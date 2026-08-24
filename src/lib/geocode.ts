/**
 * Turning typed text into a point on the map.
 *
 * Two sources, in this order: our own stops table, and OpenStreetMap Nominatim
 * for everything that is an address rather than a stop.
 *
 * Nominatim is a free service run on donated hardware and its usage policy is
 * not advisory. What it demands, and what this module implements:
 *
 *   - at most one request per second, absolute, across the whole process;
 *   - a real User-Agent that identifies this application and a way to reach us;
 *   - aggressive caching, so the same query is never asked twice;
 *   - no bulk or automated harvesting.
 *
 * The throttle and the cache both live here, server-side, because a user typing
 * fast in the browser must not be able to turn us into an abusive client. When
 * the queue is already full we do not queue further: we answer from our own
 * stops instead. Being useless to one user beats being banned for everyone.
 */

import { normaliseSearch, searchStops } from "@/lib/queries";
import type { Stop } from "@/lib/types";

// ---------------------------------------------------------------------------
// Policy constants
// ---------------------------------------------------------------------------

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** One request per second is the published ceiling; 1.2 s leaves us clear of it. */
const MIN_REQUEST_GAP_MS = 1_200;
/** Requests already waiting for their turn. Past this we stop queueing. */
const MAX_QUEUE_DEPTH = 4;
const REQUEST_TIMEOUT_MS = 5_000;

/** Rome plus the ring road, as left,top,right,bottom. Nothing outside is us. */
const VIEWBOX = "12.23,42.06,12.72,41.71";

const CACHE_MAX_ENTRIES = 600;
const CACHE_TTL_MS = 24 * 3600 * 1000;
/** A miss is remembered too, but briefly: the index does get better. */
const NEGATIVE_TTL_MS = 15 * 60 * 1000;

const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 5;

/**
 * Nominatim wants to know who is calling and how to reach them. Deployments
 * should set PROBUS_CONTACT so a real address appears here.
 */
function userAgent(): string {
  const contact = process.env.PROBUS_CONTACT?.trim();
  const who = contact !== undefined && contact.length > 0 ? contact : "https://github.com/BusFinder";
  return `BusFinder/1.0 (unofficial Rome transit journey planner; ${who})`;
}

/** Set PROBUS_GEOCODING=off to run stop-to-stop only, with no outbound calls. */
function geocodingEnabled(): boolean {
  return process.env.PROBUS_GEOCODING?.trim().toLowerCase() !== "off";
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export type GeocodeSource = "stop" | "nominatim";

export interface GeocodeResult {
  name: string;
  /** Fuller address, when the source gives one. */
  label: string | null;
  lat: number;
  lon: number;
  source: GeocodeSource;
  /** Set only when the result is one of our own stops. */
  stopId: string | null;
  stopCode: string | null;
}

function fromStop(stop: Stop): GeocodeResult {
  return {
    name: stop.stopName,
    label: null,
    lat: stop.lat,
    lon: stop.lon,
    source: "stop",
    stopId: stop.stopId,
    stopCode: stop.stopCode,
  };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  results: GeocodeResult[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheGet(key: string, now: number): GeocodeResult[] | null {
  const entry = cache.get(key);
  if (entry === undefined) return null;
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  // Re-insert so the eviction order below is least-recently-used.
  cache.delete(key);
  cache.set(key, entry);
  return entry.results;
}

function cacheSet(key: string, results: GeocodeResult[], now: number): void {
  cache.set(key, {
    results,
    expiresAt: now + (results.length === 0 ? NEGATIVE_TTL_MS : CACHE_TTL_MS),
  });
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done === true) break;
    cache.delete(oldest.value);
  }
}

/** Test helper: forgets every cached answer. */
export function resetGeocodeCache(): void {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Throttle: one outbound request at a time, spaced by MIN_REQUEST_GAP_MS
// ---------------------------------------------------------------------------

let lastRequestAt = 0;
let queueDepth = 0;
/** Serialises callers; each link waits for the one before it. */
let chain: Promise<void> = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Runs `task` no sooner than MIN_REQUEST_GAP_MS after the previous one, with at
 * most MAX_QUEUE_DEPTH callers waiting. Returns null when the queue is full,
 * which the caller treats as "geocoding unavailable" and degrades.
 */
async function throttled<T>(task: () => Promise<T>): Promise<T | null> {
  if (queueDepth >= MAX_QUEUE_DEPTH) return null;
  queueDepth += 1;

  // Capture the current tail, then extend it: the next caller waits for us.
  const previous = chain;
  let release = (): void => undefined;
  chain = new Promise<void>((resolve) => {
    release = resolve;
  });

  try {
    await previous;
    const wait = lastRequestAt + MIN_REQUEST_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    return await task();
  } finally {
    queueDepth -= 1;
    release();
  }
}

// ---------------------------------------------------------------------------
// Nominatim
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Nominatim sends lat/lon as strings; anything else means we misread the feed. */
function coord(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function shorten(displayName: string): string {
  // "Piazza Venezia, Trevi, Municipio Roma I, Roma, Lazio, Italia" -> first two.
  const parts = displayName.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
  return parts.slice(0, 2).join(", ");
}

function parseNominatim(raw: unknown): GeocodeResult[] {
  if (!Array.isArray(raw)) return [];
  const out: GeocodeResult[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const lat = coord(item.lat, 41.5, 42.3);
    const lon = coord(item.lon, 12.0, 13.0);
    if (lat === null || lon === null) continue;
    const display = typeof item.display_name === "string" ? item.display_name : "";
    const name = typeof item.name === "string" && item.name.length > 0 ? item.name : shorten(display);
    if (name.length === 0) continue;
    out.push({
      name,
      label: display.length > 0 && display !== name ? display : null,
      lat,
      lon,
      source: "nominatim",
      stopId: null,
      stopCode: null,
    });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

async function askNominatim(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(MAX_RESULTS));
  url.searchParams.set("viewbox", VIEWBOX);
  url.searchParams.set("bounded", "1");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("accept-language", "it");

  const response = await fetch(url, {
    headers: { "User-Agent": userAgent(), Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Nominatim ha risposto ${response.status}`);
  const body: unknown = await response.json();
  return parseNominatim(body);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** "41.9028,12.4964" and friends. Returns null when the text is not a fix. */
export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const match = /^\s*(-?\d{1,3}(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/.exec(input);
  if (match === null) return null;
  const lat = Number(match[1]?.replace(",", "."));
  const lon = Number(match[2]?.replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

/**
 * Places matching `query`, best first. Our own stops always answer; Nominatim is
 * consulted only when the text does not already look like a stop we know, and
 * any failure there degrades silently to the stop matches.
 */
export async function geocode(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (trimmed.length < 2) return [];

  const stopMatches = searchStops(trimmed, MAX_RESULTS).map(fromStop);
  // An exact stop name is not worth an outbound request.
  const normalised = normaliseSearch(trimmed);
  const firstStop = stopMatches[0];
  if (firstStop !== undefined && normaliseSearch(firstStop.name) === normalised) return stopMatches;
  if (!geocodingEnabled()) return stopMatches;

  const now = Date.now();
  const cacheKey = normalised;
  const cached = cacheGet(cacheKey, now);
  if (cached !== null) return merge(cached, stopMatches);

  const fetched = await throttled(async () => {
    try {
      return await askNominatim(trimmed);
    } catch (cause) {
      // Never fatal: the stops table is a complete answer on its own.
      console.warn("[geocode] Nominatim non raggiungibile:", cause);
      return null;
    }
  });

  if (fetched === null) return stopMatches;
  cacheSet(cacheKey, fetched, Date.now());
  return merge(fetched, stopMatches);
}

/** Geocoded places first, then our stops, with no duplicate positions. */
function merge(places: GeocodeResult[], stops: GeocodeResult[]): GeocodeResult[] {
  const out: GeocodeResult[] = [...places];
  for (const stop of stops) {
    if (out.length >= MAX_RESULTS + 2) break;
    const duplicate = out.some(
      (held) => Math.abs(held.lat - stop.lat) < 0.0004 && Math.abs(held.lon - stop.lon) < 0.0005,
    );
    if (!duplicate) out.push(stop);
  }
  return out;
}

/** The single best interpretation of `query`, or null when there is none. */
export async function geocodeOne(query: string): Promise<GeocodeResult | null> {
  const results = await geocode(query);
  return results[0] ?? null;
}
