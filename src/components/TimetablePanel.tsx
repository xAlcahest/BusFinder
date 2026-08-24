"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LineBadge from "@/components/LineBadge";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconClock } from "@/components/Icons";
import { ListSkeleton } from "@/components/Skeleton";
import { parseTimetableResponse, useJsonResource } from "@/components/api";
import { useNow } from "@/components/hooks";
import type { RouteSummary, TimetableEntry } from "@/lib/types";
import { formatClock, formatSecOfDay, INTL_TAG, serviceDateFor } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export interface TimetablePanelProps {
  stopId: string;
  /** Lines calling here, from the arrivals payload: keeps the filter stable. */
  routes: RouteSummary[];
}

/** Rows per request. The API caps at 1000: stay well under it and paginate. */
const PAGE_SIZE = 250;
/** A stop can run past 30:00, so a service day is longer than 24 h. */
const MAX_SERVICE_SEC = 172_800;
/** Open a little before now, so the bus you are about to miss is still listed. */
const LOOKBEHIND_SEC = 900;
const DATE_PATTERN = /^\d{8}$/;

function dateFormatFor(locale: Locale): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Calendar maths on the YYYYMMDD service date, in UTC so DST cannot shift it. */
function shiftServiceDate(date: string, days: number): string {
  if (!DATE_PATTERN.test(date)) return date;
  const parsed = new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(4, 6)) - 1,
      Number(date.slice(6, 8)),
    ),
  );
  parsed.setUTCDate(parsed.getUTCDate() + days);
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${parsed.getUTCFullYear()}${month}${day}`;
}

function serviceDateLabel(date: string, locale: Locale): string {
  if (!DATE_PATTERN.test(date)) return date;
  const parsed = new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(4, 6)) - 1,
      Number(date.slice(6, 8)),
    ),
  );
  return dateFormatFor(locale).format(parsed);
}

/**
 * Seconds into the current service day, in Rome time: after midnight the
 * service day of 01:30 is the day before, so the value keeps counting past 24 h.
 */
function serviceSecNow(nowMs: number): number | null {
  const clock = formatClock(Math.floor(nowMs / 1000));
  const hours = Number(clock.slice(0, 2));
  const minutes = Number(clock.slice(3, 5));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const sec = hours * 3600 + minutes * 60;
  return hours < 4 ? sec + 86_400 : sec;
}

interface HourGroup {
  hour: number;
  label: string;
  entries: TimetableEntry[];
}

function groupByHour(entries: TimetableEntry[]): HourGroup[] {
  const groups = new Map<number, TimetableEntry[]>();
  for (const entry of entries) {
    const hour = Math.floor(entry.departureSec / 3600);
    const bucket = groups.get(hour);
    if (bucket === undefined) groups.set(hour, [entry]);
    else bucket.push(entry);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hour, list]) => ({
      hour,
      label: String(hour % 24).padStart(2, "0"),
      entries: list,
    }));
}

interface TimetableRunProps {
  stopId: string;
  date: string;
  routeId: string | null;
  /** Seconds of the service day this run starts from. */
  anchorSec: number;
  /** Rome seconds of the service day, null before hydration. */
  nowSec: number | null;
  isToday: boolean;
  onRestart: (anchorSec: number) => void;
}

/**
 * One forward run through a service day: fetches a page at a time with ?from=
 * and appends. Remounted (via key) whenever the day, the line or the starting
 * point changes, so the list can never stitch two disjoint windows together.
 */
function TimetableRun({
  stopId,
  date,
  routeId,
  anchorSec,
  nowSec,
  isToday,
  onRestart,
}: TimetableRunProps) {
  const t = useT();
  const [fromSec, setFromSec] = useState(anchorSec);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [done, setDone] = useState(false);
  const [retry, setRetry] = useState(0);

  const url =
    `/api/timetable/${encodeURIComponent(stopId)}?date=${encodeURIComponent(date)}` +
    (routeId === null ? "" : `&routeId=${encodeURIComponent(routeId)}`) +
    `&limit=${PAGE_SIZE}&from=${fromSec}`;

  const { data, error, state } = useJsonResource(url, parseTimetableResponse, retry);

  // Each page lands here; identical departures across page boundaries collapse.
  useEffect(() => {
    if (data === null || data.date !== date) return;
    const page = data.entries;
    setEntries((previous) => {
      const merged = new Map<string, TimetableEntry>();
      for (const entry of previous) merged.set(`${entry.tripId}|${entry.departureSec}`, entry);
      const before = merged.size;
      for (const entry of page) merged.set(`${entry.tripId}|${entry.departureSec}`, entry);
      if (merged.size === before) return previous;
      return [...merged.values()].sort(
        (a, b) => a.departureSec - b.departureSec || a.routeShortName.localeCompare(b.routeShortName),
      );
    });
    // A short page is the end of the service day.
    setDone(page.length < PAGE_SIZE);
  }, [data, date]);

  const groups = useMemo(() => groupByHour(entries), [entries]);
  const busy = state === "loading" || state === "refreshing";
  const last = entries.at(-1) ?? null;

  const loadMore = () => {
    if (last === null || busy) return;
    // Re-request the last second instead of stepping over it: several trips can
    // share it and the page boundary may cut through them.
    const next = Math.min(MAX_SERVICE_SEC, last.departureSec);
    if (next <= fromSec) {
      setDone(true);
      return;
    }
    setFromSec(next);
  };

  if (entries.length === 0) {
    if (busy) return <ListSkeleton rows={4} />;
    if (error !== null) {
      return (
        <ErrorState
          title={t.timetable.unavailableTitle}
          message={error}
          onRetry={() => setRetry((value) => value + 1)}
        />
      );
    }
    return (
      <EmptyState
        icon={<IconCalendar size={22} />}
        title={t.timetable.emptyTitle}
        hint={anchorSec > 0 ? t.timetable.emptyFromNow : t.timetable.emptyWholeDay}
        action={
          anchorSec > 0 ? (
            <button
              type="button"
              onClick={() => onRestart(0)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-on-accent"
            >
              <IconCalendar size={17} />
              {t.timetable.fromServiceStart}
            </button>
          ) : undefined
        }
      />
    );
  }

  const first = entries[0];
  const currentHour = nowSec === null ? null : Math.floor(nowSec / 3600);

  return (
    <>
      {error !== null ? (
        <ErrorState
          inline
          message={t.timetable.partialError(error)}
          onRetry={() => setRetry((value) => value + 1)}
          className="mb-3"
        />
      ) : null}

      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {groups.map((group) => {
          const live = isToday && currentHour === group.hour;
          return (
            <li key={group.hour} className="grid grid-cols-[3.25rem_1fr] gap-2 px-3 py-2.5 lg:py-2">
              <span
                className={`pt-1 text-end text-lg font-extrabold tabular-nums ${
                  live ? "text-accent" : "text-muted"
                }`}
              >
                {group.label}
              </span>
              <ul className="flex flex-col gap-1.5">
                {group.entries.map((entry) => (
                  <li
                    key={`${entry.tripId}-${entry.departureSec}`}
                    className="flex items-center gap-2.5"
                  >
                    <span className="w-7 shrink-0 text-sm font-bold tabular-nums">
                      {String(Math.floor(entry.departureSec / 60) % 60).padStart(2, "0")}
                    </span>
                    <LineBadge
                      shortName={entry.routeShortName}
                      routeType={entry.routeType}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted caps-data lg:overflow-visible lg:whitespace-normal">
                      {entry.headsign.length > 0 ? entry.headsign : t.common.dash}
                    </span>
                    <span className="sr-only">{entry.departureLabel}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      {done ? null : (
        <button
          type="button"
          onClick={loadMore}
          disabled={busy}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-60 disabled:hover:bg-surface"
        >
          {busy ? t.timetable.loadingMore : t.timetable.loadMore}
        </button>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted">
        {t.timetable.summary(
          entries.length,
          formatSecOfDay(first.departureSec),
          formatSecOfDay(last === null ? first.departureSec : last.departureSec),
          done,
        )}
      </p>
    </>
  );
}

export default function TimetablePanel({ stopId, routes }: TimetablePanelProps) {
  const t = useT();
  const locale = useLocale();
  const [date, setDate] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [anchorSec, setAnchorSec] = useState(0);
  const [anchorAtNow, setAnchorAtNow] = useState(true);
  const nowMs = useNow(60_000);

  const today = nowMs === null ? null : serviceDateFor(new Date(nowMs));
  const nowSec = nowMs === null ? null : serviceSecNow(nowMs);
  const startOfNow = nowSec === null ? 0 : Math.max(0, nowSec - LOOKBEHIND_SEC);

  // Today is only knowable on the client: keep SSR output deterministic, and
  // open the day where the rider is, not at the first night bus.
  useEffect(() => {
    const now = Date.now();
    const current = serviceSecNow(now);
    setDate(serviceDateFor(new Date(now)));
    setAnchorSec(current === null ? 0 : Math.max(0, current - LOOKBEHIND_SEC));
    setAnchorAtNow(true);
  }, []);

  const isToday = date !== null && date === today;
  const showJumpToNow = today !== null && (!isToday || !anchorAtNow);

  const goToDate = (next: string) => {
    setDate(next);
    setAnchorSec(0);
    setAnchorAtNow(false);
  };

  const goToNow = () => {
    if (today === null) return;
    setDate(today);
    setAnchorSec(startOfNow);
    setAnchorAtNow(true);
  };

  const restartAt = (sec: number) => {
    setAnchorSec(sec);
    setAnchorAtNow(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 rounded-card border border-line bg-surface p-2">
        <button
          type="button"
          onClick={() => {
            if (date !== null) goToDate(shiftServiceDate(date, -1));
          }}
          disabled={date === null}
          aria-label={t.timetable.previousDay}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconChevronLeft size={19} />
        </button>

        <p className="min-w-0 flex-1 text-center">
          <span className="block truncate text-sm font-bold first-letter:uppercase">
            {date === null ? t.common.dash : serviceDateLabel(date, locale)}
          </span>
          <span className="block text-[0.6875rem] uppercase tracking-wider text-muted">
            {isToday ? t.timetable.today : t.timetable.scheduled}
          </span>
        </p>

        <button
          type="button"
          onClick={() => {
            if (date !== null) goToDate(shiftServiceDate(date, 1));
          }}
          disabled={date === null}
          aria-label={t.timetable.nextDay}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconChevronRight size={19} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {showJumpToNow ? (
          <button
            type="button"
            onClick={goToNow}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            <IconClock size={14} />
            {isToday ? t.timetable.jumpToNow : t.timetable.backToToday}
          </button>
        ) : null}
        {anchorSec > 0 ? (
          <button
            type="button"
            onClick={() => restartAt(0)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            <IconCalendar size={14} />
            {t.timetable.fromServiceStart}
          </button>
        ) : null}
      </div>

      {/* The bleed matches the page gutter; inside the desktop column it would
          overflow the grid track, so there it wraps instead of scrolling. */}
      {routes.length > 1 ? (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar lg:mx-0 lg:flex-wrap lg:overflow-x-visible lg:px-0">
          <button
            type="button"
            onClick={() => setRouteId(null)}
            aria-pressed={routeId === null}
            className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-xs font-bold ${
              routeId === null
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
            }`}
          >
            {t.common.all}
          </button>
          {routes.map((route) => (
            <button
              key={route.routeId}
              type="button"
              onClick={() => setRouteId(route.routeId)}
              aria-pressed={routeId === route.routeId}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 ${
                routeId === route.routeId ? "border-ink bg-surface-2" : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <LineBadge
                shortName={route.shortName}
                routeType={route.routeType}
                color={route.color}
                textColor={route.textColor}
                size="sm"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        {date === null ? (
          <ListSkeleton rows={4} />
        ) : (
          <TimetableRun
            key={`${date}|${routeId ?? ""}|${anchorSec}`}
            stopId={stopId}
            date={date}
            routeId={routeId}
            anchorSec={anchorSec}
            nowSec={nowSec}
            isToday={isToday}
            onRestart={restartAt}
          />
        )}
      </div>
    </div>
  );
}
