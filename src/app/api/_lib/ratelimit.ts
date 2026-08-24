/**
 * Cost control for clients that call us often: an in-process sliding-window
 * rate limiter, plus the conditional-response helper the vehicle routes use to
 * answer 304 instead of resending an unchanged body. No dependencies and no
 * shared store: one Node process serves the whole app, so a map is enough.
 *
 * The sync routes are the reason the limiter exists. Guessing a syncId means
 * guessing a 100-bit code, so enumeration is already hopeless on paper; the
 * limiter is what keeps it hopeless in practice, and it also caps the write
 * load a single client can put on data/sync.db.
 */

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";

export interface RateRule {
  /** Bucket name, so two rules on one IP do not share a window. */
  name: string;
  /** Requests allowed inside the window. */
  limit: number;
  windowMs: number;
}

/** Whole-route budget: comfortably above a device syncing every few seconds. */
export const SYNC_RULE: RateRule = { name: "sync", limit: 60, windowMs: 60_000 };
/** Tighter, because GET against a guessed id is the only enumeration vector. */
export const SYNC_READ_RULE: RateRule = { name: "sync-read", limit: 20, windowMs: 60_000 };

/**
 * Live positions, polled every 3-5 s. One open map costs ~15 requests a minute,
 * so this is the budget for roughly forty simultaneous users behind one address
 * — a carrier-grade NAT or an office are exactly that. It is a ceiling against
 * a client that has lost its interval, not a quota on legitimate use, and
 * unchanged (304) responses are refunded so polling costs nothing when the feed
 * has not moved.
 */
export const VEHICLES_RULE: RateRule = { name: "vehicles", limit: 600, windowMs: 60_000 };
/**
 * Second window on the same endpoints, because 600/min alone would let a
 * runaway loop fire them all inside a second. Opening a page issues a handful
 * at once, so this leaves room for several users doing that together.
 */
export const VEHICLES_BURST_RULE: RateRule = { name: "vehicles-burst", limit: 60, windowMs: 5_000 };
/** Both windows apply to every vehicle request. */
export const VEHICLE_RULES: readonly RateRule[] = [VEHICLES_BURST_RULE, VEHICLES_RULE];

/**
 * With no proxy in front, every client collapses into one bucket (see
 * clientKeyOf), so a per-address budget would be shared by the whole world.
 * That bucket therefore gets a far higher ceiling: there it is only a last-ditch
 * guard against a runaway loop, and the per-address limit does its real work
 * behind a proxy, where the header exists.
 */
const SHARED_BUCKET_FACTOR = 25;

/** Hard cap on tracked keys, so a spoofed x-forwarded-for cannot grow the map. */
const MAX_KEYS = 5_000;
/** Sweep cadence, in checks, to keep the common path allocation-free. */
const SWEEP_EVERY = 500;

interface Bucket {
  /** Unix ms of the hits still inside the window, oldest first. */
  hits: number[];
  /** Unix ms of the last hit, for eviction ordering. */
  lastSeen: number;
  windowMs: number;
}

const buckets = new Map<string, Bucket>();
let checksSinceSweep = 0;

/** Drops buckets whose whole window has elapsed, then trims to MAX_KEYS. */
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastSeen >= bucket.windowMs) buckets.delete(key);
  }
  if (buckets.size <= MAX_KEYS) return;
  // Still over budget: evict least-recently-seen first.
  const byAge = [...buckets.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen);
  for (const [key] of byAge.slice(0, buckets.size - MAX_KEYS)) buckets.delete(key);
}

export interface RateVerdict {
  allowed: boolean;
  /** Seconds until the oldest hit leaves the window. At least 1 when blocked. */
  retryAfterSec: number;
  remaining: number;
}

/** The shared bucket is not one user, so it gets a proportionally higher ceiling. */
function limitFor(clientKey: string, rule: RateRule): number {
  return clientKey === UNKNOWN_CLIENT ? rule.limit * SHARED_BUCKET_FACTOR : rule.limit;
}

/** Records a hit against one rule and says whether it is allowed. */
export function checkRate(clientKey: string, rule: RateRule, now: number = Date.now()): RateVerdict {
  if (++checksSinceSweep >= SWEEP_EVERY) {
    checksSinceSweep = 0;
    sweep(now);
  }

  const limit = limitFor(clientKey, rule);
  const key = `${rule.name}:${clientKey}`;
  const bucket = buckets.get(key) ?? { hits: [], lastSeen: now, windowMs: rule.windowMs };
  const cutoff = now - rule.windowMs;
  // Hits are appended in time order, so dropping the expired prefix is enough.
  let first = 0;
  while (first < bucket.hits.length && bucket.hits[first] <= cutoff) first += 1;
  if (first > 0) bucket.hits = bucket.hits.slice(first);

  bucket.lastSeen = now;
  bucket.windowMs = rule.windowMs;

  if (bucket.hits.length >= limit) {
    // Blocked hits are not recorded: hammering must not extend the penalty.
    buckets.set(key, bucket);
    const oldest = bucket.hits[0] ?? now;
    const waitMs = Math.max(0, oldest + rule.windowMs - now);
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(waitMs / 1000)), remaining: 0 };
  }

  bucket.hits.push(now);
  // A new key can only be added once the map has room, evictions included.
  if (!buckets.has(key) && buckets.size >= MAX_KEYS) sweep(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSec: 0, remaining: limit - bucket.hits.length };
}

/** Used when no proxy header is present: everyone shares one bucket. */
const UNKNOWN_CLIENT = "unknown";

/**
 * First hop of x-forwarded-for, which is the client as the edge saw it. The
 * value is attacker-controlled, hence MAX_KEYS above; behind our proxy it is
 * rewritten, and with no proxy at all every request falls into one bucket.
 */
export function clientKeyOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded !== null) {
    const first = forwarded.split(",")[0]?.trim() ?? "";
    // Cap the length so a huge header cannot be used to bloat map keys.
    if (first.length > 0) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip")?.trim() ?? "";
  if (real.length > 0) return real.slice(0, 64);
  return UNKNOWN_CLIENT;
}

/**
 * Applies every rule to one request. Returns a ready 429 when any rule is
 * exhausted, null when the request may proceed.
 */
export function enforceRateLimit(request: Request, rules: readonly RateRule[]): NextResponse<ApiError> | null {
  const clientKey = clientKeyOf(request);
  const now = Date.now();
  let retryAfterSec = 0;
  let blocked = false;
  // Every rule is checked, so one bucket cannot mask another's accounting.
  for (const rule of rules) {
    const verdict = checkRate(clientKey, rule, now);
    if (!verdict.allowed) {
      blocked = true;
      retryAfterSec = Math.max(retryAfterSec, verdict.retryAfterSec);
    }
  }
  if (!blocked) return null;

  const body: ApiError = {
    error: "Troppe richieste",
    detail: `Riprova tra ${retryAfterSec} second${retryAfterSec === 1 ? "o" : "i"}.`,
  };
  return NextResponse.json(body, {
    status: 429,
    headers: {
      "Retry-After": String(retryAfterSec),
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

/**
 * Gives a request its budget back. Polling at 4 s against a feed that moves
 * every ~34 s means most answers are 304s that carry no body and cost almost
 * nothing, so charging for them would throttle honest users for doing exactly
 * what we asked them to do. Call this only for responses that did no real work.
 */
export function refundRateLimit(request: Request, rules: readonly RateRule[]): void {
  const clientKey = clientKeyOf(request);
  for (const rule of rules) {
    const bucket = buckets.get(`${rule.name}:${clientKey}`);
    // Drop the most recent hit, which is the one this request just recorded.
    if (bucket !== undefined && bucket.hits.length > 0) bucket.hits.pop();
  }
}

/** Test and dev helper: forgets every bucket. */
export function resetRateLimit(): void {
  buckets.clear();
  checksSinceSweep = 0;
}

// ---------------------------------------------------------------------------
// Conditional responses. A client polling live positions every few seconds
// gets the same bytes most of the time, because the origin feed only moves
// every ~30 s. A validator lets it skip both the download and the re-render.
// ---------------------------------------------------------------------------

const NO_STORE = "no-store, max-age=0";

/** Strong validator over the exact bytes we would send, so 304 is never a lie. */
export function etagOf(payload: string): string {
  return `"${createHash("sha1").update(payload).digest("base64url")}"`;
}

/** If-None-Match may carry a list, weak prefixes or the wildcard. */
function etagMatches(header: string | null, etag: string): boolean {
  if (header === null) return false;
  const value = header.trim();
  if (value.length === 0) return false;
  if (value === "*") return true;
  for (const candidate of value.split(",")) {
    if (candidate.trim().replace(/^W\//, "") === etag) return true;
  }
  return false;
}

/**
 * 304 when the client already holds this body, the body itself otherwise.
 * `payload` must be the serialised response: the validator covers what we send.
 */
export function conditionalJson(
  request: Request,
  payload: string,
  /** Rules to refund when the answer is a 304: it cost nothing, so it is free. */
  refundRules?: readonly RateRule[],
): Response {
  const etag = etagOf(payload);
  if (etagMatches(request.headers.get("if-none-match"), etag)) {
    if (refundRules !== undefined) refundRateLimit(request, refundRules);
    // RFC 9110: no body, and the validator so the client can keep using it.
    return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": NO_STORE } });
  }
  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": NO_STORE,
      ETag: etag,
    },
  });
}
