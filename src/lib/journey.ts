/**
 * A-to-B planner over public transport only.
 *
 * There is no street network in this app and no routing server: walking is a
 * straight line with a detour factor, which is honest as a lower bound and is
 * labelled as such in the UI. Everything else is real GTFS.
 *
 * The shape of the search is dictated by one constraint: stop_times has 4.5 M
 * rows and better-sqlite3 is synchronous on the only Node thread, so a slow
 * query stalls every other request. Connectivity is therefore decided entirely
 * in memory against route_stops (23 k rows, cached), and stop_times is read
 * only for the few dozen route+stop pairs that survive that search.
 */

import {
  allStopsById,
  haversineM,
  legDepartures,
  parsePatternKey,
  romeClock,
  routeNetwork,
  serviceDayOriginUnix,
  shiftServiceDate,
  allRoutesById,
  isValidServiceDate,
  patternShape,
  tripShape,
  patternServiceHours,
  MAX_SERVICE_SEC,
  type PatternMembership,
  type RouteNetwork,
} from "@/lib/queries";
import {
  raptorPlans,
  type RaptorAccess,
  type RaptorNeighbour,
  type RaptorPlan,
  type RaptorStats,
} from "@/lib/raptor";
import { decodePolyline, encodePolyline } from "@/lib/polyline";
import { buildPath, pointAtDistance, projectOnPath, type RoutePath } from "@/lib/pathmotion";
import { getDb } from "@/lib/db";
import type {
  Journey,
  JourneyLeg,
  JourneyPlace,
  JourneyPoint,
  JourneyRideLeg,
  JourneyWalkLeg,
  RouteSummary,
  Stop,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Tuning. Every number here is a deliberate trade between quality and the
// per-request time budget; the comments say which way each one pushes.
// ---------------------------------------------------------------------------

/** Brisk urban walking. */
const WALK_SPEED_MPS = 1.25;
/** Straight line to plausible street distance. Rome's centre is not a grid. */
const WALK_DETOUR = 1.35;
/** Below this a walk leg is noise, so it is dropped from the itinerary. */
const MIN_WALK_LEG_M = 40;

/** How far we will make someone walk to the first stop, or from the last. */
const ACCESS_WALK_M = 800;
/** Second pass when the first found no stop at all (suburbs, industrial areas). */
const ACCESS_WALK_WIDE_M = 2000;
const MAX_ACCESS_STOPS = 16;

/** Walk between two poles of the same interchange (Termini is a dozen stops). */
const TRANSFER_WALK_M = 350;
const MAX_TRANSFER_NEIGHBOURS = 5;
/** Slack on top of the walk: doors, platforms, and a bus that is not to the second. */
const TRANSFER_BUFFER_SEC = 150;

/**
 * How far along a line we look for a change. Rome's outer routes are long (the
 * night line that replaces the Roma-Lido rail is 80 stops), and riding most of
 * one before changing is exactly what a suburban trip looks like.
 */
const MAX_RIDE_STOPS = 80;

/** Candidate route pairs that get to touch stop_times. This is the cost knob. */
const MAX_DIRECT_CANDIDATES = 10;
const MAX_TRANSFER_CANDIDATES = 12;
const DEPARTURES_PER_DIRECT = 3;
const DEPARTURES_PER_FIRST_LEG = 2;

/** First pass. Most searches resolve here. */
const WINDOW_SEC = 90 * 60;
/** Night and rural retry, only when the first pass found nothing. */
const WINDOW_WIDE_SEC = 6 * 3600;

/** Beyond this a walk-only itinerary is not worth offering. */
const WALK_ONLY_MAX_M = 2200;
/**
 * Walking is certain: no waiting, no missed connection, no timetable. A ride
 * has to arrive this much earlier before it is worth ranking above the walk.
 */
const WALK_PREFERENCE_SEC = 5 * 60;
/** Past this the walk is not an option any more, just clutter. */
const WALK_DISCARD_SEC = 12 * 60;

/**
 * The round-based escalation, used only when the cheap pairing search comes up
 * short. Four rounds is three changes, which covers Rome end to end; each extra
 * round costs another pass over the patterns the frontier touches.
 */
const MAX_ROUNDS = 4;
/** Plans that get to touch stop_times. Each one costs a handful of queries. */
const MAX_MULTI_PLANS = 8;
const DEPARTURES_PER_MULTI = 2;
/** Rounds of "that line is not running now, try again without it". */
const MAX_ESCALATION_PASSES = 3;
/** A run that started this long ago can still be under way when we board it. */
const SERVICE_LOOKBACK_SEC = 2 * 3600;
/** How far past the window the last leg of a three-change plan can reach. */
const SERVICE_LOOKAHEAD_SEC = 3 * 3600;

/**
 * When the cheap search does produce something, escalate anyway if what it
 * produced looks like a detour: a plausible door-to-door time for the crow-flight
 * distance, generously padded, so a normal journey never pays for the extra work.
 */
const DETOUR_BASE_SEC = 15 * 60;
const DETOUR_SPEED_MPS = 5.5;
const DETOUR_FACTOR = 1.9;

const DEFAULT_MAX_RESULTS = 5;
/** Two departures of the same pairing is a useful "or the next one"; three is spam. */
const MAX_PER_SIGNATURE = 2;

/** Rough in-vehicle speed by GTFS route_type, used only to rank candidates. */
function cruiseSpeedMps(routeType: number): number {
  if (routeType === 1) return 8.5;
  if (routeType === 2) return 12;
  if (routeType === 0) return 4.5;
  return 4;
}

// ---------------------------------------------------------------------------
// Walking
// ---------------------------------------------------------------------------

export function walkSeconds(straightLineM: number): number {
  if (!Number.isFinite(straightLineM) || straightLineM <= 0) return 0;
  return Math.ceil((straightLineM * WALK_DETOUR) / WALK_SPEED_MPS);
}

// ---------------------------------------------------------------------------
// Spatial index over the stops, so "what is walkable from here" costs nothing.
// Cached for the life of the database handle, like the route network.
// ---------------------------------------------------------------------------

/** ~278 m of latitude, ~275 m of longitude at Rome's latitude. */
const CELL_LAT = 0.0025;
const CELL_LON = 0.0033;

interface StopGrid {
  cells: Map<string, Stop[]>;
  stops: ReadonlyMap<string, Stop>;
  /** Memoised neighbour lists; a request touches a few thousand stops at most. */
  neighbours: Map<string, readonly WalkNeighbour[]>;
  /** The same lists in the shape the round-based search wants, built once. */
  raptorNeighbours: Map<string, readonly RaptorNeighbour[]>;
}

export interface WalkNeighbour {
  stop: Stop;
  distanceM: number;
}

let gridCache: StopGrid | null = null;
let gridOwner: ReturnType<typeof getDb> | null = null;

function cellKey(lat: number, lon: number): string {
  return `${Math.floor(lat / CELL_LAT)}:${Math.floor(lon / CELL_LON)}`;
}

function stopGrid(): StopGrid {
  const db = getDb();
  if (gridCache !== null && gridOwner === db) return gridCache;
  const stops = allStopsById();
  const cells = new Map<string, Stop[]>();
  for (const stop of stops.values()) {
    const key = cellKey(stop.lat, stop.lon);
    const bucket = cells.get(key);
    if (bucket === undefined) cells.set(key, [stop]);
    else bucket.push(stop);
  }
  gridCache = { cells, stops, neighbours: new Map(), raptorNeighbours: new Map() };
  gridOwner = db;
  return gridCache;
}

/** Every stop within `radiusM` of a point, nearest first. */
function stopsWithin(grid: StopGrid, lat: number, lon: number, radiusM: number): WalkNeighbour[] {
  const latSpan = Math.ceil(radiusM / 111320 / CELL_LAT);
  const lonScale = 111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const lonSpan = Math.ceil(radiusM / lonScale / CELL_LON);
  const baseLat = Math.floor(lat / CELL_LAT);
  const baseLon = Math.floor(lon / CELL_LON);

  const out: WalkNeighbour[] = [];
  for (let dLat = -latSpan; dLat <= latSpan; dLat += 1) {
    for (let dLon = -lonSpan; dLon <= lonSpan; dLon += 1) {
      const bucket = grid.cells.get(`${baseLat + dLat}:${baseLon + dLon}`);
      if (bucket === undefined) continue;
      for (const stop of bucket) {
        const distanceM = haversineM(lat, lon, stop.lat, stop.lon);
        if (distanceM <= radiusM) out.push({ stop, distanceM: Math.round(distanceM) });
      }
    }
  }
  out.sort((a, b) => a.distanceM - b.distanceM || a.stop.stopId.localeCompare(b.stop.stopId));
  return out;
}

/**
 * Stops you can change to at `stopId`, itself first. This is what makes a
 * transfer at Termini work at all: the lines there are spread over a dozen
 * distinct stop ids that share nothing but their position.
 */
function transferNeighbours(grid: StopGrid, stopId: string): readonly WalkNeighbour[] {
  const held = grid.neighbours.get(stopId);
  if (held !== undefined) return held;
  const stop = grid.stops.get(stopId);
  if (stop === undefined) {
    grid.neighbours.set(stopId, []);
    return [];
  }
  const near = stopsWithin(grid, stop.lat, stop.lon, TRANSFER_WALK_M).slice(
    0,
    MAX_TRANSFER_NEIGHBOURS,
  );
  grid.neighbours.set(stopId, near);
  return near;
}

/**
 * The same neighbours in the round-based search's own shape. It asks for the
 * walkable stops around every stop it reaches, on every round of every pass, so
 * building the list afresh each time is thousands of throwaway arrays a request.
 */
function raptorNeighbours(grid: StopGrid, stopId: string): readonly RaptorNeighbour[] {
  const held = grid.raptorNeighbours.get(stopId);
  if (held !== undefined) return held;
  const made = transferNeighbours(grid, stopId).map((near) => ({
    stopId: near.stop.stopId,
    distanceM: near.distanceM,
  }));
  grid.raptorNeighbours.set(stopId, made);
  return made;
}

// ---------------------------------------------------------------------------
// Service days. A departure written 25:30 belongs to the previous service date,
// and the previous date's late trips are still running after midnight, so a
// window has to be measured against each candidate day's own origin.
// ---------------------------------------------------------------------------

interface ServiceWindow {
  date: string;
  /** Unix seconds that seconds-after-midnight are counted from. */
  origin: number;
}

export function serviceWindows(fromUnix: number, toUnix: number): ServiceWindow[] {
  if (!Number.isFinite(fromUnix) || !Number.isFinite(toUnix)) return [];
  const today = romeClock(fromUnix).date;
  const out: ServiceWindow[] = [];
  // Yesterday carries trips past midnight; tomorrow carries a window that
  // crosses into the small hours as that day's own early service.
  for (const shift of [-1, 0, 1]) {
    const date = shiftServiceDate(today, shift);
    if (!isValidServiceDate(date)) continue;
    const origin = serviceDayOriginUnix(date);
    if (toUnix - origin < 0) continue;
    if (fromUnix - origin > MAX_SERVICE_SEC) continue;
    out.push({ date, origin });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Candidate search, entirely in memory
// ---------------------------------------------------------------------------

interface AccessStop {
  stop: Stop;
  walkM: number;
  walkSec: number;
}

function accessStops(
  grid: StopGrid,
  lat: number,
  lon: number,
  radiusM: number,
  pinnedStopId: string | null,
): AccessStop[] {
  const found = stopsWithin(grid, lat, lon, radiusM)
    .slice(0, MAX_ACCESS_STOPS)
    .map((near) => ({ stop: near.stop, walkM: near.distanceM, walkSec: walkSeconds(near.distanceM) }));

  if (pinnedStopId === null) return found;
  // An explicitly chosen stop is the boarding point whether or not the radius
  // would have reached it, and it must not be crowded out by nearer ones.
  const pinned = grid.stops.get(pinnedStopId);
  if (pinned === undefined) return found;
  const rest = found.filter((entry) => entry.stop.stopId !== pinnedStopId);
  const distanceM = Math.round(haversineM(lat, lon, pinned.lat, pinned.lon));
  return [{ stop: pinned, walkM: distanceM, walkSec: walkSeconds(distanceM) }, ...rest].slice(
    0,
    MAX_ACCESS_STOPS,
  );
}

/** An alighting option on one pattern: which stop, where along it, and the walk out. */
interface DestEntry {
  stopId: string;
  idx: number;
  access: AccessStop;
}

/** Alighting options per pattern, ordered along the route, with a suffix best. */
interface DestOptions {
  entries: DestEntry[];
  /** bestFrom[i] is the cheapest walk among entries[i..]; parallel to `entries`. */
  bestFrom: DestEntry[];
  lastIdx: number;
}

function buildDestOptions(net: RouteNetwork, destAccess: AccessStop[]): Map<string, DestOptions> {
  const byKey = new Map<string, DestEntry[]>();
  for (const access of destAccess) {
    for (const membership of net.byStop.get(access.stop.stopId) ?? []) {
      const list = byKey.get(membership.key);
      const entry: DestEntry = { stopId: access.stop.stopId, idx: membership.idx, access };
      if (list === undefined) byKey.set(membership.key, [entry]);
      else list.push(entry);
    }
  }

  const out = new Map<string, DestOptions>();
  for (const [key, entries] of byKey) {
    entries.sort((a, b) => a.idx - b.idx);
    const bestFrom: DestEntry[] = new Array<DestEntry>(entries.length);
    let best = entries[entries.length - 1];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const here = entries[i];
      if (here === undefined || best === undefined) continue;
      if (here.access.walkM < best.access.walkM) best = here;
      bestFrom[i] = best;
    }
    const last = entries[entries.length - 1];
    if (last === undefined) continue;
    out.set(key, { entries, bestFrom, lastIdx: last.idx });
  }
  return out;
}

/** Cheapest alighting strictly after position `idx`, or null. */
function destAfter(options: DestOptions, idx: number): DestEntry | null {
  for (let i = 0; i < options.entries.length; i += 1) {
    const entry = options.entries[i];
    if (entry === undefined) continue;
    if (entry.idx > idx) return options.bestFrom[i] ?? entry;
  }
  return null;
}

interface DirectCandidate {
  key: string;
  board: AccessStop;
  boardIdx: number;
  alight: DestEntry;
  score: number;
}

interface TransferCandidate {
  firstKey: string;
  board: AccessStop;
  boardIdx: number;
  /** Where the first ride ends. */
  changeStopId: string;
  changeIdx: number;
  secondKey: string;
  /** Where the second ride starts; may differ from changeStopId. */
  reboardStopId: string;
  reboardIdx: number;
  transferWalkM: number;
  alight: DestEntry;
  score: number;
}

function rideEstimateSec(a: Stop, b: Stop, routeType: number): number {
  const metres = haversineM(a.lat, a.lon, b.lat, b.lon);
  return Math.round(metres / cruiseSpeedMps(routeType)) + 60;
}

function routeTypeOf(routes: ReadonlyMap<string, RouteSummary>, key: string): number {
  const parsed = parsePatternKey(key);
  if (parsed === null) return 3;
  return routes.get(parsed.routeId)?.routeType ?? 3;
}

function routeIdOf(key: string): string {
  return parsePatternKey(key)?.routeId ?? key;
}

// ---------------------------------------------------------------------------
// Timetable resolution
// ---------------------------------------------------------------------------

interface Ride {
  tripId: string;
  headsign: string;
  departureUnix: number;
  arrivalUnix: number;
  boardSeq: number;
  alightSeq: number;
  serviceDate: string;
}

/**
 * Per-request memo over the only queries that touch stop_times. Two candidate
 * pairings often share a first leg, and without this they would pay for it twice.
 */
class RideFinder {
  private readonly cache = new Map<string, Ride[]>();
  private queries = 0;

  constructor(private readonly windowSec: number) {}

  get queryCount(): number {
    return this.queries;
  }

  find(key: string, boardStopId: string, alightStopId: string, earliest: number, limit: number): Ride[] {
    const parsed = parsePatternKey(key);
    if (parsed === null) return [];
    const memoKey = `${key}|${boardStopId}|${alightStopId}|${earliest}|${limit}`;
    const held = this.cache.get(memoKey);
    if (held !== undefined) return held;

    const latest = earliest + this.windowSec;
    const found: Ride[] = [];
    for (const window of serviceWindows(earliest, latest)) {
      this.queries += 1;
      const rows = legDepartures({
        routeId: parsed.routeId,
        directionId: parsed.directionId,
        boardStopId,
        alightStopId,
        serviceDate: window.date,
        fromSec: earliest - window.origin,
        toSec: latest - window.origin,
        limit,
      });
      for (const row of rows) {
        found.push({
          tripId: row.tripId,
          headsign: row.headsign,
          departureUnix: window.origin + row.departureSec,
          arrivalUnix: window.origin + row.arrivalSec,
          boardSeq: row.boardSeq,
          alightSeq: row.alightSeq,
          serviceDate: window.date,
        });
      }
    }
    found.sort((a, b) => a.departureUnix - b.departureUnix || a.tripId.localeCompare(b.tripId));
    const result = found.slice(0, limit);
    this.cache.set(memoKey, result);
    return result;
  }
}

// ---------------------------------------------------------------------------
// Assembling itineraries
// ---------------------------------------------------------------------------

function pointOfPlace(place: JourneyPlace): JourneyPoint {
  return {
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    stopId: place.stopId,
    stopCode: place.stopCode,
  };
}

function pointOfStop(stop: Stop): JourneyPoint {
  return {
    name: stop.stopName,
    lat: stop.lat,
    lon: stop.lon,
    stopId: stop.stopId,
    stopCode: stop.stopCode,
  };
}

function walkLeg(from: JourneyPoint, to: JourneyPoint, distanceM: number, departureTime: number): JourneyWalkLeg {
  const durationSec = walkSeconds(distanceM);
  return {
    kind: "walk",
    from,
    to,
    distanceM: Math.round(distanceM),
    durationSec,
    departureTime,
    arrivalTime: departureTime + durationSec,
  };
}

function rideLeg(args: {
  route: RouteSummary;
  directionId: number;
  ride: Ride;
  from: Stop;
  to: Stop;
}): JourneyRideLeg {
  const { route, directionId, ride, from, to } = args;
  return {
    kind: "ride",
    route,
    directionId,
    tripId: ride.tripId,
    headsign: ride.headsign,
    from: pointOfStop(from),
    to: pointOfStop(to),
    departureTime: ride.departureUnix,
    arrivalTime: ride.arrivalUnix,
    durationSec: ride.arrivalUnix - ride.departureUnix,
    stopCount: Math.max(1, ride.alightSeq - ride.boardSeq),
    serviceDate: ride.serviceDate,
    // Filled in for the itineraries that survive ranking; see attachGeometry.
    geometry: null,
  };
}

// ---------------------------------------------------------------------------
// Ride geometry: the piece of the line's own shape between the two stops, so
// the map draws the roads instead of a chord. Only the itineraries we are about
// to return pay for it, and only once per (trip, board, alight).
// ---------------------------------------------------------------------------

/** A stop further than this from its line's shape is not on it: no geometry. */
const SHAPE_SNAP_M = 150;
/** Below this the slice is a point, and two identical vertices are not a path. */
const MIN_GEOMETRY_M = 20;
/** A vertex this close to an end is already covered by the interpolated one. */
const VERTEX_EPSILON_M = 0.5;
/**
 * Built shapes kept between requests. The feed ships 1 142 of them and the
 * median one is ~200 vertices, so even all of them would fit; the cap is what
 * keeps a long running process bounded whatever the next ingest brings.
 */
const MAX_CACHED_SHAPES = 512;

const shapeCache = new Map<string, RoutePath | null>();
let shapeOwner: ReturnType<typeof getDb> | null = null;

/** The metric index for one encoded shape, built at most once per cache key. */
function cachedPath(key: string, load: () => string | null): RoutePath | null {
  const db = getDb();
  if (shapeOwner !== db) {
    shapeCache.clear();
    shapeOwner = db;
  }
  const held = shapeCache.get(key);
  if (held !== undefined) return held;

  let built: RoutePath | null = null;
  try {
    const encoded = load();
    built = encoded === null || encoded.length === 0 ? null : buildPath(decodePolyline(encoded));
  } catch {
    // A shape that will not decode is a shape we do not have: the leg keeps its
    // straight line rather than the request failing over a drawing detail.
    built = null;
  }
  // Insertion-ordered, so the first key is always the oldest entry.
  while (shapeCache.size >= MAX_CACHED_SHAPES) {
    const oldest = shapeCache.keys().next();
    if (oldest.done === true) break;
    shapeCache.delete(oldest.value);
  }
  shapeCache.set(key, built);
  return built;
}

/**
 * The road this particular run follows. The trip's own shape first: a line has
 * several variants per direction and the representative pattern shape is the
 * wrong road for a good share of its trips. The pattern shape is the fallback
 * for a feed that ships trips without one.
 */
function shapeForLeg(leg: JourneyRideLeg): RoutePath | null {
  const trip = tripShape(leg.tripId);
  if (trip !== null) {
    const path = cachedPath(`s:${trip.shapeId}`, () => trip.polyline);
    if (path !== null) return path;
  }
  return cachedPath(`p:${leg.route.routeId}:${leg.directionId}`, () =>
    patternShape(leg.route.routeId, leg.directionId),
  );
}

/** Where along the shape the ride runs, and how far off it the worse stop sits. */
interface ShapeSlice {
  fromS: number;
  toS: number;
  offM: number;
}

/**
 * The stretch of shape between two stops.
 *
 * A Rome pattern can touch the same street twice (loops, and the terminus
 * turnarounds every second route has), so the nearest vertex to a stop is not
 * always the one this ride passes. Both ends are therefore resolved twice, once
 * forwards from the boarding stop and once backwards from the alighting one,
 * and the pairing that fits the shape best wins.
 */
function sliceBetween(path: RoutePath, from: JourneyPoint, to: JourneyPoint): ShapeSlice | null {
  const span = path.lengthM;
  const candidates: ShapeSlice[] = [];

  const board = projectOnPath(path, from.lat, from.lon, null, 0, 0);
  if (board !== null) {
    // hint + window = "search the shape from here to the end, nothing before it".
    const alight = projectOnPath(path, to.lat, to.lon, board.s + span, span, SHAPE_SNAP_M);
    if (alight !== null) {
      candidates.push({
        fromS: board.s,
        toS: alight.s,
        offM: Math.max(board.distanceM, alight.distanceM),
      });
    }
  }

  const alight = projectOnPath(path, to.lat, to.lon, null, 0, 0);
  if (alight !== null) {
    const board2 = projectOnPath(path, from.lat, from.lon, alight.s - span, span, SHAPE_SNAP_M);
    if (board2 !== null) {
      candidates.push({
        fromS: board2.s,
        toS: alight.s,
        offM: Math.max(board2.distanceM, alight.distanceM),
      });
    }
  }

  let best: ShapeSlice | null = null;
  for (const candidate of candidates) {
    if (candidate.offM > SHAPE_SNAP_M) continue;
    if (candidate.toS - candidate.fromS < MIN_GEOMETRY_M) continue;
    if (best === null || candidate.offM < best.offM) best = candidate;
  }
  return best;
}

/** The shape's own vertices between the two ends, with both ends interpolated. */
function slicePoints(path: RoutePath, fromS: number, toS: number): Array<[number, number]> {
  const head = pointAtDistance(path, fromS);
  const tail = pointAtDistance(path, toS);
  const out: Array<[number, number]> = [[head.lat, head.lon]];
  for (let i = 0; i < path.cum.length; i += 1) {
    const s = path.cum[i];
    if (s <= fromS + VERTEX_EPSILON_M) continue;
    if (s >= toS - VERTEX_EPSILON_M) break;
    out.push([path.lats[i], path.lons[i]]);
  }
  out.push([tail.lat, tail.lon]);
  return out;
}

function geometryFor(leg: JourneyRideLeg, memo: Map<string, string | null>): string | null {
  const fromKey = leg.from.stopId ?? `${leg.from.lat},${leg.from.lon}`;
  const toKey = leg.to.stopId ?? `${leg.to.lat},${leg.to.lon}`;
  // Keyed on the trip, not the pattern: two runs of one line between the same
  // two stops can follow different variants, and drawing one for the other is
  // exactly the wrong road this whole path exists to avoid.
  const key = `${leg.tripId}|${fromKey}|${toKey}`;
  const held = memo.get(key);
  if (held !== undefined) return held;

  let encoded: string | null = null;
  const path = shapeForLeg(leg);
  if (path !== null) {
    const slice = sliceBetween(path, leg.from, leg.to);
    if (slice !== null) {
      try {
        encoded = encodePolyline(slicePoints(path, slice.fromS, slice.toS));
      } catch {
        encoded = null;
      }
    }
  }
  memo.set(key, encoded);
  return encoded;
}

/** Copies the itineraries with each ride leg's real geometry attached. */
function attachGeometry(journeys: Journey[]): Journey[] {
  const memo = new Map<string, string | null>();
  return journeys.map((journey) => ({
    ...journey,
    legs: journey.legs.map((leg) =>
      leg.kind === "ride" ? { ...leg, geometry: geometryFor(leg, memo) } : leg,
    ),
  }));
}

function finishJourney(legs: JourneyLeg[], id: string): Journey | null {
  const first = legs[0];
  const last = legs[legs.length - 1];
  if (first === undefined || last === undefined) return null;
  let walkDistanceM = 0;
  let walkDurationSec = 0;
  let rides = 0;
  for (const leg of legs) {
    if (leg.kind === "walk") {
      walkDistanceM += leg.distanceM;
      walkDurationSec += leg.durationSec;
    } else {
      rides += 1;
    }
  }
  return {
    id,
    legs,
    departureTime: first.departureTime,
    arrivalTime: last.arrivalTime,
    durationSec: last.arrivalTime - first.departureTime,
    transfers: Math.max(0, rides - 1),
    walkDistanceM,
    walkDurationSec,
    source: "scheduled",
  };
}

/** Route sequence plus boarding points: two departures of the same plan share it. */
function signatureOf(journey: Journey): string {
  const parts: string[] = [];
  for (const leg of journey.legs) {
    if (leg.kind !== "ride") continue;
    parts.push(`${leg.route.routeId}:${leg.directionId}:${leg.from.stopId ?? ""}:${leg.to.stopId ?? ""}`);
  }
  return parts.length === 0 ? "walk" : parts.join(">");
}

/**
 * The same vehicles at the same times. A big interchange is many stop ids in
 * one place, so one trip can be found through several of them and come back as
 * itineraries that differ only in which pole we happened to name.
 */
/**
 * What the rider can actually tell apart: the line, where they get on and off,
 * and the clock. Deliberately NOT the trip id — the feed often has two vehicles
 * running the same line between the same stops at the same second, and offering
 * both is noise that costs a slot a real alternative could have used.
 */
function identityOf(journey: Journey): string {
  const parts: string[] = [];
  for (const leg of journey.legs) {
    if (leg.kind !== "ride") continue;
    parts.push(
      `${leg.route.routeId}:${leg.directionId}:${leg.from.stopId ?? ""}:${leg.to.stopId ?? ""}` +
        `@${leg.departureTime}-${leg.arrivalTime}`,
    );
  }
  return parts.length === 0 ? `walk@${journey.arrivalTime}` : parts.join(">");
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export interface PlanRequest {
  origin: JourneyPlace;
  destination: JourneyPlace;
  /** Unix seconds: no journey may leave the origin before this. */
  departAfter: number;
  maxResults?: number;
}

/**
 * What the planner has to explain about a result. The planner runs on the
 * server, which does not know the reader's language, so it names the case and
 * leaves the wording to the client dictionary.
 */
export type JourneyNotice =
  | "no-origin-stops"
  | "no-destination-stops"
  | "no-connection"
  | "walk-only-left"
  | "later-departures";

export interface PlanResult {
  journeys: Journey[];
  /** Case to explain, for the client to word. Null when there is nothing. */
  notice: JourneyNotice | null;
  /** Diagnostics, not part of the API response. */
  stats: PlanStats;
}

export interface PlanStats {
  originStops: number;
  destStops: number;
  directCandidates: number;
  transferCandidates: number;
  /** stop_times queries actually issued. */
  queries: number;
  /** True when the first, narrow time window found nothing. */
  widened: boolean;
  /** True when the cheap search came up short and the round-based one ran. */
  escalated: boolean;
  /** Shape of the last round-based pass, null when it never ran. */
  rounds: RaptorStats | null;
  /** Round-based passes run, each one dropping the lines that turned out idle. */
  escalationPasses: number;
  /** Journeys that came from the round-based search rather than the pairing one. */
  multiLegJourneys: number;
}

function clampResults(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_MAX_RESULTS;
  return Math.max(1, Math.min(8, Math.floor(value)));
}

export function planJourneys(request: PlanRequest): PlanResult {
  const maxResults = clampResults(request.maxResults);
  const departAfter = Math.floor(request.departAfter);
  if (!Number.isFinite(departAfter)) throw new Error("journey: orario di partenza non valido");

  const grid = stopGrid();
  const net = routeNetwork();
  const routes = allRoutesById();

  const origin = request.origin;
  const destination = request.destination;
  const directDistanceM = haversineM(origin.lat, origin.lon, destination.lat, destination.lon);

  const walkOnly = buildWalkOnly(origin, destination, directDistanceM, departAfter);

  let originAccess = accessStops(grid, origin.lat, origin.lon, ACCESS_WALK_M, origin.stopId);
  let destAccess = accessStops(grid, destination.lat, destination.lon, ACCESS_WALK_M, destination.stopId);
  if (originAccess.length === 0) {
    originAccess = accessStops(grid, origin.lat, origin.lon, ACCESS_WALK_WIDE_M, origin.stopId);
  }
  if (destAccess.length === 0) {
    destAccess = accessStops(grid, destination.lat, destination.lon, ACCESS_WALK_WIDE_M, destination.stopId);
  }

  const stats: PlanStats = {
    originStops: originAccess.length,
    destStops: destAccess.length,
    directCandidates: 0,
    transferCandidates: 0,
    queries: 0,
    widened: false,
    escalated: false,
    rounds: null,
    escalationPasses: 0,
    multiLegJourneys: 0,
  };

  if (originAccess.length === 0 || destAccess.length === 0) {
    return {
      journeys: walkOnly === null ? [] : [walkOnly],
      notice: originAccess.length === 0 ? "no-origin-stops" : "no-destination-stops",
      stats,
    };
  }

  const destOptions = buildDestOptions(net, destAccess);
  const direct = findDirectCandidates(net, routes, originAccess, destOptions);
  const transfer = findTransferCandidates(grid, net, routes, originAccess, destOptions, destination, directDistanceM);
  stats.directCandidates = direct.length;
  stats.transferCandidates = transfer.length;

  const ends: Endpoints = {
    origin: pointOfPlace(origin),
    destination: pointOfPlace(destination),
    departAfter,
  };

  // The round-based search knows the network but not the timetable, so it will
  // route a rider onto a night line in the morning. Pricing a plan is what finds
  // that out, and a pass that learns nothing new ends the loop.
  const escalate = (windowSec: number): Journey[] => {
    stats.escalated = true;
    // Start from the lines that are not running in this window at all, then let
    // the timetable add the ones the feed lists but does not actually serve. A
    // line idle for the next ninety minutes may well be running within six, so
    // each window starts this over rather than inheriting the narrower verdict.
    const deadPatterns = idlePatterns(net, departAfter, windowSec);
    const found: Journey[] = [];
    for (let pass = 0; pass < MAX_ESCALATION_PASSES; pass += 1) {
      const before = deadPatterns.size;
      const result = raptorPlans({
        origin,
        destination,
        originAccess: originAccess.map(toRaptorAccess),
        destAccess: destAccess.map(toRaptorAccess),
        maxRounds: MAX_ROUNDS,
        // One-ride plans are the cheap search's job, unless it found none at all.
        minRides: direct.length === 0 && transfer.length === 0 ? 1 : 2,
        maxPlans: MAX_MULTI_PLANS,
        neighbours: (stopId) => raptorNeighbours(grid, stopId),
        excludePatterns: deadPatterns,
      });
      stats.rounds = result.stats;
      stats.escalationPasses += 1;
      if (result.plans.length === 0) break;
      found.push(...resolvePlans(result.plans, ends, windowSec, routes, grid, stats, deadPatterns));
      if (found.length > 0 || deadPatterns.size === before) break;
    }
    stats.multiLegJourneys += found.length;
    return found;
  };

  let journeys =
    direct.length === 0 && transfer.length === 0
      ? []
      : resolve(direct, transfer, ends, WINDOW_SEC, routes, grid, stats);
  if (needsMoreRounds(journeys, walkOnly, directDistanceM)) {
    journeys = [...journeys, ...escalate(WINDOW_SEC)];
  }

  let widened = false;
  if (journeys.length === 0) {
    widened = true;
    stats.widened = true;
    if (direct.length > 0 || transfer.length > 0) {
      journeys = resolve(direct, transfer, ends, WINDOW_WIDE_SEC, routes, grid, stats);
    }
    if (journeys.length === 0) journeys = escalate(WINDOW_WIDE_SEC);
  }

  const ranked = rank(journeys, walkOnly, maxResults);

  let notice: JourneyNotice | null = null;
  if (journeys.length === 0) {
    notice = walkOnly === null ? "no-connection" : "walk-only-left";
  } else if (widened) {
    notice = "later-departures";
  }

  return { journeys: attachGeometry(ranked), notice, stats };
}

/**
 * Patterns with no run under way anywhere near the window we are searching.
 * The round-based search knows the network but not the clock, so without this
 * it spends every candidate plan on night lines at nine in the morning.
 *
 * Returns an empty set rather than excluding everything if the feed says
 * nothing at all for these dates: no knowledge must never mean no journeys.
 */
function idlePatterns(net: RouteNetwork, departAfter: number, windowSec: number): Set<string> {
  const live = new Set<string>();
  const until = departAfter + windowSec + SERVICE_LOOKAHEAD_SEC;
  for (const window of serviceWindows(departAfter, until)) {
    const from = Math.floor((departAfter - window.origin - SERVICE_LOOKBACK_SEC) / 3600);
    const to = Math.floor((until - window.origin) / 3600);
    let mask = 0;
    for (let hour = Math.max(0, from); hour <= Math.min(31, to); hour += 1) mask |= 1 << hour;
    if (mask === 0) continue;
    for (const [key, hours] of patternServiceHours(window.date)) {
      if ((hours & mask) !== 0) live.add(key);
    }
  }
  if (live.size === 0) return new Set<string>();
  const idle = new Set<string>();
  for (const key of net.patterns.keys()) if (!live.has(key)) idle.add(key);
  return idle;
}

function toRaptorAccess(access: AccessStop): RaptorAccess {
  return { stopId: access.stop.stopId, walkM: access.walkM, walkSec: access.walkSec };
}

/** Time spent moving, so a long wait for the first departure is not read as a detour. */
function movingSec(journey: Journey): number {
  for (const leg of journey.legs) {
    if (leg.kind === "ride") return journey.arrivalTime - leg.departureTime;
  }
  return journey.durationSec;
}

/**
 * True when the cheap pairing search is not enough: either it found nothing, or
 * what it found takes far longer than the distance can justify, which is what a
 * one-change detour around a missing two-change connection looks like.
 */
function needsMoreRounds(
  journeys: Journey[],
  walkOnly: Journey | null,
  directDistanceM: number,
): boolean {
  if (journeys.length === 0) return true;
  let best = Number.POSITIVE_INFINITY;
  let earliest = Number.POSITIVE_INFINITY;
  for (const journey of journeys) {
    best = Math.min(best, movingSec(journey));
    earliest = Math.min(earliest, journey.arrivalTime);
  }
  // No sequence of changes beats simply walking there, so do not go looking.
  if (walkOnly !== null && walkOnly.arrivalTime <= earliest) return false;
  return best > DETOUR_BASE_SEC + (directDistanceM / DETOUR_SPEED_MPS) * DETOUR_FACTOR;
}

function buildWalkOnly(
  origin: JourneyPlace,
  destination: JourneyPlace,
  distanceM: number,
  departAfter: number,
): Journey | null {
  if (distanceM > WALK_ONLY_MAX_M) return null;
  const leg = walkLeg(pointOfPlace(origin), pointOfPlace(destination), distanceM, departAfter);
  return finishJourney([leg], "walk");
}

function findDirectCandidates(
  net: RouteNetwork,
  routes: ReadonlyMap<string, RouteSummary>,
  originAccess: AccessStop[],
  destOptions: Map<string, DestOptions>,
): DirectCandidate[] {
  const best = new Map<string, DirectCandidate>();
  for (const board of originAccess) {
    for (const membership of net.byStop.get(board.stop.stopId) ?? []) {
      const options = destOptions.get(membership.key);
      if (options === undefined) continue;
      const alight = destAfter(options, membership.idx);
      if (alight === null) continue;
      const routeType = routeTypeOf(routes, membership.key);
      const score =
        board.walkSec +
        rideEstimateSec(board.stop, alight.access.stop, routeType) +
        alight.access.walkSec;
      const held = best.get(membership.key);
      if (held === undefined || score < held.score) {
        best.set(membership.key, { key: membership.key, board, boardIdx: membership.idx, alight, score });
      }
    }
  }
  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, MAX_DIRECT_CANDIDATES);
}

/** Best boarding stop per pattern reachable from the origin. */
function boardingByPattern(
  net: RouteNetwork,
  originAccess: AccessStop[],
): Map<string, { access: AccessStop; membership: PatternMembership }> {
  const best = new Map<string, { access: AccessStop; membership: PatternMembership }>();
  for (const access of originAccess) {
    for (const membership of net.byStop.get(access.stop.stopId) ?? []) {
      const held = best.get(membership.key);
      if (held === undefined || access.walkM < held.access.walkM) {
        best.set(membership.key, { access, membership });
      }
    }
  }
  return best;
}

/** Where each pattern that reaches the destination can be boarded, and to what end. */
function boardingsTowardsDestination(
  net: RouteNetwork,
  destOptions: Map<string, DestOptions>,
): Map<string, Array<{ key: string; idx: number; alight: DestEntry }>> {
  const out = new Map<string, Array<{ key: string; idx: number; alight: DestEntry }>>();
  for (const [key, options] of destOptions) {
    const pattern = net.patterns.get(key);
    if (pattern === undefined) continue;
    const limit = Math.min(options.lastIdx, pattern.stops.length);
    for (let idx = 0; idx < limit; idx += 1) {
      const stopId = pattern.stops[idx];
      if (stopId === undefined) continue;
      const alight = destAfter(options, idx);
      if (alight === null) continue;
      const list = out.get(stopId);
      const entry = { key, idx, alight };
      if (list === undefined) out.set(stopId, [entry]);
      else list.push(entry);
    }
  }
  return out;
}

function findTransferCandidates(
  grid: StopGrid,
  net: RouteNetwork,
  routes: ReadonlyMap<string, RouteSummary>,
  originAccess: AccessStop[],
  destOptions: Map<string, DestOptions>,
  destination: JourneyPlace,
  directDistanceM: number,
): TransferCandidate[] {
  const boardings = boardingByPattern(net, originAccess);
  const towards = boardingsTowardsDestination(net, destOptions);
  if (towards.size === 0) return [];

  // A change that leaves you no closer to the destination than you started is
  // almost always a detour we do not need to price.
  const detourLimit = Math.max(1200, directDistanceM * 1.15);

  const best = new Map<string, TransferCandidate>();
  for (const [firstKey, from] of boardings) {
    const pattern = net.patterns.get(firstKey);
    if (pattern === undefined) continue;
    const firstRouteId = routeIdOf(firstKey);
    const firstType = routeTypeOf(routes, firstKey);
    const last = Math.min(pattern.stops.length, from.membership.idx + 1 + MAX_RIDE_STOPS);

    for (let idx = from.membership.idx + 1; idx < last; idx += 1) {
      const changeStopId = pattern.stops[idx];
      if (changeStopId === undefined) continue;
      const changeStop = grid.stops.get(changeStopId);
      if (changeStop === undefined) continue;
      if (haversineM(changeStop.lat, changeStop.lon, destination.lat, destination.lon) > detourLimit) {
        continue;
      }

      for (const neighbour of transferNeighbours(grid, changeStopId)) {
        for (const option of towards.get(neighbour.stop.stopId) ?? []) {
          if (option.key === firstKey) continue;
          // The same line in the other direction is a ride back, never a change.
          if (routeIdOf(option.key) === firstRouteId) continue;

          const transferWalkSec = walkSeconds(neighbour.distanceM);
          const secondType = routeTypeOf(routes, option.key);
          const score =
            from.access.walkSec +
            rideEstimateSec(from.access.stop, changeStop, firstType) +
            TRANSFER_BUFFER_SEC +
            transferWalkSec +
            rideEstimateSec(neighbour.stop, option.alight.access.stop, secondType) +
            option.alight.access.walkSec;

          const pairKey = `${firstKey}>${option.key}`;
          const held = best.get(pairKey);
          if (held !== undefined && held.score <= score) continue;
          best.set(pairKey, {
            firstKey,
            board: from.access,
            boardIdx: from.membership.idx,
            changeStopId,
            changeIdx: idx,
            secondKey: option.key,
            reboardStopId: neighbour.stop.stopId,
            reboardIdx: option.idx,
            transferWalkM: neighbour.distanceM,
            alight: option.alight,
            score,
          });
        }
      }
    }
  }

  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, MAX_TRANSFER_CANDIDATES);
}

/** The two ends of the search, carried through assembly instead of shared state. */
interface Endpoints {
  origin: JourneyPoint;
  destination: JourneyPoint;
  departAfter: number;
}

function resolve(
  direct: DirectCandidate[],
  transfer: TransferCandidate[],
  ends: Endpoints,
  windowSec: number,
  routes: ReadonlyMap<string, RouteSummary>,
  grid: StopGrid,
  stats: PlanStats,
): Journey[] {
  const finder = new RideFinder(windowSec);
  const out: Journey[] = [];

  for (const candidate of direct) {
    const parsed = parsePatternKey(candidate.key);
    const route = parsed === null ? undefined : routes.get(parsed.routeId);
    if (parsed === null || route === undefined) continue;
    const alightStop = grid.stops.get(candidate.alight.stopId);
    if (alightStop === undefined) continue;

    const rides = finder.find(
      candidate.key,
      candidate.board.stop.stopId,
      candidate.alight.stopId,
      ends.departAfter + candidate.board.walkSec,
      DEPARTURES_PER_DIRECT,
    );
    for (const ride of rides) {
      const journey = assembleDirect(candidate, ride, route, parsed.directionId, alightStop, ends);
      if (journey !== null) out.push(journey);
    }
  }

  for (const candidate of transfer) {
    const first = parsePatternKey(candidate.firstKey);
    const second = parsePatternKey(candidate.secondKey);
    const firstRoute = first === null ? undefined : routes.get(first.routeId);
    const secondRoute = second === null ? undefined : routes.get(second.routeId);
    if (first === null || second === null || firstRoute === undefined || secondRoute === undefined) {
      continue;
    }
    const changeStop = grid.stops.get(candidate.changeStopId);
    const reboardStop = grid.stops.get(candidate.reboardStopId);
    const alightStop = grid.stops.get(candidate.alight.stopId);
    if (changeStop === undefined || reboardStop === undefined || alightStop === undefined) continue;

    const firstRides = finder.find(
      candidate.firstKey,
      candidate.board.stop.stopId,
      candidate.changeStopId,
      ends.departAfter + candidate.board.walkSec,
      DEPARTURES_PER_FIRST_LEG,
    );
    for (const firstRide of firstRides) {
      const readyAt =
        firstRide.arrivalUnix + TRANSFER_BUFFER_SEC + walkSeconds(candidate.transferWalkM);
      const secondRides = finder.find(
        candidate.secondKey,
        candidate.reboardStopId,
        candidate.alight.stopId,
        readyAt,
        1,
      );
      const secondRide = secondRides[0];
      if (secondRide === undefined) continue;
      const journey = assembleTransfer({
        candidate,
        firstRide,
        secondRide,
        firstRoute,
        secondRoute,
        firstDirection: first.directionId,
        secondDirection: second.directionId,
        changeStop,
        reboardStop,
        alightStop,
        ends,
      });
      if (journey !== null) out.push(journey);
    }
  }

  stats.queries += finder.queryCount;
  return out;
}

// ---------------------------------------------------------------------------
// Pricing a multi-leg plan against the real timetable
// ---------------------------------------------------------------------------

/** One ride of a plan, with everything the timetable lookup and the legs need. */
interface PlanLeg {
  key: string;
  route: RouteSummary;
  directionId: number;
  board: Stop;
  alight: Stop;
}

function preparePlan(
  plan: RaptorPlan,
  routes: ReadonlyMap<string, RouteSummary>,
  grid: StopGrid,
): PlanLeg[] | null {
  const legs: PlanLeg[] = [];
  for (const ride of plan.rides) {
    const parsed = parsePatternKey(ride.patternKey);
    if (parsed === null) return null;
    const route = routes.get(parsed.routeId);
    const board = grid.stops.get(ride.boardStopId);
    const alight = grid.stops.get(ride.alightStopId);
    if (route === undefined || board === undefined || alight === undefined) return null;
    if (board.stopId === alight.stopId) return null;
    legs.push({ key: ride.patternKey, route, directionId: parsed.directionId, board, alight });
  }
  return legs.length === 0 ? null : legs;
}

/**
 * Follows a plan through the timetable: a few departures on the first leg, then
 * the first connection that can actually be caught on each one after it. A leg
 * with nothing to catch abandons that branch rather than the whole plan.
 */
function chainRides(
  legs: readonly PlanLeg[],
  firstRide: Ride,
  finder: RideFinder,
  dead: Set<string>,
): Ride[] | null {
  const rides: Ride[] = [firstRide];
  for (let i = 1; i < legs.length; i += 1) {
    const previousLeg = legs[i - 1];
    const leg = legs[i];
    const previousRide = rides[i - 1];
    if (previousLeg === undefined || leg === undefined || previousRide === undefined) return null;
    const walkM = haversineM(
      previousLeg.alight.lat,
      previousLeg.alight.lon,
      leg.board.lat,
      leg.board.lon,
    );
    const readyAt = previousRide.arrivalUnix + TRANSFER_BUFFER_SEC + walkSeconds(walkM);
    const next = finder.find(leg.key, leg.board.stopId, leg.alight.stopId, readyAt, 1)[0];
    if (next === undefined) {
      // Nothing at all in a window this wide is a line that is not running now,
      // not a connection we merely missed. The next pass searches without it.
      dead.add(leg.key);
      return null;
    }
    rides.push(next);
  }
  return rides;
}

function resolvePlans(
  plans: readonly RaptorPlan[],
  ends: Endpoints,
  windowSec: number,
  routes: ReadonlyMap<string, RouteSummary>,
  grid: StopGrid,
  stats: PlanStats,
  dead: Set<string>,
): Journey[] {
  const finder = new RideFinder(windowSec);
  const out: Journey[] = [];

  for (const plan of plans) {
    const legs = preparePlan(plan, routes, grid);
    const first = legs === null ? undefined : legs[0];
    if (legs === null || first === undefined) continue;

    const originWalkM = haversineM(ends.origin.lat, ends.origin.lon, first.board.lat, first.board.lon);
    const firstRides = finder.find(
      first.key,
      first.board.stopId,
      first.alight.stopId,
      ends.departAfter + walkSeconds(originWalkM),
      DEPARTURES_PER_MULTI,
    );
    if (firstRides.length === 0) {
      dead.add(first.key);
      continue;
    }
    for (const firstRide of firstRides) {
      const rides = chainRides(legs, firstRide, finder, dead);
      if (rides === null) continue;
      const journey = assemblePlan(legs, rides, originWalkM, ends);
      if (journey !== null) out.push(journey);
    }
  }

  stats.queries += finder.queryCount;
  return out;
}

function assemblePlan(
  legs: readonly PlanLeg[],
  rides: readonly Ride[],
  originWalkM: number,
  ends: Endpoints,
): Journey | null {
  const first = legs[0];
  const firstRide = rides[0];
  const last = legs[legs.length - 1];
  const lastRide = rides[rides.length - 1];
  if (first === undefined || firstRide === undefined || last === undefined || lastRide === undefined) {
    return null;
  }

  const out: JourneyLeg[] = [];
  const leaveAt = Math.max(ends.departAfter, firstRide.departureUnix - walkSeconds(originWalkM));
  if (originWalkM >= MIN_WALK_LEG_M) {
    out.push(walkLeg(ends.origin, pointOfStop(first.board), originWalkM, leaveAt));
  }

  for (let i = 0; i < legs.length; i += 1) {
    const leg = legs[i];
    const ride = rides[i];
    if (leg === undefined || ride === undefined) return null;
    if (i > 0) {
      const previousLeg = legs[i - 1];
      const previousRide = rides[i - 1];
      if (previousLeg === undefined || previousRide === undefined) return null;
      const walkM = haversineM(
        previousLeg.alight.lat,
        previousLeg.alight.lon,
        leg.board.lat,
        leg.board.lon,
      );
      if (walkM >= MIN_WALK_LEG_M) {
        out.push(
          walkLeg(
            pointOfStop(previousLeg.alight),
            pointOfStop(leg.board),
            walkM,
            previousRide.arrivalUnix,
          ),
        );
      }
    }
    out.push(
      rideLeg({ route: leg.route, directionId: leg.directionId, ride, from: leg.board, to: leg.alight }),
    );
  }

  const destWalkM = haversineM(
    last.alight.lat,
    last.alight.lon,
    ends.destination.lat,
    ends.destination.lon,
  );
  if (destWalkM >= MIN_WALK_LEG_M) {
    out.push(walkLeg(pointOfStop(last.alight), ends.destination, destWalkM, lastRide.arrivalUnix));
  }

  const keys = legs.map((leg) => leg.key).join(">");
  const trips = rides.map((ride) => ride.tripId).join(">");
  return finishJourney(out, `m:${keys}:${trips}:${firstRide.departureUnix}`);
}

function assembleDirect(
  candidate: DirectCandidate,
  ride: Ride,
  route: RouteSummary,
  directionId: number,
  alightStop: Stop,
  ends: Endpoints,
): Journey | null {
  const legs: JourneyLeg[] = [];
  // Leave just in time for the bus, but never before the requested moment.
  const leaveAt = Math.max(ends.departAfter, ride.departureUnix - candidate.board.walkSec);
  if (candidate.board.walkM >= MIN_WALK_LEG_M) {
    legs.push(walkLeg(ends.origin, pointOfStop(candidate.board.stop), candidate.board.walkM, leaveAt));
  }
  legs.push(rideLeg({ route, directionId, ride, from: candidate.board.stop, to: alightStop }));
  if (candidate.alight.access.walkM >= MIN_WALK_LEG_M) {
    legs.push(
      walkLeg(pointOfStop(alightStop), ends.destination, candidate.alight.access.walkM, ride.arrivalUnix),
    );
  }
  return finishJourney(legs, `d:${candidate.key}:${ride.tripId}:${ride.departureUnix}`);
}

function assembleTransfer(args: {
  candidate: TransferCandidate;
  firstRide: Ride;
  secondRide: Ride;
  firstRoute: RouteSummary;
  secondRoute: RouteSummary;
  firstDirection: number;
  secondDirection: number;
  changeStop: Stop;
  reboardStop: Stop;
  alightStop: Stop;
  ends: Endpoints;
}): Journey | null {
  const { candidate, firstRide, secondRide, ends } = args;
  const legs: JourneyLeg[] = [];
  const leaveAt = Math.max(ends.departAfter, firstRide.departureUnix - candidate.board.walkSec);

  if (candidate.board.walkM >= MIN_WALK_LEG_M) {
    legs.push(
      walkLeg(ends.origin, pointOfStop(candidate.board.stop), candidate.board.walkM, leaveAt),
    );
  }
  legs.push(
    rideLeg({
      route: args.firstRoute,
      directionId: args.firstDirection,
      ride: firstRide,
      from: candidate.board.stop,
      to: args.changeStop,
    }),
  );
  if (candidate.transferWalkM >= MIN_WALK_LEG_M) {
    legs.push(
      walkLeg(
        pointOfStop(args.changeStop),
        pointOfStop(args.reboardStop),
        candidate.transferWalkM,
        firstRide.arrivalUnix,
      ),
    );
  }
  legs.push(
    rideLeg({
      route: args.secondRoute,
      directionId: args.secondDirection,
      ride: secondRide,
      from: args.reboardStop,
      to: args.alightStop,
    }),
  );
  if (candidate.alight.access.walkM >= MIN_WALK_LEG_M) {
    legs.push(
      walkLeg(
        pointOfStop(args.alightStop),
        ends.destination,
        candidate.alight.access.walkM,
        secondRide.arrivalUnix,
      ),
    );
  }
  return finishJourney(
    legs,
    `t:${candidate.firstKey}>${candidate.secondKey}:${firstRide.tripId}:${secondRide.tripId}`,
  );
}

/**
 * True when `a` is at least as good as `b` on every axis a rider cares about
 * and strictly better on one: leaves no earlier, arrives no later, changes no
 * more, walks no further. Without this the same plan comes back four times,
 * differing only in which earlier train you took to wait longer at the change.
 */
function dominates(a: Journey, b: Journey): boolean {
  const noWorse =
    a.departureTime >= b.departureTime &&
    a.arrivalTime <= b.arrivalTime &&
    a.transfers <= b.transfers &&
    a.walkDistanceM <= b.walkDistanceM;
  if (!noWorse) return false;
  return (
    a.departureTime > b.departureTime ||
    a.arrivalTime < b.arrivalTime ||
    a.transfers < b.transfers ||
    a.walkDistanceM < b.walkDistanceM
  );
}

function paretoFront(journeys: Journey[]): Journey[] {
  return journeys.filter(
    (candidate) => !journeys.some((other) => other !== candidate && dominates(other, candidate)),
  );
}

/**
 * Ranks the transit options, then decides where the walk belongs. The walk is
 * kept out of the Pareto pass on purpose: it always leaves at the earliest
 * possible moment and covers the whole distance on foot, so on those two axes
 * a ride beats it almost by definition, and it would be filtered out even when
 * it is plainly the better way to go.
 */
function rank(journeys: Journey[], walkOnly: Journey | null, maxResults: number): Journey[] {
  const sorted = paretoFront(journeys).sort(
    (a, b) =>
      a.arrivalTime - b.arrivalTime ||
      a.transfers - b.transfers ||
      a.walkDistanceM - b.walkDistanceM ||
      b.departureTime - a.departureTime ||
      a.id.localeCompare(b.id),
  );

  const seen = new Map<string, number>();
  const identities = new Set<string>();
  const out: Journey[] = [];
  for (const journey of sorted) {
    if (out.length >= maxResults) break;
    // Sorted least-walking-first among equals, so the first one kept is the best.
    const identity = identityOf(journey);
    if (identities.has(identity)) continue;
    const signature = signatureOf(journey);
    const count = seen.get(signature) ?? 0;
    if (count >= MAX_PER_SIGNATURE) continue;
    identities.add(identity);
    seen.set(signature, count + 1);
    out.push(journey);
  }

  if (walkOnly === null) return out;
  const best = out[0];
  if (best === undefined) return [walkOnly];
  const lost = walkOnly.arrivalTime - best.arrivalTime;
  if (lost > WALK_DISCARD_SEC) return out;
  if (lost <= WALK_PREFERENCE_SEC) return [walkOnly, ...out].slice(0, maxResults);
  // Worth mentioning, but not the recommendation: slot it in by arrival time.
  const at = out.findIndex((journey) => journey.arrivalTime > walkOnly.arrivalTime);
  const index = at === -1 ? out.length : at;
  return [...out.slice(0, index), walkOnly, ...out.slice(index)].slice(0, maxResults);
}
