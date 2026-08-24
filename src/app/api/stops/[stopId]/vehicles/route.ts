import { badRequest, failure, notFound, requireId } from "@/app/api/_lib/http";
import { VEHICLE_RULES, conditionalJson, enforceRateLimit } from "@/app/api/_lib/ratelimit";
import { ensurePoller, safeSnapshot } from "@/app/api/_lib/rt";
import { getDb } from "@/lib/db";
import { allRoutesById, getStop, getTripInfos, routesForStop } from "@/lib/queries";
import type { TripInfo } from "@/lib/queries";
import type { VehicleLite } from "@/lib/realtime";
import type { StopVehicle, StopVehiclesResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Same horizon the arrivals route uses: predictions past it are noise. */
const RT_HORIZON_SEC = 90 * 60;
const PAST_GRACE_SEC = 120;
/**
 * Hard cap on markers. Termini-class interchanges are served by ~40 lines, so
 * mode=all can reach three digits; beyond this the map is unreadable anyway.
 */
const MAX_VEHICLES = 250;

/**
 * `minutesAway` is the only part of this body that moves with the wall clock,
 * and at whole-minute granularity. Reading the clock on a 15 s grid costs at
 * most 8 s of precision, well inside the age of the snapshot itself, and in
 * exchange the body stops changing on every single request.
 */
const CLOCK_GRID_SEC = 15;

type Mode = "approaching" | "all";

interface Rendered {
  payload: string;
  builtAtMs: number;
}

/** One entry per stop, mode and clock tick actually being polled. */
const RENDER_CACHE_MAX = 128;
/**
 * Bodies here reach six figures of bytes, so entry count alone is not a bound.
 * This is the real ceiling on what the cache can hold.
 */
const RENDER_CACHE_MAX_BYTES = 4 * 1024 * 1024;
/** Backstop so a stalled poller cannot pin a body forever. */
const RENDER_CACHE_TTL_MS = 120_000;

const rendered = new Map<string, Rendered>();
let renderedBytes = 0;

function cacheDrop(key: string): void {
  const hit = rendered.get(key);
  if (hit === undefined) return;
  renderedBytes -= hit.payload.length;
  rendered.delete(key);
}

function cacheGet(key: string, nowMs: number): string | null {
  const hit = rendered.get(key);
  if (hit === undefined) return null;
  if (nowMs - hit.builtAtMs > RENDER_CACHE_TTL_MS) {
    cacheDrop(key);
    return null;
  }
  return hit.payload;
}

function cacheSet(key: string, payload: string, nowMs: number): void {
  cacheDrop(key);
  // Insertion-ordered map, so the first key is always the oldest entry.
  while (
    rendered.size >= RENDER_CACHE_MAX ||
    (rendered.size > 0 && renderedBytes + payload.length > RENDER_CACHE_MAX_BYTES)
  ) {
    const oldest = rendered.keys().next();
    if (oldest.done === true) break;
    cacheDrop(oldest.value);
  }
  rendered.set(key, { payload, builtAtMs: nowMs });
  renderedBytes += payload.length;
}

/** Null means the caller sent something we do not serve; the route 400s on it. */
function parseMode(raw: string | null): Mode | null {
  if (raw === null || raw.trim().length === 0) return "approaching";
  const value = raw.trim();
  return value === "approaching" || value === "all" ? value : null;
}

/**
 * Both realtime feeds carry a routeId, and for a large share of trips it
 * contradicts the trip row in our static snapshot: the ids are recycled, so a
 * stale trip would hand us a headsign for a line that does not pass here.
 * Keep the static trip only when it agrees with the live route.
 */
function tripOnRoute(trip: TripInfo | null, routeId: string | null): TripInfo | null {
  if (trip === null) return null;
  return routeId === null || trip.routeId === routeId ? trip : null;
}

/**
 * Most common trip_headsign for a route and direction, so a trip whose static
 * row is stale still tells the rider where the bus is going. Cached per
 * process: it only changes when the static feed is reingested.
 */
const headsignCache = new Map<string, string | null>();

let headsignOwner: ReturnType<typeof getDb> | null = null;

function directionHeadsign(routeId: string, directionId: number): string | null {
  let db: ReturnType<typeof getDb>;
  try {
    db = getDb();
  } catch {
    return null;
  }
  // A reingest swaps the handle, so the cached answers may no longer hold.
  if (headsignOwner !== db) {
    headsignCache.clear();
    headsignOwner = db;
  }
  const key = `${routeId}|${directionId}`;
  const cached = headsignCache.get(key);
  if (cached !== undefined) return cached;
  let value: string | null = null;
  try {
    const row: unknown = db
      .prepare(
        `SELECT headsign FROM trips
         WHERE route_id = ? AND direction_id = ? AND headsign IS NOT NULL AND headsign <> ''
         GROUP BY headsign ORDER BY COUNT(*) DESC LIMIT 1`,
      )
      .get(routeId, directionId);
    if (typeof row === "object" && row !== null && "headsign" in row) {
      const raw = (row as { headsign: unknown }).headsign;
      if (typeof raw === "string" && raw.length > 0) value = raw;
    }
  } catch (cause) {
    console.error("[api:stop-vehicles] terminus not resolved", cause);
  }
  // Cache the miss too: a route with no headsign must not requery every poll.
  headsignCache.set(key, value);
  return value;
}

/** The trip's own headsign when we trust it, the line's terminus otherwise. */
function resolveHeadsign(
  trip: TripInfo | null,
  routeId: string | null,
  directionId: number | null,
): string | null {
  if (trip !== null && trip.headsign.length > 0) return trip.headsign;
  if (routeId === null || directionId === null) return null;
  if (directionId !== 0 && directionId !== 1) return null;
  return directionHeadsign(routeId, directionId);
}

/** A fix we cannot place on a map is worse than no fix at all. */
function hasUsablePosition(vehicle: VehicleLite): boolean {
  if (!Number.isFinite(vehicle.lat) || !Number.isFinite(vehicle.lon)) return false;
  return vehicle.lat >= -90 && vehicle.lat <= 90 && vehicle.lon >= -180 && vehicle.lon <= 180;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ stopId: string }> },
): Promise<Response> {
  try {
    const limited = enforceRateLimit(request, VEHICLE_RULES);
    if (limited !== null) return limited;

    const { stopId: rawStopId } = await context.params;
    const stopId = requireId(rawStopId, "stopId");

    const mode = parseMode(new URL(request.url).searchParams.get("mode"));
    if (mode === null) return badRequest('parametro "mode" deve essere "approaching" o "all"');

    const stop = getStop(stopId);
    if (stop === null) return notFound("Fermata non trovata", stopId);

    ensurePoller();
    const snapshot = safeSnapshot();
    const nowMs = Date.now();
    const now = Math.round(nowMs / 1000 / CLOCK_GRID_SEC) * CLOCK_GRID_SEC;

    // Memoised per db handle, so reading it here costs a lookup; its size is in
    // the key so a reingested db cannot leave a stale line name in the cache.
    const routes = allRoutesById();
    // -1 for a snapshot with no revision: it must never share a key with a real one.
    const revision = snapshot.revision ?? -1;
    const key = [stopId, mode, revision, snapshot.degraded ? 1 : 0, routes.size, now].join("|");
    const cached = cacheGet(key, nowMs);
    if (cached !== null) return conditionalJson(request, cached, VEHICLE_RULES);

    // One live position per trip. The winner is the lowest vehicle key, never
    // the newest fix: two vehicles on one trip would otherwise alternate every
    // poll and the rendered bus would teleport between them.
    const byTrip = new Map<string, VehicleLite>();
    for (const vehicle of snapshot.vehicles) {
      if (vehicle.tripId === null || !hasUsablePosition(vehicle)) continue;
      const known = byTrip.get(vehicle.tripId);
      if (known === undefined || vehicle.vehicleId < known.vehicleId) {
        byTrip.set(vehicle.tripId, vehicle);
      }
    }

    // The producer trims stops a trip has already served, so an entry for this
    // stop means the vehicle still has it ahead. SKIPPED will not call here.
    const updates = snapshot.byStop.get(stopId) ?? [];
    interface Inbound {
      arrivalTime: number;
      routeId: string | null;
      directionId: number | null;
    }
    const inboundByTrip = new Map<string, Inbound>();
    for (const update of updates) {
      if (update.skipped || update.time === null || !Number.isFinite(update.time)) continue;
      if (!byTrip.has(update.tripId)) continue;
      const time = Math.floor(update.time);
      if (time > now + RT_HORIZON_SEC || time < now - PAST_GRACE_SEC) continue;
      const known = inboundByTrip.get(update.tripId);
      if (known === undefined || time < known.arrivalTime) {
        inboundByTrip.set(update.tripId, {
          arrivalTime: time,
          routeId: update.routeId,
          directionId: snapshot.tripUpdates.get(update.tripId)?.directionId ?? null,
        });
      }
    }

    const trips = getTripInfos(inboundByTrip.keys());

    const approaching: StopVehicle[] = [];
    const seenVehicles = new Set<string>();
    for (const [tripId, inbound] of inboundByTrip) {
      const vehicle = byTrip.get(tripId);
      if (vehicle === undefined) continue;
      // Same precedence the arrivals route uses, so the two endpoints agree on
      // the line of a trip. The vehicle feed is only a fallback.
      const routeId = inbound.routeId ?? vehicle.routeId ?? null;
      const route = routeId === null ? null : (routes.get(routeId) ?? null);
      const trip = tripOnRoute(trips.get(tripId) ?? null, routeId);
      seenVehicles.add(vehicle.vehicleId);
      approaching.push({
        vehicleId: vehicle.vehicleId,
        vehicleLabel: vehicle.vehicleLabel,
        tripId,
        routeId,
        routeShortName: route?.shortName ?? trip?.routeShortName ?? null,
        lat: vehicle.lat,
        lon: vehicle.lon,
        bearing: vehicle.bearing,
        timestamp: vehicle.timestamp,
        relation: "approaching",
        minutesAway: Math.floor((inbound.arrivalTime - now) / 60),
        arrivalTime: inbound.arrivalTime,
        headsign: resolveHeadsign(trip, routeId, inbound.directionId),
        routeColor: route?.color ?? trip?.routeColor ?? null,
        routeType: route?.routeType ?? trip?.routeType ?? null,
      });
    }
    // Tie-broken on the identity so the MAX_VEHICLES slice keeps the same
    // vehicles from one poll to the next.
    approaching.sort(
      (a, b) =>
        (a.arrivalTime ?? 0) - (b.arrivalTime ?? 0) || a.vehicleId.localeCompare(b.vehicleId),
    );

    const vehicles: StopVehicle[] = approaching.slice(0, MAX_VEHICLES);

    if (mode === "all" && vehicles.length < MAX_VEHICLES) {
      const servingRoutes = new Set(routesForStop(stopId).map((route) => route.routeId));
      const onLine: StopVehicle[] = [];
      for (const vehicle of snapshot.vehicles) {
        if (!hasUsablePosition(vehicle)) continue;
        if (vehicle.routeId === null || !servingRoutes.has(vehicle.routeId)) continue;
        if (seenVehicles.has(vehicle.vehicleId)) continue;
        seenVehicles.add(vehicle.vehicleId);
        const route = routes.get(vehicle.routeId) ?? null;
        const update = vehicle.tripId === null ? null : (snapshot.tripUpdates.get(vehicle.tripId) ?? null);
        onLine.push({
          vehicleId: vehicle.vehicleId,
          vehicleLabel: vehicle.vehicleLabel,
          tripId: vehicle.tripId,
          routeId: vehicle.routeId,
          routeShortName: route?.shortName ?? null,
          lat: vehicle.lat,
          lon: vehicle.lon,
          bearing: vehicle.bearing,
          timestamp: vehicle.timestamp,
          relation: "onLine",
          minutesAway: null,
          arrivalTime: null,
          headsign: resolveHeadsign(null, vehicle.routeId, update?.directionId ?? null),
          routeColor: route?.color ?? null,
          routeType: route?.routeType ?? null,
        });
      }
      onLine.sort((a, b) => a.vehicleId.localeCompare(b.vehicleId));
      vehicles.push(...onLine.slice(0, MAX_VEHICLES - vehicles.length));
    }

    const body: StopVehiclesResponse = {
      stop,
      mode,
      vehicles,
      feedTimestamp: snapshot.feedTimestamps.vehicles,
      degraded: snapshot.degraded,
    };
    const payload = JSON.stringify(body);
    cacheSet(key, payload, nowMs);
    return conditionalJson(request, payload, VEHICLE_RULES);
  } catch (cause) {
    return failure("stop-vehicles", cause);
  }
}
