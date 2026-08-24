# Build contract

Read this fully before writing code. Several agents work on this repo in
parallel; the only thing keeping the result coherent is this file plus
`src/lib/types.ts` and `scripts/schema.sql`.

## What we are building

A web clone of the Android app "Probus Rome" (unofficial ATAC/Rome transit
app), in Next.js. No accounts, no login, no cloud sync, no ads, no analytics.
All user state lives in `localStorage`. Everything is in Italian in the UI.

Data comes from the official Rome open data GTFS feeds, nothing else. We never
call the original app's backend.

## Hard rules

1. **Do not create or modify files outside the ones assigned to you.** If you
   need something from another module, code against the type in
   `src/lib/types.ts` and assume it exists.
2. **Never change `src/lib/types.ts` or `scripts/schema.sql`.** They are the
   contract. If you believe one is wrong, say so in your final report instead
   of editing it.
3. TypeScript strict. No `any`, no non-null assertions on external data, no
   unchecked casts. Validate every input that comes from a URL, a query string
   or a network response.
4. Every async path handles its own errors. A failing realtime feed must
   degrade to scheduled data, never throw a 500 at the user.
5. Comments: at most 1-2 lines, only where the reason is not obvious from the
   code. No essays, no restating what the line does.
6. Italian for all user-facing strings. Code identifiers stay English.
7. `pnpm install` is already done. Never run it again, never add a dependency
   that is not already in `package.json`.

## Available dependencies (all installed, verified working)

`next@15.5.4`, `react@19.1.0`, `better-sqlite3@11.10`, `gtfs-realtime-bindings@1.1.1`,
`maplibre-gl@5.6`, `yauzl@3.2` (zip streaming), `tailwindcss@4.1` (v4: import with
`@import "tailwindcss";`, no config file needed), `tsx` for running scripts.

## Data sources (verified live on 2026-08-02)

Base: `https://romamobilita.it/sites/default/files/`

| File | Size | Notes |
|---|---|---|
| `rome_static_gtfs.zip` | 42 MB | refreshed most mornings |
| `rome_rtgtfs_trip_updates_feed.pb` | ~480 KB | refreshed every ~60 s |
| `rome_rtgtfs_vehicle_positions_feed.pb` | ~70 KB | refreshed every ~60 s |
| `rome_rtgtfs_service_alerts_feed.pb` | small | |

**A copy of the static zip and both realtime feeds is already downloaded at
`/tmp/claude-1000/-home-alcahest-git-Probus/a76ecbe0-dbc6-4998-af0b-8460b1554a52/scratchpad/gtfs/`
(`static.zip`, `tu.pb`, `vp.pb`). Use those local files while developing so we
do not hammer the origin.**

### Static feed shape (verified)

Files inside the zip: `agency.txt` (5 rows), `routes.txt` (430), `stops.txt`
(8 267), `trips.txt` (148 828), `stop_times.txt` (4 530 844 rows, 214 MB),
`shapes.txt` (20 MB), `calendar_dates.txt` (2 895).

- There is **no `calendar.txt`**. Every service day is an explicit
  `calendar_dates` row with `exception_type=1`. A service runs on a date if and
  only if such a row exists.
- CSV quoting is inconsistent: `stop_times.txt` is unquoted, but `stops.txt`
  and `trips.txt` quote some fields (`"TERMINI (MA-MB-FS)"`). Use a real CSV
  parser, do not split on commas.
- `stop_times.txt` must be streamed, never read into memory whole.
- Headers, in order:
  - `stops`: stop_id, stop_code, stop_name, stop_desc, stop_lat, stop_lon, stop_url, wheelchair_boarding, stop_timezone, location_type, parent_station
  - `routes`: route_id, agency_id, route_short_name, route_long_name, route_type, route_url, route_color, route_text_color
  - `trips`: route_id, service_id, trip_id, trip_headsign, trip_short_name, direction_id, block_id, shape_id, wheelchair_accessible, exceptional
  - `stop_times`: trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, shape_dist_traveled, timepoint
  - `shapes`: shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled
  - `calendar_dates`: service_id, date, exception_type

### Realtime feed shape (verified by decoding the real file)

```js
const gtfs = require("gtfs-realtime-bindings");
const msg = gtfs.transit_realtime.FeedMessage.decode(buffer);
// msg.header -> { gtfsRealtimeVersion: "2.0", incrementality: "FULL_DATASET", timestamp: "1785694057" }
// msg.entity[i].tripUpdate.trip -> { tripId: "0#5779-28", startTime, startDate, routeId: "409", directionId: 0 }
// msg.entity[i].tripUpdate.stopTimeUpdate[j] ->
//   { stopSequence: 1, stopId: "82923", scheduleRelationship: "SCHEDULED",
//     departure: { delay: 266, time: "1785694046", uncertainty: 19 } }
```

Critical details:
- Timestamps and `time` fields are **protobuf Longs serialised as strings**.
  Always convert with `Number(...)`, never use them directly in arithmetic.
- A `stopTimeUpdate` may carry `arrival`, `departure`, both, or neither.
  Prefer `arrival`, fall back to `departure`.
- `scheduleRelationship: "SKIPPED"` means the vehicle will not call there.
- `trip.routeId` is present, so no join is needed just to get the route.
- IDs join cleanly with the static feed: RT `stopId` matches `stops.stop_id`,
  RT `tripId` matches `trips.trip_id`. Verified.
- Roughly 630 vehicles are active on a Sunday evening; expect a few thousand at
  weekday peak. Never assume the feed is non-empty.

## Runtime architecture

Single Next.js app (App Router), running as a long-lived Node process in a
container. Two data layers:

- **Static**: read-only SQLite at `data/gtfs.db`, built by `scripts/ingest.ts`,
  opened once per process.
- **Realtime**: an in-process poller refreshes all three `.pb` feeds every 30 s
  and keeps the parsed result in memory. One fetch serves all users. Never
  fetch the origin from the browser: the feeds send no CORS headers.

## API contract

All routes live under `src/app/api/`, return JSON, and on failure return the
`ApiError` shape with a 4xx/5xx status. All responses use types from
`src/lib/types.ts` verbatim.

| Route | Response |
|---|---|
| `GET /api/arrivals/[stopId]` | `ArrivalsResponse` |
| `GET /api/timetable/[stopId]?date=YYYYMMDD&routeId=<optional>` | `TimetableResponse` |
| `GET /api/search?q=<text>` | `SearchResponse` |
| `GET /api/stops/nearby?lat=&lon=&radius=` | `{ stops: NearbyStop[] }` |
| `GET /api/line/[routeId]?direction=0\|1` | `LineDetail` |
| `GET /api/alerts` | `AlertsResponse` |
| `GET /api/vehicles?routeId=<optional>` | `VehiclesResponse` |

Every route must be dynamic (`export const dynamic = "force-dynamic"`), since
all of them depend on live state.

## File ownership

Do not touch a file owned by someone else.

- **A (ingest)**: `scripts/ingest.ts`, `src/lib/db.ts`, `src/lib/polyline.ts`
- **B (realtime)**: `src/lib/realtime.ts`
- **C (queries + API)**: `src/lib/queries.ts`, everything under `src/app/api/`
- **D (core UI)**: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`,
  `src/app/stop/[stopId]/page.tsx`, `src/components/` except map components
- **E (maps)**: `src/app/nearby/page.tsx`, `src/app/line/[routeId]/page.tsx`,
  `src/components/map/`
- **F (client state + minor pages)**: `src/hooks/`, `src/lib/storage.ts`,
  `src/lib/format.ts`, `src/app/alerts/page.tsx`, `src/app/settings/page.tsx`,
  `src/app/info/page.tsx`
- **G (delivery)**: `Dockerfile`, `.dockerignore`, `docker-compose.yml`,
  `fly.toml`, `README.md`, `scripts/refresh-cron.sh`, `scripts/smoke.ts`

## Cross-module API, fixed now so parallel work compiles

```ts
// src/lib/db.ts        (A)
export function getDb(): import("better-sqlite3").Database;
export function isDbReady(): boolean;

// src/lib/polyline.ts  (A)
export function encodePolyline(points: Array<[number, number]>): string;
export function decodePolyline(encoded: string): Array<[number, number]>;

// src/lib/realtime.ts  (B)
export interface RealtimeSnapshot {
  tripUpdates: Map<string, TripUpdateLite>;      // keyed by tripId
  byStop: Map<string, StopTimeUpdateLite[]>;     // keyed by stopId
  vehicles: VehicleLite[];
  alerts: RawAlert[];
  feedTimestamp: number | null;
  fetchedAt: number;
  degraded: boolean;
}
export function getSnapshot(): RealtimeSnapshot;
export function startPoller(): void;
export interface TripUpdateLite {
  tripId: string; routeId: string | null; directionId: number | null;
  startDate: string | null; vehicleId: string | null;
  stops: StopTimeUpdateLite[];
}
export interface StopTimeUpdateLite {
  tripId: string; routeId: string | null; vehicleId: string | null;
  stopId: string; stopSequence: number | null;
  time: number | null; delay: number | null; skipped: boolean;
}
export interface VehicleLite {
  vehicleId: string; tripId: string | null; routeId: string | null;
  lat: number; lon: number; bearing: number | null; timestamp: number;
}
export interface RawAlert {
  id: string; header: string; description: string; url: string | null;
  cause: string | null; effect: string | null;
  activeFrom: number | null; activeUntil: number | null;
  routeIds: string[]; stopIds: string[];
}

// src/lib/format.ts    (F)
export function formatMinutes(minutes: number): string;   // "3 min", "in arrivo"
export function formatClock(unixSeconds: number): string; // "20:14"
export function formatSecOfDay(sec: number): string;      // handles >24h
export function formatDistance(metres: number): string;   // "250 m", "1,2 km"
export function serviceDateFor(date: Date): string;       // YYYYMMDD, 04:00 cutoff

// src/lib/storage.ts   (F)  — safe localStorage access, SSR-guarded
export function readFavorites(): Favorite[];
export function writeFavorites(items: Favorite[]): void;
export function readRecents(): RecentStop[];
export function pushRecent(stop: { stopId: string; stopName: string }): void;
export function readSettings(): Settings;
export function writeSettings(patch: Partial<Settings>): void;

// src/hooks/           (F)
export function useFavorites(): {
  favorites: Favorite[]; isFavorite(stopId: string): boolean;
  add(stop: { stopId: string; stopName: string }): void;
  remove(stopId: string): void;
  setTag(stopId: string, tag: string | null): void;
  reorder(stopId: string, direction: -1 | 1): void;
  clear(): void;
};
export function useRecents(): { recents: RecentStop[]; clear(): void };
export function useSettings(): { settings: Settings; update(patch: Partial<Settings>): void };
```

Hooks are client-only (`"use client"`), must not read `localStorage` during
render, and must hydrate in an effect to avoid SSR mismatch.

## Routes (pages)

- `/` home: favourites with live arrivals, recents, search box
- `/stop/[stopId]` arrivals for a stop, plus its timetable and lines
- `/line/[routeId]` line detail: stop list, map of the path, live vehicles
- `/nearby` nearby stops, list and map
- `/alerts` service alerts
- `/settings` settings, clear recents, clear favourites
- `/info` about, data attribution, FAQ

## Non-negotiable UX details

- Mobile first. This is a phone app on the street; big tap targets, high
  contrast, works one-handed.
- Arrivals refresh on an interval from settings, and always show the age of the
  data. Never silently display stale numbers as if they were live.
- Every screen must be usable with no realtime data at all (night, feed down).
- Data attribution to "Roma Servizi per la Mobilità" is required and must
  appear in the footer and on `/info`.
- Make clear in `/info` that this is unofficial and not affiliated with ATAC.
