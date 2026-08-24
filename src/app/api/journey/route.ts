/**
 * GET /api/journey
 *
 * Two modes on one path, because the planner owns both and they share the same
 * place-resolution rules:
 *
 *   ?from=&to=[&at=][&results=]   plan journeys, answers JourneyResponse
 *   ?mode=places&q=<text>         resolve typed text, answers { places }
 *
 * `from` and `to` each accept one of three spellings:
 *   stop:<stopId>      a stop the user picked from our own search
 *   <lat>,<lon>        a raw fix, e.g. from the browser's geolocation
 *   free text          an address or a place, resolved server-side
 */

import { BadParam, failure, jsonOk, notFound } from "@/app/api/_lib/http";
import { enforceRateLimit, type RateRule } from "@/app/api/_lib/ratelimit";
import { geocode, parseCoordinates, type GeocodeResult } from "@/lib/geocode";
import { planJourneys } from "@/lib/journey";
import { getStop } from "@/lib/queries";
import type { JourneyPlace, JourneyResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * A plan costs tens of milliseconds of synchronous CPU on the only Node thread,
 * so the budget is deliberately tighter than the read-only endpoints'.
 */
const JOURNEY_RULE: RateRule = { name: "journey", limit: 40, windowMs: 60_000 };
/** Second window, so a runaway loop cannot spend the minute budget in a second. */
const JOURNEY_BURST_RULE: RateRule = { name: "journey-burst", limit: 8, windowMs: 5_000 };
const RULES: readonly RateRule[] = [JOURNEY_BURST_RULE, JOURNEY_RULE];

/** Lazio plus a margin, matching /api/stops/nearby. */
const LAT_MIN = 40.5;
const LAT_MAX = 43.0;
const LON_MIN = 11.0;
const LON_MAX = 14.2;

const STOP_ID_RE = /^[A-Za-z0-9._#-]{1,64}$/;
const MAX_TEXT_LENGTH = 120;
/** Planning far outside the loaded calendar is pointless; a month each way is plenty. */
const MAX_TIME_SKEW_SEC = 31 * 24 * 3600;

function inServiceArea(lat: number, lon: number): boolean {
  return lat >= LAT_MIN && lat <= LAT_MAX && lon >= LON_MIN && lon <= LON_MAX;
}

function placeFromGeocode(result: GeocodeResult): JourneyPlace {
  return {
    kind: result.source === "stop" ? "stop" : "place",
    name: result.name,
    label: result.label,
    lat: result.lat,
    lon: result.lon,
    stopId: result.stopId,
    stopCode: result.stopCode,
  };
}

/** Resolves one endpoint. Throws BadParam for bad input, returns null for "not found". */
async function resolvePlace(raw: string, label: string): Promise<JourneyPlace | null> {
  const value = raw.trim();
  if (value.length === 0) throw new BadParam(`parametro "${label}" vuoto`);
  if (value.length > MAX_TEXT_LENGTH) throw new BadParam(`parametro "${label}" troppo lungo`);

  if (value.startsWith("stop:")) {
    const stopId = value.slice(5).trim();
    if (!STOP_ID_RE.test(stopId)) throw new BadParam(`identificativo fermata "${label}" non valido`);
    const stop = getStop(stopId);
    if (stop === null) return null;
    return {
      kind: "stop",
      name: stop.stopName,
      label: null,
      lat: stop.lat,
      lon: stop.lon,
      stopId: stop.stopId,
      stopCode: stop.stopCode,
    };
  }

  const coords = parseCoordinates(value);
  if (coords !== null) {
    if (!inServiceArea(coords.lat, coords.lon)) {
      throw new BadParam(`coordinate "${label}" fuori dall'area di Roma`);
    }
    return {
      kind: "coord",
      name: `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`,
      label: null,
      lat: coords.lat,
      lon: coords.lon,
      stopId: null,
      stopCode: null,
    };
  }

  const found = await geocode(value);
  const best = found[0];
  if (best === undefined) return null;
  if (!inServiceArea(best.lat, best.lon)) return null;
  return placeFromGeocode(best);
}

function readInstant(params: URLSearchParams, nowSec: number): number {
  const raw = params.get("at");
  if (raw === null || raw.trim().length === 0) return nowSec;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed)) throw new BadParam('parametro "at" non numerico');
  const value = Math.floor(parsed);
  if (Math.abs(value - nowSec) > MAX_TIME_SKEW_SEC) {
    throw new BadParam('parametro "at" troppo lontano da adesso');
  }
  return value;
}

function readResults(params: URLSearchParams): number | undefined {
  const raw = params.get("results");
  if (raw === null || raw.trim().length === 0) return undefined;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed)) throw new BadParam('parametro "results" non numerico');
  const value = Math.floor(parsed);
  if (value < 1 || value > 8) throw new BadParam('parametro "results" fuori intervallo (1..8)');
  return value;
}

async function places(params: URLSearchParams): Promise<Response> {
  const query = (params.get("q") ?? "").trim();
  if (query.length === 0) return jsonOk({ places: [] as JourneyPlace[] });
  if (query.length > MAX_TEXT_LENGTH) throw new BadParam('parametro "q" troppo lungo');

  const coords = parseCoordinates(query);
  if (coords !== null && inServiceArea(coords.lat, coords.lon)) {
    return jsonOk({
      places: [
        {
          kind: "coord",
          name: `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`,
          label: null,
          lat: coords.lat,
          lon: coords.lon,
          stopId: null,
          stopCode: null,
        } satisfies JourneyPlace,
      ],
    });
  }

  const found = await geocode(query);
  return jsonOk({
    places: found.filter((item) => inServiceArea(item.lat, item.lon)).map(placeFromGeocode),
  });
}

export async function GET(request: Request): Promise<Response> {
  const limited = enforceRateLimit(request, RULES);
  if (limited !== null) return limited;

  try {
    const params = new URL(request.url).searchParams;
    if (params.get("mode") === "places") return await places(params);

    const fromRaw = params.get("from");
    const toRaw = params.get("to");
    if (fromRaw === null || toRaw === null) {
      throw new BadParam('parametri "from" e "to" obbligatori');
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const departAfter = readInstant(params, nowSec);
    const maxResults = readResults(params);

    // `detail` carries a stable slug, not prose: the client picks the wording
    // from its own dictionary and the server has no idea which language that is.
    const origin = await resolvePlace(fromRaw, "from");
    if (origin === null) return notFound("Partenza non trovata", "origin");
    const destination = await resolvePlace(toRaw, "to");
    if (destination === null) return notFound("Arrivo non trovato", "destination");

    const plan = planJourneys({ origin, destination, departAfter, maxResults });
    const body: JourneyResponse = {
      origin,
      destination,
      departAfter,
      journeys: plan.journeys,
      notice: plan.notice,
      generatedAt: nowSec,
    };
    return jsonOk(body);
  } catch (cause) {
    return failure("journey", cause);
  }
}
