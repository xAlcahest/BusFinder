/**
 * Realtime access for the API routes. Every entry point here degrades to an
 * empty snapshot instead of throwing: a dead feed must never 500 the user.
 */

import { getSnapshot, startPoller } from "@/lib/realtime";
import type { RealtimeSnapshot } from "@/lib/realtime";
import { allRoutesById } from "@/lib/queries";
import type { RouteSummary } from "@/lib/types";

function emptySnapshot(): RealtimeSnapshot {
  return {
    tripUpdates: new Map(),
    byStop: new Map(),
    vehicles: [],
    alerts: [],
    feedTimestamp: null,
    feedTimestamps: { tripUpdates: null, vehicles: null, alerts: null },
    fetchedAt: 0,
    degraded: true,
  };
}

let pollerFailed = false;

/** startPoller() is idempotent; this only adds the failure guard. */
export function ensurePoller(): void {
  if (pollerFailed) return;
  try {
    startPoller();
  } catch (cause) {
    pollerFailed = true;
    console.error("[api:rt] realtime poller failed to start", cause);
  }
}

export function safeSnapshot(): RealtimeSnapshot {
  try {
    return getSnapshot();
  } catch (cause) {
    console.error("[api:rt] realtime snapshot unavailable", cause);
    return emptySnapshot();
  }
}

/** Route lookup that survives a missing database, so alerts still render. */
export function safeRoutesById(): ReadonlyMap<string, RouteSummary> {
  try {
    return allRoutesById();
  } catch (cause) {
    console.error("[api:rt] route list unavailable", cause);
    return new Map();
  }
}
