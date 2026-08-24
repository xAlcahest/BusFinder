"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  addFavorite,
  clearFavorites,
  favoriteKey,
  favoritesSnapshot,
  hydrate,
  moveFavorite,
  removeFavorite,
  restoreFavorite,
  serverFavoritesSnapshot,
  setFavoritePinnedRoutes,
  setFavoriteTag,
  subscribe,
} from "@/lib/storage";
import type { Favorite, FavoriteKind, FavoriteTarget } from "@/lib/types";

export interface UseFavorites {
  favorites: Favorite[];
  isFavorite(kind: FavoriteKind, id: string): boolean;
  add(target: FavoriteTarget): void;
  /** Returns what was removed, so the caller can offer an undo. */
  remove(kind: FavoriteKind, id: string): Favorite | null;
  restore(item: Favorite): boolean;
  setTag(kind: FavoriteKind, id: string, tag: string | null): void;
  setPinnedRoutes(stopId: string, routeIds: string[]): void;
  reorder(kind: FavoriteKind, id: string, direction: -1 | 1): void;
  clear(): void;
}

/**
 * Favourite stops and lines, shared by every component that mounts this hook.
 * State lives in the storage module, so two instances never disagree.
 */
export function useFavorites(): UseFavorites {
  const favorites = useSyncExternalStore(
    subscribe,
    favoritesSnapshot,
    serverFavoritesSnapshot,
  );

  useEffect(() => {
    hydrate();
  }, []);

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) => {
      const key = favoriteKey({ kind, id });
      return favorites.some((item) => favoriteKey(item) === key);
    },
    [favorites],
  );

  const add = useCallback((target: FavoriteTarget) => {
    addFavorite(target);
  }, []);

  const remove = useCallback(
    (kind: FavoriteKind, id: string) => removeFavorite(kind, id),
    [],
  );

  const restore = useCallback((item: Favorite) => restoreFavorite(item), []);

  const setTag = useCallback((kind: FavoriteKind, id: string, tag: string | null) => {
    setFavoriteTag(kind, id, tag);
  }, []);

  const setPinnedRoutes = useCallback((stopId: string, routeIds: string[]) => {
    setFavoritePinnedRoutes(stopId, routeIds);
  }, []);

  const reorder = useCallback((kind: FavoriteKind, id: string, direction: -1 | 1) => {
    moveFavorite(kind, id, direction);
  }, []);

  const clear = useCallback(() => {
    clearFavorites();
  }, []);

  return {
    favorites,
    isFavorite,
    add,
    remove,
    restore,
    setTag,
    setPinnedRoutes,
    reorder,
    clear,
  };
}
