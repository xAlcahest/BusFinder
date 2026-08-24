"use client";

/**
 * Service alerts, reusable outside /alerts.
 *
 * `AlertsForContext` is deliberately self-contained: give it a line or a stop
 * and it fetches, filters, validates and renders on its own, so any screen can
 * drop it in with one line and no extra wiring. The /alerts page reuses the
 * validation, the labels and the card from here so there is a single copy.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import LineBadge from "@/components/LineBadge";
import { IconAlert, IconChevronRight } from "@/components/Icons";
import { formatDateTime } from "@/lib/format";
import { activeDictionary, useT } from "@/lib/i18n";
import type { AlertsResponse, RouteSummary, ServiceAlert } from "@/lib/types";

// ---------------------------------------------------------------------------
// Response validation: the API is external input like any other.
// ---------------------------------------------------------------------------

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseRoute(raw: unknown): RouteSummary | null {
  if (!isRecord(raw)) return null;
  const routeId = asString(raw.routeId);
  const shortName = asString(raw.shortName);
  if (routeId === null || shortName === null) return null;
  return {
    routeId,
    shortName,
    longName: asString(raw.longName),
    routeType: asNumber(raw.routeType) ?? 3,
    color: asString(raw.color),
    textColor: asString(raw.textColor),
  };
}

function parseAlert(raw: unknown, index: number): ServiceAlert | null {
  if (!isRecord(raw)) return null;
  const header = asString(raw.header);
  const description = asString(raw.description);
  if (header === null && description === null) return null;
  return {
    id: asString(raw.id) ?? `alert-${index}`,
    header: header ?? activeDictionary().alerts.fallbackHeader,
    description: description ?? "",
    url: asString(raw.url),
    cause: asString(raw.cause),
    effect: asString(raw.effect),
    activeFrom: asNumber(raw.activeFrom),
    activeUntil: asNumber(raw.activeUntil),
    affectedRoutes: Array.isArray(raw.affectedRoutes)
      ? raw.affectedRoutes.map(parseRoute).filter((route): route is RouteSummary => route !== null)
      : [],
    affectedStopIds: Array.isArray(raw.affectedStopIds)
      ? raw.affectedStopIds.map(asString).filter((stopId): stopId is string => stopId !== null)
      : [],
  };
}

export function parseAlertsResponse(raw: unknown): AlertsResponse | null {
  if (!isRecord(raw) || !Array.isArray(raw.alerts)) return null;
  return {
    alerts: raw.alerts.map(parseAlert).filter((alert): alert is ServiceAlert => alert !== null),
    feedTimestamp: asNumber(raw.feedTimestamp),
    // Anything other than an explicit false is treated as degraded, so we never
    // present possibly stale alerts as live.
    degraded: raw.degraded !== false,
  };
}

// ---------------------------------------------------------------------------
// Labels for the GTFS-RT enums. The codes are the feed's; the words are ours.
// ---------------------------------------------------------------------------

/** Severe effects earn the red treatment; a detour is only a warning. */
const SEVERE_EFFECTS: ReadonlySet<string> = new Set([
  "NO_SERVICE",
  "SIGNIFICANT_DELAYS",
  "REDUCED_SERVICE",
]);

export function effectLabel(effect: string | null): string | null {
  if (effect === null) return null;
  return activeDictionary().alerts.effect(effect) ?? effect;
}

export function causeLabel(cause: string | null): string | null {
  if (cause === null) return null;
  return activeDictionary().alerts.cause(cause) ?? cause;
}

export function windowLabel(from: number | null, until: number | null): string {
  const t = activeDictionary();
  if (from !== null && until !== null) {
    return t.alerts.windowBetween(formatDateTime(from), formatDateTime(until));
  }
  if (from !== null) return t.alerts.windowFrom(formatDateTime(from));
  if (until !== null) return t.alerts.windowUntil(formatDateTime(until));
  return t.alerts.windowUnknown;
}

/** Everything the free-text filter searches, lowercased once per alert. */
export function searchTextOf(alert: ServiceAlert): string {
  const parts = [alert.header, alert.description, effectLabel(alert.effect) ?? "", causeLabel(alert.cause) ?? ""];
  for (const route of alert.affectedRoutes) {
    parts.push(route.shortName);
    if (route.longName !== null) parts.push(route.longName);
  }
  return parts.join(" ").toLowerCase();
}

// ---------------------------------------------------------------------------
// One alert, collapsed by default: the feed carries ~56 KB of prose.
// ---------------------------------------------------------------------------

export interface AlertCardProps {
  alert: ServiceAlert;
  /** Route already named by the surrounding section, hidden from "altre linee". */
  contextRouteId?: string | null;
  /** Open the description without a tap. Only sensible for a short list. */
  defaultOpen?: boolean;
}

export function AlertCard({ alert, contextRouteId = null, defaultOpen = false }: AlertCardProps) {
  const t = useT();
  const effect = effectLabel(alert.effect);
  const cause = causeLabel(alert.cause);
  const severe = alert.effect !== null && SEVERE_EFFECTS.has(alert.effect);
  const others = alert.affectedRoutes.filter((route) => route.routeId !== contextRouteId);
  const hasBody = alert.description.length > 0;

  return (
    <details
      open={defaultOpen}
      className="group rounded-card border border-line bg-surface shadow-card [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-start gap-2.5 px-4 py-3.5">
        <span
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${severe ? "text-danger" : "text-late"}`}
        >
          <IconAlert size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-semibold leading-snug">{alert.header}</span>
          {effect !== null ? (
            <span
              className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide ${
                severe ? "bg-danger-soft text-danger" : "bg-late-soft text-late"
              }`}
            >
              {effect}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-muted transition-transform group-open:rotate-90"
        >
          <IconChevronRight size={16} />
        </span>
      </summary>

      <div className="border-t border-line px-4 py-3">
        {hasBody ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{alert.description}</p>
        ) : (
          <p className="text-sm text-muted">{t.alerts.noDetail}</p>
        )}

        <p className="mt-2.5 text-xs text-muted">{windowLabel(alert.activeFrom, alert.activeUntil)}</p>

        {cause !== null || alert.affectedStopIds.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {cause !== null ? (
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-medium text-muted">
                {cause}
              </span>
            ) : null}
            {alert.affectedStopIds.length > 0 ? (
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-medium text-muted">
                {t.stops.involved(alert.affectedStopIds.length)}
              </span>
            ) : null}
          </p>
        ) : null}

        {others.length > 0 ? (
          <div className="mt-2.5">
            <p className="text-xs text-muted">
              {contextRouteId === null ? t.alerts.affectedLines : t.alerts.alsoOn}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {others.slice(0, 12).map((route) => (
                <Link key={route.routeId} href={`/line/${encodeURIComponent(route.routeId)}`}>
                  <LineBadge
                    shortName={route.shortName}
                    routeType={route.routeType}
                    color={route.color}
                    textColor={route.textColor}
                    size="sm"
                  />
                </Link>
              ))}
              {others.length > 12 ? (
                <span className="self-center text-xs text-muted">+{others.length - 12}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        {alert.url !== null ? (
          <a
            href={alert.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-2"
          >
            {t.alerts.operatorLink}
          </a>
        ) : null}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Fetching, shared by /alerts and by every screen that embeds the component
// ---------------------------------------------------------------------------

export interface AlertsFeed {
  status: "loading" | "ready" | "error";
  data: AlertsResponse | null;
  error: string | null;
  /** Epoch ms of the last successful response. */
  fetchedAt: number | null;
  reload: () => void;
}

const DEFAULT_REFRESH_MS = 60_000;
/** Backstop for a socket that stalls without failing (phone losing signal). */
const REQUEST_TIMEOUT_MS = 20_000;

export interface AlertsFeedOptions {
  /** False keeps the hook inert: no request, no timer. */
  enabled?: boolean;
  refreshMs?: number;
}

/**
 * Polls /api/alerts. `routeId` uses the server-side filter, which is far
 * cheaper than shipping the whole feed to filter it in the browser.
 */
export function useAlertsFeed(routeId: string | null, options: AlertsFeedOptions = {}): AlertsFeed {
  const { enabled = true, refreshMs = DEFAULT_REFRESH_MS } = options;
  const [tick, setTick] = useState(0);
  const [status, setStatus] = useState<AlertsFeed["status"]>("loading");
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || refreshMs <= 0) return;
    const id = window.setInterval(() => setTick((value) => value + 1), refreshMs);
    return () => window.clearInterval(id);
  }, [enabled, refreshMs]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let cancelled = false;
    let timedOut = false;
    const guard = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    const url =
      routeId === null || routeId.length === 0
        ? "/api/alerts"
        : `/api/alerts?routeId=${encodeURIComponent(routeId)}`;

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const detail = isRecord(body) ? asString(body.error) : null;
          throw new Error(detail ?? activeDictionary().errors.httpStatus(res.status));
        }
        const parsed = parseAlertsResponse(body);
        if (parsed === null) throw new Error(activeDictionary().errors.badResponse);
        if (cancelled) return;
        setData(parsed);
        setError(null);
        setStatus("ready");
        setFetchedAt(Date.now());
      } catch (err) {
        if (cancelled) return;
        if (controller.signal.aborted && !timedOut) return;
        const words = activeDictionary().errors;
        const message = timedOut
          ? words.timedOut
          : err instanceof TypeError
            ? words.offline
            : err instanceof Error
              ? err.message
              : words.unexpected;
        setError(message);
        setStatus("error");
      } finally {
        window.clearTimeout(guard);
      }
    };

    void load();
    return () => {
      cancelled = true;
      window.clearTimeout(guard);
      controller.abort();
    };
  }, [enabled, routeId, tick]);

  return { status, data, error, fetchedAt, reload };
}

// ---------------------------------------------------------------------------
// The embeddable block
// ---------------------------------------------------------------------------

const EMBEDDED_REFRESH_MS = 300_000;

/** Higher sorts first: this exact stop beats a line-wide notice. */
function relevance(alert: ServiceAlert, stopId: string): number {
  let score = 0;
  if (alert.affectedStopIds.includes(stopId)) score += 4;
  if (alert.effect !== null && SEVERE_EFFECTS.has(alert.effect)) score += 2;
  if (alert.description.length > 0) score += 1;
  return score;
}

export interface AlertsForContextProps {
  /** A line: filtered by the API, so only its alerts come down the wire. */
  routeId?: string | null;
  /** A stop: matched against the stops the feed names explicitly. */
  stopId?: string | null;
  /** Lines calling at that stop, so a rider also sees line-wide disruptions. */
  routeIds?: readonly string[];
  className?: string;
}

/**
 * Alerts that concern one line or one stop. Renders nothing at all when there
 * is nothing to say, so it is safe to mount unconditionally on any screen.
 */
export default function AlertsForContext({
  routeId = null,
  stopId = null,
  routeIds,
  className = "",
}: AlertsForContextProps) {
  const t = useT();
  const byRoute = typeof routeId === "string" && routeId.length > 0 ? routeId : null;
  const byStop = typeof stopId === "string" && stopId.length > 0 ? stopId : null;
  const scoped = byRoute !== null || byStop !== null;

  // A secondary block on someone else's screen: poll slowly, alerts move in hours.
  const feed = useAlertsFeed(byRoute, { enabled: scoped, refreshMs: EMBEDDED_REFRESH_MS });

  // The stop case has no server-side filter: keep the alerts that name this
  // stop or one of the lines calling at it.
  const lineSet = useMemo(() => new Set(routeIds ?? []), [routeIds]);
  const alerts = useMemo(() => {
    const all = feed.data?.alerts ?? [];
    if (byRoute !== null) return all;
    if (byStop === null) return [];
    const matching = all.filter(
      (alert) =>
        alert.affectedStopIds.includes(byStop) ||
        alert.affectedRoutes.some((route) => lineSet.has(route.routeId)),
    );
    // An interchange can match twenty alerts: the ones naming this stop, then
    // the severe ones, are what the rider needs in the first few slots.
    return matching.sort((a, b) => relevance(b, byStop) - relevance(a, byStop));
  }, [feed.data, byRoute, byStop, lineSet]);

  if (!scoped) return null;

  const failed = feed.status === "error";

  // Only take over the slot when there is nothing to show: a transient error
  // must not hide alerts we already fetched.
  if (failed && alerts.length === 0) {
    return (
      <p className={`flex flex-wrap items-center gap-2 text-xs text-muted ${className}`}>
        <span>{t.alerts.contextUnavailable(feed.error ?? "")}</span>
        <button
          type="button"
          onClick={feed.reload}
          className="font-semibold text-accent underline underline-offset-2"
        >
          {t.common.retry}
        </button>
      </p>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <section
      aria-label={t.alerts.contextAria}
      className={`rounded-card border border-late bg-late-soft/40 p-3 ${className}`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span aria-hidden="true" className="text-late">
          <IconAlert size={17} />
        </span>
        <h2 className="flex-1 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-late">
          {t.alerts.contextHeading(alerts.length)}
        </h2>
        <Link
          href="/alerts"
          className="text-xs font-semibold text-muted underline underline-offset-2"
        >
          {t.alerts.contextAll}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.slice(0, 6).map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            contextRouteId={byRoute}
            defaultOpen={alerts.length === 1}
          />
        ))}
      </div>

      {alerts.length > 6 ? (
        <p className="mt-2 text-xs text-muted">
          {t.alerts.contextMore(alerts.length - 6)}
          <Link href="/alerts" className="font-semibold underline underline-offset-2">
            {t.alerts.contextMoreLink}
          </Link>
          .
        </p>
      ) : null}

      {failed ? (
        <p className="mt-2 text-xs text-muted">{t.alerts.contextStale(feed.error ?? "")}</p>
      ) : null}
    </section>
  );
}
