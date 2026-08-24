"use client";

/**
 * Undo for a removed star. Losing a favourite kept for months to a mis-tap is
 * worse than never having saved it, so every removal parks the whole entry here
 * (tag and pinned lines included) and offers it back for a few seconds.
 *
 * A module store, not context: the star sits in a dozen unrelated trees and the
 * bar is mounted once, next to the sidebar.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { IconClose, IconStar } from "@/components/Icons";
import { useFavorites } from "@/components/state";
import { useT } from "@/lib/i18n";
import type { Favorite } from "@/lib/types";

/** Long enough to notice the bar, short enough not to sit on the nav. */
const UNDO_MS = 8_000;

interface PendingUndo {
  favorite: Favorite;
  /** Distinguishes two removals of the same entry, so the timer can be scoped. */
  token: number;
}

let pending: PendingUndo | null = null;
let nextToken = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of Array.from(listeners)) {
    try {
      listener();
    } catch (err) {
      console.error("[BusFinder] undo listener failed", err);
    }
  }
}

function subscribeUndo(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function undoSnapshot(): PendingUndo | null {
  return pending;
}

function serverUndoSnapshot(): PendingUndo | null {
  return null;
}

/** Offers `favorite` back until the bar times out or the user acts. */
export function offerUndo(favorite: Favorite | null): void {
  if (favorite === null) return;
  pending = { favorite, token: nextToken };
  nextToken += 1;
  emit();
}

/** Clears the bar. A token that is no longer current is ignored. */
export function dismissUndo(token?: number): void {
  if (pending === null) return;
  if (token !== undefined && pending.token !== token) return;
  pending = null;
  emit();
}

export default function FavoriteUndoBar() {
  const t = useT();
  const current = useSyncExternalStore(subscribeUndo, undoSnapshot, serverUndoSnapshot);
  const { restore } = useFavorites();

  const token = current?.token ?? null;
  useEffect(() => {
    if (token === null) return;
    const timer = window.setTimeout(() => dismissUndo(token), UNDO_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [token]);

  const undo = useCallback(() => {
    if (current === null) return;
    restore(current.favorite);
    dismissUndo(current.token);
  }, [current, restore]);

  if (current === null) return null;

  const removed =
    current.favorite.kind === "line" ? t.favorites.undoRemovedLine : t.favorites.undoRemovedStop;

  return (
    // Above the bottom nav on phones, bottom left on desktop where there is none.
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px)+0.75rem)] z-50 mx-auto flex max-w-md items-center gap-2 rounded-card border border-line-strong bg-surface px-3 py-2 shadow-2xl lg:inset-x-auto lg:bottom-4 lg:start-[calc(var(--shell-sidebar-w)+1rem)] lg:mx-0"
    >
      <span aria-hidden="true" className="shrink-0 text-muted">
        <IconStar size={18} />
      </span>
      <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug">
        <span className="font-semibold caps-data">{current.favorite.name}</span>
        <span className="block text-xs text-muted">{removed}</span>
      </p>
      <button
        type="button"
        onClick={undo}
        className="inline-flex h-11 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-bold text-on-accent transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        {t.common.cancel}
      </button>
      <button
        type="button"
        onClick={() => dismissUndo(current.token)}
        aria-label={t.favorites.undoDismiss}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 active:bg-surface-2"
      >
        <IconClose size={17} />
      </button>
    </div>
  );
}
