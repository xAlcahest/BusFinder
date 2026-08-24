"use client";

/**
 * Navigator-style motion for the live vehicle markers: fetch the shape of each
 * route once, snap every fix onto it, and let MapView's animation clock carry
 * the marker along the shape between fixes.
 *
 * The shape cache is module level on purpose. A stop is served by up to twenty
 * lines and the positions poll every few seconds, so the shapes must survive
 * both the poll and a remount, and be fetched at most once per route.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { decodePolyline } from "@/lib/polyline";
import { DEFAULT_MOTION, VehicleMotion, buildPath, hintFrom } from "@/lib/pathmotion";
import type { MotionSample, RoutePath, SpeedHint } from "@/lib/pathmotion";

import { errorMessage, fetchJson, isAbortError, parseLineDetail } from "./api";
import type { MapViewProps } from "./types";

/** Marker ids MapView uses for vehicles; the trackers are keyed the same way. */
export const VEHICLE_MARKER_PREFIX = "veh:";

/** Ceiling on distinct routes we will ever ask a shape for, per session. */
const MAX_ROUTES = 24;
/** Consecutive off-shape fixes before a vehicle is called diverted (~2 polls). */
const DIVERT_MIN_STREAK = 2;
/** Shape requests in flight at once: these are cold queries, not the hot path. */
const MAX_IN_FLIGHT = 2;
const SHAPE_TIMEOUT_MS = 12_000;
/** A route whose shape request failed is retried no sooner than this. */
const RETRY_AFTER_MS = 60_000;

interface RouteShapes {
  /** Stable array identity while nothing new lands, so trackers can compare. */
  paths: RoutePath[];
  requested: Set<number>;
  failedAt: Map<number, number>;
}

const shapeCache = new Map<string, RouteShapes>();
const listeners = new Set<() => void>();
const queue: Array<{ routeId: string; direction: number; priority: boolean }> = [];
let inFlight = 0;
/** Counters for the report: how many shape requests this session really made. */
const shapeStats = { requests: 0, ok: 0, failed: 0, empty: 0, skippedRoutes: 0 };

function notify(): void {
  for (const listener of listeners) listener();
}

function entryFor(routeId: string): RouteShapes | null {
  const known = shapeCache.get(routeId);
  if (known !== undefined) return known;
  if (shapeCache.size >= MAX_ROUTES) {
    shapeStats.skippedRoutes += 1;
    return null;
  }
  const fresh: RouteShapes = { paths: [], requested: new Set(), failedAt: new Map() };
  shapeCache.set(routeId, fresh);
  return fresh;
}

/** Decoding is a pure function over untrusted text: never let it kill the map. */
function safePath(encoded: string | null): RoutePath | null {
  if (encoded === null || encoded.length === 0) return null;
  try {
    return buildPath(decodePolyline(encoded));
  } catch (err) {
    console.warn("Tracciato linea non decodificabile:", errorMessage(err));
    return null;
  }
}

async function loadShape(routeId: string, direction: number): Promise<void> {
  const controller = new AbortController();
  const guard = window.setTimeout(() => controller.abort(), SHAPE_TIMEOUT_MS);
  try {
    // Inside the try: an early return out here would strand the in-flight slot
    // and, two of those in, the queue would never move again.
    const entry = shapeCache.get(routeId);
    if (entry === undefined) return;
    shapeStats.requests += 1;
    const raw = await fetchJson(
      `/api/line/${encodeURIComponent(routeId)}?direction=${direction}`,
      controller.signal,
    );
    const detail = parseLineDetail(raw);
    const path = detail === null ? null : safePath(detail.polyline);
    if (path === null) {
      shapeStats.empty += 1;
      // A line with no shape is a normal state: remember it so we stop asking.
      entry.failedAt.set(direction, Number.POSITIVE_INFINITY);
      return;
    }
    shapeStats.ok += 1;
    entry.paths = [...entry.paths, path];
    notify();
  } catch (err) {
    if (isAbortError(err)) return;
    shapeStats.failed += 1;
    shapeCache.get(routeId)?.failedAt.set(direction, Date.now());
    console.warn(`Tracciato della linea ${routeId} non disponibile:`, errorMessage(err));
  } finally {
    window.clearTimeout(guard);
    inFlight -= 1;
    pump();
  }
}

function pump(): void {
  while (inFlight < MAX_IN_FLIGHT && queue.length > 0) {
    const index = queue.findIndex((job) => job.priority);
    const job = queue.splice(index >= 0 ? index : 0, 1)[0];
    inFlight += 1;
    void loadShape(job.routeId, job.direction);
  }
}

/** Queues one route+direction, unless it is cached, pending or recently failed. */
function requestShape(routeId: string, direction: number, priority: boolean): void {
  const entry = entryFor(routeId);
  if (entry === null) return;
  if (entry.requested.has(direction)) {
    const failedAt = entry.failedAt.get(direction);
    if (failedAt === undefined) return;
    if (Date.now() - failedAt < RETRY_AFTER_MS) return;
    entry.failedAt.delete(direction);
  }
  entry.requested.add(direction);
  queue.push({ routeId, direction, priority });
  pump();
}

function hasSettled(routeId: string, direction: number): boolean {
  const entry = shapeCache.get(routeId);
  if (entry === undefined) return false;
  if (!entry.requested.has(direction)) return false;
  const pending = queue.some((job) => job.routeId === routeId && job.direction === direction);
  return !pending && (entry.paths.length > 0 || entry.failedAt.has(direction));
}

const NO_PATHS: RoutePath[] = [];

function pathsFor(routeId: string | null): RoutePath[] {
  if (routeId === null) return NO_PATHS;
  return shapeCache.get(routeId)?.paths ?? NO_PATHS;
}

// --- learned speed hints ----------------------------------------------------

/**
 * Speeds the server has learned for each line, fetched once and refreshed
 * rarely: they describe a part of the day, not a moment, so polling them would
 * be pure waste. A route with no hint predicts exactly as it did before this
 * existed, which is also what happens for the first few minutes of any session.
 */
const hintCache = new Map<string, SpeedHint>();
/** Unix ms of the last attempt per route, successful or not. */
const hintAskedAt = new Map<string, number>();
const HINT_TTL_MS = 6 * 60_000;
const HINT_RETRY_MS = 2 * 60_000;
const HINT_TIMEOUT_MS = 8_000;
/** Matches MAX_HINT_ROUTES on the server: more than this in one URL is dropped. */
const HINT_BATCH = 12;
/**
 * Ceiling on cached routes. A session that walks the city visits far more
 * lines than one stop shows, and each hint is a few hundred map entries, so
 * this is bounded the same way the shape cache is.
 */
const MAX_HINT_ROUTES_CACHED = 40;
let hintInFlight = false;
const hintStats = { requests: 0, ok: 0, failed: 0, routes: 0, cells: 0 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Numbers only, and only from an array: this is untrusted wire data. One bad
 * entry discards the whole array rather than shifting every later value onto
 * the wrong cell, because these three arrays are read positionally.
 */
function numberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const item of value) {
    if (typeof item === "number" && Number.isFinite(item)) out.push(item);
    else return [];
  }
  return out;
}

/** Stores whatever the answer contained; a malformed route is skipped, not fatal. */
function absorbHints(raw: unknown): void {
  if (!isRecord(raw) || !Array.isArray(raw.routes)) return;
  for (const entry of raw.routes) {
    if (!isRecord(entry)) continue;
    const routeId = entry.routeId;
    if (typeof routeId !== "string" || routeId.length === 0) continue;
    const cells = numberArray(entry.cells);
    const mps = numberArray(entry.mps);
    const weight = numberArray(entry.weight);
    if (cells.length === 0) continue;
    const hint = hintFrom(cells, mps, weight);
    if (hint.mps.size === 0) continue;
    // Insertion-ordered map, so the first key is always the oldest entry.
    while (hintCache.size >= MAX_HINT_ROUTES_CACHED && !hintCache.has(routeId)) {
      const oldest = hintCache.keys().next();
      if (oldest.done === true) break;
      hintCache.delete(oldest.value);
      hintAskedAt.delete(oldest.value);
    }
    hintCache.set(routeId, hint);
    hintStats.cells += hint.mps.size;
  }
  hintStats.routes = hintCache.size;
}

async function loadHints(routeIds: string[]): Promise<void> {
  const controller = new AbortController();
  const guard = window.setTimeout(() => controller.abort(), HINT_TIMEOUT_MS);
  try {
    hintStats.requests += 1;
    const query = routeIds.map((id) => encodeURIComponent(id)).join(",");
    absorbHints(await fetchJson(`/api/motion?routes=${query}`, controller.signal));
    hintStats.ok += 1;
    notify();
  } catch (err) {
    if (isAbortError(err)) return;
    hintStats.failed += 1;
    // Hints are an optimisation. Losing them costs prediction quality and
    // nothing else, so this never reaches the user.
    console.warn("Velocita apprese non disponibili:", errorMessage(err));
  } finally {
    window.clearTimeout(guard);
    hintInFlight = false;
  }
}

/** Asks for whatever is missing or stale, at most one request at a time. */
function requestHints(routeIds: Iterable<string>): void {
  if (hintInFlight) return;
  const now = Date.now();
  const due: string[] = [];
  for (const routeId of routeIds) {
    const askedAt = hintAskedAt.get(routeId);
    const has = hintCache.has(routeId);
    if (askedAt !== undefined && now - askedAt < (has ? HINT_TTL_MS : HINT_RETRY_MS)) continue;
    due.push(routeId);
    if (due.length >= HINT_BATCH) break;
  }
  if (due.length === 0) return;
  for (const routeId of due) hintAskedAt.set(routeId, now);
  hintInFlight = true;
  void loadHints(due);
}

export interface ShapeStats {
  requests: number;
  ok: number;
  failed: number;
  empty: number;
  routes: number;
  skippedRoutes: number;
  /** Fixes the identity-conflict guard refused, summed over live trackers. */
  conflictDrops: number;
  /** Learned-speed requests and what they brought back. */
  hintRequests: number;
  hintOk: number;
  hintFailed: number;
  hintRoutes: number;
  hintCells: number;
}

// --- provider ---------------------------------------------------------------

/**
 * What MapView needs to drive a marker itself. `positionAt` advances the
 * estimate and must be called at most once per frame per marker; `peek` reads
 * the last value without moving anything.
 */
export interface MotionProvider {
  driven(markerId: string): boolean;
  positionAt(markerId: string, nowMs: number): MotionSample | null;
  peek(markerId: string): MotionSample | null;
  /**
   * True when the vehicle is persistently off every shape of its route, i.e.
   * genuinely running a different path — not merely missing a shape yet. Stays
   * false until both directions are loaded, so a bus on the not-yet-fetched
   * direction is never falsely flagged.
   */
  diverted(markerId: string): boolean;
  /**
   * Fires whenever the trackers change: a new fix, a shape landing, a vehicle
   * appearing or leaving. A driver that stopped its frame loop because nothing
   * was moving has no other way to learn that something now is.
   */
  subscribe(listener: () => void): () => void;
}

export interface MotionController extends MotionProvider {
  /** Marker id, for callers that hold a vehicle id. */
  markerIdFor(vehicleId: string): string;
  stats(): ShapeStats;
}

/** MapView's own props: the base contract plus what motion and follow need. */
export interface MotionMapViewProps extends MapViewProps {
  motion?: MotionProvider | null;
  /** Marker the camera stays centred on, frame by frame. Null disables it. */
  followMarkerId?: string | null;
  /** A pan, zoom or rotate the user drove with their own hands. */
  onUserGesture?: () => void;
}

export interface MotionVehicle {
  vehicleId: string;
  routeId: string | null;
  lat: number;
  lon: number;
  bearing: number | null;
  /** Unix seconds of the fix; 0 when the feed did not say. */
  timestamp: number;
}

export interface UseVehicleMotionOptions {
  enabled: boolean;
  /** Route whose shape is fetched first, normally the followed vehicle's. */
  priorityRouteId?: string | null;
  /**
   * When the snapshot carrying these fixes was published. Fix age is measured
   * against it rather than against the device clock, which may be wrong.
   */
  feedTimestamp?: number | null;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface DebugWindow extends Window {
  __probusMotion?: MotionController;
}

/**
 * Keeps one tracker per vehicle, fed from the poll and from the shape cache.
 * The returned controller has a stable identity: it reads refs, so nothing
 * here re-renders the tree while the markers are moving.
 */
export function useVehicleMotion(
  vehicles: readonly MotionVehicle[],
  { enabled, priorityRouteId = null, feedTimestamp = null }: UseVehicleMotionOptions,
): MotionController {
  const trackersRef = useRef<Map<string, VehicleMotion>>(new Map());
  /** Frame drivers waiting to hear that the trackers moved on. */
  const driversRef = useRef<Set<() => void>>(new Set());
  /** Markers confirmed off their route, and the consecutive-fix streak behind it. */
  const divertedRef = useRef<Set<string>>(new Set());
  const offStreakRef = useRef<Map<string, number>>(new Map());
  const [shapeRevision, setShapeRevision] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (): void => setReduced(media.matches);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const bump = (): void => setShapeRevision((value) => value + 1);
    listeners.add(bump);
    return () => {
      listeners.delete(bump);
    };
  }, []);

  useEffect(() => {
    const trackers = trackersRef.current;
    const drivers = driversRef.current;
    // Reduced motion means no prediction and no easing at all: the markers fall
    // back to the plain "jump to the fix" path.
    if (!enabled || reduced) {
      trackers.clear();
      for (const driver of drivers) driver();
      return;
    }

    const now = performance.now();
    const alive = new Set<string>();
    const routes = new Set<string>();
    const needsAlternate = new Set<string>();
    const nextDiverted = new Set<string>();

    for (const vehicle of vehicles) {
      // vehicleId is the identity the feed parser built, not the painted label:
      // two buses sharing a label must never share one tracker. See VehicleLite.
      const id = `${VEHICLE_MARKER_PREFIX}${vehicle.vehicleId}`;
      alive.add(id);
      let tracker = trackers.get(id);
      if (tracker === undefined) {
        tracker = new VehicleMotion(DEFAULT_MOTION);
        trackers.set(id, tracker);
      }
      tracker.setPaths(pathsFor(vehicle.routeId), now);
      tracker.setSpeedHint(vehicle.routeId === null ? null : (hintCache.get(vehicle.routeId) ?? null));
      const ageSec =
        feedTimestamp === null || vehicle.timestamp <= 0
          ? 0
          : Math.max(0, feedTimestamp - vehicle.timestamp);
      tracker.pushFix(
        {
          lat: vehicle.lat,
          lon: vehicle.lon,
          bearing: vehicle.bearing,
          timestampSec: vehicle.timestamp,
          ageSec,
        },
        now,
      );
      if (vehicle.routeId === null) continue;
      routes.add(vehicle.routeId);
      // Only after direction 0 has landed and still fails to explain this
      // vehicle is the opposite shape worth a second request.
      if (tracker.offPath && hasSettled(vehicle.routeId, 0)) needsAlternate.add(vehicle.routeId);

      // Divergence, decided only once BOTH directions are loaded so a bus on the
      // not-yet-fetched direction is never flagged. Needs a streak of fixes: a
      // single GPS outlier must not raise the alarm.
      const bothLoaded = hasSettled(vehicle.routeId, 0) && hasSettled(vehicle.routeId, 1);
      if (bothLoaded && tracker.offPath) {
        const streak = (offStreakRef.current.get(id) ?? 0) + 1;
        offStreakRef.current.set(id, streak);
        if (streak >= DIVERT_MIN_STREAK) nextDiverted.add(id);
      } else {
        offStreakRef.current.delete(id);
      }
    }

    divertedRef.current = nextDiverted;
    for (const id of [...trackers.keys()]) {
      if (!alive.has(id)) {
        trackers.delete(id);
        offStreakRef.current.delete(id);
      }
    }

    for (const routeId of routes) requestShape(routeId, 0, routeId === priorityRouteId);
    for (const routeId of needsAlternate) requestShape(routeId, 1, routeId === priorityRouteId);
    requestHints(routes);

    // Last, so a driver woken here sees trackers that are already up to date.
    // This is the only thing that restarts a frame loop which stopped because
    // no vehicle was drivable yet; a shape landing changes nothing React sees.
    for (const driver of drivers) driver();
  }, [vehicles, enabled, reduced, priorityRouteId, feedTimestamp, shapeRevision]);

  const controller = useMemo<MotionController>(
    () => ({
      markerIdFor: (vehicleId: string) => `${VEHICLE_MARKER_PREFIX}${vehicleId}`,
      driven: (markerId: string) => trackersRef.current.get(markerId)?.isDriving() === true,
      positionAt: (markerId: string, nowMs: number) =>
        trackersRef.current.get(markerId)?.step(nowMs) ?? null,
      peek: (markerId: string) => trackersRef.current.get(markerId)?.peek() ?? null,
      diverted: (markerId: string) => divertedRef.current.has(markerId),
      subscribe: (listener: () => void) => {
        const drivers = driversRef.current;
        drivers.add(listener);
        return () => {
          drivers.delete(listener);
        };
      },
      stats: () => ({
        ...shapeStats,
        conflictDrops: [...trackersRef.current.values()].reduce(
          (total, tracker) => total + tracker.conflictDropCount(),
          0,
        ),
        routes: shapeCache.size,
        hintRequests: hintStats.requests,
        hintOk: hintStats.ok,
        hintFailed: hintStats.failed,
        hintRoutes: hintStats.routes,
        hintCells: hintStats.cells,
      }),
    }),
    [],
  );

  // Opt-in probe for automated timing checks; inert without ?probusdebug.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("probusdebug")) return;
    const scope = window as DebugWindow;
    scope.__probusMotion = controller;
    return () => {
      delete scope.__probusMotion;
    };
  }, [controller]);

  return controller;
}
