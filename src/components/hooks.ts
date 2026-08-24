"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** True only after hydration: gate anything that depends on localStorage. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Ticking clock in epoch ms. Null until hydrated, so SSR output stays stable. */
export function useNow(intervalMs = 15_000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), Math.max(1000, intervalMs));
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export interface Poll {
  /** Increments on every refresh cycle; feed it to useJsonResource. */
  nonce: number;
  /** Epoch ms when the current cycle started, null before hydration. */
  startedAt: number | null;
  refresh: () => void;
}

const MIN_INTERVAL_SEC = 10;
const MAX_INTERVAL_SEC = 600;

/**
 * Drives refresh cycles on the settings interval. Pauses while the tab is
 * hidden and catches up as soon as it comes back.
 */
export function usePoll(intervalSec: number): Poll {
  const [nonce, setNonce] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const lastRef = useRef(0);

  const safeInterval = Number.isFinite(intervalSec)
    ? Math.min(MAX_INTERVAL_SEC, Math.max(MIN_INTERVAL_SEC, Math.round(intervalSec)))
    : 30;

  const refresh = useCallback(() => {
    lastRef.current = Date.now();
    setStartedAt(lastRef.current);
    setNonce((value) => value + 1);
  }, []);

  // Mount only: changing the interval must not fake a fresh fetch.
  useEffect(() => {
    lastRef.current = Date.now();
    setStartedAt(lastRef.current);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      lastRef.current = Date.now();
      setStartedAt(lastRef.current);
      setNonce((value) => value + 1);
    };

    const id = window.setInterval(tick, safeInterval * 1000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRef.current < safeInterval * 1000) return;
      tick();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [safeInterval]);

  return { nonce, startedAt, refresh };
}

/** Matches the `lg:` breakpoint, the one the sidebar and the shell already use. */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * True once the viewport is at `lg`. False during SSR and until the first
 * effect, so the server and the first client render always agree.
 */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const apply = (): void => setDesktop(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  return desktop;
}
