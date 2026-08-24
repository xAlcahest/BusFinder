import { BadParam, failure, jsonOk, optionalInt, optionalNumber } from "@/app/api/_lib/http";
import { MAX_RADIUS_M, MIN_RADIUS_M, nearbyStops } from "@/lib/queries";
import type { NearbyStop } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Lazio plus a margin: anything outside is a bad fix or the wrong city. */
const LAT_MIN = 40.5;
const LAT_MAX = 43.0;
const LON_MIN = 11.0;
const LON_MAX = 14.2;
const DEFAULT_LIMIT = 50;

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams;
    const lat = optionalNumber(params, "lat");
    const lon = optionalNumber(params, "lon");
    if (lat === null || lon === null) throw new BadParam('parametri "lat" e "lon" obbligatori');
    if (lat < LAT_MIN || lat > LAT_MAX || lon < LON_MIN || lon > LON_MAX) {
      throw new BadParam("coordinate fuori dall'area di Roma");
    }

    const radius = optionalNumber(params, "radius") ?? DEFAULT_SETTINGS.nearbyRadius;
    if (radius < MIN_RADIUS_M || radius > MAX_RADIUS_M) {
      throw new BadParam(`raggio fuori intervallo (${MIN_RADIUS_M}..${MAX_RADIUS_M} m)`);
    }
    const limit = optionalInt(params, "limit", 1, 200) ?? DEFAULT_LIMIT;

    const stops: NearbyStop[] = nearbyStops(lat, lon, radius, limit);
    return jsonOk({ stops });
  } catch (cause) {
    return failure("stops/nearby", cause);
  }
}
