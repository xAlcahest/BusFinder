"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatClock, formatSecOfDay, serviceDateFor } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Stop, TimetableEntry } from "@/lib/types";
import { parseTimetableResponse } from "@/components/api";

import { errorMessage, fetchJson, isAbortError } from "./api";

/**
 * "No vehicles" and "no service" are different facts, and only one of them is
 * ours to assert. The realtime feed knows whether a bus is transmitting; the
 * timetable knows whether the line is meant to be running. This resolves the
 * two into one honest sentence, and shows the schedule when that is the answer
 * the rider actually needs.
 */
export type LineServiceKind =
  | "loading"
  | "live"
  | "feed-down"
  | "untracked"
  | "finished"
  | "none-today"
  | "unknown";

export interface LineService {
  kind: LineServiceKind;
  /** Headline, always safe to render. */
  title: string;
  /** Second line, or null when the headline says everything. */
  detail: string | null;
  /** Next scheduled departures from `stop`, when there are any. */
  next: TimetableEntry[];
  stopName: string | null;
}

/** Entries we ask for. A terminus on a busy line runs a few hundred a day. */
const TIMETABLE_LIMIT = 1000;
/** Departures shown when the line is scheduled but untracked. */
const NEXT_SHOWN = 4;
/** Keep the bus you are about to miss in the list. */
const LOOKBEHIND_SEC = 120;

/**
 * Seconds into the current service day in Rome time. Trips after midnight
 * belong to the previous service day, so the value keeps counting past 24 h.
 * Same 04:00 cutoff as serviceDateFor, so the pair always agree.
 */
function serviceSecNow(nowMs: number): number | null {
  const clock = formatClock(Math.floor(nowMs / 1000));
  const hours = Number(clock.slice(0, 2));
  const minutes = Number(clock.slice(3, 5));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const sec = hours * 3600 + minutes * 60;
  return hours < 4 ? sec + 86_400 : sec;
}

interface Schedule {
  entries: TimetableEntry[];
  /** Set when we could not read the timetable at all. */
  failed: boolean;
}

/**
 * Today's scheduled departures of one line from one stop. Fetched once per
 * stop and route: the timetable is static, so it never needs to poll.
 */
function useLineSchedule(
  routeId: string,
  stopId: string | null,
  serviceDate: string | null,
): Schedule | null {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (stopId === null || serviceDate === null) {
      setSchedule(null);
      return;
    }
    const date = serviceDate;
    if (!/^\d{8}$/.test(date) || date === "00000000") {
      setSchedule({ entries: [], failed: true });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setSchedule(null);

    const url =
      `/api/timetable/${encodeURIComponent(stopId)}?date=${date}` +
      `&routeId=${encodeURIComponent(routeId)}&limit=${TIMETABLE_LIMIT}`;

    fetchJson(url, controller.signal)
      .then((body) => {
        if (cancelled || !mountedRef.current) return;
        const parsed = parseTimetableResponse(body);
        if (parsed === null) {
          setSchedule({ entries: [], failed: true });
          return;
        }
        setSchedule({
          entries: [...parsed.entries].sort((a, b) => a.departureSec - b.departureSec),
          failed: false,
        });
      })
      .catch((err: unknown) => {
        if (cancelled || isAbortError(err) || !mountedRef.current) return;
        // Not worth an error banner: it only costs us the ability to be
        // specific, and the caller degrades to a non-committal sentence.
        console.warn("Orario della linea non letto:", errorMessage(err));
        setSchedule({ entries: [], failed: true });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // serviceDate is a dependency on purpose: a page left open across the 04:00
    // rollover must re-read the timetable instead of judging the new day by the
    // old one's departures.
  }, [routeId, stopId, serviceDate]);

  return schedule;
}

export interface UseLineServiceArgs {
  routeId: string;
  /** First stop of the active direction; null until the line has loaded. */
  originStop: Stop | null;
  vehicleCount: number;
  /** True when the realtime feed itself is stale or unreachable. */
  degraded: boolean;
  vehiclesError: string | null;
  /** False until the first vehicles answer has landed. */
  vehiclesLoaded: boolean;
  /** Rome ms, ticking; null before hydration. */
  nowMs: number | null;
}

export function useLineService({
  routeId,
  originStop,
  vehicleCount,
  degraded,
  vehiclesError,
  vehiclesLoaded,
  nowMs,
}: UseLineServiceArgs): LineService {
  const t = useT();
  // Stable within a service day, so it does not refetch on every clock tick.
  const serviceDate = nowMs === null ? null : serviceDateFor(new Date(nowMs));
  const schedule = useLineSchedule(routeId, originStop?.stopId ?? null, serviceDate);
  const stopName = originStop?.stopName ?? null;

  return useMemo<LineService>(() => {
    const base = { next: [] as TimetableEntry[], stopName };

    if (vehicleCount > 0) {
      return {
        ...base,
        kind: "live",
        title: t.lineService.inService(vehicleCount),
        detail: null,
      };
    }
    if (!vehiclesLoaded) {
      return { ...base, kind: "loading", title: t.lineService.loadingVehicles, detail: null };
    }

    // The feed is the first suspect: with nothing to read from it, we cannot
    // say anything at all about what is or is not out on the road.
    if (degraded || vehiclesError !== null) {
      return {
        ...base,
        kind: "feed-down",
        title: t.lineService.feedDownTitle,
        detail: t.lineService.feedDownDetail,
      };
    }

    if (schedule === null || nowMs === null) {
      return { ...base, kind: "loading", title: t.lineService.checkingTimetable, detail: null };
    }

    const nowSec = serviceSecNow(nowMs);
    if (schedule.failed || nowSec === null) {
      return {
        ...base,
        kind: "unknown",
        title: t.lineService.noneReporting,
        detail: t.lineService.unknownDetail,
      };
    }

    const upcoming = schedule.entries.filter(
      (entry) => entry.departureSec >= nowSec - LOOKBEHIND_SEC,
    );

    if (upcoming.length > 0) {
      return {
        ...base,
        kind: "untracked",
        next: upcoming.slice(0, NEXT_SHOWN),
        title: t.lineService.noneReporting,
        detail: t.lineService.scheduledDetail(upcoming.length),
      };
    }

    if (schedule.entries.length > 0) {
      const last = schedule.entries[schedule.entries.length - 1];
      return {
        ...base,
        kind: "finished",
        title: t.lineService.finishedTitle,
        detail: t.lineService.finishedDetail(
          schedule.entries.length,
          formatSecOfDay(last.departureSec),
        ),
      };
    }

    // Nothing scheduled from this stop today. Only ever said about today, and
    // never as "the line does not exist".
    return {
      ...base,
      kind: "none-today",
      title: t.lineService.noneTodayTitle,
      detail:
        stopName === null
          ? t.lineService.noneTodayDetail
          : t.lineService.noneTodayFrom(stopName),
    };
  }, [schedule, stopName, vehicleCount, degraded, vehiclesError, vehiclesLoaded, nowMs, t]);
}

/** The scheduled departures list, shown when no vehicle is transmitting. */
export function NextDepartures({ service }: { service: LineService }) {
  const t = useT();
  if (service.next.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface px-3 py-2.5">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted">
        {t.lineService.nextDepartures}
        {service.stopName === null ? "" : t.lineService.nextDeparturesFrom(service.stopName)}
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {service.next.map((entry) => (
          <li
            key={`${entry.tripId}-${entry.departureSec}`}
            className="flex items-baseline gap-2.5 text-sm"
          >
            <span className="w-12 shrink-0 font-bold tabular-nums">
              {formatSecOfDay(entry.departureSec)}
            </span>
            <span className="min-w-0 flex-1 truncate text-muted caps-data">
              {entry.headsign.length > 0 ? entry.headsign : t.common.dash}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">{t.lineService.scheduledOnly}</p>
    </div>
  );
}
