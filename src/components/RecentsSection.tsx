"use client";

import { useMemo } from "react";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import { ListSkeleton } from "@/components/Skeleton";
import StopList, { type StopListItem } from "@/components/StopList";
import { IconClock } from "@/components/Icons";
import { useMounted, useNow } from "@/components/hooks";
import { useFavorites, useRecents } from "@/components/state";
import { INTL_TAG } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";

const MAX_RECENTS = 8;
const DAY_MS = 86_400_000;

function visitedLabel(
  visitedAt: number,
  nowMs: number | null,
  t: Dictionary,
  locale: Locale,
): string | null {
  if (nowMs === null || !Number.isFinite(visitedAt)) return null;
  const diff = nowMs - visitedAt;
  if (diff < 3_600_000) return t.recents.justNow;
  if (diff < DAY_MS) return t.recents.today;
  if (diff < 2 * DAY_MS) return t.recents.yesterday;
  return new Intl.DateTimeFormat(INTL_TAG[locale], { day: "numeric", month: "short" }).format(
    new Date(visitedAt),
  );
}

/** `className` lets the home page move this beside the favourites at `2xl`. */
export default function RecentsSection({ className = "" }: { className?: string }) {
  const t = useT();
  const locale = useLocale();
  const mounted = useMounted();
  const { recents, clear } = useRecents();
  const { favorites } = useFavorites();
  const nowMs = useNow(60_000);

  const items = useMemo<StopListItem[]>(() => {
    const pinned = new Set(
      favorites.filter((favorite) => favorite.kind === "stop").map((favorite) => favorite.id),
    );
    return recents
      .filter((recent) => !pinned.has(recent.stopId))
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, MAX_RECENTS)
      .map((recent) => ({
        stopId: recent.stopId,
        stopName: recent.stopName,
        meta: visitedLabel(recent.visitedAt, nowMs, t, locale),
      }));
  }, [recents, favorites, nowMs, t, locale]);

  // A brand new install should show one empty state, not two.
  if (mounted && items.length === 0 && favorites.length === 0) return null;

  return (
    <section
      aria-labelledby="recents-heading"
      className={`mt-8 lg:mt-[var(--section-gap)] ${className}`}
    >
      <SectionHeader
        id="recents-heading"
        title={t.recents.heading}
        action={
          mounted && recents.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center rounded-full px-2 text-xs font-semibold text-muted underline underline-offset-2 transition-colors hover:text-ink active:text-ink lg:min-h-9"
            >
              {t.recents.clear}
            </button>
          ) : undefined
        }
      />

      {!mounted ? (
        <ListSkeleton rows={2} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconClock size={22} />}
          title={t.recents.emptyTitle}
          hint={t.recents.emptyHint}
        />
      ) : (
        <StopList items={items} ariaLabel={t.recents.listAria} />
      )}
    </section>
  );
}
