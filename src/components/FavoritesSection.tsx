"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import FavoriteLineCard from "@/components/FavoriteLineCard";
import FavoriteStopCard, { type FavoriteCardStatus } from "@/components/FavoriteStopCard";
import { offerUndo } from "@/components/FavoriteUndo";
import { IconChevronRight, IconPin, IconStar } from "@/components/Icons";
import RefreshIndicator from "@/components/RefreshIndicator";
import SectionHeader from "@/components/SectionHeader";
import { FavoriteCardSkeleton } from "@/components/Skeleton";
import TagDialog from "@/components/TagDialog";
import { useMounted, useNow, usePoll } from "@/components/hooks";
import { useFavorites, useSettings } from "@/components/state";
import { useT } from "@/lib/i18n";
import { favoriteKey } from "@/lib/storage";
import type { Favorite, RouteSummary } from "@/lib/types";

/** Rows per card. The phone shows the first three; the grid has room for more. */
const ROWS_PER_CARD = 6;
/** Stable identity, so the dialog does not rebuild its options every render. */
const NO_ROUTES: readonly RouteSummary[] = [];

/** One column on the phone, an auto-filling grid from `lg` up. */
const GRID_CLASS =
  "flex flex-col gap-3 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] lg:items-start lg:gap-3";

interface EditTarget {
  favorite: Favorite;
  routes: readonly RouteSummary[];
}

export default function FavoritesSection() {
  const t = useT();
  const mounted = useMounted();
  const { favorites, setTag, setPinnedRoutes, reorder, remove } = useFavorites();
  const { settings } = useSettings();
  const poll = usePoll(settings.refreshInterval);
  const nowMs = useNow(15_000);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [reordering, setReordering] = useState(false);
  const [moveNotice, setMoveNotice] = useState("");
  const [status, setStatus] = useState<Record<string, FavoriteCardStatus>>({});

  const handleStatus = useCallback((key: string, next: FavoriteCardStatus) => {
    setStatus((prev) => {
      const current = prev[key];
      if (
        current !== undefined &&
        current.busy === next.busy &&
        current.fetchedAt === next.fetchedAt &&
        current.signature === next.signature
      ) {
        return prev;
      }
      return { ...prev, [key]: next };
    });
  }, []);

  // Removing goes through the undo bar: a mis-tap must not cost a favourite.
  const handleRemove = useCallback(
    (favorite: Favorite) => {
      offerUndo(remove(favorite.kind, favorite.id));
    },
    [remove],
  );

  const handleEdit = useCallback((favorite: Favorite, routes: RouteSummary[]) => {
    setEditTarget({ favorite, routes: routes.length === 0 ? NO_ROUTES : routes });
  }, []);

  const ordered = useMemo(
    () => [...favorites].sort((a, b) => a.order - b.order || a.addedAt - b.addedAt),
    [favorites],
  );

  const move = (favorite: Favorite, index: number, direction: -1 | 1): void => {
    const to = index + direction;
    if (to < 0 || to >= ordered.length) return;
    reorder(favorite.kind, favorite.id, direction);
    setMoveNotice(t.favorites.movedTo(favorite.name, to + 1, ordered.length));
  };

  // Age of the freshest complete picture: the oldest card wins. The joined
  // fingerprints answer the other question a refresh raises: did anything move?
  let busy = false;
  let oldest: number | null = null;
  const parts: string[] = [];
  for (const favorite of ordered) {
    const entry = status[favoriteKey(favorite)];
    if (entry === undefined) continue;
    if (entry.busy) busy = true;
    if (entry.fetchedAt !== null && (oldest === null || entry.fetchedAt < oldest)) {
      oldest = entry.fetchedAt;
    }
    parts.push(`${favoriteKey(favorite)}=${entry.signature ?? ""}`);
  }
  const signature = parts.length === 0 ? null : parts.join("\n");

  const canReorder = mounted && ordered.length > 1;
  // Drop out of reorder mode on its own if the list shrinks below two entries,
  // otherwise the "Fine" button disappears with the user still stuck in it.
  const inReorder = reordering && canReorder;

  return (
    <section aria-labelledby="favorites-heading">
      <SectionHeader
        id="favorites-heading"
        title={t.favorites.heading}
        count={mounted && ordered.length > 0 ? ordered.length : undefined}
        action={
          mounted && ordered.length > 0 ? (
            <div className="flex items-center gap-2">
              {canReorder ? (
                <button
                  type="button"
                  onClick={() => {
                    setReordering((value) => !value);
                    setMoveNotice("");
                  }}
                  aria-pressed={inReorder}
                  className={`inline-flex h-11 items-center rounded-full px-3 text-xs font-bold transition-colors lg:h-9 ${
                    inReorder
                      ? "bg-accent text-on-accent"
                      : "border border-line bg-surface text-ink hover:bg-surface-2 active:bg-surface-2"
                  }`}
                >
                  {inReorder ? t.favorites.reorderDone : t.favorites.reorder}
                </button>
              ) : null}
              {inReorder ? null : (
                <RefreshIndicator
                  state={busy ? "refreshing" : "ready"}
                  fetchedAt={oldest}
                  signature={signature}
                  onRefresh={poll.refresh}
                  staleAfterSec={Math.max(90, settings.refreshInterval * 3)}
                />
              )}
            </div>
          ) : undefined
        }
      />

      {!mounted ? (
        <div className={GRID_CLASS}>
          <FavoriteCardSkeleton />
          <FavoriteCardSkeleton />
        </div>
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={<IconStar size={22} />}
          title={t.favorites.emptyTitle}
          hint={t.favorites.emptyHint}
          action={
            <Link
              href="/nearby"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition-opacity hover:opacity-90"
            >
              <IconPin size={17} />
              {t.nav.nearby}
            </Link>
          }
        />
      ) : inReorder ? (
        <>
          <p className="mb-2 text-xs text-muted">{t.favorites.reorderHint}</p>
          <ul className="flex flex-col gap-2 lg:max-w-3xl">
            {ordered.map((favorite, index) => (
              <li
                key={favoriteKey(favorite)}
                className="flex items-stretch gap-1 rounded-card border border-line bg-surface shadow-card"
              >
                <span className="flex w-8 shrink-0 items-center justify-center text-xs font-bold tabular-nums text-muted">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 self-center py-3 pe-2">
                  <span className="block truncate text-[0.9375rem] font-semibold caps-data">
                    {favorite.kind === "line" ? t.lines.named(favorite.name) : favorite.name}
                  </span>
                  {favorite.tag !== null && favorite.tag.length > 0 ? (
                    <span className="block truncate text-xs font-semibold text-accent">
                      {favorite.tag}
                    </span>
                  ) : null}
                </span>
                {/* aria-disabled, not disabled: a disabled button loses focus mid-reorder. */}
                <button
                  type="button"
                  onClick={() => move(favorite, index, -1)}
                  aria-disabled={index === 0}
                  aria-label={t.favorites.moveUp(favorite.name)}
                  className={`inline-flex w-12 shrink-0 items-center justify-center border-s border-line text-ink transition-colors hover:bg-surface-2 active:bg-surface-2 ${
                    index === 0 ? "opacity-30" : ""
                  }`}
                >
                  <span className="-rotate-90">
                    <IconChevronRight size={18} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => move(favorite, index, 1)}
                  aria-disabled={index === ordered.length - 1}
                  aria-label={t.favorites.moveDown(favorite.name)}
                  className={`inline-flex w-12 shrink-0 items-center justify-center border-s border-line text-ink transition-colors hover:bg-surface-2 active:bg-surface-2 ${
                    index === ordered.length - 1 ? "opacity-30" : ""
                  }`}
                >
                  <span className="rotate-90">
                    <IconChevronRight size={18} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
            {moveNotice}
          </p>
        </>
      ) : (
        <div className={GRID_CLASS}>
          {ordered.map((favorite) =>
            favorite.kind === "line" ? (
              <FavoriteLineCard
                key={favoriteKey(favorite)}
                favorite={favorite}
                nonce={poll.nonce}
                onStatus={handleStatus}
                onRemove={handleRemove}
              />
            ) : (
              <FavoriteStopCard
                key={favoriteKey(favorite)}
                favorite={favorite}
                nonce={poll.nonce}
                nowMs={nowMs}
                rows={ROWS_PER_CARD}
                allowScheduled={settings.showScheduledFallback}
                onStatus={handleStatus}
                onEdit={handleEdit}
                onRemove={handleRemove}
              />
            ),
          )}
        </div>
      )}

      <TagDialog
        open={editTarget !== null}
        stopName={editTarget?.favorite.name ?? ""}
        initialTag={editTarget?.favorite.tag ?? null}
        routes={editTarget?.routes ?? NO_ROUTES}
        initialPinned={editTarget?.favorite.pinnedRoutes}
        onClose={() => setEditTarget(null)}
        onSave={(tag) => {
          if (editTarget !== null) setTag(editTarget.favorite.kind, editTarget.favorite.id, tag);
        }}
        onSavePinned={(routeIds) => {
          if (editTarget !== null) setPinnedRoutes(editTarget.favorite.id, routeIds);
        }}
      />
    </section>
  );
}
