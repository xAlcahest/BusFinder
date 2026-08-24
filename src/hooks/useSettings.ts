"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  hydrate,
  resetSettings,
  serverSettingsSnapshot,
  settingsSnapshot,
  subscribe,
  writeSettings,
} from "@/lib/storage";
import type { Settings } from "@/lib/types";

export interface UseSettings {
  settings: Settings;
  update(patch: Partial<Settings>): void;
  reset(): void;
}

type ResolvedTheme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function prefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(DARK_QUERY).matches;
}

function resolveTheme(theme: Settings["theme"]): ResolvedTheme {
  if (theme === "light" || theme === "dark") return theme;
  return prefersDark() ? "dark" : "light";
}

/**
 * User settings, shared across every mounted instance. Also mirrors the chosen
 * theme onto <html> (data-theme plus the `dark` class) so CSS can react to it.
 */
export function useSettings(): UseSettings {
  const settings = useSyncExternalStore(subscribe, settingsSnapshot, serverSettingsSnapshot);

  useEffect(() => {
    hydrate();
  }, []);

  const theme = settings.theme;
  useEffect(() => {
    const root = document.documentElement;
    const apply = (): void => {
      const resolved = resolveTheme(theme);
      root.dataset.theme = resolved;
      root.classList.toggle("dark", resolved === "dark");
    };
    apply();
    if (theme !== "system" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(DARK_QUERY);
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
    };
  }, [theme]);

  const update = useCallback((patch: Partial<Settings>) => {
    writeSettings(patch);
  }, []);

  const reset = useCallback(() => {
    resetSettings();
  }, []);

  return { settings, update, reset };
}
