/**
 * Along-path motion for live vehicles: project a fix onto the route shape,
 * carry the vehicle along that shape between fixes, and ease onto the truth
 * when the next fix disagrees. Pure maths plus one small stateful tracker;
 * no React, no I/O, no DOM.
 *
 * Three properties are deliberate and measured, not incidental:
 *
 *  - the prediction is biased short, so the marker normally sits a little
 *    behind the vehicle. Catching up forwards reads as motion; being dragged
 *    backwards reads as a bug, so the cheap error is the one we choose;
 *  - the rendered position has a hard speed ceiling, so closing a gap can
 *    never look like a sprint, and a gap too large to close at that ceiling
 *    fades out and re-anchors instead of crossing the city;
 *  - observed speeds are learned per place and per time band and fed back in
 *    as a hint. With no hint the maths reduces exactly to the old constant
 *    speed formula, so a cold start behaves as it always did.
 *
 * Distances are metres in a local equirectangular frame anchored on the first
 * vertex of each path. Over a Rome bus route (tens of km) the error of that
 * approximation is centimetres, far below the precision of the feed.
 */

const EARTH_R = 6_371_008.8;
const DEG = Math.PI / 180;

export interface RoutePath {
  /** Cleaned vertices, split by axis: a shape can run to thousands of points. */
  readonly lats: Float64Array;
  readonly lons: Float64Array;
  /** Metres east of the origin, one per vertex. */
  readonly xs: Float64Array;
  /** Metres north of the origin, one per vertex. */
  readonly ys: Float64Array;
  /** Distance along the path at each vertex; the last entry is the length. */
  readonly cum: Float64Array;
  readonly lengthM: number;
}

/** Two vertices closer than this are the same point as far as we care. */
const DEDUPE_M = 0.5;

function isLatLon(lat: unknown, lon: unknown): boolean {
  if (typeof lat !== "number" || typeof lon !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Builds the metric index for a decoded shape. Returns null when the input has
 * fewer than two usable vertices or no length: callers must treat that as "we
 * have no road for this vehicle" rather than as an error.
 */
export function buildPath(points: ReadonlyArray<readonly [number, number]>): RoutePath | null {
  if (!Array.isArray(points) || points.length < 2) return null;

  const clean: Array<readonly [number, number]> = [];
  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const [lat, lon] = point;
    if (!isLatLon(lat, lon)) continue;
    clean.push([lat, lon]);
  }
  if (clean.length < 2) return null;

  const lat0 = clean[0][0];
  const lon0 = clean[0][1];
  const cosLat0 = Math.cos(lat0 * DEG);

  const xs: number[] = [];
  const ys: number[] = [];
  const cum: number[] = [];
  const lats: number[] = [];
  const lons: number[] = [];
  let total = 0;

  for (const [lat, lon] of clean) {
    const x = (lon - lon0) * DEG * EARTH_R * cosLat0;
    const y = (lat - lat0) * DEG * EARTH_R;
    if (lats.length > 0) {
      const dx = x - xs[xs.length - 1];
      const dy = y - ys[ys.length - 1];
      const step = Math.hypot(dx, dy);
      if (step < DEDUPE_M) continue;
      total += step;
    }
    lats.push(lat);
    lons.push(lon);
    xs.push(x);
    ys.push(y);
    cum.push(total);
  }

  if (lats.length < 2 || total <= 0) return null;
  return {
    lats: Float64Array.from(lats),
    lons: Float64Array.from(lons),
    xs: Float64Array.from(xs),
    ys: Float64Array.from(ys),
    cum: Float64Array.from(cum),
    lengthM: total,
  };
}

export interface Projection {
  /** Distance along the path, in metres, of the nearest point. */
  s: number;
  /** How far the fix sits from the path. */
  distanceM: number;
  lat: number;
  lon: number;
}

/** Index of the last vertex whose cumulative distance is <= s. */
function segmentFor(path: RoutePath, s: number): number {
  const cum = path.cum;
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, cum.length - 2);
}

function projectRange(
  path: RoutePath,
  x: number,
  y: number,
  from: number,
  to: number,
): Projection | null {
  const { xs, ys, cum, lats, lons } = path;
  let bestD2 = Infinity;
  let bestIndex = -1;
  let bestT = 0;

  for (let i = from; i < to; i++) {
    const ax = xs[i];
    const ay = ys[i];
    const dx = xs[i + 1] - ax;
    const dy = ys[i + 1] - ay;
    const len2 = dx * dx + dy * dy;
    // Zero-length segments are removed at build time, but never divide blind.
    const raw = len2 > 0 ? ((x - ax) * dx + (y - ay) * dy) / len2 : 0;
    const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    const px = ax + dx * t;
    const py = ay + dy * t;
    const d2 = (x - px) ** 2 + (y - py) ** 2;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestIndex = i;
      bestT = t;
    }
  }

  if (bestIndex < 0) return null;
  const aLat = lats[bestIndex];
  const aLon = lons[bestIndex];
  // The metric frame is affine in lat/lon, so interpolating either is the same.
  return {
    s: cum[bestIndex] + (cum[bestIndex + 1] - cum[bestIndex]) * bestT,
    distanceM: Math.sqrt(bestD2),
    lat: aLat + (lats[bestIndex + 1] - aLat) * bestT,
    lon: aLon + (lons[bestIndex + 1] - aLon) * bestT,
  };
}

/**
 * Nearest point on the path to a fix. `hintS` restricts the first pass to a
 * window around a known position, which both speeds up long shapes and stops a
 * route that doubles back on itself from snapping onto the wrong pass. The full
 * shape is scanned whenever that window does not produce a close enough match.
 */
export function projectOnPath(
  path: RoutePath,
  lat: number,
  lon: number,
  hintS: number | null,
  windowM: number,
  acceptM: number,
): Projection | null {
  if (!isLatLon(lat, lon)) return null;
  const lat0 = path.lats[0];
  const lon0 = path.lons[0];
  const cosLat0 = Math.cos(lat0 * DEG);
  const x = (lon - lon0) * DEG * EARTH_R * cosLat0;
  const y = (lat - lat0) * DEG * EARTH_R;
  const last = path.cum.length - 1;

  if (hintS !== null && Number.isFinite(hintS) && windowM > 0) {
    const from = segmentFor(path, Math.max(0, hintS - windowM));
    const to = Math.min(last, segmentFor(path, Math.min(path.lengthM, hintS + windowM)) + 1);
    const near = projectRange(path, x, y, from, to);
    if (near !== null && near.distanceM <= acceptM) return near;
  }
  return projectRange(path, x, y, 0, last);
}

export interface PathPoint {
  lat: number;
  lon: number;
  /** Degrees clockwise from north, following the path forwards. */
  bearing: number;
}

/** The point `s` metres along the path, clamped to both ends. */
export function pointAtDistance(path: RoutePath, s: number): PathPoint {
  const clamped = s <= 0 ? 0 : s >= path.lengthM ? path.lengthM : s;
  const i = segmentFor(path, clamped);
  const span = path.cum[i + 1] - path.cum[i];
  const t = span > 0 ? (clamped - path.cum[i]) / span : 0;
  const aLat = path.lats[i];
  const aLon = path.lons[i];
  const dx = path.xs[i + 1] - path.xs[i];
  const dy = path.ys[i + 1] - path.ys[i];
  const bearing = (((Math.atan2(dx, dy) / DEG) % 360) + 360) % 360;
  return {
    lat: aLat + (path.lats[i + 1] - aLat) * t,
    lon: aLon + (path.lons[i + 1] - aLon) * t,
    bearing,
  };
}

// --- learned speed grid -----------------------------------------------------

/**
 * Side of the cells the learned speeds are bucketed into. Traffic on a Rome
 * arterial is uniform over a couple of hundred metres and is emphatically not
 * uniform over a kilometre, so this is about as coarse as the hint can be
 * before it stops describing anything real.
 */
export const CELL_M = 250;
const DEG_LAT_M = 111_320;
/** Keeps both cell axes non-negative before they are packed into one integer. */
const CELL_OFFSET = 1 << 20;
const CELL_SPAN = 1 << 21;

/**
 * Cell containing a point, as one integer, or -1 for an unusable coordinate.
 *
 * Deliberately geographic rather than an index along a shape: the same street
 * is shared by both directions of a line and by shapes that get renumbered
 * every ingest, so a place is the only key that stays meaningful. The
 * longitude step is taken at the latitude of the cell's own row, which makes
 * the cells roughly square and, more importantly, makes the mapping a pure
 * function of the coordinate that server and client can both compute.
 */
export function cellKeyOf(lat: number, lon: number): number {
  if (!isLatLon(lat, lon)) return -1;
  const dLat = CELL_M / DEG_LAT_M;
  const cy = Math.floor(lat / dLat);
  const cosLat = Math.max(0.05, Math.cos((cy + 0.5) * dLat * DEG));
  const cx = Math.floor(lon / (CELL_M / (DEG_LAT_M * cosLat)));
  if (Math.abs(cy) >= CELL_OFFSET || Math.abs(cx) >= CELL_OFFSET) return -1;
  return (cy + CELL_OFFSET) * CELL_SPAN + (cx + CELL_OFFSET);
}

/**
 * Learned speeds for one route: mean metres per second per cell, plus the
 * decayed sample weight behind each mean. An absent cell simply means "never
 * observed", which is the normal state for most of the network.
 */
export interface SpeedHint {
  mps: ReadonlyMap<number, number>;
  weight: ReadonlyMap<number, number>;
}

/**
 * Builds a hint from the three parallel arrays the API sends. Every entry is
 * checked: this is untrusted wire data, and one NaN in the speed map would
 * poison every prediction that walks through that cell.
 */
export function hintFrom(
  cells: readonly number[],
  mps: readonly number[],
  weight: readonly number[],
): SpeedHint {
  const mpsMap = new Map<number, number>();
  const weightMap = new Map<number, number>();
  const count = Math.min(cells.length, mps.length, weight.length);
  for (let i = 0; i < count; i += 1) {
    const cell = cells[i];
    const speed = mps[i];
    const confidence = weight[i];
    if (!Number.isInteger(cell) || cell < 0) continue;
    if (!Number.isFinite(speed) || !Number.isFinite(confidence)) continue;
    if (!(speed > 0) || speed > 40 || !(confidence > 0)) continue;
    mpsMap.set(cell, speed);
    weightMap.set(cell, confidence);
  }
  return { mps: mpsMap, weight: weightMap };
}

/** Great-circle distance in metres, for callers that need it off the path. */
export function metresBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG;
  const p2 = lat2 * DEG;
  const dp = (lat2 - lat1) * DEG;
  const dl = (lon2 - lon1) * DEG;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
}

// --- tracker ----------------------------------------------------------------

export interface MotionFix {
  lat: number;
  lon: number;
  bearing: number | null;
  /** Unix seconds from the feed; 0 or nonsense means "unknown". */
  timestampSec: number;
  /**
   * How old the fix was inside the snapshot that carried it. Only used to spot
   * a vehicle that stopped reporting; the Rome feed runs tens of seconds behind
   * its own header even when everything is healthy.
   */
  ageSec: number;
}

export interface MotionSample {
  lat: number;
  lon: number;
  bearing: number | null;
  /** The vehicle is being carried by the estimate, not sitting on a fix. */
  predicted: boolean;
  /** Prediction reached its horizon (or the end of the shape) and is holding. */
  held: boolean;
  /** How long it has been holding; 0 while it is still moving. */
  heldSec: number;
  /** How far the last fix sat from the shape. */
  offPathM: number;
  /**
   * 0..1. Below 1 only while a re-anchor is crossfading: a gap too wide to
   * close at the speed ceiling is faded out and picked up again at the truth,
   * because sprinting there would be a lie and teleporting there is a flicker.
   */
  opacity: number;
}

export interface MotionConfig {
  /** How long a single fix may carry the vehicle before we stop guessing. */
  horizonSec: number;
  /** A fix this far behind its own snapshot is a vehicle that stopped reporting. */
  staleFixSec: number;
  /** Prediction decays towards this reach, so a bad guess cannot run away. */
  velocityTauSec: number;
  maxSpeedMps: number;
  /** A fix further than this from the shape is a diverted vehicle, not a snap. */
  snapToleranceM: number;
  /** Time constant of the ease onto a new fix. */
  easeTauMs: number;
  /** Below this the truth is behind us and we hold instead of reversing. */
  backstepToleranceM: number;
  /** A correction that has to run backwards is slowed by this much. */
  backstepEaseFactor: number;
  projectWindowM: number;
  minFixGapSec: number;
  maxFixGapSec: number;
  /**
   * Every predicted advance is scaled by this. Under 1 on purpose: it buys a
   * systematic under-estimate of progress, which turns most corrections into
   * forward catch-ups instead of the backward drags that read as broken.
   */
  predictBias: number;
  /** Ceiling on the rendered speed, as a multiple of the plausible vehicle speed. */
  catchUpFactor: number;
  /** Ceiling on the rendered speed in absolute terms, whatever the estimate claims. */
  maxCatchUpMps: number;
  /** Floor under the plausible speed, so a stopped vehicle can still be corrected. */
  minCatchUpMps: number;
  /** A gap needing longer than this at the ceiling re-anchors instead of chasing. */
  reanchorSec: number;
  /** Below this a gap is never a re-anchor, however slow the vehicle looks. */
  reanchorMinGapM: number;
  /** Half-length of the re-anchor crossfade; the whole thing costs twice this. */
  reanchorFadeMs: number;
  /** Most of the speed estimate a learned hint may ever replace, 0..1. */
  hintMaxTrust: number;
  /** Under this a jump is never an identity conflict, whatever speed it implies. */
  conflictMinJumpM: number;
  /** Fixes dropped in a row before the newest one is believed anyway. */
  conflictMaxDrops: number;
}

export const DEFAULT_MOTION: MotionConfig = {
  horizonSec: 55,
  staleFixSec: 300,
  velocityTauSec: 300,
  maxSpeedMps: 25,
  snapToleranceM: 45,
  easeTauMs: 220,
  backstepToleranceM: 175,
  backstepEaseFactor: 3,
  projectWindowM: 700,
  minFixGapSec: 3,
  maxFixGapSec: 300,
  predictBias: 0.9,
  catchUpFactor: 1.6,
  maxCatchUpMps: 18,
  minCatchUpMps: 4,
  reanchorSec: 45,
  reanchorMinGapM: 400,
  reanchorFadeMs: 260,
  hintMaxTrust: 0.75,
  conflictMinJumpM: 250,
  conflictMaxDrops: 3,
};

/** Longest frame gap we integrate in one step; anything more is a stall. */
const MAX_STEP_MS = 250;
/** Below this the vehicle is parked and its heading is noise. */
const STEADY_SPEED_MPS = 0.6;
/** Weight of the newest speed estimate; the rest is the previous one. */
const SPEED_BLEND = 0.5;
/** Step of the walk that integrates a place-dependent speed along the shape. */
const CHUNK_M = 125;
/** Ceiling on that walk, so one frame's work is bounded whatever the speed. */
const MAX_CHUNKS = 16;
/** Sample weight at which a learned speed earns half of its maximum trust. */
const HINT_HALF_WEIGHT = 3;
/** Under this the walk has effectively stopped and integrating further is noise. */
const MIN_WALK_MPS = 0.05;
/**
 * How much of the learned road speed to use before this vehicle has a measured
 * one of its own. Well under 1: the aim is to stop a fresh marker sitting dead
 * for a full feed cycle, not to race it ahead of a bus that may be at a light.
 */
const COLD_START_TRUST = 0.6;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Moves `value` towards 0 by at most `limit`, keeping its sign. */
function capMagnitude(value: number, limit: number): number {
  if (limit <= 0) return 0;
  return value > limit ? limit : value < -limit ? -limit : value;
}

/**
 * One vehicle's motion state. Fed a fix at a time, asked for a position at a
 * time. `step` is the only method that advances the rendered position, so the
 * caller must call it exactly once per animation frame; `peek` reads the last
 * result without touching the state.
 */
export class VehicleMotion {
  private readonly config: MotionConfig;
  private paths: RoutePath[] = [];
  private path: RoutePath | null = null;
  private fix: MotionFix | null = null;
  private fixKey = "";
  private anchorMs = 0;
  private anchorS = 0;
  /** The fix was already ancient on arrival: show it, do not guess from it. */
  private frozen = false;
  private heldSinceMs: number | null = null;
  private speed = 0;
  private hasSpeed = false;
  private prevS: number | null = null;
  private prevFixSec: number | null = null;
  private prevFixMs = 0;
  private renderedS = 0;
  private lastStepMs = 0;
  private anchored = false;
  private bearing: number | null = null;
  private lastSample: MotionSample | null = null;
  private offPathM = Number.POSITIVE_INFINITY;
  private hint: SpeedHint | null = null;
  /** Learned speed at the current anchor; the reference for every ratio below. */
  private anchorLearned: { mps: number; weight: number } | null = null;
  /** 0 none, 1 fading out of the stale position, 2 fading in on the truth. */
  private fadePhase: 0 | 1 | 2 = 0;
  private fadeStartMs = 0;
  /**
   * Shape and position frozen at the start of a fade-out. Held separately
   * because the fix that triggered the re-anchor may also have moved us onto a
   * different shape, on which the old distance means nothing.
   */
  private fadePath: RoutePath | null = null;
  private fadeS = 0;
  private reanchors = 0;
  /** Last fix actually applied; the reference the conflict guard measures from. */
  private accepted: MotionFix | null = null;
  private acceptedMs = 0;
  /** A fix that implied an impossible speed, waiting for a second one to back it. */
  private suspect: MotionFix | null = null;
  private suspectMs = 0;
  private drops = 0;
  private conflictDrops = 0;
  /** True when the last fix could not be snapped onto any known shape. */
  offPath = true;

  constructor(config: MotionConfig = DEFAULT_MOTION) {
    this.config = config;
  }

  /**
   * Learned speeds for this vehicle's route. Null, or a hint with no cell for
   * where the vehicle happens to be, costs nothing: the prediction falls back
   * to the observed speed and behaves exactly as it does with no store at all.
   */
  setSpeedHint(hint: SpeedHint | null): void {
    this.hint = hint;
  }

  /** How many times this vehicle has re-anchored. Diagnostics only. */
  reanchorCount(): number {
    return this.reanchors;
  }

  /** How many fixes the conflict guard has thrown away. Diagnostics only. */
  conflictDropCount(): number {
    return this.conflictDrops;
  }

  /** Candidate shapes for this vehicle's route; the closest one wins per fix. */
  setPaths(paths: RoutePath[], nowMs: number): void {
    if (paths.length === this.paths.length && paths.every((p, i) => p === this.paths[i])) return;
    this.paths = paths;
    if (this.fix !== null) this.applyFix(nowMs);
  }

  /** True once the vehicle is snapped and can be driven along its shape. */
  isDriving(): boolean {
    return this.anchored && this.path !== null;
  }

  pushFix(fix: MotionFix, nowMs: number): void {
    if (!isLatLon(fix.lat, fix.lon)) return;
    const key = `${fix.lat},${fix.lon},${fix.timestampSec}`;
    if (key === this.fixKey) return;
    this.fixKey = key;
    if (!this.acceptFix(fix, nowMs)) return;
    this.fix = fix;
    this.applyFix(nowMs);
  }

  /** Seconds between two fixes: the feed's own clock when it has one, ours otherwise. */
  private gapSecFrom(from: MotionFix, fromMs: number, fix: MotionFix, nowMs: number): number {
    const usable = (sec: number): number | null =>
      Number.isFinite(sec) && sec > 0 ? sec : null;
    const fixSec = usable(fix.timestampSec);
    const fromSec = usable(from.timestampSec);
    const bySec = fixSec !== null && fromSec !== null ? fixSec - fromSec : null;
    return bySec !== null && bySec > 0 ? bySec : Math.max(0, (nowMs - fromMs) / 1000);
  }

  /** True when a vehicle of this kind could really have covered that ground. */
  private reachable(from: MotionFix, fromMs: number, fix: MotionFix, nowMs: number): boolean {
    const jumpM = metresBetween(from.lat, from.lon, fix.lat, fix.lon);
    if (jumpM <= this.config.conflictMinJumpM) return true;
    const gapSec = this.gapSecFrom(from, fromMs, fix, nowMs);
    return gapSec > 0 && jumpM / gapSec <= this.config.maxSpeedMps;
  }

  private remember(fix: MotionFix, nowMs: number): void {
    this.accepted = fix;
    this.acceptedMs = nowMs;
    this.suspect = null;
    this.drops = 0;
  }

  /**
   * Guard against a second vehicle reporting under this one's identity. A fix
   * that would need an impossible speed is held back until a second, agreeing
   * fix confirms the new place; a lone outlier is dropped, so a feed that
   * alternates between two vehicles holds one of them instead of teleporting.
   */
  private acceptFix(fix: MotionFix, nowMs: number): boolean {
    const cfg = this.config;
    const accepted = this.accepted;
    // Nothing to contradict: the first fix of a vehicle is always the truth.
    if (accepted === null) {
      this.remember(fix, nowMs);
      return true;
    }
    // Gone long enough to have been anywhere; this is a vehicle we lost, not a clash.
    if (this.gapSecFrom(accepted, this.acceptedMs, fix, nowMs) >= cfg.staleFixSec) {
      this.remember(fix, nowMs);
      return true;
    }
    if (this.reachable(accepted, this.acceptedMs, fix, nowMs)) {
      this.remember(fix, nowMs);
      return true;
    }
    const suspect = this.suspect;
    // A second fix consistent with the suspect one: the vehicle really did move.
    if (suspect !== null && this.reachable(suspect, this.suspectMs, fix, nowMs)) {
      this.remember(fix, nowMs);
      return true;
    }
    this.drops += 1;
    this.conflictDrops += 1;
    // Escape valve: nothing agrees with anything, so stop holding a dead position.
    if (this.drops >= cfg.conflictMaxDrops) {
      this.remember(fix, nowMs);
      return true;
    }
    this.suspect = fix;
    this.suspectMs = nowMs;
    return false;
  }

  private applyFix(nowMs: number): void {
    const fix = this.fix;
    if (fix === null) return;
    const cfg = this.config;

    let best: Projection | null = null;
    let bestPath: RoutePath | null = null;
    for (const candidate of this.paths) {
      const hint = candidate === this.path && this.anchored ? this.renderedS : null;
      const proj = projectOnPath(
        candidate,
        fix.lat,
        fix.lon,
        hint,
        cfg.projectWindowM,
        cfg.snapToleranceM,
      );
      if (proj === null) continue;
      if (best === null || proj.distanceM < best.distanceM) {
        best = proj;
        bestPath = candidate;
      }
    }

    this.offPathM = best === null ? Number.POSITIVE_INFINITY : best.distanceM;
    if (best === null || bestPath === null || best.distanceM > cfg.snapToleranceM) {
      // Unknown shape, or a diverted vehicle: hand it back to the plain tween.
      this.offPath = true;
      this.anchored = false;
      this.path = null;
      this.lastSample = null;
      this.prevS = null;
      this.hasSpeed = false;
      this.cancelFade();
      return;
    }
    this.offPath = false;

    const switched = bestPath !== this.path;
    const previousPath = this.path;
    this.path = bestPath;

    const fixSec = Number.isFinite(fix.timestampSec) && fix.timestampSec > 0 ? fix.timestampSec : null;
    // Whether there was anything to predict with before this fix landed.
    const hadSpeed = this.hasSpeed;
    if (!switched && this.prevS !== null) {
      const gapSec =
        fixSec !== null && this.prevFixSec !== null
          ? fixSec - this.prevFixSec
          : (nowMs - this.prevFixMs) / 1000;
      if (gapSec >= cfg.minFixGapSec && gapSec <= cfg.maxFixGapSec) {
        const raw = clamp((best.s - this.prevS) / gapSec, -cfg.maxSpeedMps, cfg.maxSpeedMps);
        this.speed = this.hasSpeed ? this.speed * (1 - SPEED_BLEND) + raw * SPEED_BLEND : raw;
        this.hasSpeed = true;
      }
    } else if (switched) {
      this.hasSpeed = false;
      this.speed = 0;
    }

    // Measured against the rendered position, not the previous anchor: what
    // matters for the decision below is the distance the marker would have to
    // travel, which is the only thing the viewer can see.
    const wasAnchored = this.anchored;
    const gapM = wasAnchored ? Math.abs(best.s - this.renderedS) : 0;

    this.prevS = best.s;
    this.prevFixSec = fixSec;
    this.prevFixMs = nowMs;
    this.anchorS = best.s;
    this.anchorMs = nowMs;

    // Dead reckoning runs from the moment the fix reached us. A fix that is
    // minutes behind its own snapshot is a vehicle that stopped reporting, and
    // carrying that one forward would be invention, not estimation.
    const ageSec = Number.isFinite(fix.ageSec) && fix.ageSec > 0 ? fix.ageSec : 0;
    this.frozen = ageSec >= cfg.staleFixSec;

    if (!wasAnchored) {
      this.renderedS = best.s;
      this.bearing = null;
      this.cancelFade();
    } else if (switched || !hadSpeed || gapM > this.reanchorGapM()) {
      // Three ways to end up somewhere the marker cannot walk to. A different
      // shape, on which the rendered distance means nothing. A gap so wide
      // that closing it under the ceiling would take longer than anyone will
      // watch. Or the very first fix that gave us a speed at all, where the
      // marker has been standing on the previous one for half a minute and the
      // distance to make up is not a prediction error but the absence of one.
      // All three are a vehicle we lost and found, so fade off the stale
      // position rather than sprinting across the map to it.
      if (switched) this.bearing = null;
      this.beginFade(previousPath ?? bestPath, nowMs);
      this.renderedS = best.s;
    }
    // Nobody has been stepping us (a hidden tab, a marker that just appeared):
    // the ease has to start from this fix, not swallow the whole gap at once.
    if (!wasAnchored || switched || nowMs - this.lastStepMs > MAX_STEP_MS) {
      this.lastStepMs = nowMs;
    }
    this.anchored = true;
  }

  /** Freezes where the marker is now, so the fade-out has something to show. */
  private beginFade(path: RoutePath, nowMs: number): void {
    // Already fading out: keep the original frozen point, or a burst of fixes
    // would restart the fade and leave the marker stuck half transparent.
    if (this.fadePhase === 1) return;
    this.reanchors += 1;
    // A configuration with no fade re-anchors by simply appearing at the truth.
    // Guarded here so the elapsed/duration ratio in step() never divides by zero.
    if (!(this.config.reanchorFadeMs > 0)) {
      this.cancelFade();
      return;
    }
    this.fadePath = path;
    this.fadeS = this.renderedS;
    this.fadePhase = 1;
    this.fadeStartMs = nowMs;
  }

  private cancelFade(): void {
    this.fadePhase = 0;
    this.fadePath = null;
  }

  /** Learned speed at a point on the path, or 0 where nothing was ever seen. */
  private hintMagnitudeAt(path: RoutePath | null, s: number): number {
    const hint = this.hint;
    if (hint === null || path === null) return 0;
    const at = pointAtDistance(path, s);
    const key = cellKeyOf(at.lat, at.lon);
    if (key < 0) return 0;
    const learned = hint.mps.get(key);
    if (learned === undefined || !(learned > 0)) return 0;
    const weight = hint.weight.get(key) ?? 0;
    return weight > 0 ? learned : 0;
  }

  /**
   * Speed to predict with at a point ahead.
   *
   * The learned speeds are used as a *shape*, never as a level: what they say
   * is "this stretch runs 40% slower than the one you are on", and that is
   * applied to the speed this vehicle is actually doing. Taking the learned
   * number as an absolute would import every bias in it — the fleet average is
   * not this bus, and a speed measured between two fixes is a chord across a
   * road that bends — and none of that survives a ratio. What is left is the
   * only thing the store really knows: where the traffic is, and when.
   */
  private speedMagnitudeAt(path: RoutePath, s: number, observed: number): number {
    const hint = this.hint;
    if (hint === null) return observed;
    const here = this.anchorLearned;
    if (here === null) return observed;
    const at = pointAtDistance(path, s);
    const key = cellKeyOf(at.lat, at.lon);
    if (key < 0) return observed;
    const learned = hint.mps.get(key);
    if (learned === undefined || !(learned > 0)) return observed;
    const weight = hint.weight.get(key) ?? 0;
    if (!(weight > 0)) return observed;
    // A cell claiming a vehicle triples or thirds its speed is measuring
    // something other than this road; clamp before it reaches the prediction.
    const ratio = clamp(learned / here.mps, 0.4, 2.2);
    // Trust is the weaker of the two ends: a confident reading ahead is worth
    // nothing if the reading it is being compared against is a single sample.
    const evidence = Math.min(weight, here.weight);
    const trust = Math.min(this.config.hintMaxTrust, evidence / (evidence + HINT_HALF_WEIGHT));
    return observed * (1 + trust * (ratio - 1));
  }

  /** Learned speed at the anchor, the denominator every ratio is taken against. */
  private anchorLearnedAt(path: RoutePath): { mps: number; weight: number } | null {
    const hint = this.hint;
    if (hint === null) return null;
    const at = pointAtDistance(path, this.anchorS);
    const key = cellKeyOf(at.lat, at.lon);
    if (key < 0) return null;
    const mps = hint.mps.get(key);
    const weight = hint.weight.get(key) ?? 0;
    if (mps === undefined || !(mps > 0) || !(weight > 0)) return null;
    return { mps, weight };
  }

  /**
   * Distance covered in `predictSec`, integrating the learned speed profile of
   * the road ahead rather than assuming the last observed speed holds. With no
   * hint every chunk returns the observed speed and the whole thing collapses
   * to the plain v*t this used to compute.
   */
  private travelFor(path: RoutePath, predictSec: number, observed: number, dir: number): number {
    if (!(observed > MIN_WALK_MPS) || predictSec <= 0) return 0;
    // Resolved once per step rather than per chunk: the anchor does not move
    // between fixes, and this is a binary search over the shape.
    this.anchorLearned = this.anchorLearnedAt(path);
    let travelled = 0;
    let remaining = predictSec;
    let s = this.anchorS;
    let speed = observed;
    for (let i = 0; i < MAX_CHUNKS && remaining > 1e-4; i += 1) {
      speed = this.speedMagnitudeAt(path, s + (dir * CHUNK_M) / 2, observed);
      if (!(speed > MIN_WALK_MPS)) return travelled;
      const chunkSec = CHUNK_M / speed;
      if (chunkSec >= remaining) return travelled + speed * remaining;
      travelled += CHUNK_M;
      remaining -= chunkSec;
      s += dir * CHUNK_M;
    }
    // Ran out of chunks before running out of horizon: finish at the last
    // speed we looked up rather than silently truncating the prediction.
    return travelled + speed * remaining;
  }

  /** Ceiling on how fast the rendered marker may move, metres per second. */
  private capMps(): number {
    const cfg = this.config;
    const plausible = Math.max(
      cfg.minCatchUpMps,
      Math.abs(this.speed),
      this.hintMagnitudeAt(this.path, this.renderedS),
    );
    return Math.min(cfg.maxCatchUpMps, plausible * cfg.catchUpFactor);
  }

  /** Gap above which chasing is abandoned in favour of a re-anchor. */
  private reanchorGapM(): number {
    const cfg = this.config;
    return Math.max(cfg.reanchorMinGapM, this.capMps() * cfg.reanchorSec);
  }

  /** Advances the rendered position to `nowMs`. Call once per frame. */
  step(nowMs: number): MotionSample | null {
    const path = this.path;
    if (path === null || !this.anchored) {
      this.lastSample = null;
      return null;
    }
    const cfg = this.config;
    const dtMs = clamp(nowMs - this.lastStepMs, 0, MAX_STEP_MS);
    this.lastStepMs = nowMs;

    const elapsedSec = Math.max(0, (nowMs - this.anchorMs) / 1000);
    const predictSec = this.frozen ? 0 : Math.min(elapsedSec, cfg.horizonSec);
    const forward = this.speed >= 0 ? 1 : -1;
    // Integrate the road ahead, then take the same long tail as before so an
    // over-estimated speed still cannot run away, then shade the whole thing
    // down: a marker that is slightly behind can be caught up, a marker that
    // is ahead can only be dragged back.
    // Until a second fix arrives there is nothing to measure, and a vehicle
    // that has just appeared would sit still for a whole 32 s feed cycle. The
    // learned speed for the road it is standing on is a far better guess than
    // zero, so seed with it — damped, because it is a road average and not this
    // vehicle. Once a real speed exists it takes over completely.
    const seeded = this.hasSpeed
      ? Math.abs(this.speed)
      : this.hintMagnitudeAt(path, this.anchorS) * COLD_START_TRUST;
    const travelled = this.travelFor(path, predictSec, seeded, forward);
    const taper =
      predictSec > 0
        ? (cfg.velocityTauSec * (1 - Math.exp(-predictSec / cfg.velocityTauSec))) / predictSec
        : 1;
    const advance = forward * travelled * taper * cfg.predictBias;
    const target = clamp(this.anchorS + advance, 0, path.lengthM);

    // A re-anchor owns the marker while it crossfades: the position is frozen
    // on the way out, and the pursuit below only resumes on the way back in.
    let opacity = 1;
    if (this.fadePhase === 1) {
      const t = (nowMs - this.fadeStartMs) / cfg.reanchorFadeMs;
      if (t < 1) {
        return this.sample(this.fadePath ?? path, this.fadeS, forward, predictSec, 1 - t, nowMs);
      }
      this.fadePhase = 2;
      this.fadeStartMs = nowMs;
      this.fadePath = null;
      this.renderedS = target;
      opacity = 0;
    } else if (this.fadePhase === 2) {
      const t = (nowMs - this.fadeStartMs) / cfg.reanchorFadeMs;
      if (t >= 1) this.fadePhase = 0;
      else opacity = t;
    }

    const diff = target - this.renderedS;
    const behind = forward * diff < 0;
    // Hard ceiling on the rendered speed. The gap still closes on an ease, so
    // the last metres arrive gently, but the ease can never move the marker
    // faster than a vehicle of this kind plausibly moves.
    const capM = (this.capMps() * dtMs) / 1000;
    // The truth a little behind the guess: hold and let it catch up, because a
    // marker sliding backwards reads as a bug. Far behind, it has to be walked
    // back, and a slower ease makes that read as a correction, not a snap.
    if (!behind) {
      this.renderedS += capMagnitude(diff * (1 - Math.exp(-dtMs / cfg.easeTauMs)), capM);
    } else if (Math.abs(diff) >= cfg.backstepToleranceM) {
      const eased = diff * (1 - Math.exp(-dtMs / (cfg.easeTauMs * cfg.backstepEaseFactor)));
      this.renderedS += capMagnitude(eased, capM);
    }

    return this.sample(path, this.renderedS, forward, predictSec, opacity, nowMs);
  }

  /** Renders one position into a sample and records it as the last one. */
  private sample(
    path: RoutePath,
    s: number,
    forward: number,
    predictSec: number,
    opacity: number,
    nowMs: number,
  ): MotionSample {
    const cfg = this.config;
    const at = pointAtDistance(path, s);
    let bearing = forward < 0 ? (at.bearing + 180) % 360 : at.bearing;
    if (Math.abs(this.speed) < STEADY_SPEED_MPS) {
      bearing = this.bearing ?? this.fix?.bearing ?? bearing;
    }
    this.bearing = bearing;

    const elapsedSec = Math.max(0, (nowMs - this.anchorMs) / 1000);
    const atEnd = s >= path.lengthM - 1 && this.speed > 0;
    const held = this.frozen || predictSec >= cfg.horizonSec || atEnd;
    if (!held) this.heldSinceMs = null;
    else if (this.heldSinceMs === null) this.heldSinceMs = nowMs;
    this.lastSample = {
      lat: at.lat,
      lon: at.lon,
      bearing,
      predicted: !this.frozen && elapsedSec > 0.5,
      held,
      heldSec: this.heldSinceMs === null ? 0 : (nowMs - this.heldSinceMs) / 1000,
      offPathM: this.offPathM,
      opacity: clamp(opacity, 0, 1),
    };
    return this.lastSample;
  }

  /** The last stepped result, without advancing anything. */
  peek(): MotionSample | null {
    return this.lastSample;
  }

  /** Signed speed along the shape, metres per second. Negative runs it backwards. */
  speedMps(): number {
    return this.hasSpeed ? this.speed : 0;
  }
}
