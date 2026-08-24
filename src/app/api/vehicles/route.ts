import { failure, optionalId } from "@/app/api/_lib/http";
import { VEHICLE_RULES, conditionalJson, enforceRateLimit } from "@/app/api/_lib/ratelimit";
import { ensurePoller, safeRoutesById, safeSnapshot } from "@/app/api/_lib/rt";
import type { Vehicle, VehiclesResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * This body is a pure function of the snapshot and the route filter: no wall
 * clock enters it. So while the snapshot revision holds, every client polling
 * every few seconds gets the identical bytes, and both the serialisation and
 * the ETag can be reused instead of recomputed.
 */
interface Rendered {
  payload: string;
  builtAtMs: number;
}

const RENDER_CACHE_MAX = 64;
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

export async function GET(request: Request): Promise<Response> {
  try {
    const limited = enforceRateLimit(request, VEHICLE_RULES);
    if (limited !== null) return limited;

    const params = new URL(request.url).searchParams;
    const routeFilter = optionalId(params, "routeId", "routeId");

    ensurePoller();
    const snapshot = safeSnapshot();
    const nowMs = Date.now();
    // Memoised per db handle, so reading it before the cache check costs a
    // lookup; its size is in the key so a late or reingested db invalidates.
    const routes = safeRoutesById();
    // -1 for a snapshot with no revision: it must never share a key with a real one.
    const revision = snapshot.revision ?? -1;
    const key = [revision, snapshot.degraded ? 1 : 0, routes.size, routeFilter ?? ""].join("|");

    const cached = cacheGet(key, nowMs);
    if (cached !== null) return conditionalJson(request, cached, VEHICLE_RULES);

    const vehicles: Vehicle[] = [];
    for (const raw of snapshot.vehicles) {
      if (routeFilter !== null && raw.routeId !== routeFilter) continue;
      // A fix without usable coordinates cannot be drawn on the map.
      if (!Number.isFinite(raw.lat) || !Number.isFinite(raw.lon)) continue;
      if (raw.lat < -90 || raw.lat > 90 || raw.lon < -180 || raw.lon > 180) continue;
      vehicles.push({
        vehicleId: raw.vehicleId,
        vehicleLabel: raw.vehicleLabel,
        tripId: raw.tripId,
        routeId: raw.routeId,
        routeShortName: raw.routeId === null ? null : (routes.get(raw.routeId)?.shortName ?? null),
        lat: raw.lat,
        lon: raw.lon,
        bearing: raw.bearing,
        timestamp: raw.timestamp,
      });
    }

    const body: VehiclesResponse = {
      vehicles,
      feedTimestamp: snapshot.feedTimestamp,
      degraded: snapshot.degraded,
    };
    const payload = JSON.stringify(body);
    cacheSet(key, payload, nowMs);
    return conditionalJson(request, payload, VEHICLE_RULES);
  } catch (cause) {
    return failure("vehicles", cause);
  }
}
