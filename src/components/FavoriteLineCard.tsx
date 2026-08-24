"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import LineBadge from "@/components/LineBadge";
import { IconStar } from "@/components/Icons";
import { useJsonResource } from "@/components/api";
import { parseVehiclesResponse } from "@/components/map/api";
import type { FavoriteCardStatus } from "@/components/FavoriteStopCard";
import { useT } from "@/lib/i18n";
import { favoriteKey } from "@/lib/storage";
import type { Favorite } from "@/lib/types";

export interface FavoriteLineCardProps {
  favorite: Favorite;
  /** Poll cycle from the parent, so every card refreshes together. */
  nonce: number;
  onStatus: (key: string, status: FavoriteCardStatus) => void;
  onRemove: (favorite: Favorite) => void;
}

/** A saved line: how many vehicles are out right now, and one tap to the line. */
export default function FavoriteLineCard({
  favorite,
  nonce,
  onStatus,
  onRemove,
}: FavoriteLineCardProps) {
  const t = useT();
  const { data, error, state, fetchedAt } = useJsonResource(
    `/api/vehicles?routeId=${encodeURIComponent(favorite.id)}`,
    parseVehiclesResponse,
    nonce,
  );

  const key = favoriteKey(favorite);
  const busy = state === "loading" || state === "refreshing";
  const count = data === null ? null : data.vehicles.length;
  const signature = useMemo(
    () => (data === null ? null : `${data.feedTimestamp ?? 0}:${data.vehicles.length}`),
    [data],
  );
  useEffect(() => {
    onStatus(key, { busy, fetchedAt, signature });
  }, [onStatus, key, busy, fetchedAt, signature]);

  const hasTag = favorite.tag !== null && favorite.tag.length > 0;
  const routeType = favorite.routeType ?? 3;

  return (
    <article className="relative rounded-card border border-line bg-surface shadow-card transition-colors hover:border-line-strong">
      <div className="flex items-start gap-3 px-4 py-3.5 lg:px-3.5 lg:py-3">
        <LineBadge
          shortName={favorite.name}
          routeType={routeType}
          color={favorite.color}
          size="md"
          decorative
        />

        <div className="min-w-0 flex-1">
          {hasTag ? (
            <p className="mb-0.5 truncate text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent">
              {favorite.tag}
            </p>
          ) : null}
          <h3 className="text-[1.0625rem] font-bold leading-tight">
            <Link
              href={`/line/${encodeURIComponent(favorite.id)}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {t.lines.named(favorite.name)}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {error !== null && data === null
              ? t.favorites.vehiclesUnavailable
              : count === null
                ? t.favorites.lookingForVehicles
                : count === 0
                  ? t.favorites.noVehiclesNow
                  : t.favorites.vehiclesInService(count)}
          </p>
        </div>

        <div className="relative z-10 -me-1.5 flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => onRemove(favorite)}
            aria-label={t.favorites.removeStarLine(favorite.name)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-soft active:bg-accent-soft lg:h-9 lg:w-9"
          >
            <IconStar size={18} filled />
          </button>
        </div>
      </div>
    </article>
  );
}
