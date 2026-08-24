"use client";

/**
 * Client-side access to our own API: strict runtime validation plus a small
 * fetch hook. Nothing here trusts the wire format.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { activeDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import type {
  Arrival,
  ArrivalSource,
  ArrivalsResponse,
  RouteSummary,
  SearchResponse,
  Stop,
  StopWithRoutes,
  TimetableEntry,
  TimetableResponse,
} from "@/lib/types";

// --- primitive guards -------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Keeps only the items a parser accepts, so one bad row cannot blank a screen. */
function parseArray<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    const parsed = parse(item);
    if (parsed !== null) out.push(parsed);
  }
  return out;
}

// --- domain parsers ---------------------------------------------------------

export function parseRouteSummary(raw: unknown): RouteSummary | null {
  if (!isRecord(raw)) return null;
  const routeId = asNonEmptyString(raw.routeId);
  const shortName = asString(raw.shortName);
  const routeType = asFiniteNumber(raw.routeType);
  if (routeId === null || shortName === null || routeType === null) return null;
  return {
    routeId,
    shortName,
    longName: asNullableString(raw.longName),
    routeType,
    color: asNullableString(raw.color),
    textColor: asNullableString(raw.textColor),
  };
}

export function parseStop(raw: unknown): Stop | null {
  if (!isRecord(raw)) return null;
  const stopId = asNonEmptyString(raw.stopId);
  const stopName = asString(raw.stopName);
  const lat = asFiniteNumber(raw.lat);
  const lon = asFiniteNumber(raw.lon);
  if (stopId === null || stopName === null || lat === null || lon === null) return null;
  return {
    stopId,
    stopCode: asNullableString(raw.stopCode),
    stopName,
    lat,
    lon,
    wheelchair: asNullableNumber(raw.wheelchair),
  };
}

function parseStopWithRoutes(raw: unknown): StopWithRoutes | null {
  const stop = parseStop(raw);
  if (stop === null || !isRecord(raw)) return null;
  return { ...stop, routes: parseArray(raw.routes, parseRouteSummary) };
}

function parseArrivalSource(raw: unknown): ArrivalSource | null {
  return raw === "realtime" || raw === "scheduled" ? raw : null;
}

function parseArrival(raw: unknown): Arrival | null {
  if (!isRecord(raw)) return null;
  const tripId = asNonEmptyString(raw.tripId);
  const routeId = asNonEmptyString(raw.routeId);
  const routeShortName = asString(raw.routeShortName);
  const routeType = asFiniteNumber(raw.routeType);
  const arrivalTime = asFiniteNumber(raw.arrivalTime);
  const minutesAway = asFiniteNumber(raw.minutesAway);
  const source = parseArrivalSource(raw.source);
  if (
    tripId === null ||
    routeId === null ||
    routeShortName === null ||
    routeType === null ||
    arrivalTime === null ||
    minutesAway === null ||
    source === null
  ) {
    return null;
  }
  return {
    tripId,
    routeId,
    routeShortName,
    routeType,
    routeColor: asNullableString(raw.routeColor),
    headsign: asString(raw.headsign) ?? "",
    arrivalTime,
    minutesAway,
    delaySec: asNullableNumber(raw.delaySec),
    source,
    vehicleId: asNullableString(raw.vehicleId),
    skipped: asBoolean(raw.skipped, false),
  };
}

export function parseArrivalsResponse(raw: unknown): ArrivalsResponse | null {
  if (!isRecord(raw)) return null;
  const stop = parseStopWithRoutes(raw.stop);
  if (stop === null) return null;
  return {
    stop,
    arrivals: parseArray(raw.arrivals, parseArrival),
    feedTimestamp: asNullableNumber(raw.feedTimestamp),
    degraded: asBoolean(raw.degraded, false),
    generatedAt: asFiniteNumber(raw.generatedAt) ?? Math.floor(Date.now() / 1000),
  };
}

export function parseSearchResponse(raw: unknown): SearchResponse | null {
  if (!isRecord(raw)) return null;
  const query = asString(raw.query);
  if (query === null) return null;
  return {
    query,
    stops: parseArray(raw.stops, parseStop),
    routes: parseArray(raw.routes, parseRouteSummary),
  };
}

function parseTimetableEntry(raw: unknown): TimetableEntry | null {
  if (!isRecord(raw)) return null;
  const tripId = asNonEmptyString(raw.tripId);
  const routeId = asNonEmptyString(raw.routeId);
  const routeShortName = asString(raw.routeShortName);
  const routeType = asFiniteNumber(raw.routeType);
  const departureSec = asFiniteNumber(raw.departureSec);
  const departureLabel = asNonEmptyString(raw.departureLabel);
  if (
    tripId === null ||
    routeId === null ||
    routeShortName === null ||
    routeType === null ||
    departureSec === null ||
    departureLabel === null
  ) {
    return null;
  }
  return {
    tripId,
    routeId,
    routeShortName,
    routeType,
    headsign: asString(raw.headsign) ?? "",
    departureSec,
    departureLabel,
  };
}

export function parseTimetableResponse(raw: unknown): TimetableResponse | null {
  if (!isRecord(raw)) return null;
  const stop = parseStop(raw.stop);
  const date = asNonEmptyString(raw.date);
  if (stop === null || date === null) return null;
  return {
    stop,
    date,
    routes: parseArray(raw.routes, parseRouteSummary),
    entries: parseArray(raw.entries, parseTimetableEntry),
  };
}

// --- fetching ---------------------------------------------------------------

export type ResourceState = "loading" | "refreshing" | "ready" | "error";

export interface Resource<T> {
  data: T | null;
  error: string | null;
  state: ResourceState;
  /**
   * Epoch ms of our last successful response. This is the age of our own HTTP
   * call, never the age of the upstream feed: do not show it as data freshness.
   */
  fetchedAt: number | null;
  /** True when we are showing data older than the last attempt. */
  stale: boolean;
}

function messageFor(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return activeDictionary().errors.unexpected;
}

type ErrorWords = Dictionary["errors"];

/** The server writes its sentences in Italian, so they are logged, never shown. */
function logServerError(raw: unknown, status: number, url: string): void {
  if (!isRecord(raw)) return;
  const error = asNonEmptyString(raw.error);
  const detail = asNonEmptyString(raw.detail);
  if (error === null && detail === null) return;
  console.warn("[api]", status, url, error ?? "", detail ?? "");
}

/** A 404 means different things per endpoint, and only the path tells us which. */
function notFoundMessage(url: string, words: ErrorWords, detail: string | null): string {
  const query = url.indexOf("?");
  const path = query === -1 ? url : url.slice(0, query);
  if (path.includes("/api/line/")) return words.lineNotFound;
  if (path.includes("/api/journey")) {
    // The route names the missing endpoint with a slug; anything else is an
    // older server, so fall back to wording that does not claim which one.
    if (detail === "origin") return `${words.journeyOriginNotFound}. ${words.journeyPlaceHint}`;
    if (detail === "destination") {
      return `${words.journeyDestinationNotFound}. ${words.journeyPlaceHint}`;
    }
    return `${words.requestFailed(404)}. ${words.journeyPlaceHint}`;
  }
  return words.stopNotFound;
}

/**
 * Message for a failed API call, always in the UI language. The body's own
 * wording is technical detail for the console: the server has no idea which
 * language the reader picked, so it cannot be put on screen.
 */
function httpMessage(raw: unknown, status: number, url: string): string {
  logServerError(raw, status, url);
  const words = activeDictionary().errors;
  if (status === 400) return words.badRequest;
  if (status === 404) {
    return notFoundMessage(url, words, isRecord(raw) ? asNonEmptyString(raw.detail) : null);
  }
  if (status === 429) return words.tooManyRequests;
  if (status >= 500) return words.serviceDown;
  return words.requestFailed(status);
}

const INITIAL: Resource<never> = {
  data: null,
  error: null,
  state: "loading",
  fetchedAt: null,
  stale: false,
};

/**
 * Cap on concurrent requests from one tab: the home screen renders one card
 * per favourite (up to 200) and they all refresh on the same nonce.
 */
const MAX_CONCURRENT_REQUESTS = 6;
/** Backstop for a socket that stalls without failing, so a slot always frees. */
const REQUEST_TIMEOUT_MS = 20_000;

let activeRequests = 0;
const waiting: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests += 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    waiting.push(resolve);
  });
}

/** Hands the slot straight to the next waiter, so the count cannot drift. */
function releaseSlot(): void {
  const next = waiting.shift();
  if (next === undefined) {
    activeRequests -= 1;
    return;
  }
  next();
}

/**
 * Fetches `url` on mount and whenever `nonce` changes. Aborts in flight
 * requests on unmount or url change; never throws to the caller.
 */
export function useJsonResource<T>(
  url: string | null,
  parse: (raw: unknown) => T | null,
  nonce: number,
): Resource<T> {
  const [resource, setResource] = useState<Resource<T>>(
    url === null ? { ...INITIAL, state: "ready" } : INITIAL,
  );
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    if (url === null) {
      setResource({ data: null, error: null, state: "ready", fetchedAt: null, stale: false });
      return;
    }
    const controller = new AbortController();
    let active = true;

    setResource((prev) => ({
      ...prev,
      state: prev.data === null ? "loading" : "refreshing",
    }));

    void (async () => {
      await acquireSlot();
      let timedOut = false;
      const guard = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
      try {
        // Unmounted or superseded while queued: never open the socket at all.
        if (!active) return;
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        const body: unknown = await response.json().catch(() => null);
        if (!active) return;
        if (!response.ok) throw new Error(httpMessage(body, response.status, url));
        const parsed = parseRef.current(body);
        if (parsed === null) throw new Error(activeDictionary().errors.badResponse);
        setResource({
          data: parsed,
          error: null,
          state: "ready",
          fetchedAt: Date.now(),
          stale: false,
        });
      } catch (error) {
        if (!active) return;
        if (controller.signal.aborted && !timedOut) return;
        const words = activeDictionary().errors;
        const message = timedOut
          ? words.timedOut
          : error instanceof TypeError
            ? words.offline
            : messageFor(error);
        setResource((prev) => ({
          data: prev.data,
          error: message,
          state: "error",
          fetchedAt: prev.fetchedAt,
          stale: prev.data !== null,
        }));
      } finally {
        clearTimeout(guard);
        releaseSlot();
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [url, nonce]);

  return resource;
}

// --- live polling (vehicle positions) ---------------------------------------

/**
 * Default cadence for live positions. The value is latency, not freshness: the
 * origin feed only moves every ~30 s and our server serves every client from
 * one snapshot of it, so most of these requests answer 304. What shrinks is the
 * gap between the snapshot updating and the map showing it.
 */
export const VEHICLE_POLL_INTERVAL_MS = 4_000;
export const VEHICLE_POLL_MIN_MS = 3_000;
export const VEHICLE_POLL_MAX_MS = 60_000;
/** Ceiling on backoff, so a dead endpoint is still retried once a minute. */
const LIVE_BACKOFF_CAP_MS = 60_000;
/** Shorter than the shared one: a poller on a few seconds cannot wait 20 s. */
const LIVE_REQUEST_TIMEOUT_MS = 8_000;
/** Upper bound on an obeyed Retry-After, in case an intermediary sends a wild one. */
const LIVE_MAX_RETRY_AFTER_MS = 300_000;

export interface LiveStats {
  /** Requests that reached a response, 304s and 429s included. */
  requests: number;
  /** Responses whose payload matched what we already held. */
  unchanged: number;
  /** Responses that carried a different payload. */
  changed: number;
  errors: number;
  throttled: number;
}

export interface LiveResource<T> extends Resource<T> {
  /**
   * Bumps only when the payload actually changed. `data` keeps its identity
   * across unchanged polls, so an effect keyed on it will not re-run.
   */
  revision: number;
  /** Delay before the next poll; grows while backing off. */
  intervalMs: number;
  stats: LiveStats;
  /** Polls now, unless one is already in flight. */
  refresh: () => void;
}

export interface LiveOptions {
  /** Clamped to 3-60 s. Defaults to 4 s. */
  intervalMs?: number;
  /** False parks the poller and clears the data, for a hidden panel. */
  enabled?: boolean;
}

const EMPTY_STATS: LiveStats = { requests: 0, unchanged: 0, changed: 0, errors: 0, throttled: 0 };

function idleLive<T>(state: ResourceState, refresh: () => void): LiveResource<T> {
  return {
    data: null,
    error: null,
    state,
    fetchedAt: null,
    stale: false,
    revision: 0,
    intervalMs: VEHICLE_POLL_INTERVAL_MS,
    stats: EMPTY_STATS,
    refresh,
  };
}

/** Read through a call so the check is never narrowed away by an earlier one. */
function tabHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

function clampMs(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Half jitter: never below half the target, so a fleet cannot resynchronise. */
function backoffMs(failures: number, baseMs: number): number {
  const target = Math.min(LIVE_BACKOFF_CAP_MS, baseMs * 2 ** Math.min(failures, 10));
  return Math.round(target / 2 + Math.random() * (target / 2));
}

/** Retry-After is delta-seconds or an HTTP-date; both are honoured verbatim. */
function retryAfterMs(raw: string | null): number | null {
  if (raw === null) return null;
  const value = raw.trim();
  if (value.length === 0) return null;
  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    if (!Number.isFinite(seconds)) return null;
    return clampMs(seconds * 1000, 1000, LIVE_MAX_RETRY_AFTER_MS);
  }
  const at = Date.parse(value);
  if (Number.isNaN(at)) return null;
  return clampMs(at - Date.now(), 1000, LIVE_MAX_RETRY_AFTER_MS);
}

/**
 * Self-scheduling poller for data that changes faster than a page refresh.
 * Differences from useJsonResource, all of them deliberate:
 *
 * - it drives its own timer instead of taking a nonce, so it can slow itself
 *   down on 429 and on failure without the caller knowing;
 * - it sends If-None-Match and treats a 304, or a body identical to the last
 *   one, as "nothing to do": `data` keeps its identity and `revision` stands;
 * - it never has two requests in flight, it stops entirely while the tab is
 *   hidden, and it re-arms in a finally so no outcome can strand the loop.
 */
export function useLiveResource<T>(
  url: string | null,
  parse: (raw: unknown) => T | null,
  options: LiveOptions = {},
): LiveResource<T> {
  const baseMs = clampMs(
    options.intervalMs ?? VEHICLE_POLL_INTERVAL_MS,
    VEHICLE_POLL_MIN_MS,
    VEHICLE_POLL_MAX_MS,
  );
  const enabled = options.enabled ?? true;
  const idle = url === null || !enabled;

  const kickRef = useRef<() => void>(() => undefined);
  const refresh = useCallback(() => {
    kickRef.current();
  }, []);
  const [resource, setResource] = useState<LiveResource<T>>(() =>
    idleLive<T>(idle ? "ready" : "loading", refresh),
  );
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    if (url === null || !enabled) {
      kickRef.current = () => undefined;
      setResource(idleLive<T>("ready", refresh));
      return;
    }

    let active = true;
    let timer: number | null = null;
    let inFlight = false;
    let inFlightController: AbortController | null = null;
    let parked = false;
    let failures = 0;
    let revision = 0;
    let etag: string | null = null;
    let bodyText: string | null = null;
    let held: T | null = null;
    const stats: LiveStats = { requests: 0, unchanged: 0, changed: 0, errors: 0, throttled: 0 };

    setResource(idleLive<T>("loading", refresh));

    const schedule = (delayMs: number): void => {
      if (!active) return;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        void run();
      }, Math.max(0, delayMs));
    };

    const publish = (patch: Partial<LiveResource<T>>): void => {
      if (!active) return;
      setResource((prev) => ({ ...prev, ...patch, stats: { ...stats }, refresh }));
    };

    const run = async (): Promise<void> => {
      if (!active || inFlight) return;
      // Hidden tab: park without a timer, the visibility listener restarts us.
      if (tabHidden()) {
        parked = true;
        return;
      }
      parked = false;
      inFlight = true;
      let nextDelayMs = baseMs;
      // No shared slot queue here: this poller is single-flight by construction,
      // and waiting behind the arrivals fan-out would defeat the whole point.
      const controller = new AbortController();
      inFlightController = controller;
      let timedOut = false;
      const guard = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, LIVE_REQUEST_TIMEOUT_MS);
      try {
        const headers: Record<string, string> = { accept: "application/json" };
        if (etag !== null) headers["if-none-match"] = etag;
        const response = await fetch(url, { signal: controller.signal, cache: "no-store", headers });
        if (!active) return;
        stats.requests += 1;

        if (response.status === 429) {
          await response.text().catch(() => "");
          stats.throttled += 1;
          failures += 1;
          // Retry-After is a floor, not a target: obeying a value below our own
          // cadence would make being throttled poll faster than not being.
          const after = retryAfterMs(response.headers.get("retry-after"));
          nextDelayMs = after === null ? backoffMs(failures, baseMs) : Math.max(baseMs, after);
          publish({
            error: activeDictionary().errors.tooManyRequests,
            state: "error",
            stale: held !== null,
            intervalMs: nextDelayMs,
          });
          return;
        }

        if (response.status === 304) {
          // A 304 carries no body, so there is nothing to drain.
          stats.unchanged += 1;
          failures = 0;
          publish({ error: null, state: "ready", fetchedAt: Date.now(), stale: false, intervalMs: baseMs });
          return;
        }

        const text = await response.text();
        if (!active) return;
        if (!response.ok) {
          let body: unknown = null;
          try {
            body = JSON.parse(text) as unknown;
          } catch {
            body = null;
          }
          throw new Error(httpMessage(body, response.status, url));
        }

        failures = 0;
        const nextEtag = response.headers.get("etag");
        if (nextEtag !== null) etag = nextEtag;

        // Same bytes as last time: keep the parsed object, and its identity.
        if (held !== null && text === bodyText) {
          stats.unchanged += 1;
          publish({ error: null, state: "ready", fetchedAt: Date.now(), stale: false, intervalMs: baseMs });
          return;
        }

        let raw: unknown;
        try {
          raw = JSON.parse(text) as unknown;
        } catch {
          throw new Error(activeDictionary().errors.badResponse);
        }
        const parsed = parseRef.current(raw);
        if (parsed === null) throw new Error(activeDictionary().errors.badResponse);

        bodyText = text;
        held = parsed;
        revision += 1;
        stats.changed += 1;
        publish({
          data: parsed,
          error: null,
          state: "ready",
          fetchedAt: Date.now(),
          stale: false,
          revision,
          intervalMs: baseMs,
        });
      } catch (error) {
        if (!active) return;
        // Aborted by us on unmount, not a failure worth reporting or counting.
        if (controller.signal.aborted && !timedOut) return;
        stats.errors += 1;
        failures += 1;
        nextDelayMs = backoffMs(failures, baseMs);
        const words = activeDictionary().errors;
        const message = timedOut
          ? words.timedOut
          : error instanceof TypeError
            ? words.offline
            : messageFor(error);
        publish({ error: message, state: "error", stale: held !== null, intervalMs: nextDelayMs });
      } finally {
        window.clearTimeout(guard);
        inFlight = false;
        if (inFlightController === controller) inFlightController = null;
        // Always re-arm. A poller that stops rescheduling looks like fresh data
        // that simply never changes, which is the worst failure mode here.
        if (!active) {
          // unmounted or superseded: nothing to arm
        } else if (tabHidden()) {
          parked = true;
        } else {
          schedule(nextDelayMs);
        }
      }
    };

    const kick = (): void => {
      if (!active) return;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      void run();
    };
    kickRef.current = kick;

    const onVisible = (): void => {
      if (!active || tabHidden()) return;
      if (!parked || inFlight) return;
      parked = false;
      kick();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    kick();

    return () => {
      active = false;
      kickRef.current = () => undefined;
      if (timer !== null) window.clearTimeout(timer);
      inFlightController?.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [url, baseMs, enabled, refresh]);

  return resource;
}

/**
 * Live vehicle positions: useLiveResource with the vehicle cadence. Arrivals
 * stay on usePoll and useJsonResource; only positions need seconds.
 */
export function useVehiclePoll<T>(
  url: string | null,
  parse: (raw: unknown) => T | null,
  options: LiveOptions = {},
): LiveResource<T> {
  return useLiveResource(url, parse, {
    intervalMs: options.intervalMs ?? VEHICLE_POLL_INTERVAL_MS,
    enabled: options.enabled,
  });
}
