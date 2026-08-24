"use client";

import type { ReactNode } from "react";
import ArrivalRow, { RowSelectOverlay, SELECTED_ROW } from "@/components/ArrivalRow";
import EmptyState from "@/components/EmptyState";
import LineBadge from "@/components/LineBadge";
import { IconClock } from "@/components/Icons";
import type { Arrival } from "@/lib/types";
import { formatClock, formatMinutes } from "@/lib/format";
import { useT } from "@/lib/i18n";

export interface ArrivalsListProps {
  arrivals: Arrival[];
  nowMs: number | null;
  max?: number;
  /** Realtime feed unreachable or stale: say so instead of faking it. */
  degraded?: boolean;
  /** Unix seconds of the feed the realtime rows came from, null when we have none. */
  feedTimestamp?: number | null;
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: ReactNode;
  /** Trip highlighted on the map; its row is highlighted here too. */
  selectedTripId?: string | null;
  /** Given, rows become pickable and select the matching vehicle on the map. */
  onSelectTrip?: ((tripId: string | null) => void) | null;
  className?: string;
}

/** Drops departures the feed forgot to retire; anything older is noise. */
const PAST_TOLERANCE_MIN = -5;
/** Same threshold the server uses to flag a snapshot as degraded. */
const STALE_FEED_SEC = 180;

function minutesFrom(arrival: Arrival, nowMs: number | null): number {
  if (nowMs === null) return arrival.minutesAway;
  return Math.floor((arrival.arrivalTime * 1000 - nowMs) / 60_000);
}

const STALE_RAIL = "repeating-linear-gradient(180deg, var(--p-late) 0 4px, transparent 4px 9px)";

/**
 * A realtime row whose feed stopped updating: same numbers, but nothing here
 * may claim to be live. Kept separate from ArrivalRow, which is the live row.
 */
function StaleArrivalRow({
  arrival,
  nowMs,
  feedAgeMin,
  selected,
  onSelect,
}: {
  arrival: Arrival;
  nowMs: number | null;
  feedAgeMin: number | null;
  selected: boolean;
  onSelect: (() => void) | null;
}): ReactNode {
  const t = useT();
  const minutes = minutesFrom(arrival, nowMs);
  const clock = formatClock(arrival.arrivalTime);
  const frozen =
    feedAgeMin === null ? t.arrivals.frozenUnknown : t.arrivals.frozenFor(feedAgeMin);
  const srLabel = [
    t.lines.named(arrival.routeShortName),
    arrival.headsign.length > 0 ? t.arrivals.towardsSr(arrival.headsign) : null,
    arrival.skipped
      ? t.arrivals.skippedSr
      : t.arrivals.expectedSr(formatMinutes(minutes), clock),
    t.arrivals.frozenSr(frozen),
  ]
    .filter((part): part is string => part !== null)
    .join(", ");

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
        style={{ backgroundImage: STALE_RAIL }}
      />

      <LineBadge
        shortName={arrival.routeShortName}
        routeType={arrival.routeType}
        color={arrival.routeColor}
        size="md"
        decorative
      />

      <div aria-hidden="true" className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold caps-data text-[0.9375rem] lg:overflow-visible lg:whitespace-normal ${arrival.skipped ? "line-through" : ""}`}
        >
          {arrival.headsign.length > 0 ? arrival.headsign : t.lines.noHeadsign}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-late">
            <span className="h-1.5 w-1.5 rounded-full bg-late" />
            {t.arrivals.frozenPrefix(frozen)}
          </span>
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
        ) : minutes >= 60 ? (
          <span className="text-lg font-bold tabular-nums text-late">{clock}</span>
        ) : (
          <span className="inline-flex items-baseline gap-0.5 text-late">
            <span className="text-lg font-bold">~</span>
            <span className="text-2xl font-extrabold tabular-nums leading-none">
              {Math.max(0, minutes)}
            </span>
            <span className="text-[0.6875rem] font-medium">{t.common.minutesShort}</span>
          </span>
        )}
      </div>
    </li>
  );
}

export default function ArrivalsList({
  arrivals,
  nowMs,
  max,
  degraded = false,
  feedTimestamp = null,
  emptyTitle,
  emptyHint,
  emptyAction,
  selectedTripId = null,
  onSelectTrip = null,
  className = "",
}: ArrivalsListProps) {
  const t = useT();
  const visible = arrivals
    .filter((arrival) => {
      if (nowMs === null) return arrival.minutesAway >= PAST_TOLERANCE_MIN;
      return Math.floor((arrival.arrivalTime * 1000 - nowMs) / 60_000) >= PAST_TOLERANCE_MIN;
    })
    .slice(0, max !== undefined && max > 0 ? max : undefined);

  const feedAgeSec =
    feedTimestamp === null || nowMs === null
      ? null
      : Math.max(0, Math.floor(nowMs / 1000 - feedTimestamp));
  const feedAgeMin = feedAgeSec === null ? null : Math.floor(feedAgeSec / 60);
  const hasRealtime = visible.some((arrival) => arrival.source === "realtime");
  // Degraded with a feed that is still recent means a partial outage, not frozen
  // predictions: only the genuinely old feed downgrades the rows.
  const feedStale = degraded && (feedAgeSec === null || feedAgeSec >= STALE_FEED_SEC);
  const rowsAreStale = feedStale && hasRealtime;

  // With nothing to list there is nothing to qualify: the empty state speaks.
  const banner = !degraded || visible.length === 0 ? null : !hasRealtime ? (
    <>
      <span className="font-semibold">{t.arrivals.bannerNoRealtimeStrong}</span>
      {t.arrivals.bannerNoRealtime}
    </>
  ) : feedStale ? (
    <>
      <span className="font-semibold">{t.arrivals.bannerFrozenStrong(feedAgeMin)}</span>
      {t.arrivals.bannerFrozenBefore}
      {feedTimestamp === null
        ? t.arrivals.bannerFrozenLastUpdate
        : t.arrivals.bannerFrozenAt(formatClock(feedTimestamp))}
      {t.arrivals.bannerFrozenAfter}
    </>
  ) : (
    <>
      <span className="font-semibold">{t.arrivals.bannerPartialStrong}</span>
      {t.arrivals.bannerPartial}
    </>
  );

  return (
    <div className={className}>
      {banner !== null ? (
        <p
          role="status"
          className="mb-3 rounded-xl border border-late/40 bg-late-soft px-3.5 py-2.5 text-[0.8125rem] leading-snug text-ink"
        >
          {banner}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconClock size={22} />}
          title={emptyTitle ?? t.arrivals.emptyTitle}
          hint={emptyHint ?? t.arrivals.emptyHint}
          action={emptyAction}
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
          {visible.map((arrival, index) => {
            const key = `${arrival.tripId}-${arrival.routeId}-${arrival.arrivalTime}`;
            const selected = selectedTripId !== null && arrival.tripId === selectedTripId;
            // Picking the selected row again clears it, the same as the map does.
            const onSelect =
              onSelectTrip === null ? null : () => onSelectTrip(selected ? null : arrival.tripId);
            if (rowsAreStale && arrival.source === "realtime") {
              return (
                <StaleArrivalRow
                  key={key}
                  arrival={arrival}
                  nowMs={nowMs}
                  feedAgeMin={feedAgeMin}
                  selected={selected}
                  onSelect={onSelect}
                />
              );
            }
            return (
              <ArrivalRow
                key={key}
                arrival={arrival}
                nowMs={nowMs}
                lead={index === 0}
                selected={selected}
                onSelect={onSelect}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
