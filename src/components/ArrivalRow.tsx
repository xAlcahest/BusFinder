"use client";

import LineBadge from "@/components/LineBadge";
import type { Arrival } from "@/lib/types";
import { formatClock, formatMinutes } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

export interface ArrivalRowProps {
  arrival: Arrival;
  /** Epoch ms, so minutes stay honest between refreshes. Null before hydration. */
  nowMs: number | null;
  variant?: "full" | "compact";
  /** Emphasise the next departure. */
  lead?: boolean;
  /** This trip is the one highlighted on the map. */
  selected?: boolean;
  /** Given, the row becomes pickable and highlights its vehicle on the map. */
  onSelect?: (() => void) | null;
}

/**
 * Overlay rather than a wrapping button: the row is a rich `li` and turning it
 * into a control would change its semantics for every caller that does not pass
 * `onSelect`.
 */
export function RowSelectOverlay({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    />
  );
}

export const SELECTED_ROW = "bg-accent-soft";

function minutesFrom(arrival: Arrival, nowMs: number | null): number {
  if (nowMs === null) return arrival.minutesAway;
  return Math.floor((arrival.arrivalTime * 1000 - nowMs) / 60_000);
}

interface Delay {
  text: string;
  /** Spelled-out tail, shown only from `lg` where there is room for it. */
  long: string | null;
  tone: string;
  sr: string;
}

function delayOf(delaySec: number | null, t: Dictionary): Delay | null {
  if (delaySec === null || !Number.isFinite(delaySec)) return null;
  if (Math.abs(delaySec) < 60) {
    return { text: t.arrivals.onTime, long: null, tone: "text-live", sr: t.arrivals.onTime };
  }
  const minutes = Math.round(Math.abs(delaySec) / 60);
  if (delaySec > 0) {
    return {
      text: t.arrivals.lateBy(minutes),
      long: t.arrivals.lateSuffix,
      tone: "text-late",
      sr: t.arrivals.lateSr(minutes),
    };
  }
  return {
    text: t.arrivals.earlyBy(minutes),
    long: t.arrivals.earlySuffix,
    tone: "text-early",
    sr: t.arrivals.earlySr(minutes),
  };
}

/** Desktop gets the whole headsign; the phone keeps the single truncated line. */
const HEADSIGN_FULL = "lg:overflow-visible lg:whitespace-normal";

const SCHEDULED_RAIL =
  "repeating-linear-gradient(180deg, var(--p-border-strong) 0 4px, transparent 4px 9px)";

export default function ArrivalRow({
  arrival,
  nowMs,
  variant = "full",
  lead = false,
  selected = false,
  onSelect = null,
}: ArrivalRowProps) {
  const t = useT();
  const minutes = minutesFrom(arrival, nowMs);
  const live = arrival.source === "realtime";
  const delay = live ? delayOf(arrival.delaySec, t) : null;
  const clock = formatClock(arrival.arrivalTime);
  const imminent = minutes <= 0;
  const far = minutes >= 60;

  const srLabel = [
    t.lines.named(arrival.routeShortName),
    arrival.headsign.length > 0 ? t.arrivals.towardsSr(arrival.headsign) : null,
    arrival.skipped
      ? t.arrivals.skippedSr
      : far
        ? t.arrivals.atClock(clock)
        : formatMinutes(minutes),
    live ? t.arrivals.live : t.arrivals.scheduledSr,
    delay?.sr ?? null,
  ]
    .filter((part): part is string => part !== null)
    .join(", ");

  if (variant === "compact") {
    return (
      <li className="flex items-center gap-2.5 py-1.5">
        <span className="sr-only">{srLabel}</span>
        <LineBadge
          shortName={arrival.routeShortName}
          routeType={arrival.routeType}
          color={arrival.routeColor}
          size="sm"
          decorative
        />
        <span
          aria-hidden="true"
          className={`min-w-0 flex-1 truncate text-[0.8125rem] caps-data ${arrival.skipped ? "text-muted line-through" : "text-muted"}`}
        >
          {arrival.headsign.length > 0 ? arrival.headsign : t.lines.noHeadsign}
        </span>
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          {live ? (
            <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full border border-line-strong" />
          )}
          {arrival.skipped ? (
            <span className="text-xs font-semibold text-danger">{t.arrivals.skipped}</span>
          ) : far ? (
            <span className="text-sm font-bold tabular-nums text-ink">{clock}</span>
          ) : imminent ? (
            <span className="text-xs font-bold uppercase tracking-wide text-accent">
              {t.arrivals.due}
            </span>
          ) : (
            <span className="text-sm font-bold tabular-nums text-ink">
              {minutes}
              <span className="ms-0.5 text-[0.6875rem] font-medium text-muted">
                {t.common.minutesShort}
              </span>
            </span>
          )}
        </span>
      </li>
    );
  }

  return (
    <li
      className={`relative flex items-center gap-3 py-[var(--row-py)] ps-5 pe-4 transition-colors lg:hover:bg-surface-2/50 ${arrival.skipped ? "opacity-70" : ""} ${selected ? SELECTED_ROW : ""}`}
    >
      <span className="sr-only">{srLabel}</span>
      {onSelect !== null ? (
        <RowSelectOverlay
          label={
            selected
              ? t.arrivals.hideOnMap(arrival.routeShortName)
              : t.arrivals.showOnMap(arrival.routeShortName)
          }
          selected={selected}
          onSelect={onSelect}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="absolute inset-y-2 start-2 w-[3px] rounded-full"
        style={
          live
            ? { backgroundColor: "var(--p-live)" }
            : { backgroundImage: SCHEDULED_RAIL }
        }
      />

      <LineBadge
        shortName={arrival.routeShortName}
        routeType={arrival.routeType}
        color={arrival.routeColor}
        size={lead ? "lg" : "md"}
        decorative
      />

      <div aria-hidden="true" className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold caps-data ${HEADSIGN_FULL} ${lead ? "text-[1.0625rem]" : "text-[0.9375rem]"} ${arrival.skipped ? "line-through" : ""}`}
        >
          {arrival.headsign.length > 0 ? arrival.headsign : t.lines.noHeadsign}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {live ? (
            <span className="inline-flex items-center gap-1 font-semibold text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
              {t.arrivals.live}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 font-medium text-muted">
              {t.arrivals.scheduled}
              <span className="hidden lg:inline">{t.arrivals.scheduledTail}</span>
            </span>
          )}
          {delay !== null ? (
            <span className={`font-semibold ${delay.tone}`}>
              {delay.text}
              {delay.long !== null ? (
                <span className="hidden lg:inline">&nbsp;{delay.long}</span>
              ) : null}
            </span>
          ) : null}
          <span className="tabular-nums text-muted">{clock}</span>
          {arrival.skipped ? (
            <span className="rounded-md bg-danger-soft px-1.5 py-0.5 font-semibold text-danger">
              {t.arrivals.skipped}
            </span>
          ) : null}
        </p>
      </div>

      <div aria-hidden="true" className="w-[4.75rem] shrink-0 text-end">
        {arrival.skipped ? (
          <span className="text-sm font-semibold text-danger">{t.common.dash}</span>
        ) : far ? (
          <span className="text-lg font-bold tabular-nums">{clock}</span>
        ) : imminent ? (
          <span className="text-sm font-extrabold uppercase leading-tight tracking-wide text-accent">
            {t.arrivals.due}
          </span>
        ) : (
          <span className="inline-flex items-baseline gap-1">
            <span
              className={`font-extrabold tabular-nums leading-none ${lead ? "text-4xl" : "text-2xl"}`}
            >
              {minutes}
            </span>
            <span className="text-[0.6875rem] font-medium text-muted">{t.common.minutesShort}</span>
          </span>
        )}
      </div>
    </li>
  );
}
