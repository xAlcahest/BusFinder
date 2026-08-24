/**
 * In-process GTFS-realtime poller. One fetch cycle serves every request;
 * nothing here is per-user. Server-only, never import from a client component:
 * it keeps a process-wide timer and state.
 *
 * Every fetch is conditional on the origin's Last-Modified, so an unchanged
 * feed costs a 304 with no body instead of the whole payload.
 *
 * Timestamps in this module are unix SECONDS, including `fetchedAt`.
 */

import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import type { transit_realtime as TR } from "gtfs-realtime-bindings";

const { transit_realtime } = GtfsRealtimeBindings;

// ---------------------------------------------------------------------------
// Public contract (fixed in CONTRACT.md)
// ---------------------------------------------------------------------------

export interface StopTimeUpdateLite {
  tripId: string;
  routeId: string | null;
  vehicleId: string | null;
  stopId: string;
  stopSequence: number | null;
  time: number | null;
  delay: number | null;
  skipped: boolean;
  /**
   * GTFS-RT NO_DATA: the producer publishes no live timing for this stop, so
   * the passage is real but its clock is the timetable's, not a prediction.
   */
  noData: boolean;
}

export interface TripUpdateLite {
  tripId: string;
  routeId: string | null;
  directionId: number | null;
  startDate: string | null;
  vehicleId: string | null;
  stops: StopTimeUpdateLite[];
}

export interface VehicleLite {
  /**
   * Identity, not display: markers, motion trackers and every dedupe key on it.
   * Built from the descriptor id and the label together, because the label
   * alone is a number painted on a bus and two operators can paint the same one.
   */
  vehicleId: string;
  /** The number painted on the bus. Display only, never an identity. */
  vehicleLabel: string | null;
  tripId: string | null;
  routeId: string | null;
  lat: number;
  lon: number;
  bearing: number | null;
  timestamp: number;
}

export interface RawAlert {
  id: string;
  header: string;
  description: string;
  url: string | null;
  cause: string | null;
  effect: string | null;
  activeFrom: number | null;
  activeUntil: number | null;
  routeIds: string[];
  stopIds: string[];
}

/**
 * Header clock of each feed, carried over per feed when one of them fails, so
 * a consumer never pairs one feed's data with another feed's timestamp.
 */
export interface FeedTimestamps {
  tripUpdates: number | null;
  vehicles: number | null;
  alerts: number | null;
}

export interface RealtimeSnapshot {
  /** Keyed by tripId. */
  tripUpdates: Map<string, TripUpdateLite>;
  /** Keyed by stopId, each list sorted by time ascending, unknown times last. */
  byStop: Map<string, StopTimeUpdateLite[]>;
  vehicles: VehicleLite[];
  alerts: RawAlert[];
  /** Clock of the data being served: the trip-updates feed when it has one. */
  feedTimestamp: number | null;
  feedTimestamps: FeedTimestamps;
  /** Unix seconds of the last cycle that confirmed at least one feed current. */
  fetchedAt: number;
  degraded: boolean;
  /**
   * Bumps only when a cycle decoded new bytes. Two snapshots with the same
   * revision carry the same data, which is what lets a route reuse a body and
   * its ETag instead of rebuilding both. Optional so a hand-built fallback
   * snapshot stays valid; absent means "assume nothing, rebuild".
   */
  revision?: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = "https://romamobilita.it/sites/default/files/";
const FEED_FILES = {
  tripUpdates: "rome_rtgtfs_trip_updates_feed.pb",
  vehicles: "rome_rtgtfs_vehicle_positions_feed.pb",
  alerts: "rome_rtgtfs_service_alerts_feed.pb",
} as const;

/**
 * The origin refreshes the realtime feeds every ~35 s and honours
 * If-Modified-Since, so an unchanged feed costs it a 304 with an empty body.
 * At 10 s we halve the worst-case staleness of a position without moving more
 * bytes than the old 30 s unconditional cycle did.
 */
const POLL_INTERVAL_MS = 10_000;
/** Alerts are not latency-sensitive; they keep the old cadence. */
const ALERTS_MIN_INTERVAL_MS = 30_000;
/** Below the poll interval, so a slow fetch cannot make cycles pile up. */
const FETCH_TIMEOUT_MS = 9_000;
/** Largest feed body we will hold in memory; the real feeds are under 400 kB. */
const MAX_FEED_BYTES = 8 * 1024 * 1024;
/** Data older than this counts as degraded, both for our fetch and the feed. */
const MAX_AGE_SEC = 180;
const USER_AGENT = "BusFinder-web/1.0 (+realtime poller)";
/** Plausible unix-second window, guards against bogus or millisecond values. */
const MIN_PLAUSIBLE_TIME = 1_000_000_000;
const MAX_PLAUSIBLE_TIME = 4_000_000_000;

// ---------------------------------------------------------------------------
// Numeric normalisation. Protobuf 64-bit fields arrive as number, string or a
// Long-like {low, high, unsigned}; getting this wrong yields silent NaN.
// ---------------------------------------------------------------------------

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return null;
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object") {
    if ("low" in value && "high" in value) {
      const low = value.low;
      const high = value.high;
      if (typeof low === "number" && typeof high === "number") {
        const unsigned = "unsigned" in value && value.unsigned === true;
        // Long keeps both halves as int32; re-widen high before recombining.
        const highPart = unsigned ? high >>> 0 : high | 0;
        const combined = highPart * 4_294_967_296 + (low >>> 0);
        return Number.isFinite(combined) ? combined : null;
      }
    }
    const asString = String(value);
    const parsed = Number(asString);
    return Number.isFinite(parsed) && asString.trim() !== "" ? parsed : null;
  }
  return null;
}

/** Protobuf classes expose defaults on the prototype: absent != 0. */
function ownNumber(source: object, key: string, value: unknown): number | null {
  return Object.hasOwn(source, key) ? toNumberOrNull(value) : null;
}

function plausibleTime(value: number | null): number | null {
  if (value === null) return null;
  return value >= MIN_PLAUSIBLE_TIME && value <= MAX_PLAUSIBLE_TIME ? Math.trunc(value) : null;
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

// ---------------------------------------------------------------------------
// Enum decoding. Decoded messages carry numeric enums; some producers and
// JSON round-trips carry the names instead, so accept both.
// ---------------------------------------------------------------------------

const STOP_TIME_RELATIONSHIP: Readonly<Record<number, string>> = {
  0: "SCHEDULED",
  1: "SKIPPED",
  2: "NO_DATA",
  3: "UNSCHEDULED",
};

const ALERT_CAUSE: Readonly<Record<number, string>> = {
  1: "UNKNOWN_CAUSE",
  2: "OTHER_CAUSE",
  3: "TECHNICAL_PROBLEM",
  4: "STRIKE",
  5: "DEMONSTRATION",
  6: "ACCIDENT",
  7: "HOLIDAY",
  8: "WEATHER",
  9: "MAINTENANCE",
  10: "CONSTRUCTION",
  11: "POLICE_ACTIVITY",
  12: "MEDICAL_EMERGENCY",
};

const ALERT_EFFECT: Readonly<Record<number, string>> = {
  1: "NO_SERVICE",
  2: "REDUCED_SERVICE",
  3: "SIGNIFICANT_DELAYS",
  4: "DETOUR",
  5: "ADDITIONAL_SERVICE",
  6: "MODIFIED_SERVICE",
  7: "OTHER_EFFECT",
  8: "UNKNOWN_EFFECT",
  9: "STOP_MOVED",
  10: "NO_EFFECT",
  11: "ACCESSIBILITY_ISSUE",
};

function enumName(table: Readonly<Record<number, string>>, value: unknown): string | null {
  if (typeof value === "string") return nonEmptyString(value.toUpperCase());
  const numeric = toNumberOrNull(value);
  if (numeric === null) return null;
  return table[numeric] ?? null;
}

// ---------------------------------------------------------------------------
// Feed parsing
// ---------------------------------------------------------------------------

function headerTimestamp(message: TR.FeedMessage | null): number | null {
  if (message === null) return null;
  const header = message.header;
  if (header === null || header === undefined) return null;
  return plausibleTime(ownNumber(header, "timestamp", header.timestamp));
}

function vehicleLabelOf(descriptor: TR.IVehicleDescriptor | null | undefined): string | null {
  if (!descriptor) return null;
  // Label is the number painted on the bus, what riders actually recognise.
  return nonEmptyString(descriptor.label) ?? nonEmptyString(descriptor.id);
}

/**
 * Stable identity of one physical vehicle. The descriptor id leads because it
 * is the operator's own key; the label is folded in when it says something
 * different, so a recycled id and a shared label cannot collapse two buses
 * into one marker that jumps between them.
 */
function vehicleKeyOf(descriptor: TR.IVehicleDescriptor | null | undefined): string | null {
  if (!descriptor) return null;
  const id = nonEmptyString(descriptor.id);
  const label = nonEmptyString(descriptor.label);
  if (id === null || label === null || id === label) return id ?? label;
  // A separator inside either half would let two different pairs spell the same
  // key, so those take a length-prefixed form instead. Untrusted strings.
  if (id.includes("#") || label.includes("#")) return `${id.length}#${id}${label}`;
  return `${id}#${label}`;
}

function parseStopTimeUpdate(
  raw: TR.TripUpdate.IStopTimeUpdate,
  tripId: string,
  routeId: string | null,
  vehicleId: string | null,
): StopTimeUpdateLite | null {
  const stopId = nonEmptyString(raw.stopId);
  if (stopId === null) return null;

  // NO_DATA is kept: it means "no live timing here", not "no passage here".
  const relationship = enumName(STOP_TIME_RELATIONSHIP, raw.scheduleRelationship);

  const events: TR.TripUpdate.IStopTimeEvent[] = [];
  if (raw.arrival) events.push(raw.arrival);
  if (raw.departure) events.push(raw.departure);

  let time: number | null = null;
  let delay: number | null = null;
  for (const event of events) {
    const candidate = plausibleTime(ownNumber(event, "time", event.time));
    if (candidate === null) continue;
    time = candidate;
    delay = ownNumber(event, "delay", event.delay);
    break;
  }
  if (time === null) {
    for (const event of events) {
      const candidate = ownNumber(event, "delay", event.delay);
      if (candidate === null) continue;
      delay = candidate;
      break;
    }
  }

  return {
    tripId,
    routeId,
    vehicleId,
    stopId,
    stopSequence: ownNumber(raw, "stopSequence", raw.stopSequence),
    time,
    delay,
    skipped: relationship === "SKIPPED",
    noData: relationship === "NO_DATA",
  };
}

interface TripUpdateIndex {
  tripUpdates: Map<string, TripUpdateLite>;
  byStop: Map<string, StopTimeUpdateLite[]>;
}

function parseTripUpdates(message: TR.FeedMessage): TripUpdateIndex {
  const tripUpdates = new Map<string, TripUpdateLite>();
  const byStop = new Map<string, StopTimeUpdateLite[]>();

  for (const entity of message.entity ?? []) {
    if (entity.isDeleted === true) continue;
    const update = entity.tripUpdate;
    if (!update) continue;
    const trip = update.trip;
    const tripId = nonEmptyString(trip?.tripId);
    if (tripId === null) continue;
    // The origin repeats a handful of identical entities per feed; first wins,
    // otherwise a stop would list the same trip twice.
    if (tripUpdates.has(tripId)) continue;

    const routeId = nonEmptyString(trip?.routeId);
    // Trip updates carry the label: it is what the arrivals list shows.
    const vehicleId = vehicleLabelOf(update.vehicle);
    const directionId = trip ? ownNumber(trip, "directionId", trip.directionId) : null;

    const stops: StopTimeUpdateLite[] = [];
    for (const rawStop of update.stopTimeUpdate ?? []) {
      const parsed = parseStopTimeUpdate(rawStop, tripId, routeId, vehicleId);
      if (parsed === null) continue;
      stops.push(parsed);
      const bucket = byStop.get(parsed.stopId);
      if (bucket === undefined) byStop.set(parsed.stopId, [parsed]);
      else bucket.push(parsed);
    }

    tripUpdates.set(tripId, {
      tripId,
      routeId,
      directionId,
      startDate: nonEmptyString(trip?.startDate),
      vehicleId,
      stops,
    });
  }

  for (const bucket of byStop.values()) {
    bucket.sort((a, b) => (a.time ?? Number.POSITIVE_INFINITY) - (b.time ?? Number.POSITIVE_INFINITY));
  }

  return { tripUpdates, byStop };
}

/**
 * Which of two fixes of the same vehicle to keep: the newest, and on a tie the
 * one further south, so nothing depends on the order the producer emitted them.
 */
function fresher(candidate: VehicleLite, known: VehicleLite): boolean {
  if (candidate.timestamp !== known.timestamp) return candidate.timestamp > known.timestamp;
  if (candidate.lat !== known.lat) return candidate.lat < known.lat;
  return candidate.lon < known.lon;
}

function parseVehicles(message: TR.FeedMessage, feedTimestamp: number | null): VehicleLite[] {
  const byId = new Map<string, VehicleLite>();
  const fallbackTime = feedTimestamp ?? nowSec();

  for (const entity of message.entity ?? []) {
    if (entity.isDeleted === true) continue;
    const position = entity.vehicle;
    if (!position) continue;
    const point = position.position;
    if (!point) continue;

    const lat = toNumberOrNull(point.latitude);
    const lon = toNumberOrNull(point.longitude);
    if (lat === null || lon === null) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    // A 0,0 fix is the GPS "no lock" sentinel, not a place any bus goes.
    if (lat === 0 && lon === 0) continue;

    const tripId = nonEmptyString(position.trip?.tripId);
    const vehicleId = vehicleKeyOf(position.vehicle) ?? (tripId !== null ? `trip:${tripId}` : null);
    if (vehicleId === null) continue;

    const parsed: VehicleLite = {
      vehicleId,
      vehicleLabel: vehicleLabelOf(position.vehicle),
      tripId,
      routeId: nonEmptyString(position.trip?.routeId),
      lat,
      lon,
      bearing: ownNumber(point, "bearing", point.bearing),
      timestamp: plausibleTime(ownNumber(position, "timestamp", position.timestamp)) ?? fallbackTime,
    };
    const known = byId.get(vehicleId);
    if (known === undefined || fresher(parsed, known)) byId.set(vehicleId, parsed);
  }

  // Sorted by identity so the served order depends on the data, not on the
  // order the producer happened to emit entities in.
  return [...byId.values()].sort((a, b) =>
    a.vehicleId < b.vehicleId ? -1 : a.vehicleId > b.vehicleId ? 1 : 0,
  );
}

/** Alert URLs end up in an href: only http(s) survives. */
function safeUrl(value: string | null): string | null {
  if (value === null) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function translatedText(value: TR.ITranslatedString | null | undefined): string | null {
  let fallback: string | null = null;
  for (const translation of value?.translation ?? []) {
    const text = nonEmptyString(translation.text);
    if (text === null) continue;
    const language = typeof translation.language === "string" ? translation.language.toLowerCase() : "";
    if (language.startsWith("it")) return text;
    if (fallback === null) fallback = text;
  }
  return fallback;
}

function parseAlerts(message: TR.FeedMessage): RawAlert[] {
  const alerts: RawAlert[] = [];
  const seen = new Set<string>();
  const entities = message.entity ?? [];

  for (let index = 0; index < entities.length; index += 1) {
    const entity = entities[index];
    if (entity === undefined || entity.isDeleted === true) continue;
    const alert = entity.alert;
    if (!alert) continue;
    const id = nonEmptyString(entity.id) ?? `alert-${index}`;
    if (seen.has(id)) continue;
    seen.add(id);

    let activeFrom: number | null = null;
    let activeUntil: number | null = null;
    for (const period of alert.activePeriod ?? []) {
      const start = plausibleTime(ownNumber(period, "start", period.start));
      const end = plausibleTime(ownNumber(period, "end", period.end));
      if (start !== null && (activeFrom === null || start < activeFrom)) activeFrom = start;
      if (end !== null && (activeUntil === null || end > activeUntil)) activeUntil = end;
    }

    const routeIds = new Set<string>();
    const stopIds = new Set<string>();
    for (const informed of alert.informedEntity ?? []) {
      const routeId = nonEmptyString(informed.routeId) ?? nonEmptyString(informed.trip?.routeId);
      if (routeId !== null) routeIds.add(routeId);
      const stopId = nonEmptyString(informed.stopId);
      if (stopId !== null) stopIds.add(stopId);
    }

    alerts.push({
      id,
      header: translatedText(alert.headerText) ?? "",
      description: translatedText(alert.descriptionText) ?? "",
      url: safeUrl(translatedText(alert.url)),
      // Absent enums default to UNKNOWN_* on the prototype, report them as null.
      cause: Object.hasOwn(alert, "cause") ? enumName(ALERT_CAUSE, alert.cause) : null,
      effect: Object.hasOwn(alert, "effect") ? enumName(ALERT_EFFECT, alert.effect) : null,
      activeFrom,
      activeUntil,
      routeIds: [...routeIds],
      stopIds: [...stopIds],
    });
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

interface FeedResult {
  message: TR.FeedMessage | null;
  /** Origin answered 304: what we already hold is still current, not an error. */
  notModified: boolean;
  /** Validator to send back next cycle; null when the origin publishes none. */
  lastModified: string | null;
  error: string | null;
}

function feedUrl(file: string): string {
  const override = nonEmptyString(process.env.PROBUS_RT_BASE_URL);
  if (override === null) return new URL(file, DEFAULT_BASE_URL).toString();
  try {
    const base = override.endsWith("/") ? override : `${override}/`;
    const url = new URL(file, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`protocollo non supportato: ${url.protocol}`);
    }
    return url.toString();
  } catch (err) {
    console.warn(JSON.stringify({ tag: "realtime.badBaseUrl", value: override, error: errorMessage(err) }));
    return new URL(file, DEFAULT_BASE_URL).toString();
  }
}

/**
 * Reads the body without ever allocating more than `maxBytes`; null when the
 * body is over the cap. The origin is not ours and may serve anything.
 */
async function readCapped(response: Response, maxBytes: number): Promise<Uint8Array | null> {
  const stream = response.body;
  if (stream === null) {
    const whole = new Uint8Array(await response.arrayBuffer());
    return whole.byteLength > maxBytes ? null : whole;
  }
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value === undefined) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/** An HTTP-date is the only validator this origin publishes; anything else is dropped. */
function validatorOf(response: Response, previous: string | null): string | null {
  const raw = response.headers.get("last-modified");
  if (raw === null) return previous;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return previous;
  return Number.isNaN(Date.parse(trimmed)) ? previous : trimmed;
}

async function fetchFeed(file: string, since: string | null): Promise<FeedResult> {
  const url = feedUrl(file);
  const headers: Record<string, string> = {
    accept: "application/octet-stream",
    "user-agent": USER_AGENT,
  };
  if (since !== null) headers["if-modified-since"] = since;
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
    });
    if (response.status === 304) {
      await response.body?.cancel();
      return { message: null, notModified: true, lastModified: since, error: null };
    }
    if (!response.ok) {
      await response.body?.cancel();
      return { message: null, notModified: false, lastModified: since, error: `HTTP ${response.status}` };
    }
    const validator = validatorOf(response, since);
    // Cheap rejection when the origin declares the size up front.
    const declared = toNumberOrNull(response.headers.get("content-length"));
    if (declared !== null && declared > MAX_FEED_BYTES) {
      await response.body?.cancel();
      return {
        message: null,
        notModified: false,
        lastModified: since,
        error: `risposta troppo grande (${declared} byte)`,
      };
    }
    const body = await readCapped(response, MAX_FEED_BYTES);
    if (body === null) {
      return {
        message: null,
        notModified: false,
        lastModified: since,
        error: `risposta oltre ${MAX_FEED_BYTES} byte`,
      };
    }
    if (body.byteLength === 0) {
      return { message: null, notModified: false, lastModified: since, error: "risposta vuota" };
    }
    // Only a body we could decode earns its validator: a rejected one must refetch.
    return {
      message: transit_realtime.FeedMessage.decode(body),
      notModified: false,
      lastModified: validator,
      error: null,
    };
  } catch (err) {
    return { message: null, notModified: false, lastModified: since, error: errorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Poller singleton. Pinned on globalThis so Next dev HMR cannot stack timers.
// ---------------------------------------------------------------------------

/** Last validator seen per feed, so each cycle can ask "changed since this?". */
interface FeedValidators {
  tripUpdates: string | null;
  vehicles: string | null;
  alerts: string | null;
}

interface PollerState {
  snapshot: RealtimeSnapshot;
  /** Handle of the pending tick, null while a cycle is actually running. */
  timer: NodeJS.Timeout | null;
  /** Set once startPoller has taken ownership, so nothing starts a second loop. */
  started: boolean;
  running: boolean;
  validators: FeedValidators;
  /** Epoch ms of the last alerts fetch, which runs on its own slower cadence. */
  alertsFetchedAtMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusRealtimePoller: PollerState | undefined;
}

function emptySnapshot(): RealtimeSnapshot {
  return {
    tripUpdates: new Map<string, TripUpdateLite>(),
    byStop: new Map<string, StopTimeUpdateLite[]>(),
    vehicles: [],
    alerts: [],
    feedTimestamp: null,
    feedTimestamps: { tripUpdates: null, vehicles: null, alerts: null },
    fetchedAt: nowSec(),
    degraded: true,
    revision: 0,
  };
}

function getState(): PollerState {
  const existing = globalThis.__probusRealtimePoller;
  // A dev HMR reload can hand back a state built by an older version of this
  // module, so the fields this one needs are backfilled rather than assumed.
  if (existing !== undefined) {
    existing.validators ??= { tripUpdates: null, vehicles: null, alerts: null };
    existing.alertsFetchedAtMs ??= 0;
    existing.started ??= existing.timer !== null;
    if (typeof existing.snapshot.revision !== "number") existing.snapshot.revision = 0;
    return existing;
  }
  const created: PollerState = {
    snapshot: emptySnapshot(),
    timer: null,
    started: false,
    running: false,
    validators: { tripUpdates: null, vehicles: null, alerts: null },
    alertsFetchedAtMs: 0,
  };
  globalThis.__probusRealtimePoller = created;
  return created;
}

function isStale(snapshot: RealtimeSnapshot, at: number): boolean {
  if (at - snapshot.fetchedAt > MAX_AGE_SEC) return true;
  return snapshot.feedTimestamp !== null && at - snapshot.feedTimestamp > MAX_AGE_SEC;
}

async function runCycle(state: PollerState): Promise<void> {
  if (state.running) {
    console.warn(JSON.stringify({ tag: "realtime.skip", reason: "poll precedente ancora in corso" }));
    return;
  }
  state.running = true;
  const startedAt = Date.now();

  try {
    // Alerts move rarely and nothing on screen waits on them; skipping a cycle
    // is not a failure, so the skipped result reads as "unchanged".
    const wantAlerts = startedAt - state.alertsFetchedAtMs >= ALERTS_MIN_INTERVAL_MS;
    const skippedAlerts: FeedResult = {
      message: null,
      notModified: true,
      lastModified: state.validators.alerts,
      error: null,
    };
    const [tripRes, vehicleRes, alertRes] = await Promise.all([
      fetchFeed(FEED_FILES.tripUpdates, state.validators.tripUpdates),
      fetchFeed(FEED_FILES.vehicles, state.validators.vehicles),
      wantAlerts
        ? fetchFeed(FEED_FILES.alerts, state.validators.alerts)
        : Promise.resolve(skippedAlerts),
    ]);
    if (wantAlerts) state.alertsFetchedAtMs = startedAt;
    state.validators = {
      tripUpdates: tripRes.lastModified,
      vehicles: vehicleRes.lastModified,
      alerts: alertRes.lastModified,
    };

    const previous = state.snapshot;
    const errors: string[] = [];
    let degraded = false;
    let changed = false;

    let tripUpdates = previous.tripUpdates;
    let byStop = previous.byStop;
    if (tripRes.message !== null) {
      const index = parseTripUpdates(tripRes.message);
      tripUpdates = index.tripUpdates;
      byStop = index.byStop;
      changed = true;
    } else if (!tripRes.notModified) {
      degraded = true;
      errors.push(`trip_updates: ${tripRes.error ?? "errore sconosciuto"}`);
    }

    // A feed that failed keeps its previous clock: its data is the old one.
    const feedTimestamps: FeedTimestamps = {
      tripUpdates: headerTimestamp(tripRes.message) ?? previous.feedTimestamps.tripUpdates,
      vehicles: headerTimestamp(vehicleRes.message) ?? previous.feedTimestamps.vehicles,
      alerts: headerTimestamp(alertRes.message) ?? previous.feedTimestamps.alerts,
    };
    const feedTimestamp =
      feedTimestamps.tripUpdates ?? feedTimestamps.vehicles ?? feedTimestamps.alerts;

    let vehicles = previous.vehicles;
    if (vehicleRes.message !== null) {
      vehicles = parseVehicles(vehicleRes.message, feedTimestamps.vehicles);
      changed = true;
    } else if (!vehicleRes.notModified) {
      degraded = true;
      errors.push(`vehicle_positions: ${vehicleRes.error ?? "errore sconosciuto"}`);
    }

    let alerts = previous.alerts;
    if (alertRes.message !== null) {
      alerts = parseAlerts(alertRes.message);
      changed = true;
    } else if (!alertRes.notModified) {
      degraded = true;
      errors.push(`service_alerts: ${alertRes.error ?? "errore sconosciuto"}`);
    }

    // A 304 is as good as fresh bytes: it proves what we hold is still current.
    const confirmed =
      tripRes.error === null || vehicleRes.error === null || (wantAlerts && alertRes.error === null);
    const at = nowSec();
    const next: RealtimeSnapshot = {
      tripUpdates,
      byStop,
      vehicles,
      alerts,
      feedTimestamp,
      feedTimestamps,
      fetchedAt: confirmed ? at : previous.fetchedAt,
      degraded,
      revision: (previous.revision ?? 0) + (changed ? 1 : 0),
    };
    next.degraded = degraded || isStale(next, at);
    state.snapshot = next;

    console.log(
      JSON.stringify({
        tag: "realtime",
        ms: Date.now() - startedAt,
        rev: next.revision,
        fresh: changed,
        vehiclesFresh: vehicleRes.message !== null,
        trips: next.tripUpdates.size,
        stops: next.byStop.size,
        vehicles: next.vehicles.length,
        alerts: next.alerts.length,
        feedTs: next.feedTimestamp,
        degraded: next.degraded,
        errors,
      }),
    );
  } catch (err) {
    // Last resort: keep the previous snapshot and flag it.
    state.snapshot = { ...state.snapshot, degraded: true };
    console.error(JSON.stringify({ tag: "realtime.cycleFailed", error: errorMessage(err) }));
  } finally {
    state.running = false;
  }
}

/**
 * Self-scheduling loop rather than setInterval: the next tick is armed only
 * once the current one has settled, so a slow cycle can never pile up, and the
 * arming lives in a finally so a thrown cycle cannot stop the loop.
 */
function arm(state: PollerState, delayMs: number): void {
  if (state.timer !== null) clearTimeout(state.timer);
  const timer = setTimeout(() => {
    state.timer = null;
    runCycle(state)
      .catch((err: unknown) => {
        console.error(JSON.stringify({ tag: "realtime.tickFailed", error: errorMessage(err) }));
      })
      .finally(() => {
        arm(state, POLL_INTERVAL_MS);
      });
  }, delayMs);
  timer.unref();
  state.timer = timer;
}

export function startPoller(): void {
  const state = getState();
  if (state.started) return;
  state.started = true;
  arm(state, 0);
}

export function getSnapshot(): RealtimeSnapshot {
  try {
    const state = getState();
    // Safety net: whoever reads the feed also gets the poller running.
    if (!state.started) startPoller();
    const snapshot = state.snapshot;
    if (!snapshot.degraded && isStale(snapshot, nowSec())) return { ...snapshot, degraded: true };
    return snapshot;
  } catch (err) {
    console.error(JSON.stringify({ tag: "realtime.snapshotFailed", error: errorMessage(err) }));
    return emptySnapshot();
  }
}
