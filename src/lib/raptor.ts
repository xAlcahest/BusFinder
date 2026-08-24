/**
 * Round-based candidate search over the pattern graph, in the style of RAPTOR.
 *
 * The planner's cheap search pairs routes and only then reads stop_times, which
 * is what keeps a direct or one-change plan under a hundred milliseconds. That
 * shape does not extend: pairing route triples is a combinatorial explosion.
 *
 * So this module runs the classic round-based relaxation instead. Round 0 is
 * the stops reachable on foot from the origin; each round scans the patterns
 * serving the stops reached so far, rides them, and relaxes the arrival time at
 * every downstream stop. k rounds means k-1 changes.
 *
 * The times relaxed here are estimates, not timetable: entirely in memory, no
 * stop_times, no SQL. Its job is to answer "which sequence of lines could work",
 * cheaply and without missing the two- and three-change ones. The caller then
 * prices the handful of survivors against the real timetable.
 */

import {
  allRoutesById,
  allStopsById,
  haversineM,
  patternTripCounts,
  routeNetwork,
} from "@/lib/queries";
import { getDb } from "@/lib/db";
import type { Stop } from "@/lib/types";

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

/** Rough in-vehicle speed by GTFS route_type. Matches the planner's own table. */
function cruiseSpeedMps(routeType: number): number {
  if (routeType === 1) return 8.5;
  if (routeType === 2) return 12;
  if (routeType === 0) return 4.5;
  return 4;
}

/** Charged once per intermediate stop: doors, kerb, traffic light. */
const DWELL_SEC = 18;

/** The fastest thing in the feed, used only as an admissible remaining-time bound. */
const MAX_SPEED_MPS = 14;

/** How long a line can be ridden in one leg. Rome's outer routes reach 80 stops. */
const MAX_RIDE_STOPS = 80;

/**
 * Waiting for a line we have no timetable for yet. Derived from how many trips
 * the pattern runs, so a line with four departures a day is not treated as if
 * it were the metro; that is what stops the search proposing absurd plans.
 */
const SERVICE_SPAN_SEC = 18 * 3600;
const MIN_WAIT_SEC = 90;
const MAX_WAIT_SEC = 45 * 60;

/** Doors, platforms, and a bus that is not to the second. Matches the planner. */
const TRANSFER_BUFFER_SEC = 150;

const WALK_SPEED_MPS = 1.25;
const WALK_DETOUR = 1.35;

/**
 * Search area: an ellipse with the two endpoints as foci. A stop is worth
 * relaxing while walking to it and on to the destination is not a wild detour.
 */
const ELLIPSE_FACTOR = 1.8;
const ELLIPSE_SLACK_M = 4500;

/** A relaxation has to beat the incumbent by this much to be worth a new label. */
const IMPROVE_EPS_SEC = 30;

/**
 * These are estimates, so pruning against the best complete journey found so far
 * has to leave a margin: the timetable regularly disagrees by this much, and a
 * plan cut here is a plan the caller never gets to price.
 */
const TARGET_SLACK_SEC = 15 * 60;

/** Plans kept per ride count before the best-first fill, so a two-ride answer
 * is always offered when one exists even if the estimate ranks it below a
 * three-ride one. */
const PLANS_PER_RIDE_COUNT = 3;
/** Variants of the same sequence of lines, differing in where they are boarded. */
const VARIANTS_PER_SIGNATURE = 2;

// ---------------------------------------------------------------------------
// Pattern geometry, cached for the life of the database handle
// ---------------------------------------------------------------------------

interface PatternProfile {
  routeId: string;
  /** cum[i] is estimated seconds from the pattern's first stop to its i-th. */
  cum: Float64Array;
  /** The pattern's stops as ordinals, so the scan never touches a hash map. */
  stopIdx: Int32Array;
  /** Half the headway implied by the pattern's trip count, clamped. */
  waitSec: number;
}

/**
 * Everything the search reads but never writes. Per-stop state is indexed by a
 * dense ordinal rather than by stop id: the inner loop relaxes tens of thousands
 * of stops per request, and a typed array beats a string-keyed map at that.
 */
interface SearchIndex {
  profiles: ReadonlyMap<string, PatternProfile>;
  /** stopId -> ordinal. */
  order: ReadonlyMap<string, number>;
  /** Ordinal -> stop, parallel to every per-stop typed array below. */
  list: readonly Stop[];
}

let indexCache: SearchIndex | null = null;
let indexOwner: ReturnType<typeof getDb> | null = null;

function searchIndex(): SearchIndex {
  const db = getDb();
  if (indexCache !== null && indexOwner === db) return indexCache;

  const net = routeNetwork();
  const stops = allStopsById();
  const routes = allRoutesById();
  const tripCounts = patternTripCounts();

  const order = new Map<string, number>();
  const list: Stop[] = [];
  for (const stop of stops.values()) {
    order.set(stop.stopId, list.length);
    list.push(stop);
  }

  const profiles = new Map<string, PatternProfile>();
  for (const [key, pattern] of net.patterns) {
    const speed = cruiseSpeedMps(routes.get(pattern.routeId)?.routeType ?? 3);
    const cum = new Float64Array(pattern.stops.length);
    const stopIdx = new Int32Array(pattern.stops.length);
    let previous: Stop | undefined;
    let total = 0;
    for (let i = 0; i < pattern.stops.length; i += 1) {
      const stopId = pattern.stops[i];
      const stop = stopId === undefined ? undefined : stops.get(stopId);
      if (stop !== undefined && previous !== undefined) {
        total += haversineM(previous.lat, previous.lon, stop.lat, stop.lon) / speed + DWELL_SEC;
      }
      cum[i] = total;
      // -1 marks a stop the feed lists on a route but not in stops.txt.
      stopIdx[i] = stopId === undefined ? -1 : (order.get(stopId) ?? -1);
      if (stop !== undefined) previous = stop;
    }
    const trips = tripCounts.get(key) ?? 0;
    const waitSec =
      trips <= 0
        ? MAX_WAIT_SEC
        : Math.min(MAX_WAIT_SEC, Math.max(MIN_WAIT_SEC, SERVICE_SPAN_SEC / (2 * trips)));
    profiles.set(key, { routeId: pattern.routeId, cum, stopIdx, waitSec });
  }

  indexCache = { profiles, order, list };
  indexOwner = db;
  return indexCache;
}

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

export interface RaptorAccess {
  stopId: string;
  walkM: number;
  walkSec: number;
}

export interface RaptorNeighbour {
  stopId: string;
  distanceM: number;
}

export interface RaptorRide {
  patternKey: string;
  boardStopId: string;
  alightStopId: string;
}

/**
 * One candidate plan: which lines, and where to get on and off each. Every walk
 * is left for the caller to measure from the stop coordinates, so nothing here
 * can disagree with the itinerary that is finally built.
 */
export interface RaptorPlan {
  rides: RaptorRide[];
  /** Door-to-door estimate in seconds. Ranking only, never shown to a rider. */
  estimatedSec: number;
}

export interface RaptorStats {
  /** Rounds actually run before the search went quiet. */
  rounds: number;
  /** Pattern scans performed, summed over rounds. */
  patternScans: number;
  /** Distinct stops that ever got a label. */
  stopsReached: number;
  plansFound: number;
}

export interface RaptorRequest {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  originAccess: readonly RaptorAccess[];
  destAccess: readonly RaptorAccess[];
  /** k rounds means at most k-1 changes. */
  maxRounds: number;
  /** Plans with fewer rides than this are dropped; the cheap search owns those. */
  minRides: number;
  maxPlans: number;
  /** Walkable stops around a stop, itself included. Supplied by the caller's cache. */
  neighbours: (stopId: string) => readonly RaptorNeighbour[];
  /**
   * Patterns to leave out of this pass. The search has no timetable, so it will
   * happily route a rider onto a night line at nine in the morning; the caller
   * prices the plans, finds the line is not running, and asks again without it.
   */
  excludePatterns?: ReadonlySet<string>;
}

export interface RaptorResult {
  plans: RaptorPlan[];
  stats: RaptorStats;
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

type Via =
  | { kind: "origin"; walkM: number }
  | { kind: "ride"; patternKey: string; boardStopId: string; fromRound: number }
  | { kind: "walk"; fromStopId: string; distanceM: number; fromRound: number };

interface Label {
  /** Estimated seconds after the requested departure instant. */
  arr: number;
  via: Via;
  /** Line last ridden to get here, so we never change onto the same line. */
  routeId: string | null;
}

function walkSeconds(straightLineM: number): number {
  if (!Number.isFinite(straightLineM) || straightLineM <= 0) return 0;
  return Math.ceil((straightLineM * WALK_DETOUR) / WALK_SPEED_MPS);
}

// ---------------------------------------------------------------------------
// The search
// ---------------------------------------------------------------------------

export function raptorPlans(request: RaptorRequest): RaptorResult {
  const stats: RaptorStats = { rounds: 0, patternScans: 0, stopsReached: 0, plansFound: 0 };
  const maxRounds = Math.max(1, Math.min(5, Math.floor(request.maxRounds)));
  const maxPlans = Math.max(1, Math.min(24, Math.floor(request.maxPlans)));
  if (request.originAccess.length === 0 || request.destAccess.length === 0) {
    return { plans: [], stats };
  }

  const net = routeNetwork();
  const { profiles, order, list } = searchIndex();
  const { origin, destination } = request;
  const excluded: ReadonlySet<string> = request.excludePatterns ?? new Set<string>();
  const size = list.length;

  const crowM = haversineM(origin.lat, origin.lon, destination.lat, destination.lon);
  const ellipseBudget = ELLIPSE_FACTOR * crowM + ELLIPSE_SLACK_M;

  /**
   * Per-stop state, all indexed by ordinal. `gate` folds both cheap filters into
   * one array: an admissible lower bound on the time still to travel, or
   * Infinity when the stop is outside the search ellipse and never worth a label.
   */
  const gate = new Float64Array(size).fill(Number.NaN);
  function gateOf(index: number): number {
    const held = gate[index];
    if (held !== undefined && !Number.isNaN(held)) return held;
    const stop = list[index];
    let value = Number.POSITIVE_INFINITY;
    if (stop !== undefined) {
      const toDest = haversineM(stop.lat, stop.lon, destination.lat, destination.lon);
      const detour = haversineM(origin.lat, origin.lon, stop.lat, stop.lon) + toDest;
      if (detour <= ellipseBudget) value = toDest / MAX_SPEED_MPS;
    }
    gate[index] = value;
    return value;
  }

  /** Walk out to the destination from each stop that has one, by ordinal. */
  const exitSec = new Float64Array(size).fill(Number.POSITIVE_INFINITY);
  const exitWalkM = new Float64Array(size).fill(Number.POSITIVE_INFINITY);
  for (const access of request.destAccess) {
    const index = order.get(access.stopId);
    if (index === undefined) continue;
    const held = exitWalkM[index];
    if (held !== undefined && access.walkM >= held) continue;
    exitSec[index] = access.walkSec;
    exitWalkM[index] = access.walkM;
  }

  /** Best estimated arrival per stop over every round: the pruning frontier. */
  const best = new Float64Array(size).fill(Number.POSITIVE_INFINITY);
  const rounds: Array<Map<string, Label>> = [];

  /** Best door-to-door estimate seen so far; every relaxation is pruned against it. */
  let targetArr = Number.POSITIVE_INFINITY;

  const initial = new Map<string, Label>();
  for (const access of request.originAccess) {
    const index = order.get(access.stopId);
    if (index === undefined) continue;
    const held = initial.get(access.stopId);
    if (held !== undefined && held.arr <= access.walkSec) continue;
    initial.set(access.stopId, {
      arr: access.walkSec,
      via: { kind: "origin", walkM: access.walkM },
      routeId: null,
    });
    best[index] = access.walkSec;
    const exit = exitSec[index];
    if (exit !== undefined) targetArr = Math.min(targetArr, access.walkSec + exit);
  }
  rounds.push(initial);

  for (let round = 1; round <= maxRounds; round += 1) {
    const previous = rounds[round - 1];
    if (previous === undefined || previous.size === 0) break;
    stats.rounds = round;
    const current = new Map<string, Label>();

    // Collect the best boarding point on every pattern the frontier touches.
    // Minimising (arrival - cum[idx]) minimises the arrival at every stop
    // downstream of idx at once, which is what makes one scan per pattern enough.
    const boardings = new Map<string, Array<{ idx: number; virtual: number; stopId: string }>>();
    for (const [stopId, label] of previous) {
      for (const membership of net.byStop.get(stopId) ?? []) {
        if (excluded.has(membership.key)) continue;
        const profile = profiles.get(membership.key);
        if (profile === undefined) continue;
        if (label.routeId !== null && profile.routeId === label.routeId) continue;
        const cumAt = membership.idx < profile.cum.length ? (profile.cum[membership.idx] ?? 0) : 0;
        const entry = { idx: membership.idx, virtual: label.arr - cumAt, stopId };
        const list = boardings.get(membership.key);
        if (list === undefined) boardings.set(membership.key, [entry]);
        else list.push(entry);
      }
    }

    const improvedByRide: string[] = [];

    for (const [key, entries] of boardings) {
      const pattern = net.patterns.get(key);
      const profile = profiles.get(key);
      if (pattern === undefined || profile === undefined) continue;
      stats.patternScans += 1;
      entries.sort((a, b) => a.idx - b.idx);

      let pointer = 0;
      let bestVirtual = Number.POSITIVE_INFINITY;
      let boardStopId = "";
      let boardIdx = -1;
      const start = entries[0]?.idx ?? 0;
      const length = profile.stopIdx.length;

      for (let i = start; i < length; i += 1) {
        while (pointer < entries.length) {
          const entry = entries[pointer];
          if (entry === undefined || entry.idx > i) break;
          if (entry.virtual < bestVirtual) {
            bestVirtual = entry.virtual;
            boardStopId = entry.stopId;
            boardIdx = entry.idx;
          }
          pointer += 1;
        }
        if (boardIdx < 0 || i === boardIdx) continue;
        // Too far to stay on board from here, but a boarding point further along
        // the line may still be marked, so keep scanning rather than stopping.
        if (i - boardIdx > MAX_RIDE_STOPS) continue;

        const index = profile.stopIdx[i];
        if (index === undefined || index < 0) continue;
        const arr = bestVirtual + (profile.cum[i] ?? 0) + profile.waitSec;
        const held = best[index];
        if (held !== undefined && arr >= held - IMPROVE_EPS_SEC) continue;
        if (arr + gateOf(index) >= targetArr + TARGET_SLACK_SEC) continue;

        const stopId = pattern.stops[i];
        if (stopId === undefined) continue;
        best[index] = arr;
        current.set(stopId, {
          arr,
          via: { kind: "ride", patternKey: key, boardStopId, fromRound: round - 1 },
          routeId: profile.routeId,
        });
        improvedByRide.push(stopId);

        const exit = exitSec[index];
        if (exit !== undefined) targetArr = Math.min(targetArr, arr + exit);
      }
    }

    // Foot transfers, applied only to what a ride just improved: a walk after a
    // walk is a longer walk we would have found from the same stop anyway.
    for (const stopId of improvedByRide) {
      const label = current.get(stopId);
      if (label === undefined) continue;
      for (const neighbour of request.neighbours(stopId)) {
        if (neighbour.stopId === stopId) continue;
        const index = order.get(neighbour.stopId);
        if (index === undefined) continue;
        const arr = label.arr + TRANSFER_BUFFER_SEC + walkSeconds(neighbour.distanceM);
        const held = best[index];
        if (held !== undefined && arr >= held - IMPROVE_EPS_SEC) continue;
        if (arr + gateOf(index) >= targetArr + TARGET_SLACK_SEC) continue;

        best[index] = arr;
        current.set(neighbour.stopId, {
          arr,
          via: { kind: "walk", fromStopId: stopId, distanceM: neighbour.distanceM, fromRound: round },
          routeId: label.routeId,
        });

        const exit = exitSec[index];
        if (exit !== undefined) targetArr = Math.min(targetArr, arr + exit);
      }
    }

    rounds.push(current);
  }

  for (let i = 0; i < size; i += 1) if (Number.isFinite(best[i])) stats.stopsReached += 1;

  const plans = extractPlans(rounds, order, exitSec, request.minRides, maxPlans);
  stats.plansFound = plans.length;
  return { plans, stats };
}

// ---------------------------------------------------------------------------
// Turning labels back into plans
// ---------------------------------------------------------------------------

function extractPlans(
  rounds: ReadonlyArray<ReadonlyMap<string, Label>>,
  order: ReadonlyMap<string, number>,
  exitSec: Float64Array,
  minRides: number,
  maxPlans: number,
): RaptorPlan[] {
  const found: RaptorPlan[] = [];
  for (let round = 1; round < rounds.length; round += 1) {
    const labels = rounds[round];
    if (labels === undefined) continue;
    for (const [stopId, label] of labels) {
      const index = order.get(stopId);
      const exit = index === undefined ? undefined : exitSec[index];
      if (exit === undefined || !Number.isFinite(exit)) continue;
      const plan = reconstruct(rounds, stopId, label, exit);
      if (plan === null) continue;
      if (plan.rides.length < minRides) continue;
      found.push(plan);
    }
  }

  found.sort((a, b) => a.estimatedSec - b.estimatedSec || a.rides.length - b.rides.length);

  // Two passes. The first spreads the slots over the ride counts, because these
  // are estimates and a two-ride plan the estimate ranks badly can still be the
  // one the timetable actually allows. The second fills whatever is left.
  const seen = new Map<string, number>();
  const perCount = new Map<number, number>();
  const out: RaptorPlan[] = [];
  const take = (plan: RaptorPlan, countQuota: number): boolean => {
    if (out.length >= maxPlans) return false;
    const signature = plan.rides.map((ride) => ride.patternKey).join(">");
    const variants = seen.get(signature) ?? 0;
    if (variants >= VARIANTS_PER_SIGNATURE) return false;
    const used = perCount.get(plan.rides.length) ?? 0;
    if (used >= countQuota) return false;
    seen.set(signature, variants + 1);
    perCount.set(plan.rides.length, used + 1);
    out.push(plan);
    return true;
  };

  const taken = new Set<RaptorPlan>();
  for (const plan of found) if (take(plan, PLANS_PER_RIDE_COUNT)) taken.add(plan);
  for (const plan of found) {
    if (out.length >= maxPlans) break;
    if (taken.has(plan)) continue;
    take(plan, Number.POSITIVE_INFINITY);
  }
  return out;
}

/** Walks the parent chain back to the origin. Returns null if it does not close. */
function reconstruct(
  rounds: ReadonlyArray<ReadonlyMap<string, Label>>,
  destStopId: string,
  destLabel: Label,
  exitSec: number,
): RaptorPlan | null {
  const rides: RaptorRide[] = [];
  let stopId = destStopId;
  let label: Label = destLabel;

  // Each hop moves back one link of a chain whose length the round cap bounds;
  // the counter is belt and braces against a label that points at itself.
  for (let hops = 0; hops < 32; hops += 1) {
    const via = label.via;
    if (via.kind === "origin") {
      if (rides.length === 0) return null;
      rides.reverse();
      return { rides, estimatedSec: destLabel.arr + exitSec };
    }
    if (via.kind === "walk") {
      // A walk is not carried in the plan: the rider gets off where the line
      // stops, and the caller measures every walk from the stop coordinates.
      const source = rounds[via.fromRound]?.get(via.fromStopId);
      if (source === undefined) return null;
      stopId = via.fromStopId;
      label = source;
      continue;
    }
    rides.push({ patternKey: via.patternKey, boardStopId: via.boardStopId, alightStopId: stopId });
    const source = rounds[via.fromRound]?.get(via.boardStopId);
    if (source === undefined) return null;
    stopId = via.boardStopId;
    label = source;
  }
  return null;
}
