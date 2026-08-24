"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  clearRecents,
  hydrate,
  pushRecent,
  recentsSnapshot,
  serverRecentsSnapshot,
  subscribe,
} from "@/lib/storage";
import type { RecentStop } from "@/lib/types";

export interface UseRecents {
  recents: RecentStop[];
  push(stop: { stopId: string; stopName: string }): void;
  clear(): void;
}

/** Recently visited stops, newest first, capped at 20 by the storage module. */
export function useRecents(): UseRecents {
  const recents = useSyncExternalStore(subscribe, recentsSnapshot, serverRecentsSnapshot);

  useEffect(() => {
    hydrate();
  }, []);

  const push = useCallback((stop: { stopId: string; stopName: string }) => {
    pushRecent(stop);
  }, []);

  const clear = useCallback(() => {
    clearRecents();
  }, []);

  return { recents, push, clear };
}
