"use client";

/**
 * The locale for the React tree. It follows `settings.language` through the
 * same store every other preference uses, so switching the language in
 * /settings repaints the whole app with no reload.
 *
 * "system" is resolved only after hydration: the server has no navigator, so
 * resolving it during the first client render would make the two disagree.
 * Until then the UI renders the default language, exactly as the server did.
 *
 * Every language but the default is a separate chunk, so there is a short
 * window after hydration where the words are still Italian. `lang` and `dir`
 * follow the *chosen* language immediately, matching what the pre-paint
 * bootstrap already put on <html>, so the layout never flips twice.
 */

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  hydrate,
  serverSettingsSnapshot,
  settingsSnapshot,
  subscribe,
} from "@/lib/storage";
import {
  activeDictionary,
  dictionaryFor,
  hasDictionary,
  loadDictionary,
  type Dictionary,
} from "./dictionaries";
import {
  DEFAULT_LOCALE,
  directionFor,
  readStoredLanguage,
  resolveLocale,
  setActiveLocale,
  type Locale,
} from "./locale";

interface LocaleValue {
  locale: Locale;
  t: Dictionary;
}

const FALLBACK: LocaleValue = { locale: DEFAULT_LOCALE, t: dictionaryFor(DEFAULT_LOCALE) };

const LocaleContext = createContext<LocaleValue>(FALLBACK);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, settingsSnapshot, serverSettingsSnapshot);
  const [mounted, setMounted] = useState(false);
  // The language whose chunk has finished loading, successfully or not.
  const [settledFor, setSettledFor] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, []);

  const chosen = mounted ? resolveLocale(settings.language) : DEFAULT_LOCALE;
  // Render in the chosen language only once its strings are in memory.
  const locale = hasDictionary(chosen) ? chosen : DEFAULT_LOCALE;

  useEffect(() => {
    if (hasDictionary(chosen)) {
      setSettledFor(chosen);
      return;
    }
    let alive = true;
    void loadDictionary(chosen).then(() => {
      if (alive) setSettledFor(chosen);
    });
    return () => {
      alive = false;
    };
  }, [chosen]);

  // Imperative code (fetch error paths, formatters) reads this. Assigning in
  // render is idempotent and has to happen before the children render.
  setActiveLocale(locale);

  useEffect(() => {
    // Before hydration the bootstrap already wrote these; rewriting them with
    // the default would flip the layout and then flip it straight back.
    if (!mounted) return;
    // Optimistic while the chunk is in flight, honest once we know it failed.
    const applied = settledFor === chosen ? locale : chosen;
    document.documentElement.lang = applied;
    document.documentElement.dir = directionFor(applied);
  }, [mounted, chosen, locale, settledFor]);

  return (
    <LocaleContext.Provider value={{ locale, t: dictionaryFor(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** The strings for the current language. */
export function useT(): Dictionary {
  return useContext(LocaleContext).t;
}

/** The current language code, for the formatters that take one. */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/**
 * Locale without a provider, for the global error screen: it replaces the root
 * layout, so nothing is mounted above it. Same hydration rule as the provider.
 */
export function useStandaloneT(): Dictionary {
  const [dictionary, setDictionary] = useState<Dictionary>(FALLBACK.t);

  useEffect(() => {
    const locale = resolveLocale(readStoredLanguage());
    let alive = true;
    void loadDictionary(locale).then(() => {
      if (!alive) return;
      // No provider here, so nothing else keeps activeLocale() in step.
      setActiveLocale(hasDictionary(locale) ? locale : DEFAULT_LOCALE);
      setDictionary(dictionaryFor(locale));
    });
    return () => {
      alive = false;
    };
  }, []);

  return dictionary;
}

export { activeDictionary };
