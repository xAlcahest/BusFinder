"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import LineBadge from "@/components/LineBadge";
import { IconChevronRight, IconWheelchair } from "@/components/Icons";
import type { RouteSummary } from "@/lib/types";
import { formatDistance } from "@/lib/format";
import { useT } from "@/lib/i18n";

export interface StopListItem {
  stopId: string;
  stopName: string;
  stopCode?: string | null;
  routes?: RouteSummary[];
  /** Metres from the query point, when the list came from a nearby search. */
  distanceM?: number | null;
  /** User tag for a favourite. */
  tag?: string | null;
  /** Free-form right-hand note, e.g. "vista ieri". */
  meta?: string | null;
  wheelchair?: number | null;
}

const MAX_BADGES = 7;

function StopRow({ item }: { item: StopListItem }) {
  const t = useT();
  const routes = item.routes ?? [];
  const shown = routes.slice(0, MAX_BADGES);
  const hidden = routes.length - shown.length;

  return (
    <li className="flex items-stretch">
      <Link
        href={`/stop/${encodeURIComponent(item.stopId)}`}
        className="flex min-h-[3.75rem] min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors active:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold caps-data">{item.stopName}</span>
            {item.wheelchair === 1 ? (
              <IconWheelchair size={15} className="shrink-0 text-muted" aria-hidden="true" />
            ) : null}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {item.stopCode !== null && item.stopCode !== undefined && item.stopCode !== "" ? (
              <span className="tabular-nums">{t.stops.code(item.stopCode)}</span>
            ) : null}
            {typeof item.distanceM === "number" ? (
              <span className="tabular-nums">{formatDistance(item.distanceM)}</span>
            ) : null}
            {item.meta !== null && item.meta !== undefined ? <span>{item.meta}</span> : null}
          </div>

          {item.tag !== null && item.tag !== undefined && item.tag !== "" ? (
            <span className="mt-1.5 inline-block rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">
              {item.tag}
            </span>
          ) : null}

          {shown.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {shown.map((route) => (
                <LineBadge
                  key={route.routeId}
                  shortName={route.shortName}
                  routeType={route.routeType}
                  color={route.color}
                  textColor={route.textColor}
                  size="sm"
                />
              ))}
              {hidden > 0 ? (
                <span className="text-xs font-semibold text-muted">+{hidden}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <IconChevronRight size={18} className="shrink-0 text-muted" />
      </Link>
      <span className="flex shrink-0 items-center border-s border-line px-2">
        <FavoriteButton kind="stop" id={item.stopId} name={item.stopName} size="row" />
      </span>
    </li>
  );
}

export default function StopList({
  items,
  className = "",
  ariaLabel,
}: {
  items: StopListItem[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      className={`divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      {items.map((item) => (
        <StopRow key={item.stopId} item={item} />
      ))}
    </ul>
  );
}
