import { BadParam, failure, jsonOk, notFound, optionalId, optionalInt, requireId } from "@/app/api/_lib/http";
import {
  currentServiceDate,
  getStop,
  isValidServiceDate,
  routesForStop,
  scheduledDepartures,
  secToClock,
} from "@/lib/queries";
import type { TimetableEntry, TimetableResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 1000;
/** Cap per request: the UI walks a long day with ?from=, one page at a time. */
const MAX_LIMIT = DEFAULT_LIMIT;

export async function GET(
  request: Request,
  context: { params: Promise<{ stopId: string }> },
): Promise<Response> {
  try {
    const { stopId: rawStopId } = await context.params;
    const stopId = requireId(rawStopId, "stopId");
    const params = new URL(request.url).searchParams;

    const rawDate = params.get("date");
    const date =
      rawDate === null || rawDate.trim().length === 0
        ? currentServiceDate(Math.floor(Date.now() / 1000))
        : rawDate.trim();
    if (!isValidServiceDate(date)) throw new BadParam('parametro "date" non valido, atteso YYYYMMDD');

    const routeId = optionalId(params, "routeId", "routeId");
    const limit = optionalInt(params, "limit", 1, MAX_LIMIT) ?? DEFAULT_LIMIT;
    const fromSec = optionalInt(params, "from", 0, 172800) ?? 0;

    const stop = getStop(stopId);
    if (stop === null) return notFound("Fermata non trovata", stopId);

    const entries: TimetableEntry[] = scheduledDepartures({
      stopId,
      serviceDate: date,
      fromSec,
      limit,
      routeId,
    }).map((departure) => ({
      tripId: departure.tripId,
      routeId: departure.routeId,
      routeShortName: departure.routeShortName,
      routeType: departure.routeType,
      headsign: departure.headsign,
      departureSec: departure.departureSec,
      departureLabel: secToClock(departure.departureSec),
    }));

    const body: TimetableResponse = { stop, date, routes: routesForStop(stopId), entries };
    return jsonOk(body);
  } catch (cause) {
    return failure("timetable", cause);
  }
}
