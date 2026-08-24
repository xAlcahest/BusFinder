/**
 * Learned speed hints for the map's motion engine.
 *
 * Read-only from the client's point of view: nothing a browser sends is ever
 * stored. The statistics are built server-side from the realtime feed the
 * poller already fetches, which is why this route also starts the observation
 * loop — a deployment nobody is looking at learns nothing and costs nothing.
 *
 * The answer changes on the scale of hours, so it is served conditionally: a
 * client refreshing its hints normally gets a 304 and pays for nothing.
 */

import { BadParam, failure } from "@/app/api/_lib/http";
import { conditionalJson, enforceRateLimit } from "@/app/api/_lib/ratelimit";
import type { RateRule } from "@/app/api/_lib/ratelimit";
import { ensurePoller } from "@/app/api/_lib/rt";
import {
  MAX_HINT_ROUTES,
  bandFor,
  maybePurgeMotionStats,
  readHints,
  startMotionObserver,
} from "@/lib/motionstats";
import { CELL_M } from "@/lib/pathmotion";
import type { MotionHintsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * A client refreshes its hints every few minutes for one set of lines, so this
 * is generous for honest use and still a ceiling on a runaway loop. Unchanged
 * (304) answers are refunded, which is what most of them are.
 */
const MOTION_RULE: RateRule = { name: "motion", limit: 60, windowMs: 60_000 };
const MOTION_BURST_RULE: RateRule = { name: "motion-burst", limit: 10, windowMs: 5_000 };
const MOTION_RULES: readonly RateRule[] = [MOTION_BURST_RULE, MOTION_RULE];

const ROUTE_ID_RE = /^[A-Za-z0-9._#-]{1,64}$/;
/** Resolution of the timestamp in the body, and so of the validator over it. */
const STAMP_QUANTUM_SEC = 300;

/** Comma-separated route ids, deduplicated and capped. Anything odd is a 400. */
function parseRoutes(raw: string | null): string[] {
  if (raw === null) return [];
  // Bound the input before splitting it: the cap below is on distinct ids, not
  // on how much text a client may make us tokenise.
  if (raw.length > 1024) throw new BadParam('parametro "routes" troppo lungo');
  const out: string[] = [];
  const seen = new Set<string>();
  for (const piece of raw.split(",")) {
    const value = piece.trim();
    if (value.length === 0) continue;
    if (!ROUTE_ID_RE.test(value)) throw new BadParam(`routeId non valido: ${value.slice(0, 16)}`);
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= MAX_HINT_ROUTES) break;
  }
  return out;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const limited = enforceRateLimit(request, MOTION_RULES);
    if (limited !== null) return limited;

    const params = new URL(request.url).searchParams;
    const routes = parseRoutes(params.get("routes"));

    // Both are idempotent and cheap after the first call.
    ensurePoller();
    startMotionObserver();
    maybePurgeMotionStats();

    const nowSec = Math.floor(Date.now() / 1000);
    const band = bandFor(nowSec);
    const body: MotionHintsResponse = {
      // Quantised, not the wall clock: a field that moved every second would
      // change the ETag on every request and make the 304 below unreachable.
      generatedAt: nowSec - (nowSec % STAMP_QUANTUM_SEC),
      band,
      cellM: CELL_M,
      // A missing store, an unreadable volume: readHints logs and answers with
      // nothing, and a client with no hints predicts exactly as it used to.
      routes: routes.length === 0 ? [] : readHints(routes, band, nowSec),
    };
    return conditionalJson(request, JSON.stringify(body), MOTION_RULES);
  } catch (cause) {
    return failure("motion", cause);
  }
}
