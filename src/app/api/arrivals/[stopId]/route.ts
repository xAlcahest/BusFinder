import { failure, jsonOk, notFound, optionalBool, optionalNumber, requireId } from "@/app/api/_lib/http";
import { ensurePoller, safeSnapshot } from "@/app/api/_lib/rt";
import { allRoutesById, getStopWithRoutes, getTripInfos, upcomingDepartures } from "@/lib/queries";
import type { UpcomingDeparture } from "@/lib/queries";
import type { Arrival, ArrivalsResponse } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Predictions further out than this are noise. */
const RT_HORIZON_SEC = 90 * 60;
/** Scheduled fallback reaches further so night service is still visible. */
const SCHEDULED_HORIZON_SEC = 3 * 3600;
const PAST_GRACE_SEC = 120;
/** Hard cap on rows, above the 30 the settings screen offers. */
const MAX_LIMIT = 50;
/** Timetable rows read per stop: a whole night at the busiest stop fits. */
const SCHEDULED_LOOKAHEAD = 200;

/** Out-of-range limits clamp instead of failing: the value comes from settings. */
function clampLimit(raw: number | null): number {
  if (raw === null || !Number.isFinite(raw)) return DEFAULT_SETTINGS.maxArrivals;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(raw)));
}

/**
 * Fair cap: the first passage of every line is kept before the remaining slots
 * go to the earliest rows, so a stop crowded by one frequent line cannot hide
 * the others.
 */
function selectFairly(arrivals: Arrival[], limit: number): Arrival[] {
  const byTime = [...arrivals].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const firstPerRoute: Arrival[] = [];
  const rest: Arrival[] = [];
  const seenRoutes = new Set<string>();
  for (const arrival of byTime) {
    if (seenRoutes.has(arrival.routeId)) rest.push(arrival);
    else {
      seenRoutes.add(arrival.routeId);
      firstPerRoute.push(arrival);
    }
  }
  const head = firstPerRoute.slice(0, limit);
  return head
    .concat(rest.slice(0, Math.max(0, limit - head.length)))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ stopId: string }> },
): Promise<Response> {
  try {
    const { stopId: rawStopId } = await context.params;
    const stopId = requireId(rawStopId, "stopId");
    const params = new URL(request.url).searchParams;
    const limit = clampLimit(optionalNumber(params, "limit"));
    const allowFallback = optionalBool(params, "fallback") ?? DEFAULT_SETTINGS.showScheduledFallback;

    const stop = getStopWithRoutes(stopId);
    if (stop === null) return notFound("Fermata non trovata", stopId);

    ensurePoller();
    const snapshot = safeSnapshot();
    const now = Math.floor(Date.now() / 1000);

    const updates = snapshot.byStop.get(stopId) ?? [];
    const trips = getTripInfos(updates.map((u) => u.tripId));
    const routes = allRoutesById();

    let timetable: UpcomingDeparture[] | null = null;
    const scheduleForStop = (): UpcomingDeparture[] => {
      timetable ??= upcomingDepartures({
        stopId,
        nowUnix: now,
        limit: SCHEDULED_LOOKAHEAD,
        graceSec: PAST_GRACE_SEC,
      });
      return timetable;
    };
    /** Timetable time of one trip at this stop, for passages the feed does not time. */
    const scheduledTimeOf = (tripId: string): number | null => {
      let best: number | null = null;
      for (const departure of scheduleForStop()) {
        if (departure.tripId !== tripId) continue;
        if (best === null || departure.departureUnix < best) best = departure.departureUnix;
      }
      return best;
    };

    // Trips the feed actually places at THIS stop, timed or cancelled. The
    // producer trims stops a vehicle has already served, so tracking a trip
    // says nothing about whether it covers this stop.
    const resolvedHere = new Set<string>();

    // One row per trip AND stop visit: a loop line calls at the same stop twice.
    const byVisit = new Map<string, Arrival>();
    for (const update of updates) {
      const trip = trips.get(update.tripId) ?? null;
      const routeId = update.routeId ?? trip?.routeId ?? null;
      if (routeId === null) continue;
      const route = routes.get(routeId) ?? null;
      const shortName = trip?.routeShortName ?? route?.shortName ?? null;
      const routeType = trip?.routeType ?? route?.routeType ?? null;
      if (shortName === null || routeType === null) continue;

      // NO_DATA means the producer has no live timing for this stop, so the
      // passage stays and falls back to this trip's own scheduled time.
      const predicted = update.time;
      const time = predicted ?? (update.noData ? scheduledTimeOf(update.tripId) : null);
      // A cancelled passage counts as answered even without a time.
      if (update.skipped) resolvedHere.add(update.tripId);
      if (time === null || !Number.isFinite(time)) continue;
      // Answered here even if the horizon filter below drops the row.
      resolvedHere.add(update.tripId);
      const arrivalTime = Math.floor(time);
      if (arrivalTime > now + RT_HORIZON_SEC || arrivalTime < now - PAST_GRACE_SEC) continue;

      const arrival: Arrival = {
        tripId: update.tripId,
        routeId,
        routeShortName: shortName,
        routeType,
        routeColor: trip?.routeColor ?? route?.color ?? null,
        headsign: trip?.headsign ?? route?.longName ?? "",
        arrivalTime,
        minutesAway: Math.floor((arrivalTime - now) / 60),
        delaySec: predicted === null ? null : update.delay,
        source: update.noData ? "scheduled" : "realtime",
        vehicleId: update.vehicleId,
        skipped: update.skipped,
      };
      const key = `${update.tripId}#${update.stopSequence ?? "?"}`;
      const known = byVisit.get(key);
      if (known === undefined || arrival.arrivalTime < known.arrivalTime) byVisit.set(key, arrival);
    }

    const arrivals = [...byVisit.values()];

    // Timetable top-up, decided per trip rather than on the realtime row count:
    // a line with no AVM coverage must still show up at a busy stop.
    if (allowFallback) {
      for (const departure of scheduleForStop()) {
        if (departure.departureUnix > now + SCHEDULED_HORIZON_SEC) continue;
        // Only a passage the feed answered for at this stop is already served
        // above; a trip tracked elsewhere still needs its timetable row here.
        if (resolvedHere.has(departure.tripId)) continue;
        arrivals.push({
          tripId: departure.tripId,
          routeId: departure.routeId,
          routeShortName: departure.routeShortName,
          routeType: departure.routeType,
          routeColor: departure.routeColor,
          headsign: departure.headsign,
          arrivalTime: departure.departureUnix,
          minutesAway: Math.floor((departure.departureUnix - now) / 60),
          delaySec: null,
          source: "scheduled",
          vehicleId: null,
          skipped: false,
        });
      }
    }

    const body: ArrivalsResponse = {
      stop,
      arrivals: selectFairly(arrivals, limit),
      feedTimestamp: snapshot.feedTimestamps.tripUpdates,
      degraded: snapshot.degraded,
      generatedAt: now,
    };
    return jsonOk(body);
  } catch (cause) {
    return failure("arrivals", cause);
  }
}
