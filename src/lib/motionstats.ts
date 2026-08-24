/**
 * Learned vehicle speeds, at data/motion.db.
 *
 * The predictor used to assume that whatever a bus did between its last two
 * fixes is what it will keep doing. Via Tuscolana at 08:00 and the same street
 * at 23:00 say otherwise, and so does one stretch of a line against the next.
 * This module watches the fixes the realtime poller already receives, folds
 * them into a decayed mean speed per line, per 250 m square, per part of the
 * day, and hands that back as a hint the client blends into its prediction.
 *
 * Deliberately not the gtfs.db handle from db.ts: that one is opened read-only
 * and is replaced wholesale by the nightly ingest, so a row written there does
 * not survive until morning. This follows data/sync.db instead — its own file,
 * created with its schema on first use, WAL, one handle cached on globalThis
 * so Next's dev HMR does not leak file descriptors across module reloads.
 *
 * Kept light on purpose. It is a hint to a predictor, not a traffic model:
 * no shapes are loaded, no map matching is done, distance between two fixes is
 * the great circle between them, and everything is bounded — the sample map,
 * the write batch, the row count and the answer to a request.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { cellKeyOf } from "@/lib/pathmotion";
import { getSnapshot } from "@/lib/realtime";

type Db = Database.Database;

interface MotionDbHandle {
  db: Db;
  file: string;
  /** Unix ms of the last retention purge, so it runs at most hourly. */
  lastPurgeAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusMotionDbHandle: MotionDbHandle | undefined;
}

// --- tuning -----------------------------------------------------------------

/** A sample's weight halves every fortnight, so the store tracks the season. */
export const HALF_LIFE_SEC = 14 * 24 * 60 * 60;
/** Ceiling on a cell's weight: past this it stops learning and starts adapting. */
const MAX_WEIGHT = 24;
/** Rows below this decayed weight say nothing and are dropped. */
const MIN_WEIGHT = 0.4;
/** Nothing outlives this, whatever its weight. */
const MAX_AGE_SEC = 60 * 24 * 60 * 60;
/** Hard ceiling on the table. At ~60 bytes a row this is a few tens of MB. */
const MAX_ROWS = 250_000;
const PURGE_INTERVAL_MS = 60 * 60 * 1000;

/** Two fixes closer together in time than this measure noise, not speed. */
const MIN_GAP_SEC = 15;
/** Further apart than this and whatever happened in between is unknowable. */
const MAX_GAP_SEC = 150;
/** Above this a "movement" is a GPS glitch or a relocated vehicle, not a trip. */
const MAX_PLAUSIBLE_MPS = 25;
/** Below this the vehicle is dwelling, which is not a speed for this road. */
const MIN_SAMPLE_MPS = 0.3;

/** Vehicles whose previous fix we remember, so a batch stays bounded. */
const MAX_TRACKED_VEHICLES = 4_000;
/** Pending cells before a flush is forced regardless of the clock. */
const MAX_PENDING = 4_000;
const FLUSH_INTERVAL_MS = 20_000;

/** Routes one request may ask about. */
export const MAX_HINT_ROUTES = 12;
/** Cells one route may answer with: ~100 km of road at 250 m a cell. */
const MAX_CELLS_PER_ROUTE = 400;

/** Aggregate band, used where the specific band has not seen enough. */
export const ALL_DAY_BAND = -1;

// --- schema and handle ------------------------------------------------------

/** Kept identical to scripts/motion-schema.sql, which is read in preference to it. */
const FALLBACK_SCHEMA = `
CREATE TABLE IF NOT EXISTS cell_speed (
  route_id   TEXT    NOT NULL,
  band       INTEGER NOT NULL,
  cell       INTEGER NOT NULL,
  mps        REAL    NOT NULL,
  weight     REAL    NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (route_id, band, cell)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_cell_speed_updated_at ON cell_speed (updated_at);
`;

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Absolute path of the learned-speed database. Overridable for tests and containers. */
export function motionDbPath(): string {
  const override = process.env.PROBUS_MOTION_DB_PATH;
  if (typeof override === "string" && override.trim().length > 0) {
    return path.resolve(override.trim());
  }
  return path.join(process.cwd(), "data", "motion.db");
}

/** Prefers the on-disk schema so the file stays the single source of truth. */
function schemaSql(): string {
  const file = path.join(process.cwd(), "scripts", "motion-schema.sql");
  try {
    const sql = fs.readFileSync(file, "utf8");
    if (sql.trim().length > 0) return sql;
  } catch {
    // Missing or unreadable in a trimmed deployment: the embedded copy is equivalent.
  }
  return FALLBACK_SCHEMA;
}

function open(file: string): MotionDbHandle {
  let db: Db;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    db = new Database(file);
  } catch (err) {
    throw new Error(`Apertura del database delle velocita ${file} fallita: ${describe(err)}`);
  }
  try {
    // WAL: written continuously by the poller while requests read it.
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("busy_timeout = 5000");
    db.exec(schemaSql());
  } catch (err) {
    try {
      db.close();
    } catch {
      // Nothing useful to do while unwinding a failed open.
    }
    throw new Error(`Inizializzazione di ${file} fallita: ${describe(err)}`);
  }
  return { db, file, lastPurgeAt: 0 };
}

function handle(): MotionDbHandle {
  const file = motionDbPath();
  const cached = globalThis.__probusMotionDbHandle;
  if (cached !== undefined && cached.file === file && cached.db.open) return cached;
  if (cached !== undefined) {
    try {
      cached.db.close();
    } catch (err) {
      console.warn(`[motionstats] chiusura del vecchio handle fallita: ${describe(err)}`);
    }
    globalThis.__probusMotionDbHandle = undefined;
  }
  const opened = open(file);
  globalThis.__probusMotionDbHandle = opened;
  return opened;
}

/** Shared writable handle, opening the file and its schema on first use. */
export function getMotionDb(): Db {
  return handle().db;
}

/** Closes the shared handle, if any. For scripts, not for request paths. */
export function closeMotionDb(): void {
  const cached = globalThis.__probusMotionDbHandle;
  if (cached === undefined) return;
  globalThis.__probusMotionDbHandle = undefined;
  try {
    cached.db.close();
  } catch (err) {
    console.warn(`[motionstats] chiusura del database fallita: ${describe(err)}`);
  }
}

// --- time bands -------------------------------------------------------------

const ROME_PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  weekday: "short",
  hour12: false,
});

interface CachedBand {
  atSec: number;
  band: number;
}
let cachedBand: CachedBand | null = null;

/**
 * Band of a moment: weekday or weekend crossed with a four-hour slice, 0..11.
 * Rome local time, because that is what the traffic follows. Cached for a
 * minute: this is called once per vehicle per poll cycle and the answer only
 * changes on the hour.
 */
export function bandFor(unixSec: number): number {
  if (!Number.isFinite(unixSec) || unixSec <= 0) return 0;
  const at = Math.floor(unixSec);
  if (cachedBand !== null && Math.abs(at - cachedBand.atSec) < 60) return cachedBand.band;
  let hour = 12;
  let weekend = false;
  try {
    for (const part of ROME_PARTS.formatToParts(new Date(at * 1000))) {
      if (part.type === "hour") {
        const parsed = Number(part.value);
        if (Number.isFinite(parsed)) hour = parsed;
      } else if (part.type === "weekday") {
        weekend = part.value === "Sat" || part.value === "Sun";
      }
    }
  } catch {
    // A platform without the tz database: one band for everything still works.
    return 0;
  }
  const band = (weekend ? 6 : 0) + Math.min(5, Math.floor(hour / 4));
  cachedBand = { atSec: at, band };
  return band;
}

/** Weight of a sample of `weight` taken `ageSec` ago. */
function decayed(weight: number, ageSec: number): number {
  if (!(weight > 0)) return 0;
  if (!(ageSec > 0)) return weight;
  return weight * Math.pow(2, -ageSec / HALF_LIFE_SEC);
}

// --- observation ------------------------------------------------------------

const EARTH_R = 6_371_008.8;
const DEG = Math.PI / 180;

function metres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG;
  const p2 = lat2 * DEG;
  const dp = (lat2 - lat1) * DEG;
  const dl = (lon2 - lon1) * DEG;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
}

interface LastFix {
  lat: number;
  lon: number;
  ts: number;
  routeId: string;
  /** Unix seconds we last saw this vehicle at all, for eviction ordering. */
  seenAt: number;
}

interface Pending {
  routeId: string;
  band: number;
  cell: number;
  sum: number;
  count: number;
}

interface ObserveState {
  lastFix: Map<string, LastFix>;
  pending: Map<string, Pending>;
  lastFlushMs: number;
  /** Snapshot revision already folded in, so a re-read costs nothing. */
  lastRevision: number;
  lastFeedTs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusMotionObserve: ObserveState | undefined;
}

function observeState(): ObserveState {
  const existing = globalThis.__probusMotionObserve;
  if (existing !== undefined) return existing;
  const created: ObserveState = {
    lastFix: new Map(),
    pending: new Map(),
    lastFlushMs: 0,
    lastRevision: -1,
    lastFeedTs: -1,
  };
  globalThis.__probusMotionObserve = created;
  return created;
}

/** Drops the least recently seen vehicles once the map is over budget. */
function trimTracked(state: ObserveState): void {
  if (state.lastFix.size <= MAX_TRACKED_VEHICLES) return;
  const byAge = [...state.lastFix.entries()].sort((a, b) => a[1].seenAt - b[1].seenAt);
  for (const [id] of byAge.slice(0, state.lastFix.size - MAX_TRACKED_VEHICLES)) {
    state.lastFix.delete(id);
  }
}

export interface ObservedVehicle {
  vehicleId: string;
  routeId: string | null;
  lat: number;
  lon: number;
  /** Unix seconds of the fix. */
  timestamp: number;
}

export interface ObserveResult {
  /** Fix pairs that produced a usable speed. */
  samples: number;
  /** Pairs rejected: too close in time, too far apart, implausible or dwelling. */
  rejected: number;
  flushed: number;
}

/**
 * Folds one snapshot of vehicle positions into the pending batch. Pure
 * bookkeeping: nothing here touches the database until a flush is due.
 *
 * Speed is the great circle between two fixes over the time between them, not
 * a distance along a shape. Over the 30-odd seconds the feed publishes at, a
 * bus covers 100-150 m and the two differ by a few per cent — and the error is
 * an under-estimate, which is the direction this engine wants to be wrong in.
 */
export function observeVehicles(
  vehicles: readonly ObservedVehicle[],
  nowSec: number,
  nowMs: number = Date.now(),
): ObserveResult {
  const state = observeState();
  let samples = 0;
  let rejected = 0;

  for (const vehicle of vehicles) {
    const routeId = vehicle.routeId;
    if (routeId === null || routeId.length === 0 || routeId.length > 64) continue;
    const { lat, lon } = vehicle;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    const ts = Number.isFinite(vehicle.timestamp) && vehicle.timestamp > 0 ? vehicle.timestamp : nowSec;
    const id = vehicle.vehicleId;
    if (typeof id !== "string" || id.length === 0 || id.length > 128) continue;

    const previous = state.lastFix.get(id);
    state.lastFix.set(id, { lat, lon, ts, routeId, seenAt: nowSec });
    if (previous === undefined) continue;
    if (previous.ts === ts) continue;

    const gapSec = ts - previous.ts;
    // A vehicle that changed line has no continuity worth measuring, and one
    // whose clock ran backwards is telling us nothing we can use.
    if (previous.routeId !== routeId || gapSec < MIN_GAP_SEC || gapSec > MAX_GAP_SEC) {
      rejected += 1;
      continue;
    }
    const distanceM = metres(previous.lat, previous.lon, lat, lon);
    const mps = distanceM / gapSec;
    if (!(mps > MIN_SAMPLE_MPS) || mps > MAX_PLAUSIBLE_MPS) {
      rejected += 1;
      continue;
    }
    // The midpoint is the only place we know the vehicle actually was for the
    // whole of the interval; at these distances it is inside one cell anyway.
    const cell = cellKeyOf((previous.lat + lat) / 2, (previous.lon + lon) / 2);
    if (cell < 0) {
      rejected += 1;
      continue;
    }

    const band = bandFor(ts);
    samples += 1;
    for (const target of [band, ALL_DAY_BAND]) {
      const key = `${routeId} ${target} ${cell}`;
      const existing = state.pending.get(key);
      if (existing === undefined) {
        if (state.pending.size >= MAX_PENDING) continue;
        state.pending.set(key, { routeId, band: target, cell, sum: mps, count: 1 });
      } else {
        existing.sum += mps;
        existing.count += 1;
      }
    }
  }

  trimTracked(state);

  let flushed = 0;
  const due = nowMs - state.lastFlushMs >= FLUSH_INTERVAL_MS || state.pending.size >= MAX_PENDING;
  if (due && state.pending.size > 0) flushed = flushPending(nowSec, nowMs);
  return { samples, rejected, flushed };
}

/**
 * Writes the pending batch into the store, folding each cell into its decayed
 * mean. One IMMEDIATE transaction, so a concurrent reader sees the batch whole
 * or not at all. Never throws: losing a batch of statistics is not a reason to
 * fail whatever request happened to trigger the flush.
 */
export function flushPending(nowSec: number, nowMs: number = Date.now()): number {
  const state = observeState();
  const batch = [...state.pending.values()];
  state.pending.clear();
  state.lastFlushMs = nowMs;
  if (batch.length === 0) return 0;

  try {
    const db = getMotionDb();
    const select = db
      .prepare("SELECT mps, weight, updated_at FROM cell_speed WHERE route_id = ? AND band = ? AND cell = ?")
      .raw();
    const upsert = db.prepare(
      `INSERT INTO cell_speed (route_id, band, cell, mps, weight, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(route_id, band, cell) DO UPDATE SET
         mps = excluded.mps, weight = excluded.weight, updated_at = excluded.updated_at`,
    );
    const tx = db.transaction((rows: Pending[]): void => {
      for (const row of rows) {
        const previous = select.get(row.routeId, row.band, row.cell);
        let priorMps = 0;
        let priorWeight = 0;
        if (Array.isArray(previous)) {
          const [mps, weight, updatedAt] = previous;
          if (typeof mps === "number" && typeof weight === "number" && typeof updatedAt === "number") {
            priorMps = mps;
            // Age the old mean before it meets the new one, so a month-old
            // rush hour cannot outvote what is happening on the road today.
            priorWeight = Math.min(MAX_WEIGHT, decayed(weight, nowSec - updatedAt));
          }
        }
        const total = priorWeight + row.count;
        if (!(total > 0)) continue;
        const blended = (priorMps * priorWeight + row.sum) / total;
        upsert.run(
          row.routeId,
          row.band,
          row.cell,
          Math.round(blended * 1000) / 1000,
          Math.round(Math.min(MAX_WEIGHT, total) * 1000) / 1000,
          nowSec,
        );
      }
    });
    tx.immediate(batch);
    return batch.length;
  } catch (err) {
    console.warn(`[motionstats] scrittura del batch fallita: ${describe(err)}`);
    return 0;
  }
}

// --- reading ----------------------------------------------------------------

export interface RouteHint {
  routeId: string;
  /** Parallel arrays, one entry per cell: packed key, speed, confidence. */
  cells: number[];
  mps: number[];
  weight: number[];
}

interface Candidate {
  mps: number;
  weight: number;
}

/**
 * Learned speeds for a handful of routes in one band. A cell the band has
 * barely seen falls back to the all-day aggregate, so a line still predicts
 * sensibly at an hour nobody has watched it.
 */
export function readHints(routeIds: readonly string[], band: number, nowSec: number): RouteHint[] {
  const wanted = [...new Set(routeIds)].slice(0, MAX_HINT_ROUTES);
  if (wanted.length === 0) return [];
  const out: RouteHint[] = [];
  let statement;
  try {
    statement = getMotionDb().prepare(
      `SELECT band, cell, mps, weight, updated_at FROM cell_speed
       WHERE route_id = ? AND band IN (?, ?)`,
    );
  } catch (err) {
    console.warn(`[motionstats] lettura degli hint non disponibile: ${describe(err)}`);
    return [];
  }

  for (const routeId of wanted) {
    if (typeof routeId !== "string" || routeId.length === 0 || routeId.length > 64) continue;
    let rows: unknown[];
    try {
      rows = statement.raw().all(routeId, band, ALL_DAY_BAND) as unknown[];
    } catch (err) {
      console.warn(`[motionstats] lettura della linea ${routeId} fallita: ${describe(err)}`);
      continue;
    }

    const best = new Map<number, Candidate>();
    const fallback = new Map<number, Candidate>();
    for (const raw of rows) {
      if (!Array.isArray(raw)) continue;
      const [rowBand, cell, mps, weight, updatedAt] = raw;
      if (typeof cell !== "number" || typeof mps !== "number") continue;
      if (typeof weight !== "number" || typeof updatedAt !== "number") continue;
      const age = nowSec - updatedAt;
      if (age > MAX_AGE_SEC) continue;
      const live = decayed(weight, age);
      if (live < MIN_WEIGHT || !(mps > 0)) continue;
      const target = rowBand === band ? best : fallback;
      const known = target.get(cell);
      if (known === undefined || known.weight < live) target.set(cell, { mps, weight: live });
    }
    // The band's own evidence wins wherever it exists; the aggregate only
    // fills the gaps, and never overrides an hour we have actually watched.
    for (const [cell, value] of fallback) {
      if (!best.has(cell)) best.set(cell, value);
    }

    const entries = [...best.entries()];
    if (entries.length > MAX_CELLS_PER_ROUTE) {
      entries.sort((a, b) => b[1].weight - a[1].weight);
      entries.length = MAX_CELLS_PER_ROUTE;
    }
    if (entries.length === 0) continue;
    const hint: RouteHint = { routeId, cells: [], mps: [], weight: [] };
    for (const [cell, value] of entries) {
      hint.cells.push(cell);
      hint.mps.push(Math.round(value.mps * 100) / 100);
      hint.weight.push(Math.round(value.weight * 100) / 100);
    }
    out.push(hint);
  }
  return out;
}

// --- retention --------------------------------------------------------------

/**
 * Drops what has decayed into noise, what is simply too old, and, if the table
 * is still over its ceiling, the least recently updated rows until it is not.
 * Returns the number of rows removed.
 */
export function purgeMotionStats(nowSec: number): number {
  let removed = 0;
  try {
    const db = getMotionDb();
    // Age alone is enough: a row's weight only ever decays, and MAX_AGE_SEC is
    // several half-lives, so anything this old is already under the floor.
    removed += db.prepare("DELETE FROM cell_speed WHERE updated_at < ?").run(nowSec - MAX_AGE_SEC).changes;

    const countRow = db.prepare("SELECT COUNT(*) FROM cell_speed").raw().get();
    const count = Array.isArray(countRow) && typeof countRow[0] === "number" ? countRow[0] : 0;
    if (count > MAX_ROWS) {
      // WITHOUT ROWID, so the primary key triple is the only handle on a row.
      removed += db
        .prepare(
          `DELETE FROM cell_speed WHERE (route_id, band, cell) IN (
             SELECT route_id, band, cell FROM cell_speed ORDER BY updated_at ASC LIMIT ?
           )`,
        )
        .run(count - MAX_ROWS).changes;
    }
  } catch (err) {
    console.warn(`[motionstats] purge fallita: ${describe(err)}`);
  }
  return removed;
}

/**
 * Opportunistic retention pass: at most once an hour, and off the request path,
 * so a request never waits on it. Failures are logged and never propagate.
 */
export function maybePurgeMotionStats(): void {
  let current: MotionDbHandle;
  try {
    current = handle();
  } catch (err) {
    console.warn(`[motionstats] purge non pianificata: ${describe(err)}`);
    return;
  }
  const now = Date.now();
  if (now - current.lastPurgeAt < PURGE_INTERVAL_MS) return;
  // Claim the slot before scheduling, so concurrent requests queue only one pass.
  current.lastPurgeAt = now;
  setTimeout(() => {
    try {
      const removed = purgeMotionStats(Math.floor(Date.now() / 1000));
      if (removed > 0) console.info(`[motionstats] purge: ${removed} celle rimosse`);
    } catch (err) {
      console.warn(`[motionstats] purge fallita: ${describe(err)}`);
    }
  }, 0);
}

/** Snapshot bookkeeping, so the same feed revision is never folded in twice. */
export function shouldObserve(revision: number | undefined, feedTimestamp: number | null): boolean {
  const state = observeState();
  const rev = typeof revision === "number" ? revision : -1;
  const ts = feedTimestamp ?? -1;
  if (rev === state.lastRevision && ts === state.lastFeedTs) return false;
  state.lastRevision = rev;
  state.lastFeedTs = ts;
  return true;
}

// --- observer loop ----------------------------------------------------------

/**
 * Fast enough that consecutive observations of one vehicle stay inside
 * MAX_GAP_SEC even when the feed skips a publication, and slow enough to cost
 * nothing: a cycle is a map walk over a few thousand positions.
 */
const OBSERVE_INTERVAL_MS = 15_000;

interface ObserverState {
  timer: NodeJS.Timeout | null;
  started: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusMotionObserver: ObserverState | undefined;
}

function observeOnce(): void {
  try {
    const snapshot = getSnapshot();
    if (!shouldObserve(snapshot.revision, snapshot.feedTimestamp)) return;
    const nowSec = Math.floor(Date.now() / 1000);
    observeVehicles(snapshot.vehicles, nowSec);
  } catch (err) {
    // A dead feed, a read-only volume, a full disk: none of them are a reason
    // to stop the loop, and none of them are the caller's problem.
    console.warn(`[motionstats] ciclo di osservazione fallito: ${describe(err)}`);
  }
}

/**
 * Starts the observation loop, once per process. Called from the hints route,
 * so a deployment nobody is looking at learns nothing and costs nothing. The
 * timer is unref'd: it must never be the reason the process stays alive.
 */
export function startMotionObserver(): void {
  const existing = globalThis.__probusMotionObserver;
  if (existing !== undefined && existing.started) return;
  const state: ObserverState = existing ?? { timer: null, started: false };
  state.started = true;
  globalThis.__probusMotionObserver = state;

  const arm = (): void => {
    const timer = setTimeout(() => {
      state.timer = null;
      observeOnce();
      arm();
    }, OBSERVE_INTERVAL_MS);
    timer.unref();
    state.timer = timer;
  };
  observeOnce();
  arm();
}

/** Test helper: forgets the in-process observation state. */
export function resetObserveState(): void {
  globalThis.__probusMotionObserve = undefined;
}
