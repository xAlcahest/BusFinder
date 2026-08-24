/**
 * Shared contract for the whole app. Every module compiles against this file.
 * Do not change a type here without updating every consumer.
 */

// ---------------------------------------------------------------------------
// Static GTFS entities (mirrors the SQLite schema in scripts/schema.sql)
// ---------------------------------------------------------------------------

export interface Stop {
  stopId: string;
  stopCode: string | null;
  stopName: string;
  lat: number;
  lon: number;
  wheelchair: number | null;
}

/** A stop plus the lines that call at it. Used by stop pages and search. */
export interface StopWithRoutes extends Stop {
  routes: RouteSummary[];
}

export interface NearbyStop extends Stop {
  /** Great-circle distance from the query point, in metres, rounded. */
  distanceM: number;
  routes: RouteSummary[];
}

export interface RouteSummary {
  routeId: string;
  shortName: string;
  longName: string | null;
  /** GTFS route_type: 0 tram, 1 metro, 2 rail, 3 bus. */
  routeType: number;
  color: string | null;
  textColor: string | null;
}

export interface RouteDirection {
  directionId: number;
  /** Most common trip_headsign for this route+direction. */
  headsign: string;
  tripCount: number;
}

/** Full detail for one line in one direction. */
export interface LineDetail {
  route: RouteSummary;
  agencyName: string;
  directions: RouteDirection[];
  activeDirection: number;
  /** Ordered list of stops served in this direction. */
  stops: Stop[];
  /** Encoded polyline (Google algorithm, precision 5) of the shape, or null. */
  polyline: string | null;
}

// ---------------------------------------------------------------------------
// Arrivals: the core feature. Realtime when available, scheduled otherwise.
// ---------------------------------------------------------------------------

export type ArrivalSource = "realtime" | "scheduled";

export interface Arrival {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeType: number;
  routeColor: string | null;
  headsign: string;
  /** Unix seconds of expected arrival. Always absolute, never relative. */
  arrivalTime: number;
  /** Minutes from now, rounded down. Negative means it is due/just left. */
  minutesAway: number;
  /** Seconds of delay versus schedule; null when unknown. */
  delaySec: number | null;
  source: ArrivalSource;
  /** Vehicle label from the realtime feed, when the operator publishes one. */
  vehicleId: string | null;
  /** True when the realtime feed flags this stop as skipped for this trip. */
  skipped: boolean;
}

export interface ArrivalsResponse {
  stop: StopWithRoutes;
  arrivals: Arrival[];
  /** Unix seconds: timestamp of the realtime feed the arrivals came from. */
  feedTimestamp: number | null;
  /** True when the realtime feed is stale or unreachable and we fell back. */
  degraded: boolean;
  generatedAt: number;
}

// ---------------------------------------------------------------------------
// Timetable: scheduled service, independent of realtime.
// ---------------------------------------------------------------------------

export interface TimetableEntry {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeType: number;
  headsign: string;
  /** Seconds after midnight of the service day; can exceed 86400. */
  departureSec: number;
  /** "HH:MM", normalised into 0..23 for display. */
  departureLabel: string;
}

export interface TimetableResponse {
  stop: Stop;
  /** Service date in YYYYMMDD, as requested. */
  date: string;
  routes: RouteSummary[];
  entries: TimetableEntry[];
}

// ---------------------------------------------------------------------------
// Service alerts (GTFS-RT service_alerts feed)
// ---------------------------------------------------------------------------

export interface ServiceAlert {
  id: string;
  header: string;
  description: string;
  url: string | null;
  cause: string | null;
  effect: string | null;
  /** Unix seconds; null when the feed gives no window. */
  activeFrom: number | null;
  activeUntil: number | null;
  affectedRoutes: RouteSummary[];
  affectedStopIds: string[];
}

export interface AlertsResponse {
  alerts: ServiceAlert[];
  feedTimestamp: number | null;
  degraded: boolean;
}

// ---------------------------------------------------------------------------
// Live vehicles (GTFS-RT vehicle_positions feed)
// ---------------------------------------------------------------------------

export interface Vehicle {
  vehicleId: string;
  /**
   * Number painted on the vehicle, for display. `vehicleId` is the identity and
   * may combine several feed fields, so it is not what a rider should be shown.
   */
  vehicleLabel?: string | null;
  tripId: string | null;
  routeId: string | null;
  routeShortName: string | null;
  lat: number;
  lon: number;
  bearing: number | null;
  /** Unix seconds of the position fix. */
  timestamp: number;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  feedTimestamp: number | null;
  degraded: boolean;
}

/**
 * Learned speeds for one line, as three parallel arrays of equal length. Not
 * an array of objects: a busy line answers with a few hundred cells and the
 * repeated keys would be most of the payload.
 */
export interface RouteSpeedHint {
  routeId: string;
  /** Packed 250 m grid cells; see cellKeyOf() in src/lib/pathmotion.ts. */
  cells: number[];
  /** Mean speed through each cell, metres per second. */
  mps: number[];
  /** Decayed sample count behind each mean; the client reads it as confidence. */
  weight: number[];
}

/** GET /api/motion?routes=a,b,c */
export interface MotionHintsResponse {
  /** Unix seconds the answer was built. */
  generatedAt: number;
  /** Time band the speeds are for: -1 all day, else weekday/weekend by quarter. */
  band: number;
  /** Side of one cell in metres, so a client can sanity-check the grid. */
  cellM: number;
  routes: RouteSpeedHint[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResponse {
  query: string;
  stops: Stop[];
  routes: RouteSummary[];
}

// ---------------------------------------------------------------------------
// Client-side persistence (localStorage only, no server, no accounts)
// ---------------------------------------------------------------------------

/** Storage keys. Never write to localStorage with a key not listed here. */
export const STORAGE_KEYS = {
  favorites: "probus.favorites.v1",
  recents: "probus.recents.v1",
  settings: "probus.settings.v1",
  sync: "probus.sync.v1",
  tombstones: "probus.tombstones.v1",
  /** "1" when the sidebar sync panel is expanded; anything else is collapsed. */
  syncPanel: "probus.syncpanel.v1",
} as const;

/** What a star was put on. Entries written before lines could be saved have none. */
export type FavoriteKind = "stop" | "line";

export interface Favorite {
  /** Missing in stored v1 entries, which are always stops. */
  kind: FavoriteKind;
  /** stop_id when kind is "stop", route_id when kind is "line". */
  id: string;
  /** Snapshot of the name, so favorites render before the API answers. */
  name: string;
  /** Lines only: GTFS route_type, so the badge is right before any request. */
  routeType: number | null;
  /** Lines only: GTFS route_color. */
  color: string | null;
  /** User-chosen label, the equivalent of Probus's "note/tag". */
  tag: string | null;
  /** Stops only: only show these lines for this favorite. Empty = all. */
  pinnedRoutes: string[];
  addedAt: number;
  /** Manual ordering; lower sorts first. */
  order: number;
  /** Last local edit, in unix ms. Drives field-level merge during sync. */
  updatedAt?: number;
}

/** What a star needs to know about the thing under it. */
export interface FavoriteTarget {
  kind: FavoriteKind;
  id: string;
  name: string;
  routeType?: number | null;
  color?: string | null;
}

export interface RecentStop {
  stopId: string;
  stopName: string;
  visitedAt: number;
}

export interface Settings {
  /** Seconds between arrival refreshes. */
  refreshInterval: number;
  /** Metres for the nearby search radius. */
  nearbyRadius: number;
  /** Cap on arrivals shown per stop. */
  maxArrivals: number;
  theme: "system" | "light" | "dark";
  /** Show scheduled departures when realtime has nothing for a stop. */
  showScheduledFallback: boolean;
  /**
   * UI language. "system" follows navigator.language; see src/lib/i18n.
   * locale.ts fails to compile if its own list ever drifts from this one.
   */
  language:
    | "system"
    | "it"
    | "en"
    | "ar"
    | "bn"
    | "de"
    | "es"
    | "fr"
    | "hi"
    | "id"
    | "ja"
    | "ko"
    | "nl"
    | "pl"
    | "pt"
    | "ro"
    | "ru"
    | "tl"
    | "tr"
    | "uk"
    | "ur"
    | "zh";
}

export const DEFAULT_SETTINGS: Settings = {
  refreshInterval: 30,
  nearbyRadius: 500,
  maxArrivals: 12,
  theme: "system",
  showScheduledFallback: true,
  language: "system",
};

// ---------------------------------------------------------------------------
// Errors: every API route returns this shape on failure.
// ---------------------------------------------------------------------------

export interface ApiError {
  error: string;
  detail?: string;
}

// ---------------------------------------------------------------------------
// Device sync: a code, no account. The server stores an opaque id and a blob it
// cannot read; the key never leaves the browser.
// ---------------------------------------------------------------------------

/** Deleted favourite, so a removal on one device is not resurrected by another. */
export interface SyncTombstone {
  /** Missing in stored v1 entries, which are always stops. */
  kind: FavoriteKind;
  id: string;
  /** Unix ms. */
  deletedAt: number;
}

/** Plaintext blob, encrypted client-side before it is ever sent. */
export interface SyncPayload {
  schema: 1;
  favorites: Favorite[];
  recents: RecentStop[];
  settings: Settings;
  tombstones: SyncTombstone[];
  /** Unix ms of the last local change folded into this payload. */
  updatedAt: number;
}

/** Local sync bookkeeping. The code lives here and nowhere else. */
export interface SyncState {
  /** Human-readable code, e.g. "K7M2P-3QR8T-9WXYZ-B4NHD". Null when off. */
  code: string | null;
  /** Derived from the code; the only identifier the server ever sees. */
  syncId: string | null;
  /** Server version this device last agreed with; 0 when never pushed. */
  version: number;
  lastSyncAt: number | null;
  autoSync: boolean;
}

export const DEFAULT_SYNC_STATE: SyncState = {
  code: null,
  syncId: null,
  version: 0,
  lastSyncAt: null,
  autoSync: true,
};

export type SyncPhase = "off" | "idle" | "syncing" | "error" | "conflict";

export interface SyncStatus {
  phase: SyncPhase;
  lastSyncAt: number | null;
  /** Italian, user-facing. Null when there is nothing to say. */
  message: string | null;
}

/** GET /api/sync/[syncId] */
export interface SyncPullResponse {
  /** base64 of the AES-GCM ciphertext. */
  ciphertext: string;
  /** base64 of the 12-byte IV. */
  iv: string;
  version: number;
  /** Unix ms of the server-side write. */
  updatedAt: number;
}

/** PUT /api/sync/[syncId] body */
export interface SyncPushRequest {
  ciphertext: string;
  iv: string;
  /** Version this write is based on. 0 creates. Mismatch answers 409. */
  baseVersion: number;
}

export interface SyncPushResponse {
  version: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Vehicles serving one stop (the map on the stop page)
// ---------------------------------------------------------------------------

export type StopVehicleRelation = "approaching" | "onLine";

export interface StopVehicle extends Vehicle {
  relation: StopVehicleRelation;
  /** Set when the vehicle is inbound to this stop, else null. */
  minutesAway: number | null;
  arrivalTime: number | null;
  headsign: string | null;
  routeColor: string | null;
  routeType: number | null;
}

/** GET /api/stops/[stopId]/vehicles?mode=approaching|all */
export interface StopVehiclesResponse {
  stop: Stop;
  mode: "approaching" | "all";
  vehicles: StopVehicle[];
  feedTimestamp: number | null;
  degraded: boolean;
}

// ---------------------------------------------------------------------------
// Journey planner: A to B on public transport only. There is no street network
// in this app, so walking is always a straight line with a detour factor and
// every time comes from the timetable, never from the realtime feed.
// ---------------------------------------------------------------------------

/** How an endpoint was resolved: one of our stops, raw coordinates, a geocoded place. */
export type JourneyEndpointKind = "stop" | "coord" | "place";

export interface JourneyPoint {
  name: string;
  lat: number;
  lon: number;
  /** Set when the point is one of our stops. */
  stopId: string | null;
  stopCode: string | null;
}

export interface JourneyPlace extends JourneyPoint {
  kind: JourneyEndpointKind;
  /** Fuller address from the geocoder, when it adds anything to `name`. */
  label: string | null;
}

export interface JourneyWalkLeg {
  kind: "walk";
  from: JourneyPoint;
  to: JourneyPoint;
  /** Straight-line metres. We have no road graph: this is a lower bound. */
  distanceM: number;
  durationSec: number;
  /** Unix seconds, absolute. */
  departureTime: number;
  arrivalTime: number;
}

export interface JourneyRideLeg {
  kind: "ride";
  route: RouteSummary;
  directionId: number;
  tripId: string;
  headsign: string;
  from: JourneyPoint;
  to: JourneyPoint;
  departureTime: number;
  arrivalTime: number;
  durationSec: number;
  /** Stops travelled, boarding stop excluded. */
  stopCount: number;
  /** GTFS service date the trip belongs to, YYYYMMDD. */
  serviceDate: string;
  /**
   * Encoded polyline of the line's real shape between the two stops, so the map
   * can draw the roads rather than a chord. Null when the feed ships no shape
   * for the pattern or a stop does not sit on it.
   */
  geometry: string | null;
}

export type JourneyLeg = JourneyWalkLeg | JourneyRideLeg;

export interface Journey {
  /** Stable within one response; usable as a React key. */
  id: string;
  legs: JourneyLeg[];
  departureTime: number;
  arrivalTime: number;
  durationSec: number;
  transfers: number;
  walkDistanceM: number;
  walkDurationSec: number;
  /** Only "scheduled" today: the planner never reads the realtime feed. */
  source: "scheduled";
}

/** GET /api/journey?from=&to=&at= */
export interface JourneyResponse {
  origin: JourneyPlace;
  destination: JourneyPlace;
  /** Unix seconds the search started from. */
  departAfter: number;
  journeys: Journey[];
  /** Italian, user-facing. Null when there is nothing to explain. */
  notice: string | null;
  generatedAt: number;
}
