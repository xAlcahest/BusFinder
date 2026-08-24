"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ArrivalRow from "@/components/ArrivalRow";
import { IconStar, IconTag } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";
import { parseArrivalsResponse, useJsonResource } from "@/components/api";
import { displayLineName } from "@/components/LineBadge";
import { useT } from "@/lib/i18n";
import { favoriteKey } from "@/lib/storage";
import type { Arrival, Favorite, RouteSummary } from "@/lib/types";

export interface FavoriteCardStatus {
  busy: boolean;
  fetchedAt: number | null;
  /** Fingerprint of the predictions on this card; equal means nothing moved. */
  signature: string | null;
}

export interface FavoriteStopCardProps {
  favorite: Favorite;
  /** Poll cycle from the parent, so every card refreshes together. */
  nonce: number;
  nowMs: number | null;
  /** Rows the desktop grid shows; the phone keeps the first three, hidden in CSS. */
  rows: number;
  allowScheduled: boolean;
  /** Reports by favouriteKey, so a stop and a line cannot share a slot. */
  onStatus: (key: string, status: FavoriteCardStatus) => void;
  /** Opens the editor. Routes come from this card's own arrivals response. */
  onEdit: (favorite: Favorite, routes: RouteSummary[]) => void;
  onRemove: (favorite: Favorite) => void;
}

function pickArrivals(
  arrivals: Arrival[],
  pinnedRoutes: string[],
  allowScheduled: boolean,
  rows: number,
): Arrival[] {
  const pinned = new Set(pinnedRoutes);
  return arrivals
    .filter((arrival) => (pinned.size === 0 ? true : pinned.has(arrival.routeId)))
    .filter((arrival) => (allowScheduled ? true : arrival.source === "realtime"))
    .slice(0, rows);
}

/** Labels for the pinned lines, falling back to the raw id when unknown. */
function pinnedLabels(pinnedRoutes: string[], routes: RouteSummary[]): string[] {
  return pinnedRoutes.map((routeId) => {
    const route = routes.find((item) => item.routeId === routeId);
    return route === undefined ? routeId : displayLineName(route.shortName, route.routeType);
  });
}

export default function FavoriteStopCard({
  favorite,
  nonce,
  nowMs,
  rows,
  allowScheduled,
  onStatus,
  onEdit,
  onRemove,
}: FavoriteStopCardProps) {
  const t = useT();
  const [retry, setRetry] = useState(0);
  const { data, error, state, fetchedAt, stale } = useJsonResource(
    `/api/arrivals/${encodeURIComponent(favorite.id)}`,
    parseArrivalsResponse,
    nonce + retry,
  );

  const key = favoriteKey(favorite);
  const busy = state === "loading" || state === "refreshing";
  const signature = useMemo(
    () =>
      data === null
        ? null
        : JSON.stringify([
            data.feedTimestamp,
            data.arrivals.map((item) => [item.tripId, item.arrivalTime, item.delaySec, item.skipped]),
          ]),
    [data],
  );
  useEffect(() => {
    onStatus(key, { busy, fetchedAt, signature });
  }, [onStatus, key, busy, fetchedAt, signature]);

  const stopName = data?.stop.stopName ?? favorite.name;
  const stopCode = data?.stop.stopCode ?? null;
  const stopRoutes = data?.stop.routes ?? [];
  const arrivals =
    data === null ? [] : pickArrivals(data.arrivals, favorite.pinnedRoutes, allowScheduled, rows);
  const hasTag = favorite.tag !== null && favorite.tag.length > 0;
  const filtered = favorite.pinnedRoutes.length > 0;
  // A pinned filter that hides everything must not read like a broken feed.
  const hiddenByFilter = filtered && arrivals.length === 0 && (data?.arrivals.length ?? 0) > 0;
  const labels = filtered ? pinnedLabels(favorite.pinnedRoutes, stopRoutes) : [];

  return (
    <article className="relative rounded-card border border-line bg-surface shadow-card transition-colors hover:border-line-strong">
      <div className="flex items-start gap-2 px-4 pt-3.5 lg:px-3.5 lg:pt-3">
        <div className="min-w-0 flex-1">
          {hasTag ? (
            <p className="mb-0.5 truncate text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent">
              {favorite.tag}
            </p>
          ) : null}
          <h3 className="text-[1.0625rem] font-bold leading-tight caps-data">
            <Link
              href={`/stop/${encodeURIComponent(favorite.id)}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {stopName}
            </Link>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            {stopCode !== null && stopCode.length > 0 ? (
              <span className="tabular-nums">{t.stops.code(stopCode)}</span>
            ) : null}
            {filtered ? (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 font-semibold text-ink">
                {t.favorites.onlyLines(
                  labels.slice(0, 4).join(", ") +
                    (labels.length > 4 ? ` +${labels.length - 4}` : ""),
                )}
              </span>
            ) : null}
            {stale ? (
              <span className="rounded bg-late-soft px-1.5 py-0.5 font-semibold text-late">
                {t.favorites.notUpdated}
              </span>
            ) : null}
          </p>
        </div>

        <div className="relative z-10 -me-1.5 flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => onEdit(favorite, stopRoutes)}
            aria-label={t.favorites.editLabels(stopName)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2 lg:h-9 lg:w-9"
          >
            <IconTag size={17} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(favorite)}
            aria-label={t.favorites.removeStar(stopName)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-soft active:bg-accent-soft lg:h-9 lg:w-9"
          >
            <IconStar size={18} filled />
          </button>
        </div>
      </div>

      <div className="mt-2 border-t border-line px-4 py-1.5 lg:px-3.5">
        {data === null && busy ? (
          <div className="space-y-2 py-1.5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ) : error !== null && data === null ? (
          <p className="flex items-center gap-2 py-2 text-sm text-danger">
            <span className="min-w-0 flex-1 truncate">{error}</span>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="relative z-10 shrink-0 font-semibold underline underline-offset-2"
            >
              {t.common.retry}
            </button>
          </p>
        ) : hiddenByFilter ? (
          <p className="flex items-center gap-2 py-2.5 text-sm text-muted">
            <span className="min-w-0 flex-1">{t.favorites.noArrivalsOnPinned}</span>
            <button
              type="button"
              onClick={() => onEdit(favorite, stopRoutes)}
              className="relative z-10 shrink-0 font-semibold text-accent underline underline-offset-2"
            >
              {t.favorites.changeLines}
            </button>
          </p>
        ) : arrivals.length === 0 ? (
          <p className="py-2.5 text-sm text-muted">
            {t.favorites.noArrivalsSoon}{" "}
            <span className="font-semibold text-ink">{t.favorites.openForTimes}</span>
          </p>
        ) : (
          <ul className="divide-y divide-line max-lg:[&>li:nth-child(n+4)]:hidden">
            {arrivals.map((arrival) => (
              <ArrivalRow
                key={`${arrival.tripId}-${arrival.arrivalTime}`}
                arrival={arrival}
                nowMs={nowMs}
                variant="compact"
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
