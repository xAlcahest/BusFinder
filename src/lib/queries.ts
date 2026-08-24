/**
 * Every SQL statement in the app lives here. Statements are prepared once per
 * database instance and cached at module level; user input only ever travels
 * as a bound parameter, never as concatenated SQL.
 */

import type Database from "better-sqlite3";
import { getDb } from "@/lib/db";
import type {
  LineDetail,
  NearbyStop,
  RouteDirection,
  RouteSummary,
  Stop,
  StopWithRoutes,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Statement cache
// ---------------------------------------------------------------------------

type Stmt<R> = Database.Statement<unknown[], R>;

/**
 * Prepares lazily and re-prepares if the process ever swaps the Database
 * instance (a rebuilt gtfs.db), since statements are bound to their handle.
 */
function lazyStmt<R>(sql: string): () => Stmt<R> {
  let prepared: Stmt<R> | null = null;
  let owner: Database.Database | null = null;
  return () => {
    const db = getDb();
    if (prepared === null || owner !== db) {
      prepared = db.prepare<unknown[], R>(sql);
      owner = db;
    }
    return prepared;
  };
}

// ---------------------------------------------------------------------------
// Row decoding: the DB is ours, but a malformed row must fail loudly, not
// silently produce NaN in an API response.
// ---------------------------------------------------------------------------

function str(value: unknown, field: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw new Error(`queries: campo "${field}" non testuale`);
}

function optStr(value: unknown): string | null {
  if (typeof value === "string") return value.length > 0 ? value : null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function num(value: unknown, field: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error(`queries: campo "${field}" non numerico`);
}

function optNum(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// ---------------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------------

interface StopRow {
  stop_id: unknown;
  stop_code: unknown;
  stop_name: unknown;
  lat: unknown;
  lon: unknown;
  wheelchair: unknown;
}

interface RouteRow {
  route_id: unknown;
  short_name: unknown;
  long_name: unknown;
  route_type: unknown;
  color: unknown;
  text_color: unknown;
}

const STOP_COLS = "stop_id, stop_code, stop_name, lat, lon, wheelchair";
const ROUTE_COLS = "route_id, short_name, long_name, route_type, color, text_color";

function toStop(row: StopRow): Stop {
  return {
    stopId: str(row.stop_id, "stop_id"),
    stopCode: optStr(row.stop_code),
    stopName: str(row.stop_name, "stop_name"),
    lat: num(row.lat, "lat"),
    lon: num(row.lon, "lon"),
    wheelchair: optNum(row.wheelchair),
  };
}

function toRoute(row: RouteRow): RouteSummary {
  return {
    routeId: str(row.route_id, "route_id"),
    shortName: str(row.short_name, "short_name"),
    longName: optStr(row.long_name),
    routeType: num(row.route_type, "route_type"),
    color: optStr(row.color),
    textColor: optStr(row.text_color),
  };
}

/** "8" < "23" < "409" < "C2": digits first and numerically, then alphabetical. */
export function compareRouteNames(a: string, b: string): number {
  const na = Number.parseInt(a, 10);
  const nb = Number.parseInt(b, 10);
  const aNum = Number.isFinite(na) && /^\d/.test(a);
  const bNum = Number.isFinite(nb) && /^\d/.test(b);
  if (aNum && bNum && na !== nb) return na - nb;
  if (aNum !== bNum) return aNum ? -1 : 1;
  return a.localeCompare(b, "it");
}

// ---------------------------------------------------------------------------
// Text normalisation, matching the searchKey() the ingest writes into stop_search
// ---------------------------------------------------------------------------

export function normaliseSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** LIKE wildcards in user input must be literal; '\' is the ESCAPE char below. */
function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ---------------------------------------------------------------------------
// Service-day arithmetic (Europe/Rome), the source of the classic GTFS bug
// ---------------------------------------------------------------------------

const ROME_PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

interface RomeClock {
  /** YYYYMMDD in Rome local time. */
  date: string;
  /** Seconds elapsed since local midnight. */
  secOfDay: number;
}

function partsOf(unixSec: number): { y: number; m: number; d: number; hh: number; mm: number; ss: number } {
  const parts = ROME_PARTS.formatToParts(new Date(unixSec * 1000));
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((p) => p.type === type);
    if (found === undefined) throw new Error(`queries: Intl non ha prodotto "${type}"`);
    const value = Number.parseInt(found.value, 10);
    if (!Number.isFinite(value)) throw new Error(`queries: Intl ha prodotto "${type}" non numerico`);
    return value;
  };
  // "24" is how some ICU versions spell local midnight in h23-adjacent modes.
  const hh = read("hour") % 24;
  return { y: read("year"), m: read("month"), d: read("day"), hh, mm: read("minute"), ss: read("second") };
}

export function romeClock(unixSec: number): RomeClock {
  const p = partsOf(unixSec);
  const date = `${String(p.y).padStart(4, "0")}${String(p.m).padStart(2, "0")}${String(p.d).padStart(2, "0")}`;
  return { date, secOfDay: p.hh * 3600 + p.mm * 60 + p.ss };
}

export function isValidServiceDate(date: string): boolean {
  if (!/^\d{8}$/.test(date)) return false;
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6));
  const d = Number(date.slice(6, 8));
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** Unix seconds of a Rome wall-clock time on a YYYYMMDD date, DST included. */
function romeWallClockUnix(date: string, secOfDay: number): number {
  if (!isValidServiceDate(date)) throw new Error(`queries: data di servizio non valida "${date}"`);
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6));
  const d = Number(date.slice(6, 8));
  const naive = Date.UTC(y, m - 1, d) / 1000 + secOfDay;
  let guess = naive;
  // Two passes converge even across a DST boundary.
  for (let i = 0; i < 2; i += 1) {
    const p = partsOf(guess);
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) / 1000;
    guess = naive - (asUtc - guess);
  }
  return guess;
}

/** Unix seconds of 00:00 Rome local on a YYYYMMDD date, DST included. */
export function romeMidnightUnix(date: string): number {
  return romeWallClockUnix(date, 0);
}

const NOON_SEC = 12 * 3600;

/**
 * Origin of a GTFS service day: noon minus twelve hours, in Rome. Noon always
 * exists, so on the two changeover days this lands an hour off local midnight,
 * which is exactly what makes a 23h or 25h day come out right. Scheduled
 * seconds-after-midnight must be added to this, never to romeMidnightUnix.
 */
export function serviceDayOriginUnix(date: string): number {
  return romeWallClockUnix(date, NOON_SEC) - NOON_SEC;
}

export function shiftServiceDate(date: string, days: number): string {
  if (!isValidServiceDate(date)) throw new Error(`queries: data di servizio non valida "${date}"`);
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6));
  const d = Number(date.slice(6, 8));
  const moved = new Date(Date.UTC(y, m - 1, d + days));
  return `${String(moved.getUTCFullYear()).padStart(4, "0")}${String(moved.getUTCMonth() + 1).padStart(2, "0")}${String(moved.getUTCDate()).padStart(2, "0")}`;
}

/** Service date now in Rome, with the same 04:00 cutoff the client uses. */
export function currentServiceDate(unixSec: number): string {
  const clock = romeClock(unixSec);
  return clock.secOfDay < 4 * 3600 ? shiftServiceDate(clock.date, -1) : clock.date;
}

/** "HH:MM" for a seconds-after-midnight value that may exceed 86400. */
export function secToClock(sec: number): string {
  const wrapped = ((sec % 86400) + 86400) % 86400;
  const hh = Math.floor(wrapped / 3600);
  const mm = Math.floor((wrapped % 3600) / 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Stops
// ---------------------------------------------------------------------------

const selStop = lazyStmt<StopRow>(`SELECT ${STOP_COLS} FROM stops WHERE stop_id = ?`);

const selStopRoutes = lazyStmt<RouteRow>(`
  SELECT DISTINCT r.route_id, r.short_name, r.long_name, r.route_type, r.color, r.text_color
  FROM route_stops rs
  JOIN routes r ON r.route_id = rs.route_id
  WHERE rs.stop_id = ?
`);

export function getStop(stopId: string): Stop | null {
  const row = selStop().get(stopId);
  return row === undefined ? null : toStop(row);
}

export function routesForStop(stopId: string): RouteSummary[] {
  return selStopRoutes()
    .all(stopId)
    .map(toRoute)
    .sort((a, b) => compareRouteNames(a.shortName, b.shortName));
}

export function getStopWithRoutes(stopId: string): StopWithRoutes | null {
  const stop = getStop(stopId);
  if (stop === null) return null;
  return { ...stop, routes: routesForStop(stopId) };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

// Digits are a code on the pole, not a fragment to find anywhere: the code
// must match whole or from its start, and a name only on a word boundary.
const selStopsByCode = lazyStmt<StopRow>(`
  SELECT ${STOP_COLS},
    CASE
      WHEN stop_code = ?  THEN 0
      WHEN stop_id   = ?  THEN 0
      WHEN stop_code LIKE ? ESCAPE '\\' THEN 1
      ELSE 2
    END AS rank
  FROM stops
  WHERE stop_code = ?
     OR stop_id = ?
     OR stop_code LIKE ? ESCAPE '\\'
     OR stop_search LIKE ? ESCAPE '\\'
     OR stop_search LIKE ? ESCAPE '\\'
  ORDER BY rank, length(stop_name), stop_name
  LIMIT ?
`);

const selStopsByName = lazyStmt<StopRow>(`
  SELECT ${STOP_COLS},
    CASE WHEN stop_search LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END AS rank
  FROM stops
  WHERE stop_search LIKE ? ESCAPE '\\' OR stop_code LIKE ? ESCAPE '\\'
  ORDER BY rank, length(stop_name), stop_name
  LIMIT ?
`);

function clampLimit(limit: number, max: number): number {
  if (!Number.isFinite(limit)) return max;
  return Math.max(1, Math.min(max, Math.floor(limit)));
}

export function searchStops(query: string, limit: number): Stop[] {
  const q = normaliseSearch(query);
  if (q.length === 0) return [];
  const n = clampLimit(limit, 50);
  const esc = escapeLike(q);
  const prefix = `${esc}%`;
  const sub = `%${esc}%`;
  // An all-digits query is a stop code on the pole: exact code wins.
  const rows = /^\d+$/.test(q)
    ? selStopsByCode().all(q, q, prefix, q, q, prefix, prefix, `% ${esc}%`, n)
    : selStopsByName().all(prefix, sub, prefix, n);
  return rows.map(toStop);
}

/** "05" and "5" are the same line to a rider, and the feed writes only one. */
function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, "");
}

/** Rome publishes the metro as MEA/MEB/MEB1/MEC; riders read MA/MB/MB1/MC. */
function metroLetter(shortName: string): string | null {
  const match = /^ME([ABC]1?)$/i.exec(shortName.trim());
  return match === null ? null : match[1].toLowerCase();
}

interface RouteSearchEntry {
  route: RouteSummary;
  /** Every name the line answers to, normalised. */
  names: string[];
  /** Words that describe the line rather than name it, e.g. "metropolitana". */
  aliases: string[];
}

function routeSearchEntry(route: RouteSummary): RouteSearchEntry {
  const names = [normaliseSearch(route.shortName)];
  const aliases: string[] = [];
  const letter = route.routeType === 1 ? metroLetter(route.shortName) : null;
  if (letter !== null) {
    names.push(`m${letter}`);
    aliases.push("metro", "metropolitana", `metro ${letter}`, `metropolitana ${letter}`);
  }
  // long_name is a pair of termini ("... - ANAGNINA METRO A"), so matching it
  // would answer "metro" with every bus that ends at a metro station.
  return { route, names: names.filter((name) => name.length > 0), aliases };
}

/** Lower is better; -1 means the line does not match at all. */
function scoreRoute(entry: RouteSearchEntry, q: string, qBare: string): number {
  for (const name of entry.names) if (name === q) return 0;
  for (const name of entry.names) if (stripLeadingZeros(name) === qBare) return 1;
  for (const name of entry.names) if (name.startsWith(q)) return 2;
  for (const alias of entry.aliases) if (alias.startsWith(q)) return 3;
  for (const name of entry.names) if (name.includes(q)) return 4;
  return -1;
}

let routeSearchCache: RouteSearchEntry[] | null = null;
let routeSearchOwner: Database.Database | null = null;

function routeSearchIndex(): RouteSearchEntry[] {
  const db = getDb();
  if (routeSearchCache === null || routeSearchOwner !== db) {
    routeSearchCache = [...allRoutesById().values()].map(routeSearchEntry);
    routeSearchOwner = db;
  }
  return routeSearchCache;
}

/**
 * Scored in memory: there are a few hundred lines, and the ranking needs
 * aliases and leading-zero folding that a LIKE on one column cannot express.
 */
export function searchRoutes(query: string, limit: number): RouteSummary[] {
  const q = normaliseSearch(query);
  if (q.length === 0) return [];
  const n = clampLimit(limit, 50);
  const qBare = stripLeadingZeros(q);
  const hits: Array<{ route: RouteSummary; score: number }> = [];
  for (const entry of routeSearchIndex()) {
    const score = scoreRoute(entry, q, qBare);
    if (score >= 0) hits.push({ route: entry.route, score });
  }
  hits.sort((a, b) =>
    a.score !== b.score ? a.score - b.score : compareRouteNames(a.route.shortName, b.route.shortName),
  );
  return hits.slice(0, n).map((hit) => hit.route);
}

// ---------------------------------------------------------------------------
// Nearby
// ---------------------------------------------------------------------------

export const MIN_RADIUS_M = 50;
export const MAX_RADIUS_M = 5000;

const selStopsInBox = lazyStmt<StopRow>(`
  SELECT ${STOP_COLS} FROM stops
  WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?
`);

const EARTH_R = 6371000;

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function nearbyStops(lat: number, lon: number, radiusM: number, limit: number): NearbyStop[] {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("queries: coordinate non finite");
  if (!Number.isFinite(radiusM) || radiusM < MIN_RADIUS_M || radiusM > MAX_RADIUS_M) {
    throw new Error(`queries: raggio fuori intervallo (${MIN_RADIUS_M}..${MAX_RADIUS_M})`);
  }
  const n = clampLimit(limit, 200);
  const dLat = radiusM / 111320;
  const dLon = radiusM / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const candidates = selStopsInBox().all(lat - dLat, lat + dLat, lon - dLon, lon + dLon);

  const withDistance: NearbyStop[] = [];
  for (const row of candidates) {
    const stop = toStop(row);
    const distance = haversineM(lat, lon, stop.lat, stop.lon);
    if (distance > radiusM) continue;
    withDistance.push({ ...stop, distanceM: Math.round(distance), routes: [] });
  }
  withDistance.sort((a, b) => a.distanceM - b.distanceM);
  const top = withDistance.slice(0, n);
  for (const stop of top) stop.routes = routesForStop(stop.stopId);
  return top;
}

// ---------------------------------------------------------------------------
// Scheduled departures
// ---------------------------------------------------------------------------

export interface ScheduledDeparture {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeType: number;
  routeColor: string | null;
  headsign: string;
  /** Seconds after midnight of serviceDate; may exceed 86400. */
  departureSec: number;
  /** The service date this departure belongs to, YYYYMMDD. */
  serviceDate: string;
}

export interface UpcomingDeparture extends ScheduledDeparture {
  /** Absolute unix seconds, DST-correct. */
  departureUnix: number;
}

interface DepartureRow {
  trip_id: unknown;
  route_id: unknown;
  headsign: unknown;
  short_name: unknown;
  route_type: unknown;
  color: unknown;
  departure_sec: unknown;
}

const DEPARTURE_SQL = `
  SELECT st.trip_id, st.departure_sec, t.route_id, t.headsign,
         r.short_name, r.route_type, r.color
  FROM stop_times st
  JOIN trips t ON t.trip_id = st.trip_id
  JOIN calendar_dates cd ON cd.service_id = t.service_id AND cd.date = ?
  JOIN routes r ON r.route_id = t.route_id
  WHERE st.stop_id = ? AND st.departure_sec >= ?
`;

const selDepartures = lazyStmt<DepartureRow>(
  `${DEPARTURE_SQL} ORDER BY st.departure_sec, st.trip_id LIMIT ?`,
);

const selDeparturesByRoute = lazyStmt<DepartureRow>(
  `${DEPARTURE_SQL} AND t.route_id = ? ORDER BY st.departure_sec, st.trip_id LIMIT ?`,
);

function toDeparture(row: DepartureRow, serviceDate: string): ScheduledDeparture {
  return {
    tripId: str(row.trip_id, "trip_id"),
    routeId: str(row.route_id, "route_id"),
    routeShortName: str(row.short_name, "short_name"),
    routeType: num(row.route_type, "route_type"),
    routeColor: optStr(row.color),
    headsign: optStr(row.headsign) ?? "",
    departureSec: num(row.departure_sec, "departure_sec"),
    serviceDate,
  };
}

export function scheduledDepartures(args: {
  stopId: string;
  serviceDate: string;
  fromSec: number;
  limit: number;
  routeId?: string | null;
}): ScheduledDeparture[] {
  const { stopId, serviceDate, routeId } = args;
  if (!isValidServiceDate(serviceDate)) throw new Error(`queries: data non valida "${serviceDate}"`);
  const from = Number.isFinite(args.fromSec) ? Math.floor(args.fromSec) : 0;
  const n = clampLimit(args.limit, 5000);
  const rows =
    routeId === undefined || routeId === null || routeId === ""
      ? selDepartures().all(serviceDate, stopId, from, n)
      : selDeparturesByRoute().all(serviceDate, stopId, from, routeId, n);
  return rows.map((row) => toDeparture(row, serviceDate));
}

/**
 * Departures around `nowUnix` as absolute times. A trip leaving at 25:30 on the
 * previous service date is still running now, so both service days are queried.
 */
export function upcomingDepartures(args: {
  stopId: string;
  nowUnix: number;
  limit: number;
  routeId?: string | null;
  /** How far in the past a departure may be and still be listed. */
  graceSec?: number;
}): UpcomingDeparture[] {
  const { stopId, routeId } = args;
  if (!Number.isFinite(args.nowUnix)) throw new Error("queries: nowUnix non finito");
  const nowUnix = Math.floor(args.nowUnix);
  const grace = Number.isFinite(args.graceSec ?? NaN) ? Math.max(0, args.graceSec ?? 0) : 120;
  const n = clampLimit(args.limit, 200);
  const today = romeClock(nowUnix).date;
  const yesterday = shiftServiceDate(today, -1);

  // Offsets are measured from each service day's own origin, so a 23h or 25h
  // day shifts the window by exactly the hour the clock moved.
  const windows = [yesterday, today].map((date) => ({ date, origin: serviceDayOriginUnix(date) }));

  const out: UpcomingDeparture[] = [];
  for (const window of windows) {
    for (const dep of scheduledDepartures({
      stopId,
      serviceDate: window.date,
      fromSec: nowUnix - window.origin - grace,
      limit: n,
      routeId,
    })) {
      out.push({ ...dep, departureUnix: window.origin + dep.departureSec });
    }
  }
  out.sort((a, b) => a.departureUnix - b.departureUnix);
  return out.slice(0, n);
}

// ---------------------------------------------------------------------------
// Trips and routes (used to dress realtime updates)
// ---------------------------------------------------------------------------

export interface TripInfo {
  tripId: string;
  routeId: string;
  directionId: number;
  headsign: string;
  routeShortName: string;
  routeType: number;
  routeColor: string | null;
}

interface TripRow {
  trip_id: unknown;
  route_id: unknown;
  direction_id: unknown;
  headsign: unknown;
  short_name: unknown;
  route_type: unknown;
  color: unknown;
}

const selTrip = lazyStmt<TripRow>(`
  SELECT t.trip_id, t.route_id, t.direction_id, t.headsign,
         r.short_name, r.route_type, r.color
  FROM trips t
  JOIN routes r ON r.route_id = t.route_id
  WHERE t.trip_id = ?
`);

export function getTripInfo(tripId: string): TripInfo | null {
  const row = selTrip().get(tripId);
  if (row === undefined) return null;
  return {
    tripId: str(row.trip_id, "trip_id"),
    routeId: str(row.route_id, "route_id"),
    directionId: num(row.direction_id, "direction_id"),
    headsign: optStr(row.headsign) ?? "",
    routeShortName: str(row.short_name, "short_name"),
    routeType: num(row.route_type, "route_type"),
    routeColor: optStr(row.color),
  };
}

export function getTripInfos(tripIds: Iterable<string>): Map<string, TripInfo> {
  const out = new Map<string, TripInfo>();
  for (const tripId of tripIds) {
    if (out.has(tripId)) continue;
    const info = getTripInfo(tripId);
    if (info !== null) out.set(tripId, info);
  }
  return out;
}

const selRoute = lazyStmt<RouteRow>(`SELECT ${ROUTE_COLS} FROM routes WHERE route_id = ?`);
const selAllRoutes = lazyStmt<RouteRow>(`SELECT ${ROUTE_COLS} FROM routes`);

export function getRoute(routeId: string): RouteSummary | null {
  const row = selRoute().get(routeId);
  return row === undefined ? null : toRoute(row);
}

let routeMapCache: Map<string, RouteSummary> | null = null;
let routeMapOwner: Database.Database | null = null;

/** All routes keyed by id, cached until the database handle changes. */
export function allRoutesById(): ReadonlyMap<string, RouteSummary> {
  const db = getDb();
  if (routeMapCache === null || routeMapOwner !== db) {
    const map = new Map<string, RouteSummary>();
    for (const row of selAllRoutes().all()) {
      const route = toRoute(row);
      map.set(route.routeId, route);
    }
    routeMapCache = map;
    routeMapOwner = db;
  }
  return routeMapCache;
}

// ---------------------------------------------------------------------------
// Line detail
// ---------------------------------------------------------------------------

interface PatternRow {
  direction_id: unknown;
  headsign: unknown;
  trip_count: unknown;
  shape_id: unknown;
}

interface AgencyRow {
  agency_name: unknown;
}

interface PolylineRow {
  polyline: unknown;
}

const selPatterns = lazyStmt<PatternRow>(`
  SELECT direction_id, headsign, trip_count, shape_id
  FROM route_patterns WHERE route_id = ? ORDER BY direction_id
`);

const selAgencyForRoute = lazyStmt<AgencyRow>(`
  SELECT a.agency_name FROM routes r
  JOIN agencies a ON a.agency_id = r.agency_id
  WHERE r.route_id = ?
`);

const selShape = lazyStmt<PolylineRow>(`SELECT polyline FROM shapes WHERE shape_id = ?`);

const selRouteStops = lazyStmt<StopRow>(`
  SELECT s.stop_id, s.stop_code, s.stop_name, s.lat, s.lon, s.wheelchair
  FROM route_stops rs
  JOIN stops s ON s.stop_id = rs.stop_id
  WHERE rs.route_id = ? AND rs.direction_id = ?
  ORDER BY rs.stop_order, s.stop_name
`);

export function lineDetail(routeId: string, directionId: number): LineDetail | null {
  const route = getRoute(routeId);
  if (route === null) return null;

  const patternRows = selPatterns().all(routeId);
  const directions: RouteDirection[] = patternRows.map((row) => ({
    directionId: num(row.direction_id, "direction_id"),
    headsign: optStr(row.headsign) ?? "",
    tripCount: num(row.trip_count, "trip_count"),
  }));

  const requested = directionId === 1 ? 1 : 0;
  const active = directions.some((d) => d.directionId === requested)
    ? requested
    : (directions[0]?.directionId ?? requested);

  const stops = selRouteStops().all(routeId, active).map(toStop);

  const pattern = patternRows.find((row) => num(row.direction_id, "direction_id") === active);
  const shapeId = pattern === undefined ? null : optStr(pattern.shape_id);
  let polyline: string | null = null;
  if (shapeId !== null) {
    const shapeRow = selShape().get(shapeId);
    if (shapeRow !== undefined) polyline = optStr(shapeRow.polyline);
  }

  const agencyRow = selAgencyForRoute().get(routeId);
  const agencyName = agencyRow === undefined ? "" : (optStr(agencyRow.agency_name) ?? "");

  return { route, agencyName, directions, activeDirection: active, stops, polyline };
}

// ---------------------------------------------------------------------------
// Journey planning support
//
// The planner must never walk stop_times to decide *whether* two places are
// connected: 4.5 M rows on the only Node thread would block every other user.
// route_stops is 23 k rows, so the whole connectivity graph fits in memory and
// is cached for the life of the database handle. stop_times is then touched
// only for the handful of route+stop pairs that survived the graph search.
// ---------------------------------------------------------------------------

/** Longest departure_sec this feed contains is 31 h; leave a little headroom. */
export const MAX_SERVICE_SEC = 115_200;

/** Separator for pattern keys. Route ids are [A-Za-z0-9._#-], so this cannot occur in one. */
const PATTERN_SEP = "|";

export function patternKey(routeId: string, directionId: number): string {
  return `${routeId}${PATTERN_SEP}${directionId}`;
}

/** Splits a key made by patternKey. Returns null when the string is not one. */
export function parsePatternKey(key: string): { routeId: string; directionId: number } | null {
  const cut = key.lastIndexOf(PATTERN_SEP);
  if (cut <= 0) return null;
  const directionId = Number(key.slice(cut + 1));
  if (directionId !== 0 && directionId !== 1) return null;
  return { routeId: key.slice(0, cut), directionId };
}

/** One route in one direction: its stops in order, plus each stop's position. */
export interface RoutePatternStops {
  routeId: string;
  directionId: number;
  /** Stop ids ordered along the route. */
  stops: readonly string[];
  /** stopId -> position in `stops`. */
  index: ReadonlyMap<string, number>;
}

export interface PatternMembership {
  key: string;
  /** Position of the stop along that pattern. */
  idx: number;
}

export interface RouteNetwork {
  patterns: ReadonlyMap<string, RoutePatternStops>;
  /** stopId -> every pattern calling there. */
  byStop: ReadonlyMap<string, readonly PatternMembership[]>;
}

interface RouteStopRow {
  route_id: unknown;
  direction_id: unknown;
  stop_id: unknown;
  stop_order: unknown;
}

const selRouteStopsAll = lazyStmt<RouteStopRow>(`
  SELECT route_id, direction_id, stop_id, stop_order
  FROM route_stops
  ORDER BY route_id, direction_id, stop_order, stop_id
`);

let networkCache: RouteNetwork | null = null;
let networkOwner: Database.Database | null = null;

/**
 * The whole route<->stop graph, built once per database handle. The SQL already
 * orders by stop_order, and stop_id breaks the ties stop_order leaves, so the
 * positions are deterministic across rebuilds.
 */
export function routeNetwork(): RouteNetwork {
  const db = getDb();
  if (networkCache !== null && networkOwner === db) return networkCache;

  const patterns = new Map<string, RoutePatternStops>();
  const stopsByKey = new Map<string, string[]>();
  const indexByKey = new Map<string, Map<string, number>>();
  const byStop = new Map<string, PatternMembership[]>();

  for (const row of selRouteStopsAll().all()) {
    const routeId = str(row.route_id, "route_id");
    const directionId = num(row.direction_id, "direction_id");
    const stopId = str(row.stop_id, "stop_id");
    const key = patternKey(routeId, directionId);

    let stops = stopsByKey.get(key);
    let index = indexByKey.get(key);
    if (stops === undefined || index === undefined) {
      stops = [];
      index = new Map<string, number>();
      stopsByKey.set(key, stops);
      indexByKey.set(key, index);
      patterns.set(key, { routeId, directionId, stops, index });
    }
    // The primary key makes (route, direction, stop) unique, so no duplicates.
    const idx = stops.length;
    stops.push(stopId);
    index.set(stopId, idx);

    const memberships = byStop.get(stopId);
    if (memberships === undefined) byStop.set(stopId, [{ key, idx }]);
    else memberships.push({ key, idx });
  }

  networkCache = { patterns, byStop };
  networkOwner = db;
  return networkCache;
}

interface PatternHourRow {
  r: unknown;
  d: unknown;
  h: unknown;
}

// Every trip in this feed starts at stop_sequence 1, so one seek on idx_st_trip
// per trip answers "when does a run of this line start", without the per-trip
// aggregate that would have to read the whole of stop_times.
const selPatternHours = lazyStmt<PatternHourRow>(`
  SELECT t.route_id AS r, t.direction_id AS d, st.departure_sec / 3600 AS h
  FROM trips t
  JOIN calendar_dates cd ON cd.service_id = t.service_id AND cd.date = ?
  JOIN stop_times st ON st.trip_id = t.trip_id AND st.stop_sequence = 1
  GROUP BY 1, 2, 3
`);

/** Service dates kept: a plan spans three at most, and one more is slack. */
const HOUR_CACHE_MAX = 4;
const hourCache = new Map<string, ReadonlyMap<string, number>>();
let hourCacheOwner: Database.Database | null = null;

/**
 * Which hours of a service day each route+direction starts a run in, as a bit
 * per hour (0..31, since GTFS times run past midnight), keyed by patternKey.
 *
 * Costs one indexed pass over the day's trips, tens of milliseconds, and is
 * cached per date for the life of the handle. It is what tells the planner that
 * a night line is not an option at nine in the morning.
 */
export function patternServiceHours(serviceDate: string): ReadonlyMap<string, number> {
  if (!isValidServiceDate(serviceDate)) throw new Error(`queries: data non valida "${serviceDate}"`);
  const db = getDb();
  if (hourCacheOwner !== db) {
    hourCache.clear();
    hourCacheOwner = db;
  }
  const held = hourCache.get(serviceDate);
  if (held !== undefined) return held;

  const map = new Map<string, number>();
  for (const row of selPatternHours().all(serviceDate)) {
    const key = patternKey(str(row.r, "route_id"), num(row.d, "direction_id"));
    const hour = Math.max(0, Math.min(31, Math.floor(num(row.h, "hour"))));
    map.set(key, (map.get(key) ?? 0) | (1 << hour));
  }

  if (hourCache.size >= HOUR_CACHE_MAX) {
    const oldest = hourCache.keys().next();
    if (oldest.done !== true) hourCache.delete(oldest.value);
  }
  hourCache.set(serviceDate, map);
  return map;
}

interface PatternTripCountRow {
  route_id: unknown;
  direction_id: unknown;
  trip_count: unknown;
}

const selPatternTripCounts = lazyStmt<PatternTripCountRow>(`
  SELECT route_id, direction_id, trip_count FROM route_patterns
`);

let tripCountCache: Map<string, number> | null = null;
let tripCountOwner: Database.Database | null = null;

/**
 * Trips per day on each route+direction, keyed by patternKey. 716 rows, cached
 * with the network: the planner reads it as a headway proxy, so a line with
 * four runs a day is not costed as if it were the metro.
 */
export function patternTripCounts(): ReadonlyMap<string, number> {
  const db = getDb();
  if (tripCountCache === null || tripCountOwner !== db) {
    const map = new Map<string, number>();
    for (const row of selPatternTripCounts().all()) {
      const routeId = str(row.route_id, "route_id");
      const directionId = num(row.direction_id, "direction_id");
      map.set(patternKey(routeId, directionId), num(row.trip_count, "trip_count"));
    }
    tripCountCache = map;
    tripCountOwner = db;
  }
  return tripCountCache;
}

let stopMapCache: Map<string, Stop> | null = null;
let stopMapOwner: Database.Database | null = null;

const selAllStops = lazyStmt<StopRow>(`SELECT ${STOP_COLS} FROM stops`);

/**
 * Every stop keyed by id, cached until the handle changes. 8 267 rows: the
 * planner scans them for walkable stops instead of issuing a query per point.
 */
export function allStopsById(): ReadonlyMap<string, Stop> {
  const db = getDb();
  if (stopMapCache === null || stopMapOwner !== db) {
    const map = new Map<string, Stop>();
    for (const row of selAllStops().all()) {
      const stop = toStop(row);
      map.set(stop.stopId, stop);
    }
    stopMapCache = map;
    stopMapOwner = db;
  }
  return stopMapCache;
}

interface PatternShapeRow {
  polyline: unknown;
}

const selPatternShape = lazyStmt<PatternShapeRow>(`
  SELECT s.polyline
  FROM route_patterns rp
  JOIN shapes s ON s.shape_id = rp.shape_id
  WHERE rp.route_id = ? AND rp.direction_id = ?
`);

/**
 * The encoded path a line follows in one direction, or null when the feed
 * ships no shape for it. Every one of this feed's 716 patterns has one.
 */
export function patternShape(routeId: string, directionId: number): string | null {
  if (directionId !== 0 && directionId !== 1) return null;
  const row = selPatternShape().get(routeId, directionId);
  return row === undefined ? null : optStr(row.polyline);
}

interface TripShapeRow {
  shape_id: unknown;
  polyline: unknown;
}

const selTripShape = lazyStmt<TripShapeRow>(`
  SELECT t.shape_id, s.polyline
  FROM trips t
  JOIN shapes s ON s.shape_id = t.shape_id
  WHERE t.trip_id = ?
`);

/**
 * The shape one scheduled run actually follows. A Rome line has several
 * variants per direction (route 75 has four), so the representative pattern
 * shape is the wrong road for a good share of the trips on it. The id comes
 * back too, because several trips share one shape and callers cache by it.
 */
export function tripShape(tripId: string): { shapeId: string; polyline: string } | null {
  if (tripId.length === 0) return null;
  const row = selTripShape().get(tripId);
  if (row === undefined) return null;
  const shapeId = optStr(row.shape_id);
  const polyline = optStr(row.polyline);
  if (shapeId === null || polyline === null) return null;
  return { shapeId, polyline };
}

/** One scheduled run of a line between two of its stops. */
export interface LegDeparture {
  tripId: string;
  headsign: string;
  /** Seconds after the origin of the service day; may exceed 86400. */
  departureSec: number;
  arrivalSec: number;
  boardSeq: number;
  alightSeq: number;
}

interface LegRow {
  trip_id: unknown;
  headsign: unknown;
  departure_sec: unknown;
  arrival_sec: unknown;
  b_seq: unknown;
  a_seq: unknown;
}

// b is driven by idx_st_stop (stop_id, departure_sec), which is both the filter
// and the sort, so the LIMIT stops the scan early. a is the same trip's row at
// the alighting stop, reached through idx_st_trip.
const selLeg = lazyStmt<LegRow>(`
  SELECT b.trip_id, t.headsign, b.departure_sec, b.stop_sequence AS b_seq,
         a.arrival_sec, a.stop_sequence AS a_seq
  FROM stop_times b
  JOIN trips t ON t.trip_id = b.trip_id
  JOIN calendar_dates cd ON cd.service_id = t.service_id AND cd.date = ?
  JOIN stop_times a ON a.trip_id = b.trip_id AND a.stop_id = ? AND a.stop_sequence > b.stop_sequence
  WHERE b.stop_id = ?
    AND b.departure_sec >= ? AND b.departure_sec <= ?
    AND t.route_id = ? AND t.direction_id = ?
  ORDER BY b.departure_sec
  LIMIT ?
`);

/** Room for a circular route to answer more than once per trip before we dedupe. */
const LEG_OVERFETCH = 4;
const LEG_MAX_ROWS = 60;

/**
 * Scheduled runs of one line, in one direction, from one stop to a later stop
 * on the same trip, inside a window of one service day.
 */
export function legDepartures(args: {
  routeId: string;
  directionId: number;
  boardStopId: string;
  alightStopId: string;
  serviceDate: string;
  fromSec: number;
  toSec: number;
  limit: number;
}): LegDeparture[] {
  const { routeId, directionId, boardStopId, alightStopId, serviceDate } = args;
  if (!isValidServiceDate(serviceDate)) throw new Error(`queries: data non valida "${serviceDate}"`);
  if (directionId !== 0 && directionId !== 1) throw new Error("queries: direction_id non valido");
  if (!Number.isFinite(args.fromSec) || !Number.isFinite(args.toSec)) {
    throw new Error("queries: finestra oraria non finita");
  }
  const from = Math.max(0, Math.floor(args.fromSec));
  const to = Math.min(MAX_SERVICE_SEC, Math.floor(args.toSec));
  if (to < from) return [];
  const limit = clampLimit(args.limit, 20);
  const rows = selLeg().all(
    serviceDate,
    alightStopId,
    boardStopId,
    from,
    to,
    routeId,
    directionId,
    Math.min(LEG_MAX_ROWS, limit * LEG_OVERFETCH),
  );

  // A circular route calls at the same stop twice, so one trip can answer more
  // than once. Keep the earliest departure, and with it the nearest alighting.
  const best = new Map<string, LegDeparture>();
  for (const row of rows) {
    const leg: LegDeparture = {
      tripId: str(row.trip_id, "trip_id"),
      headsign: optStr(row.headsign) ?? "",
      departureSec: num(row.departure_sec, "departure_sec"),
      arrivalSec: num(row.arrival_sec, "arrival_sec"),
      boardSeq: num(row.b_seq, "stop_sequence"),
      alightSeq: num(row.a_seq, "stop_sequence"),
    };
    if (leg.arrivalSec <= leg.departureSec) continue;
    const held = best.get(leg.tripId);
    if (
      held === undefined ||
      leg.departureSec < held.departureSec ||
      (leg.departureSec === held.departureSec && leg.alightSeq < held.alightSeq)
    ) {
      best.set(leg.tripId, leg);
    }
  }

  return [...best.values()]
    .sort((a, b) => a.departureSec - b.departureSec || a.tripId.localeCompare(b.tripId))
    .slice(0, limit);
}
