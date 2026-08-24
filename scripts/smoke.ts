/**
 * End-to-end smoke test: hits every API route against a running server and
 * validates the response shape and a few real values against the contract in
 * src/lib/types.ts. Exits non-zero with a readable report on any failure.
 *
 * It writes as well as reads: the device-sync checks do a full round trip on a
 * random syncId and delete it again, so a run leaves no trace and can be
 * repeated. Both sync routes are rate limited per client (60 requests a minute,
 * 20 of them GETs), and one run spends about 20 and 5 of those, so three runs
 * inside the same minute will start seeing 429s.
 *
 * Usage: tsx scripts/smoke.ts [baseUrl]
 *        PROBUS_URL=https://probus.example.com tsx scripts/smoke.ts
 */

const baseUrl = (process.argv[2] ?? process.env.PROBUS_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Rome Termini: a stop that reliably exists and has multiple lines calling at it.
const TERMINI_LAT = 41.9008;
const TERMINI_LON = 12.5013;
const NEARBY_RADIUS = 1500;

// Lazio plus a margin. A vehicle fix outside this is not a Rome vehicle.
const ROME_LAT_MIN = 41.4;
const ROME_LAT_MAX = 42.3;
const ROME_LON_MIN = 11.8;
const ROME_LON_MAX = 13.2;

/** Mirrors MIN_RADIUS_M/MAX_RADIUS_M in src/lib/queries.ts. */
const MIN_RADIUS_M = 50;
/** Mirrors DEFAULT_SETTINGS.maxArrivals in src/lib/types.ts. */
const DEFAULT_MAX_ARRIVALS = 12;
/** Mirrors MAX_LIMIT in src/app/api/arrivals/[stopId]/route.ts. */
const ARRIVALS_MAX_LIMIT = 50;
/** Mirrors MAX_VEHICLES in src/app/api/stops/[stopId]/vehicles/route.ts. */
const MAX_STOP_VEHICLES = 250;
/** Mirrors RT_HORIZON_SEC/PAST_GRACE_SEC, shared by arrivals and stop vehicles. */
const RT_HORIZON_SEC = 90 * 60;
const PAST_GRACE_SEC = 120;
/**
 * Two endpoints read the same snapshot, but the poller can publish a new one
 * between two requests. Predictions moving less than this are that, not a bug.
 */
const CROSS_ENDPOINT_DRIFT_SEC = 300;
/** How many plans to ask /api/journey for. Its own cap is 8. */
const JOURNEY_RESULTS = 3;
/**
 * The planner allows 8 requests per 5 s, tighter than everything else because
 * a plan is synchronous CPU. Spacing the calls keeps the suite off that limit.
 */
const JOURNEY_PACE_MS = 700;

interface CheckResult {
  endpoint: string;
  ok: boolean;
  errors: string[];
}

const results: CheckResult[] = [];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function checkString(v: unknown, path: string): string[] {
  return typeof v === "string" ? [] : [`${path}: expected string, got ${typeof v} (${JSON.stringify(v)})`];
}

function checkNumber(v: unknown, path: string): string[] {
  return typeof v === "number" && Number.isFinite(v) ? [] : [`${path}: expected finite number, got ${JSON.stringify(v)}`];
}

function checkBoolean(v: unknown, path: string): string[] {
  return typeof v === "boolean" ? [] : [`${path}: expected boolean, got ${JSON.stringify(v)}`];
}

function checkNullable(check: (v: unknown, path: string) => string[], v: unknown, path: string): string[] {
  return v === null ? [] : check(v, path);
}

function checkArray(check: (v: unknown, path: string) => string[], v: unknown, path: string): string[] {
  if (!Array.isArray(v)) return [`${path}: expected array, got ${typeof v}`];
  return v.flatMap((item, i) => check(item, `${path}[${i}]`));
}

function checkEnum(values: readonly string[], v: unknown, path: string): string[] {
  return typeof v === "string" && values.includes(v) ? [] : [`${path}: expected one of ${values.join("|")}, got ${JSON.stringify(v)}`];
}

function checkRouteSummary(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.routeId, `${path}.routeId`),
    ...checkString(v.shortName, `${path}.shortName`),
    ...checkNullable(checkString, v.longName, `${path}.longName`),
    ...checkNumber(v.routeType, `${path}.routeType`),
    ...checkNullable(checkString, v.color, `${path}.color`),
    ...checkNullable(checkString, v.textColor, `${path}.textColor`),
  ];
}

function checkStop(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.stopId, `${path}.stopId`),
    ...checkNullable(checkString, v.stopCode, `${path}.stopCode`),
    ...checkString(v.stopName, `${path}.stopName`),
    ...checkNumber(v.lat, `${path}.lat`),
    ...checkNumber(v.lon, `${path}.lon`),
    ...checkNullable(checkNumber, v.wheelchair, `${path}.wheelchair`),
  ];
}

function checkStopWithRoutes(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [...checkStop(v, path), ...checkArray(checkRouteSummary, v.routes, `${path}.routes`)];
}

function checkNearbyStop(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkStop(v, path),
    ...checkNumber(v.distanceM, `${path}.distanceM`),
    ...checkArray(checkRouteSummary, v.routes, `${path}.routes`),
  ];
}

function checkArrival(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.tripId, `${path}.tripId`),
    ...checkString(v.routeId, `${path}.routeId`),
    ...checkString(v.routeShortName, `${path}.routeShortName`),
    ...checkNumber(v.routeType, `${path}.routeType`),
    ...checkNullable(checkString, v.routeColor, `${path}.routeColor`),
    ...checkString(v.headsign, `${path}.headsign`),
    ...checkNumber(v.arrivalTime, `${path}.arrivalTime`),
    ...checkNumber(v.minutesAway, `${path}.minutesAway`),
    ...checkNullable(checkNumber, v.delaySec, `${path}.delaySec`),
    ...checkEnum(["realtime", "scheduled"], v.source, `${path}.source`),
    ...checkNullable(checkString, v.vehicleId, `${path}.vehicleId`),
    ...checkBoolean(v.skipped, `${path}.skipped`),
  ];
}

function checkTimetableEntry(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.tripId, `${path}.tripId`),
    ...checkString(v.routeId, `${path}.routeId`),
    ...checkString(v.routeShortName, `${path}.routeShortName`),
    ...checkNumber(v.routeType, `${path}.routeType`),
    ...checkString(v.headsign, `${path}.headsign`),
    ...checkNumber(v.departureSec, `${path}.departureSec`),
    ...checkString(v.departureLabel, `${path}.departureLabel`),
  ];
}

function checkRouteDirection(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkNumber(v.directionId, `${path}.directionId`),
    ...checkString(v.headsign, `${path}.headsign`),
    ...checkNumber(v.tripCount, `${path}.tripCount`),
  ];
}

function checkServiceAlert(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.id, `${path}.id`),
    ...checkString(v.header, `${path}.header`),
    ...checkString(v.description, `${path}.description`),
    ...checkNullable(checkString, v.url, `${path}.url`),
    ...checkNullable(checkString, v.cause, `${path}.cause`),
    ...checkNullable(checkString, v.effect, `${path}.effect`),
    ...checkNullable(checkNumber, v.activeFrom, `${path}.activeFrom`),
    ...checkNullable(checkNumber, v.activeUntil, `${path}.activeUntil`),
    ...checkArray(checkRouteSummary, v.affectedRoutes, `${path}.affectedRoutes`),
    ...checkArray(checkString, v.affectedStopIds, `${path}.affectedStopIds`),
  ];
}

function checkVehicle(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.vehicleId, `${path}.vehicleId`),
    // Optional in the contract: absent is as valid as null.
    ...(v.vehicleLabel === undefined
      ? []
      : checkNullable(checkString, v.vehicleLabel, `${path}.vehicleLabel`)),
    ...checkNullable(checkString, v.tripId, `${path}.tripId`),
    ...checkNullable(checkString, v.routeId, `${path}.routeId`),
    ...checkNullable(checkString, v.routeShortName, `${path}.routeShortName`),
    ...checkNumber(v.lat, `${path}.lat`),
    ...checkNumber(v.lon, `${path}.lon`),
    ...checkNullable(checkNumber, v.bearing, `${path}.bearing`),
    ...checkNumber(v.timestamp, `${path}.timestamp`),
  ];
}

/** A StopVehicle: a Vehicle plus how it relates to the stop being watched. */
function checkStopVehicle(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  const errors = [
    ...checkVehicle(v, path),
    ...checkEnum(["approaching", "onLine"], v.relation, `${path}.relation`),
    ...checkNullable(checkNumber, v.minutesAway, `${path}.minutesAway`),
    ...checkNullable(checkNumber, v.arrivalTime, `${path}.arrivalTime`),
    ...checkNullable(checkString, v.headsign, `${path}.headsign`),
    ...checkNullable(checkString, v.routeColor, `${path}.routeColor`),
    ...checkNullable(checkNumber, v.routeType, `${path}.routeType`),
  ];
  if (errors.length > 0) return errors;

  // "approaching" is defined by a live prediction for this stop, so a row
  // claiming it without a time is describing something else.
  if (v.relation === "approaching") {
    if (v.arrivalTime === null) errors.push(`${path}: relation=approaching with arrivalTime null`);
    if (v.minutesAway === null) errors.push(`${path}: relation=approaching with minutesAway null`);
    if (v.tripId === null) errors.push(`${path}: relation=approaching with tripId null; the prediction has to belong to a trip`);
  }
  // "onLine" is only "somewhere on a line that serves this stop": no prediction.
  if (v.relation === "onLine") {
    if (v.arrivalTime !== null) errors.push(`${path}: relation=onLine must not carry arrivalTime ${String(v.arrivalTime)}`);
    if (v.minutesAway !== null) errors.push(`${path}: relation=onLine must not carry minutesAway ${String(v.minutesAway)}`);
    if (v.routeId === null) errors.push(`${path}: relation=onLine with routeId null; it was matched to the stop by its line`);
  }
  return errors;
}

/** A fix outside the Rome bounding box is not a fix for a Rome vehicle. */
function checkInRome(v: Record<string, unknown>, path: string): string[] {
  const { lat, lon } = v;
  if (typeof lat !== "number" || typeof lon !== "number") return [];
  if (lat < ROME_LAT_MIN || lat > ROME_LAT_MAX || lon < ROME_LON_MIN || lon > ROME_LON_MAX) {
    return [`${path}: ${lat},${lon} is outside the Rome bounding box`];
  }
  return [];
}

/** The ApiError shape every route must return on failure. */
function checkApiError(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected ApiError object, got ${typeof v}`];
  const errors = checkString(v.error, `${path}.error`);
  if (typeof v.error === "string" && v.error.trim().length === 0) {
    errors.push(`${path}.error: expected a non-empty message`);
  }
  if (v.detail !== undefined) errors.push(...checkString(v.detail, `${path}.detail`));
  return errors;
}

async function getJson(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${baseUrl}${path}`);
  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    throw new Error(`response for ${path} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  return { status: res.status, body };
}

/** Status, headers and raw text: for the 304 path, where there is no body. */
async function getRaw(
  path: string,
  headers?: Record<string, string>,
): Promise<{ status: number; headers: Headers; text: string }> {
  const res = await fetch(`${baseUrl}${path}`, headers === undefined ? undefined : { headers });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

/** PUT/DELETE with a JSON body. A 204 carries none, and that is not an error. */
async function sendJson(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: unknown }> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  if (text.length === 0) return { status: res.status, body: null };
  try {
    return { status: res.status, body: JSON.parse(text) as unknown };
  } catch {
    throw new Error(`${method} ${path} answered ${res.status} with a non-JSON body: ${text.slice(0, 160)}`);
  }
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomBase64(bytes: number): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Buffer.from(buf).toString("base64");
}

async function check(endpoint: string, run: () => Promise<string[]>): Promise<void> {
  try {
    const errors = await run();
    results.push({ endpoint, ok: errors.length === 0, errors });
  } catch (err) {
    results.push({ endpoint, ok: false, errors: [err instanceof Error ? err.message : String(err)] });
  }
}

/** Asserts a request is rejected with the expected 4xx and an ApiError body. */
async function checkRejects(label: string, path: string, expectedStatus: number): Promise<void> {
  await check(label, async () => {
    const { status, body } = await getJson(path);
    const errors: string[] = [];
    if (status !== expectedStatus) errors.push(`expected ${expectedStatus}, got ${status}: ${JSON.stringify(body)}`);
    errors.push(...checkApiError(body, "body"));
    return errors;
  });
}

/** Same, for the methods the sync route answers on. */
async function checkSendRejects(
  label: string,
  method: string,
  path: string,
  body: unknown,
  expectedStatus: number,
): Promise<void> {
  await check(label, async () => {
    const { status, body: got } = await sendJson(method, path, body);
    const errors: string[] = [];
    if (status !== expectedStatus) errors.push(`expected ${expectedStatus}, got ${status}: ${JSON.stringify(got)}`);
    errors.push(...checkApiError(got, "body"));
    return errors;
  });
}

function todayYyyymmdd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Mirrors secToClock() in src/lib/queries.ts: "HH:MM" wrapped into 0..23. */
function secToClock(sec: number): string {
  const wrapped = ((sec % 86400) + 86400) % 86400;
  const hh = Math.floor(wrapped / 3600);
  const mm = Math.floor((wrapped % 3600) / 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function asRecords(v: unknown): Array<Record<string, unknown>> {
  return Array.isArray(v) ? v.filter(isRecord) : [];
}

/**
 * GET /api/stops/[stopId]/vehicles, both modes.
 *
 * The interesting property is not the shape, it is that this endpoint and
 * /api/arrivals/[stopId] describe the same trips: they read the same realtime
 * snapshot, so every approaching vehicle here is a trip that endpoint knows is
 * calling at this stop, with the same line and the same predicted time.
 */
async function checkStopVehicles(stopId: string): Promise<void> {
  const encoded = encodeURIComponent(stopId);
  const arrivalsPath = `/api/arrivals/${encoded}?limit=${ARRIVALS_MAX_LIMIT}&fallback=false`;
  /** vehicleId of everything mode=approaching returned, for the mode=all check. */
  let approachingVehicleIds: string[] = [];
  /** routeIds the stop advertises, so onLine vehicles can be held to them. */
  let stopRouteIds = new Set<string>();

  await check("GET /api/stops/[stopId]/vehicles?mode=approaching", async () => {
    // Arrivals is read on both sides of the vehicles call: the poller may
    // publish a new snapshot between two requests, and a trip that appears or
    // disappears in that window must not be read as an inconsistency.
    const before = await getJson(arrivalsPath);
    const { status, body } = await getJson(`/api/stops/${encoded}/vehicles?mode=approaching`);
    const after = await getJson(arrivalsPath);

    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkStop(body.stop, "stop"),
      ...checkEnum(["approaching", "all"], body.mode, "mode"),
      ...checkArray(checkStopVehicle, body.vehicles, "vehicles"),
      ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
      ...checkBoolean(body.degraded, "degraded"),
    ];
    if (errors.length > 0) return errors;

    if (body.mode !== "approaching") errors.push(`mode: expected approaching, got ${String(body.mode)}`);
    const stopBody = isRecord(body.stop) ? body.stop : {};
    if (stopBody.stopId !== stopId) errors.push(`stop.stopId: expected ${stopId}, got ${String(stopBody.stopId)}`);

    const vehicles = asRecords(body.vehicles);
    approachingVehicleIds = vehicles.map((v) => (typeof v.vehicleId === "string" ? v.vehicleId : "")).filter((id) => id.length > 0);
    if (vehicles.length > MAX_STOP_VEHICLES) {
      errors.push(`vehicles: ${vehicles.length} entries exceeds the documented cap of ${MAX_STOP_VEHICLES}`);
    }

    const now = Math.floor(Date.now() / 1000);
    const seenVehicleIds = new Set<string>();
    const seenTripIds = new Set<string>();
    let previousArrival = Number.NEGATIVE_INFINITY;
    for (const [i, vehicle] of vehicles.entries()) {
      if (vehicle.relation !== "approaching") {
        errors.push(`vehicles[${i}].relation: mode=approaching returned ${String(vehicle.relation)}`);
      }
      errors.push(...checkInRome(vehicle, `vehicles[${i}]`));

      const vehicleId = vehicle.vehicleId;
      if (typeof vehicleId === "string") {
        if (seenVehicleIds.has(vehicleId)) errors.push(`vehicles[${i}].vehicleId: ${vehicleId} appears twice`);
        seenVehicleIds.add(vehicleId);
      }
      const tripId = vehicle.tripId;
      if (typeof tripId === "string") {
        if (seenTripIds.has(tripId)) errors.push(`vehicles[${i}].tripId: ${tripId} appears twice; one trip cannot be two buses`);
        seenTripIds.add(tripId);
      }

      const arrivalTime = vehicle.arrivalTime;
      if (typeof arrivalTime !== "number") continue;
      if (arrivalTime < previousArrival) {
        errors.push(`vehicles[${i}].arrivalTime: ${arrivalTime} sorts after ${previousArrival}, the list is not ordered by arrival`);
      }
      previousArrival = arrivalTime;
      if (arrivalTime > now + RT_HORIZON_SEC + 60) {
        errors.push(`vehicles[${i}].arrivalTime: ${arrivalTime} is beyond the ${RT_HORIZON_SEC / 60} min prediction horizon`);
      }
      if (arrivalTime < now - PAST_GRACE_SEC - 60) {
        errors.push(`vehicles[${i}].arrivalTime: ${arrivalTime} is more than ${PAST_GRACE_SEC} s in the past`);
      }
      // The server reads the clock on a 15 s grid, so allow a minute of slack.
      const minutesAway = vehicle.minutesAway;
      if (typeof minutesAway === "number") {
        const expected = Math.floor((arrivalTime - now) / 60);
        if (Math.abs(minutesAway - expected) > 1) {
          errors.push(`vehicles[${i}].minutesAway: ${minutesAway} does not follow from arrivalTime ${arrivalTime} (expected about ${expected})`);
        }
      }
    }

    // Cross-reference against the arrivals endpoint, by tripId.
    if (before.status !== 200 || after.status !== 200) {
      errors.push(`cannot cross-reference: ${arrivalsPath} answered ${before.status}/${after.status}`);
      return errors;
    }
    const arrivalTrips = new Set<string>();
    const routeByTrip = new Map<string, string>();
    const realtimeTimeByTrip = new Map<string, number>();
    let truncated = false;
    for (const snapshot of [before.body, after.body]) {
      if (!isRecord(snapshot)) continue;
      const rows = asRecords(snapshot.arrivals);
      if (rows.length >= ARRIVALS_MAX_LIMIT) truncated = true;
      if (stopRouteIds.size === 0 && isRecord(snapshot.stop)) {
        stopRouteIds = new Set(
          asRecords(snapshot.stop.routes)
            .map((r) => r.routeId)
            .filter((id): id is string => typeof id === "string"),
        );
      }
      for (const row of rows) {
        const tripId = row.tripId;
        if (typeof tripId !== "string") continue;
        arrivalTrips.add(tripId);
        if (typeof row.routeId === "string" && !routeByTrip.has(tripId)) routeByTrip.set(tripId, row.routeId);
        // Only realtime rows share their clock with this endpoint; a scheduled
        // fallback row is a timetable time and would not be comparable.
        if (row.source === "realtime" && typeof row.arrivalTime === "number") {
          const known = realtimeTimeByTrip.get(tripId);
          // A loop line calls twice: the vehicles route reports the earlier one.
          if (known === undefined || row.arrivalTime < known) realtimeTimeByTrip.set(tripId, row.arrivalTime);
        }
      }
    }

    const shared: string[] = [];
    for (const [i, vehicle] of vehicles.entries()) {
      const tripId = vehicle.tripId;
      if (typeof tripId !== "string") continue;
      if (!arrivalTrips.has(tripId)) {
        // With the arrivals list capped, a trip may simply not have made the cut.
        if (!truncated) {
          errors.push(`vehicles[${i}].tripId: ${tripId} is approaching stop ${stopId} but ${arrivalsPath} never lists it, although that call was not truncated`);
        }
        continue;
      }
      shared.push(tripId);
      const arrivalRoute = routeByTrip.get(tripId);
      if (arrivalRoute !== undefined && vehicle.routeId !== arrivalRoute) {
        errors.push(`vehicles[${i}]: trip ${tripId} runs on line ${String(vehicle.routeId)} here and on ${arrivalRoute} in /api/arrivals`);
      }
      const arrivalTime = realtimeTimeByTrip.get(tripId);
      if (arrivalTime !== undefined && typeof vehicle.arrivalTime === "number") {
        const drift = Math.abs(vehicle.arrivalTime - arrivalTime);
        if (drift > CROSS_ENDPOINT_DRIFT_SEC) {
          errors.push(`vehicles[${i}]: trip ${tripId} is predicted at ${vehicle.arrivalTime} here and at ${arrivalTime} in /api/arrivals, ${drift} s apart`);
        }
      }
    }
    if (vehicles.length > 0 && arrivalTrips.size > 0 && shared.length === 0) {
      errors.push(`no tripId is shared between the ${vehicles.length} approaching vehicles and the ${arrivalTrips.size} trips /api/arrivals lists for stop ${stopId}; the two endpoints disagree about what is coming`);
    }
    return errors;
  });

  await check("GET /api/stops/[stopId]/vehicles?mode=all", async () => {
    const { status, body } = await getJson(`/api/stops/${encoded}/vehicles?mode=all`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkEnum(["approaching", "all"], body.mode, "mode"),
      ...checkArray(checkStopVehicle, body.vehicles, "vehicles"),
      ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
      ...checkBoolean(body.degraded, "degraded"),
    ];
    if (errors.length > 0) return errors;
    if (body.mode !== "all") errors.push(`mode: expected all, got ${String(body.mode)}`);

    const vehicles = asRecords(body.vehicles);
    if (vehicles.length > MAX_STOP_VEHICLES) {
      errors.push(`vehicles: ${vehicles.length} entries exceeds the documented cap of ${MAX_STOP_VEHICLES}`);
    }

    // The map draws the inbound ones first, so they must come first in the body.
    let seenOnLine = false;
    const seenVehicleIds = new Set<string>();
    const approachingHere = new Set<string>();
    for (const [i, vehicle] of vehicles.entries()) {
      errors.push(...checkInRome(vehicle, `vehicles[${i}]`));
      const vehicleId = vehicle.vehicleId;
      if (typeof vehicleId === "string") {
        if (seenVehicleIds.has(vehicleId)) {
          errors.push(`vehicles[${i}].vehicleId: ${vehicleId} appears twice; mode=all must not list a vehicle as both approaching and onLine`);
        }
        seenVehicleIds.add(vehicleId);
      }
      if (vehicle.relation === "onLine") {
        seenOnLine = true;
        if (typeof vehicle.routeId === "string" && stopRouteIds.size > 0 && !stopRouteIds.has(vehicle.routeId)) {
          errors.push(`vehicles[${i}]: line ${vehicle.routeId} does not serve stop ${stopId}, so this vehicle has no business on its map`);
        }
      } else {
        if (seenOnLine) errors.push(`vehicles[${i}]: an approaching vehicle is listed after onLine ones`);
        if (typeof vehicleId === "string") approachingHere.add(vehicleId);
      }
    }

    // mode=all is mode=approaching plus the rest, so it may add vehicles and
    // may drift with the snapshot, but it must not simply drop the inbound ones.
    if (approachingVehicleIds.length > 0) {
      const missing = approachingVehicleIds.filter((id) => !approachingHere.has(id));
      if (missing.length * 2 > approachingVehicleIds.length) {
        errors.push(`mode=all lost ${missing.length} of the ${approachingVehicleIds.length} vehicles mode=approaching had just reported (e.g. ${missing[0]})`);
      }
    }
    return errors;
  });

  await check("GET /api/stops/[stopId]/vehicles (conditional requests)", async () => {
    const path = `/api/stops/${encoded}/vehicles?mode=approaching`;
    const errors: string[] = [];
    // The body carries a clock rounded to 15 s, so two calls can straddle a
    // tick and legitimately differ. Retry rather than assert on a coin flip.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const first = await getRaw(path);
      if (first.status !== 200) return [`expected 200, got ${first.status}: ${first.text.slice(0, 160)}`];
      const etag = first.headers.get("etag");
      if (etag === null || etag.length === 0) return ["no ETag header, so a polling client cannot avoid re-downloading an unchanged body"];
      if (!etag.startsWith('"')) errors.push(`ETag: ${etag} is not a quoted entity-tag`);

      const second = await getRaw(path, { "If-None-Match": etag });
      if (second.status === 200 && attempt < 3) continue;
      if (second.status !== 304) {
        errors.push(`If-None-Match with the ETag just returned got ${second.status} instead of 304, three times running`);
        return errors;
      }
      if (second.text.length !== 0) errors.push(`the 304 carried a ${second.text.length} byte body; RFC 9110 forbids one`);
      if (second.headers.get("etag") !== etag) errors.push(`the 304 answered ETag ${String(second.headers.get("etag"))}, expected ${etag}`);

      // A stale validator must still get the body, or a client would never resync.
      const stale = await getRaw(path, { "If-None-Match": '"not-the-current-body"' });
      if (stale.status !== 200) errors.push(`a non-matching If-None-Match got ${stale.status}, expected the full 200`);
      else if (stale.text.length === 0) errors.push("a non-matching If-None-Match got an empty 200 body");
      return errors;
    }
    return errors;
  });
}

/**
 * GET/PUT/DELETE /api/sync/[syncId]: a full round trip on a random id.
 *
 * The server stores opaque ciphertext it cannot read, so the only things worth
 * asserting are that the bytes come back exactly as they went in, that the
 * optimistic-concurrency rule actually rejects a stale write, and that a delete
 * really deletes. Cleans up after itself so it can run against the same server
 * repeatedly.
 */
async function checkSync(): Promise<void> {
  const syncId = randomHex(32);
  const path = `/api/sync/${syncId}`;
  const iv = randomBase64(12);
  const firstBlob = randomBase64(64);
  const secondBlob = randomBase64(80);
  const validBody = { ciphertext: firstBlob, iv, baseVersion: 0 };

  try {
    await check("PUT/GET/DELETE /api/sync/[syncId] (round trip)", async () => {
      const errors: string[] = [];

      const absent = await sendJson("GET", path);
      if (absent.status !== 404) {
        return [`GET on an id nothing was ever written to expected 404, got ${absent.status}: ${JSON.stringify(absent.body)}`];
      }
      errors.push(...checkApiError(absent.body, "404 body"));

      const created = await sendJson("PUT", path, validBody);
      if (created.status !== 200) {
        return [...errors, `PUT with baseVersion 0 expected 200, got ${created.status}: ${JSON.stringify(created.body)}`];
      }
      const createdBody = isRecord(created.body) ? created.body : {};
      errors.push(
        ...checkNumber(createdBody.version, "PUT.version"),
        ...checkNumber(createdBody.updatedAt, "PUT.updatedAt"),
      );
      if (createdBody.version !== 1) errors.push(`PUT.version: a first write must produce version 1, got ${String(createdBody.version)}`);
      const writtenAt = typeof createdBody.updatedAt === "number" ? createdBody.updatedAt : 0;
      const skew = Math.abs(writtenAt - Date.now());
      if (skew > 600_000) errors.push(`PUT.updatedAt: ${writtenAt} is ${Math.round(skew / 1000)} s away from now; it must be unix milliseconds`);

      const pulled = await sendJson("GET", path);
      if (pulled.status !== 200) {
        errors.push(`GET after the write expected 200, got ${pulled.status}: ${JSON.stringify(pulled.body)}`);
      } else {
        const row = isRecord(pulled.body) ? pulled.body : {};
        errors.push(
          ...checkString(row.ciphertext, "GET.ciphertext"),
          ...checkString(row.iv, "GET.iv"),
          ...checkNumber(row.version, "GET.version"),
          ...checkNumber(row.updatedAt, "GET.updatedAt"),
        );
        // Byte-identical: the server is a dumb store, it may not re-encode.
        if (row.ciphertext !== firstBlob) errors.push("GET.ciphertext: the bytes read back are not the bytes written");
        if (row.iv !== iv) errors.push(`GET.iv: expected ${iv}, got ${String(row.iv)}`);
        if (row.version !== 1) errors.push(`GET.version: expected 1, got ${String(row.version)}`);
        if (row.updatedAt !== createdBody.updatedAt) {
          errors.push(`GET.updatedAt: ${String(row.updatedAt)} does not match the ${String(createdBody.updatedAt)} the PUT reported`);
        }
      }

      // Second device writing from the version it last saw: must be refused.
      const stale = await sendJson("PUT", path, { ciphertext: secondBlob, iv, baseVersion: 0 });
      if (stale.status !== 409) {
        errors.push(`PUT with the stale baseVersion 0 expected 409, got ${stale.status}: ${JSON.stringify(stale.body)}`);
      } else {
        errors.push(...checkApiError(stale.body, "409 body"));
      }

      const updated = await sendJson("PUT", path, { ciphertext: secondBlob, iv, baseVersion: 1 });
      if (updated.status !== 200) {
        errors.push(`PUT with the current baseVersion 1 expected 200, got ${updated.status}: ${JSON.stringify(updated.body)}`);
      } else if (isRecord(updated.body) && updated.body.version !== 2) {
        errors.push(`PUT.version: the second write must produce version 2, got ${String(updated.body.version)}`);
      }

      const pulledAgain = await sendJson("GET", path);
      if (pulledAgain.status !== 200) {
        errors.push(`GET after the second write expected 200, got ${pulledAgain.status}`);
      } else {
        const row = isRecord(pulledAgain.body) ? pulledAgain.body : {};
        if (row.ciphertext === firstBlob) errors.push("GET.ciphertext: still the first blob, the accepted second write was not stored");
        else if (row.ciphertext !== secondBlob) errors.push("GET.ciphertext: neither the first nor the second blob came back");
        if (row.version !== 2) errors.push(`GET.version: expected 2 after two writes, got ${String(row.version)}`);
      }

      const deleted = await sendJson("DELETE", path);
      if (deleted.status !== 204) errors.push(`DELETE expected 204, got ${deleted.status}: ${JSON.stringify(deleted.body)}`);
      if (deleted.body !== null) errors.push(`DELETE answered a body: ${JSON.stringify(deleted.body)}`);

      const gone = await sendJson("GET", path);
      if (gone.status !== 404) errors.push(`GET after DELETE expected 404, got ${gone.status}: ${JSON.stringify(gone.body)}`);

      // Deleting what is already gone is the caller's goal, not an error.
      const deletedAgain = await sendJson("DELETE", path);
      if (deletedAgain.status !== 204) errors.push(`a second DELETE expected 204, got ${deletedAgain.status}`);
      return errors;
    });
  } finally {
    // Belt and braces: an assertion that threw halfway must not leave a row behind.
    await sendJson("DELETE", path).catch(() => undefined);
  }

  const short = "0".repeat(63);
  const upper = `A${"0".repeat(63)}`;
  await checkRejects(`GET /api/sync/[syncId] (63 hex chars) -> 400`, `/api/sync/${short}`, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (not hex) -> 400", "PUT", "/api/sync/not-a-sync-id", validBody, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (uppercase hex) -> 400", "PUT", `/api/sync/${upper}`, validBody, 400);
  await checkSendRejects("DELETE /api/sync/[syncId] (63 hex chars) -> 400", "DELETE", `/api/sync/${short}`, undefined, 400);

  const valid = `/api/sync/${randomHex(32)}`;
  await checkSendRejects("PUT /api/sync/[syncId] (body is not JSON) -> 400", "PUT", valid, "{nope", 400);
  await checkSendRejects("PUT /api/sync/[syncId] (no ciphertext) -> 400", "PUT", valid, { iv, baseVersion: 0 }, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (ciphertext not base64) -> 400", "PUT", valid, { ciphertext: "not base64!!", iv, baseVersion: 0 }, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (ciphertext too short) -> 400", "PUT", valid, { ciphertext: randomBase64(8), iv, baseVersion: 0 }, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (iv not 12 bytes) -> 400", "PUT", valid, { ciphertext: firstBlob, iv: randomBase64(11), baseVersion: 0 }, 400);
  await checkSendRejects("PUT /api/sync/[syncId] (negative baseVersion) -> 400", "PUT", valid, { ciphertext: firstBlob, iv, baseVersion: -1 }, 400);
}

/** JourneyPoint, the endpoint shape both leg kinds share. */
function checkJourneyPoint(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.name, `${path}.name`),
    ...checkNumber(v.lat, `${path}.lat`),
    ...checkNumber(v.lon, `${path}.lon`),
    ...checkNullable(checkString, v.stopId, `${path}.stopId`),
    ...checkNullable(checkString, v.stopCode, `${path}.stopCode`),
  ];
}

function checkJourneyLeg(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  const errors = [
    ...checkEnum(["walk", "ride"], v.kind, `${path}.kind`),
    ...checkJourneyPoint(v.from, `${path}.from`),
    ...checkJourneyPoint(v.to, `${path}.to`),
    ...checkNumber(v.departureTime, `${path}.departureTime`),
    ...checkNumber(v.arrivalTime, `${path}.arrivalTime`),
    ...checkNumber(v.durationSec, `${path}.durationSec`),
  ];
  if (v.kind === "walk") errors.push(...checkNumber(v.distanceM, `${path}.distanceM`));
  if (v.kind === "ride") {
    errors.push(
      ...checkRouteSummary(v.route, `${path}.route`),
      ...checkNumber(v.directionId, `${path}.directionId`),
      ...checkString(v.tripId, `${path}.tripId`),
      ...checkString(v.headsign, `${path}.headsign`),
      ...checkNumber(v.stopCount, `${path}.stopCount`),
      ...checkString(v.serviceDate, `${path}.serviceDate`),
      // Required since the map draws the real shape; null only when the feed has none.
      ...checkNullable(checkString, v.geometry, `${path}.geometry`),
    );
  }
  return errors;
}

function checkJourney(v: unknown, path: string): string[] {
  if (!isRecord(v)) return [`${path}: expected object, got ${typeof v}`];
  return [
    ...checkString(v.id, `${path}.id`),
    ...checkArray(checkJourneyLeg, v.legs, `${path}.legs`),
    ...checkNumber(v.departureTime, `${path}.departureTime`),
    ...checkNumber(v.arrivalTime, `${path}.arrivalTime`),
    ...checkNumber(v.durationSec, `${path}.durationSec`),
    ...checkNumber(v.transfers, `${path}.transfers`),
    ...checkNumber(v.walkDistanceM, `${path}.walkDistanceM`),
    ...checkNumber(v.walkDurationSec, `${path}.walkDurationSec`),
    ...checkEnum(["scheduled"], v.source, `${path}.source`),
  ];
}

/**
 * GET /api/journey.
 *
 * Only the `stop:<id>` and `<lat>,<lon>` spellings are exercised: free text
 * goes to Nominatim, and a smoke test must not depend on a third party's
 * uptime, nor spend someone else's donated quota on every CI run.
 *
 * The planner is capped at 8 requests per 5 s, tighter than the read-only
 * routes, so every call here is deliberately spaced out.
 */
async function checkJourneyPlanner(originStopId: string, destinationStopId: string): Promise<void> {
  const from = `stop:${originStopId}`;
  const to = `stop:${destinationStopId}`;
  const pace = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, JOURNEY_PACE_MS));

  await check("GET /api/journey", async () => {
    await pace();
    const requestedAt = Math.floor(Date.now() / 1000);
    const { status, body } = await getJson(
      `/api/journey?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&results=${JOURNEY_RESULTS}`,
    );
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkJourneyPoint(body.origin, "origin"),
      ...checkJourneyPoint(body.destination, "destination"),
      ...checkNumber(body.departAfter, "departAfter"),
      ...checkArray(checkJourney, body.journeys, "journeys"),
      ...checkNullable(checkString, body.notice, "notice"),
      ...checkNumber(body.generatedAt, "generatedAt"),
    ];
    if (errors.length > 0) return errors;

    const origin = isRecord(body.origin) ? body.origin : {};
    const destination = isRecord(body.destination) ? body.destination : {};
    if (origin.stopId !== originStopId) errors.push(`origin.stopId: expected ${originStopId}, got ${String(origin.stopId)}`);
    if (destination.stopId !== destinationStopId) errors.push(`destination.stopId: expected ${destinationStopId}, got ${String(destination.stopId)}`);
    if (origin.kind !== "stop") errors.push(`origin.kind: "stop:" input must resolve to a stop, got ${String(origin.kind)}`);

    const journeys = asRecords(body.journeys);
    if (journeys.length > JOURNEY_RESULTS) {
      errors.push(`journeys: ${journeys.length} results, more than the requested ${JOURNEY_RESULTS}`);
    }
    if (journeys.length === 0) {
      // Two stops on one line, so no plan at all is either a broken planner or
      // a night with no service; the notice is what tells the two apart.
      if (body.notice === null) errors.push(`no journey from ${originStopId} to ${destinationStopId}, and no notice explaining why`);
      return errors;
    }

    let previousArrival = Number.NEGATIVE_INFINITY;
    const seenIds = new Set<string>();
    for (const [i, journey] of journeys.entries()) {
      const id = journey.id;
      if (typeof id === "string") {
        if (seenIds.has(id)) errors.push(`journeys[${i}].id: ${id} is not unique within the response`);
        seenIds.add(id);
      }
      const legs = asRecords(journey.legs);
      if (legs.length === 0) {
        errors.push(`journeys[${i}].legs: empty, a journey has to be made of something`);
        continue;
      }

      const departureTime = journey.departureTime;
      const arrivalTime = journey.arrivalTime;
      if (typeof departureTime !== "number" || typeof arrivalTime !== "number") continue;
      if (departureTime < requestedAt - 600) {
        errors.push(`journeys[${i}].departureTime: ${departureTime} is before the search instant ${requestedAt}; the planner is offering a bus that has gone`);
      }
      if (arrivalTime <= departureTime) {
        errors.push(`journeys[${i}]: arrives at ${arrivalTime}, at or before its ${departureTime} departure`);
      }
      if (journey.durationSec !== arrivalTime - departureTime) {
        errors.push(`journeys[${i}].durationSec: ${String(journey.durationSec)} does not match arrivalTime - departureTime (${arrivalTime - departureTime})`);
      }

      // Legs have to chain: the summary is only true if the parts add up.
      const firstLeg = legs[0];
      const lastLeg = legs[legs.length - 1];
      if (firstLeg.departureTime !== departureTime) {
        errors.push(`journeys[${i}]: departs at ${departureTime} but its first leg departs at ${String(firstLeg.departureTime)}`);
      }
      if (lastLeg.arrivalTime !== arrivalTime) {
        errors.push(`journeys[${i}]: arrives at ${arrivalTime} but its last leg arrives at ${String(lastLeg.arrivalTime)}`);
      }
      let walkMetres = 0;
      let rideCount = 0;
      for (const [j, leg] of legs.entries()) {
        const legDeparture = leg.departureTime;
        const legArrival = leg.arrivalTime;
        if (typeof legDeparture !== "number" || typeof legArrival !== "number") continue;
        if (legArrival < legDeparture) errors.push(`journeys[${i}].legs[${j}]: arrives ${legDeparture - legArrival} s before it departs`);
        if (leg.durationSec !== legArrival - legDeparture) {
          errors.push(`journeys[${i}].legs[${j}].durationSec: ${String(leg.durationSec)} does not match its own times (${legArrival - legDeparture})`);
        }
        const previous = legs[j - 1];
        if (previous !== undefined && typeof previous.arrivalTime === "number" && legDeparture < previous.arrivalTime) {
          errors.push(`journeys[${i}].legs[${j}]: departs at ${legDeparture}, before leg ${j - 1} arrives at ${previous.arrivalTime}`);
        }
        const from = leg.from;
        if (previous !== undefined && isRecord(previous.to) && isRecord(from)) {
          if (previous.to.stopId !== from.stopId || previous.to.name !== from.name) {
            errors.push(`journeys[${i}].legs[${j}]: starts at ${String(from.name)}, but leg ${j - 1} ended at ${String(previous.to.name)}`);
          }
        }
        for (const end of ["from", "to"] as const) {
          const point = leg[end];
          if (isRecord(point)) errors.push(...checkInRome(point, `journeys[${i}].legs[${j}].${end}`));
        }
        if (leg.kind === "walk" && typeof leg.distanceM === "number") walkMetres += leg.distanceM;
        if (leg.kind === "ride") {
          rideCount += 1;
          if (typeof leg.stopCount === "number" && leg.stopCount < 1) {
            errors.push(`journeys[${i}].legs[${j}].stopCount: ${leg.stopCount}, a ride has to cover at least one stop`);
          }
        }
      }
      // The planner offers walking on its own when it is competitive, and puts
      // it first when it wins, so neither the ordering below nor a ride leg is
      // required of it. It does have to be walking all the way, though.
      if (rideCount === 0) {
        const notWalking = legs.filter((leg) => leg.kind !== "walk").length;
        if (notWalking > 0) errors.push(`journeys[${i}]: no ride leg, but ${notWalking} legs are not walks either`);
      } else {
        if (arrivalTime < previousArrival) {
          errors.push(`journeys[${i}].arrivalTime: ${arrivalTime} sorts after ${previousArrival}, results are not ordered by arrival`);
        }
        previousArrival = arrivalTime;
      }
      const expectedTransfers = Math.max(0, rideCount - 1);
      if (journey.transfers !== expectedTransfers) {
        errors.push(`journeys[${i}].transfers: ${String(journey.transfers)} does not match its ${rideCount} ride legs (expected ${expectedTransfers})`);
      }
      if (typeof journey.walkDistanceM === "number" && Math.abs(journey.walkDistanceM - walkMetres) > 1) {
        errors.push(`journeys[${i}].walkDistanceM: ${journey.walkDistanceM} is not the sum of its walk legs (${walkMetres})`);
      }
    }
    return errors;
  });

  await check("GET /api/journey?mode=places", async () => {
    await pace();
    // Coordinates, not free text: this path answers without calling Nominatim.
    const { status, body } = await getJson(`/api/journey?mode=places&q=${TERMINI_LAT}%2C${TERMINI_LON}`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = checkArray(checkJourneyPoint, body.places, "places");
    if (errors.length > 0) return errors;
    const places = asRecords(body.places);
    if (places.length === 0) return ["a coordinate inside Rome resolved to no place at all"];
    const first = places[0];
    if (first.kind !== "coord") errors.push(`places[0].kind: expected coord, got ${String(first.kind)}`);
    if (typeof first.lat === "number" && Math.abs(first.lat - TERMINI_LAT) > 0.0001) {
      errors.push(`places[0].lat: ${first.lat} is not the ${TERMINI_LAT} that was asked for`);
    }
    return errors;
  });

  const encodedFrom = encodeURIComponent(from);
  const encodedTo = encodeURIComponent(to);
  const rejections: Array<[string, string, number]> = [
    ["GET /api/journey (no from/to) -> 400", "/api/journey", 400],
    ["GET /api/journey (results out of range) -> 400", `/api/journey?from=${encodedFrom}&to=${encodedTo}&results=9`, 400],
    ["GET /api/journey (at not numeric) -> 400", `/api/journey?from=${encodedFrom}&to=${encodedTo}&at=domani`, 400],
    ["GET /api/journey (coordinates outside Rome) -> 400", `/api/journey?from=0%2C0&to=${encodedTo}`, 400],
    ["GET /api/journey (unknown stop) -> 404", `/api/journey?from=stop%3A00000000&to=${encodedTo}`, 404],
  ];
  for (const [label, query, expected] of rejections) {
    await pace();
    await checkRejects(label, query, expected);
  }
}

async function main(): Promise<void> {
  console.log(`Probus smoke test against ${baseUrl}`);

  // Bootstrap: find a real stop and route via the nearby endpoint before
  // exercising the rest of the API against them.
  let bootstrapStopId: string | null = null;
  let bootstrapStopName: string | null = null;
  let bootstrapRouteId: string | null = null;

  await check("GET /api/stops/nearby", async () => {
    const { status, body } = await getJson(`/api/stops/nearby?lat=${TERMINI_LAT}&lon=${TERMINI_LON}&radius=${NEARBY_RADIUS}`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = checkArray(checkNearbyStop, body.stops, "stops");
    if (errors.length > 0) return errors;
    const stops = asRecords(body.stops);
    if (stops.length === 0) return [`expected at least one stop near Termini within ${NEARBY_RADIUS} m, got none`];

    // Real-value assertions: inside the radius, sorted by distance, no dupes.
    const seen = new Set<string>();
    let previous = -1;
    for (const [i, stop] of stops.entries()) {
      const distance = stop.distanceM;
      const stopId = stop.stopId;
      if (typeof distance !== "number" || typeof stopId !== "string") continue;
      if (distance > NEARBY_RADIUS) errors.push(`stops[${i}].distanceM: ${distance} m exceeds the requested radius of ${NEARBY_RADIUS} m`);
      if (distance < previous) errors.push(`stops[${i}].distanceM: ${distance} m sorts after ${previous} m, results are not ordered by distance`);
      previous = distance;
      if (seen.has(stopId)) errors.push(`stops[${i}].stopId: ${stopId} appears twice`);
      seen.add(stopId);
    }

    // Prefer the busiest stop: it makes the timetable and line checks meaningful.
    const busiest = stops.reduce((best, stop) => {
      const bestCount = Array.isArray(best.routes) ? best.routes.length : 0;
      const count = Array.isArray(stop.routes) ? stop.routes.length : 0;
      return count > bestCount ? stop : best;
    }, stops[0]);
    if (typeof busiest.stopId === "string") bootstrapStopId = busiest.stopId;
    if (typeof busiest.stopName === "string") bootstrapStopName = busiest.stopName;
    const firstRoute = asRecords(busiest.routes)[0];
    if (firstRoute !== undefined && typeof firstRoute.routeId === "string") bootstrapRouteId = firstRoute.routeId;
    return errors;
  });

  if (bootstrapStopId === null) {
    console.error("Cannot continue: /api/stops/nearby did not yield a usable stop.");
    printReportAndExit();
    return;
  }
  const stopId: string = bootstrapStopId;

  await check("GET /api/arrivals/[stopId]", async () => {
    const { status, body } = await getJson(`/api/arrivals/${encodeURIComponent(stopId)}`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkStopWithRoutes(body.stop, "stop"),
      ...checkArray(checkArrival, body.arrivals, "arrivals"),
      ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
      ...checkBoolean(body.degraded, "degraded"),
      ...checkNumber(body.generatedAt, "generatedAt"),
    ];
    if (errors.length > 0) return errors;

    const stopBody = isRecord(body.stop) ? body.stop : {};
    if (stopBody.stopId !== stopId) errors.push(`stop.stopId: expected ${stopId}, got ${String(stopBody.stopId)}`);
    const generatedAt = typeof body.generatedAt === "number" ? body.generatedAt : 0;
    const skew = Math.abs(generatedAt - Math.floor(Date.now() / 1000));
    if (skew > 600) errors.push(`generatedAt: ${generatedAt} is ${skew} s away from now, the server clock or the value is wrong`);

    const arrivals = asRecords(body.arrivals);
    if (arrivals.length > DEFAULT_MAX_ARRIVALS) {
      errors.push(`arrivals: ${arrivals.length} entries exceeds the default cap of ${DEFAULT_MAX_ARRIVALS}`);
    }
    let previousTime = Number.NEGATIVE_INFINITY;
    const seenTrips = new Set<string>();
    for (const [i, arrival] of arrivals.entries()) {
      const arrivalTime = arrival.arrivalTime;
      const minutesAway = arrival.minutesAway;
      if (typeof arrivalTime !== "number" || typeof minutesAway !== "number") continue;
      if (arrivalTime < previousTime) errors.push(`arrivals[${i}].arrivalTime: ${arrivalTime} sorts after ${previousTime}, arrivals are not chronological`);
      previousTime = arrivalTime;
      // minutesAway is derived from the same clock as generatedAt, so this is exact.
      const expected = Math.floor((arrivalTime - generatedAt) / 60);
      if (minutesAway !== expected) errors.push(`arrivals[${i}].minutesAway: ${minutesAway} does not match floor((${arrivalTime} - ${generatedAt}) / 60) = ${expected}`);
      if (arrivalTime < generatedAt - 600) errors.push(`arrivals[${i}].arrivalTime: ${arrivalTime} is more than 10 min in the past`);
      const tripId = arrival.tripId;
      if (typeof tripId === "string") {
        if (seenTrips.has(tripId)) errors.push(`arrivals[${i}].tripId: ${tripId} listed twice`);
        seenTrips.add(tripId);
      }
      if (arrival.source === "scheduled" && arrival.delaySec !== null) {
        errors.push(`arrivals[${i}]: a scheduled arrival cannot carry delaySec=${String(arrival.delaySec)}`);
      }
    }
    // Every arrival must name a line the stop actually advertises.
    const stopRouteIds = new Set(asRecords(stopBody.routes).map((r) => r.routeId));
    for (const [i, arrival] of arrivals.entries()) {
      if (stopRouteIds.size > 0 && !stopRouteIds.has(arrival.routeId)) {
        errors.push(`arrivals[${i}].routeId: ${String(arrival.routeId)} is not among the routes listed for stop ${stopId}`);
      }
    }
    return errors;
  });

  let timetableRouteId: string | null = null;
  let unfilteredEntryCount = 0;

  await check("GET /api/timetable/[stopId]", async () => {
    const date = todayYyyymmdd();
    const { status, body } = await getJson(`/api/timetable/${encodeURIComponent(stopId)}?date=${date}`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkStop(body.stop, "stop"),
      ...checkString(body.date, "date"),
      ...checkArray(checkRouteSummary, body.routes, "routes"),
      ...checkArray(checkTimetableEntry, body.entries, "entries"),
    ];
    if (errors.length > 0) return errors;
    if (body.date !== date) errors.push(`date: expected ${date}, got ${String(body.date)}`);

    const entries = asRecords(body.entries);
    unfilteredEntryCount = entries.length;
    if (entries.length === 0) {
      errors.push(`expected scheduled departures at ${bootstrapStopName ?? stopId} on ${date}, got none (is ${date} inside the feed's calendar_dates range?)`);
    }
    let previousSec = Number.NEGATIVE_INFINITY;
    for (const [i, entry] of entries.entries()) {
      const departureSec = entry.departureSec;
      if (typeof departureSec !== "number") continue;
      if (departureSec < previousSec) errors.push(`entries[${i}].departureSec: ${departureSec} sorts after ${previousSec}, the timetable is not ordered`);
      previousSec = departureSec;
      if (departureSec < 0 || departureSec > 172800) errors.push(`entries[${i}].departureSec: ${departureSec} is outside 0..172800`);
      const expectedLabel = secToClock(departureSec);
      if (entry.departureLabel !== expectedLabel) {
        errors.push(`entries[${i}].departureLabel: ${String(entry.departureLabel)} does not match departureSec ${departureSec} (expected ${expectedLabel})`);
      }
    }
    // Remember a line that really runs here, for the filtered call below.
    const first = entries[0];
    if (first !== undefined && typeof first.routeId === "string") timetableRouteId = first.routeId;
    return errors;
  });

  if (timetableRouteId !== null) {
    const routeId: string = timetableRouteId;
    await check("GET /api/timetable/[stopId]?routeId=", async () => {
      const date = todayYyyymmdd();
      const { status, body } = await getJson(`/api/timetable/${encodeURIComponent(stopId)}?date=${date}&routeId=${encodeURIComponent(routeId)}`);
      if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
      if (!isRecord(body)) return ["expected object body"];
      const errors = checkArray(checkTimetableEntry, body.entries, "entries");
      if (errors.length > 0) return errors;
      const entries = asRecords(body.entries);
      if (entries.length === 0) errors.push(`expected departures for routeId=${routeId} at stop ${stopId}, got none although the unfiltered call listed it`);
      if (entries.length > unfilteredEntryCount) errors.push(`filtering by routeId=${routeId} returned ${entries.length} entries, more than the ${unfilteredEntryCount} unfiltered ones`);
      const foreign = entries.filter((e) => e.routeId !== routeId);
      if (foreign.length > 0) errors.push(`routeId filter leaked ${foreign.length} entries from other lines (e.g. ${String(foreign[0].routeId)})`);
      return errors;
    });
  } else {
    results.push({
      endpoint: "GET /api/timetable/[stopId]?routeId=",
      ok: false,
      errors: ["skipped: the unfiltered timetable returned no entry to derive a routeId from"],
    });
  }

  await check("GET /api/search", async () => {
    const name = bootstrapStopName ?? "termini";
    const { status, body } = await getJson(`/api/search?q=${encodeURIComponent(name)}`);
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkString(body.query, "query"),
      ...checkArray(checkStop, body.stops, "stops"),
      ...checkArray(checkRouteSummary, body.routes, "routes"),
    ];
    if (errors.length > 0) return errors;
    if (body.query !== name) errors.push(`query: expected ${name}, got ${String(body.query)}`);
    // Searching a stop's exact name must return that stop.
    const stops = asRecords(body.stops);
    if (!stops.some((s) => s.stopId === stopId)) {
      errors.push(`searching the exact name "${name}" did not return stop ${stopId}; got ${stops.length} stops`);
    }
    return errors;
  });

  await check("GET /api/alerts", async () => {
    const { status, body } = await getJson("/api/alerts");
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkArray(checkServiceAlert, body.alerts, "alerts"),
      ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
      ...checkBoolean(body.degraded, "degraded"),
    ];
    if (errors.length > 0) return errors;
    const now = Math.floor(Date.now() / 1000);
    const feedTimestamp = body.feedTimestamp;
    if (typeof feedTimestamp === "number" && Math.abs(now - feedTimestamp) > 86400) {
      errors.push(`feedTimestamp: ${feedTimestamp} is more than a day away from now (${now}), the poller is serving stale data as live`);
    }
    for (const [i, alert] of asRecords(body.alerts).entries()) {
      const from = alert.activeFrom;
      const until = alert.activeUntil;
      if (typeof from === "number" && typeof until === "number" && until < from) {
        errors.push(`alerts[${i}]: activeUntil ${until} precedes activeFrom ${from}`);
      }
    }
    return errors;
  });

  await check("GET /api/vehicles", async () => {
    const { status, body } = await getJson("/api/vehicles");
    if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
    if (!isRecord(body)) return ["expected object body"];
    const errors = [
      ...checkArray(checkVehicle, body.vehicles, "vehicles"),
      ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
      ...checkBoolean(body.degraded, "degraded"),
    ];
    if (errors.length > 0) return errors;
    const vehicles = asRecords(body.vehicles);
    if (vehicles.length === 0) {
      // Legitimate at 04:00, so only a warning-shaped failure when the feed says it is live.
      if (body.degraded === false) errors.push("the realtime feed reports itself healthy but published no vehicle at all");
      return errors;
    }
    const inRome = vehicles.filter(
      (v) =>
        typeof v.lat === "number" && typeof v.lon === "number" &&
        v.lat >= ROME_LAT_MIN && v.lat <= ROME_LAT_MAX && v.lon >= ROME_LON_MIN && v.lon <= ROME_LON_MAX,
    );
    if (inRome.length === 0) errors.push(`none of the ${vehicles.length} vehicles is inside the Rome bounding box`);
    const now = Math.floor(Date.now() / 1000);
    const fresh = vehicles.filter((v) => typeof v.timestamp === "number" && Math.abs(now - v.timestamp) <= 3600);
    if (fresh.length === 0) errors.push(`no vehicle has a position fix from the last hour; newest is ${Math.max(...vehicles.map((v) => (typeof v.timestamp === "number" ? v.timestamp : 0)))}`);
    const dupes = vehicles.length - new Set(vehicles.map((v) => v.vehicleId)).size;
    if (dupes > 0) errors.push(`${dupes} duplicate vehicleId values in the response`);
    return errors;
  });

  // The far end of a line the bootstrap stop is on: somewhere the planner has
  // to be able to reach from it, so the journey checks have a real pair to use.
  let lineTerminusStopId: string | null = null;

  if (bootstrapRouteId !== null) {
    const routeId: string = bootstrapRouteId;
    let otherDirection: number | null = null;

    await check("GET /api/line/[routeId]", async () => {
      const { status, body } = await getJson(`/api/line/${encodeURIComponent(routeId)}?direction=0`);
      if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
      if (!isRecord(body)) return ["expected object body"];
      const errors = [
        ...checkRouteSummary(body.route, "route"),
        ...checkString(body.agencyName, "agencyName"),
        ...checkArray(checkRouteDirection, body.directions, "directions"),
        ...checkNumber(body.activeDirection, "activeDirection"),
        ...checkArray(checkStop, body.stops, "stops"),
        ...checkNullable(checkString, body.polyline, "polyline"),
      ];
      if (errors.length > 0) return errors;

      const route = isRecord(body.route) ? body.route : {};
      if (route.routeId !== routeId) errors.push(`route.routeId: expected ${routeId}, got ${String(route.routeId)}`);
      if (typeof body.agencyName === "string" && body.agencyName.trim().length === 0) {
        errors.push("agencyName: empty, the line has no operator attributed to it");
      }
      const directions = asRecords(body.directions);
      if (directions.length === 0) errors.push("directions: empty, a real line always runs in at least one direction");
      const directionIds = directions.map((d) => d.directionId);
      if (directions.length > 0 && !directionIds.includes(body.activeDirection)) {
        errors.push(`activeDirection: ${String(body.activeDirection)} is not one of the published directions ${JSON.stringify(directionIds)}`);
      }
      // direction=0 must be honoured whenever the line actually runs it.
      if (directionIds.includes(0) && body.activeDirection !== 0) {
        errors.push(`activeDirection: asked for direction 0, which this line runs, but got ${String(body.activeDirection)}`);
      }
      for (const [i, d] of directions.entries()) {
        if (typeof d.tripCount === "number" && d.tripCount <= 0) errors.push(`directions[${i}].tripCount: ${d.tripCount}, expected at least one trip`);
      }
      otherDirection = directionIds.includes(1) && body.activeDirection !== 1 ? 1 : null;

      const stops = asRecords(body.stops);
      if (stops.length === 0) errors.push("expected at least one stop for a real line, got none");
      if (stops.length === 1) errors.push("a line with a single stop is not a usable itinerary");
      const uniqueStops = new Set(stops.map((s) => s.stopId)).size;
      if (uniqueStops !== stops.length) errors.push(`stops: ${stops.length - uniqueStops} duplicate stopId values in the itinerary`);
      for (const [i, s] of stops.entries()) {
        if (typeof s.lat !== "number" || typeof s.lon !== "number") continue;
        if (s.lat < ROME_LAT_MIN || s.lat > ROME_LAT_MAX || s.lon < ROME_LON_MIN || s.lon > ROME_LON_MAX) {
          errors.push(`stops[${i}]: ${String(s.stopName)} at ${s.lat},${s.lon} is outside the Rome bounding box`);
        }
      }
      if (typeof body.polyline === "string" && body.polyline.length === 0) {
        errors.push("polyline: empty string, use null when the line has no shape");
      }
      const terminus = stops[stops.length - 1];
      if (terminus !== undefined && typeof terminus.stopId === "string") lineTerminusStopId = terminus.stopId;
      return errors;
    });

    if (otherDirection !== null) {
      await check("GET /api/line/[routeId]?direction=1", async () => {
        const { status, body } = await getJson(`/api/line/${encodeURIComponent(routeId)}?direction=1`);
        if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
        if (!isRecord(body)) return ["expected object body"];
        const errors = [...checkNumber(body.activeDirection, "activeDirection"), ...checkArray(checkStop, body.stops, "stops")];
        if (errors.length > 0) return errors;
        if (body.activeDirection !== 1) errors.push(`activeDirection: expected 1, got ${String(body.activeDirection)}`);
        if (asRecords(body.stops).length === 0) errors.push("expected stops for direction 1, got none");
        return errors;
      });
    }

    await check("GET /api/vehicles?routeId=", async () => {
      const { status, body } = await getJson(`/api/vehicles?routeId=${encodeURIComponent(routeId)}`);
      if (status !== 200) return [`expected 200, got ${status}: ${JSON.stringify(body)}`];
      if (!isRecord(body)) return ["expected object body"];
      const errors = [
        ...checkArray(checkVehicle, body.vehicles, "vehicles"),
        ...checkNullable(checkNumber, body.feedTimestamp, "feedTimestamp"),
        ...checkBoolean(body.degraded, "degraded"),
      ];
      if (errors.length > 0) return errors;
      const vehicles = asRecords(body.vehicles);
      const mismatched = vehicles.filter((veh) => veh.routeId !== null && veh.routeId !== routeId);
      if (mismatched.length > 0) errors.push(`expected all vehicles filtered by routeId=${routeId}, got ${mismatched.length} from other routes`);
      return errors;
    });
  } else {
    results.push({
      endpoint: "GET /api/line/[routeId]",
      ok: false,
      errors: ["skipped: no routeId available from bootstrap stop"],
    });
  }

  await checkStopVehicles(stopId);
  await checkSync();

  if (lineTerminusStopId !== null && lineTerminusStopId !== stopId) {
    await checkJourneyPlanner(stopId, lineTerminusStopId);
  } else {
    results.push({
      endpoint: "GET /api/journey",
      ok: false,
      errors: ["skipped: the line check yielded no second stop to plan a journey to"],
    });
  }

  // Error paths: the contract requires the ApiError shape with a 4xx status.
  await checkRejects("GET /api/stops/nearby (no coordinates) -> 400", "/api/stops/nearby", 400);
  await checkRejects("GET /api/stops/nearby (outside Rome) -> 400", "/api/stops/nearby?lat=0&lon=0", 400);
  await checkRejects(
    "GET /api/stops/nearby (radius too small) -> 400",
    `/api/stops/nearby?lat=${TERMINI_LAT}&lon=${TERMINI_LON}&radius=${MIN_RADIUS_M - 1}`,
    400,
  );
  await checkRejects("GET /api/stops/nearby (lat not a number) -> 400", "/api/stops/nearby?lat=abc&lon=12.5", 400);
  await checkRejects("GET /api/arrivals/[stopId] (malformed id) -> 400", "/api/arrivals/a%21b", 400);
  await checkRejects("GET /api/arrivals/[stopId] (unknown stop) -> 404", "/api/arrivals/00000000", 404);
  await checkRejects(
    "GET /api/timetable/[stopId] (bad date) -> 400",
    `/api/timetable/${encodeURIComponent(stopId)}?date=20261332`,
    400,
  );
  await checkRejects("GET /api/timetable/[stopId] (unknown stop) -> 404", "/api/timetable/00000000", 404);
  await checkRejects("GET /api/search (no q) -> 400", "/api/search", 400);
  await checkRejects("GET /api/search (q too long) -> 400", `/api/search?q=${"a".repeat(101)}`, 400);
  await checkRejects("GET /api/line/[routeId] (bad direction) -> 400", "/api/line/64?direction=2", 400);
  await checkRejects("GET /api/line/[routeId] (unknown line) -> 404", "/api/line/ZZZZNOSUCHLINE", 404);
  await checkRejects("GET /api/vehicles (malformed routeId) -> 400", "/api/vehicles?routeId=a%21b", 400);
  await checkRejects(
    "GET /api/stops/[stopId]/vehicles (bad mode) -> 400",
    `/api/stops/${encodeURIComponent(stopId)}/vehicles?mode=nearby`,
    400,
  );
  await checkRejects("GET /api/stops/[stopId]/vehicles (malformed id) -> 400", "/api/stops/a%21b/vehicles", 400);
  await checkRejects("GET /api/stops/[stopId]/vehicles (unknown stop) -> 404", "/api/stops/00000000/vehicles", 404);

  printReportAndExit();
}

function printReportAndExit(): void {
  console.log("");
  for (const r of results) {
    if (r.ok) {
      console.log(`  OK   ${r.endpoint}`);
    } else {
      console.log(`  FAIL ${r.endpoint}`);
      for (const e of r.errors) console.log(`       ${e}`);
    }
  }
  const failed = results.filter((r) => !r.ok);
  console.log("");
  console.log(`${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
