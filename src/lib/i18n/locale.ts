/**
 * What language the UI is in, and how the "system" setting resolves to one.
 *
 * Dependency-free on purpose: the layout bootstrap script, the formatters and
 * the React provider all need this, and the last-resort global error screen
 * has no provider above it at all.
 */

import { STORAGE_KEYS, type Settings } from "@/lib/types";

/**
 * Languages the UI actually ships: the world's most spoken, plus the ones the
 * communities living in Rome actually read. Add a dictionary, a code here, a
 * name below and an Intl tag in format.ts to grow.
 */
export const LOCALES = [
  "it",
  "en",
  "ar",
  "bn",
  "de",
  "es",
  "fr",
  "hi",
  "id",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "tl",
  "tr",
  "uk",
  "ur",
  "zh",
] as const;

export type Locale = (typeof LOCALES)[number];

/** What the user picked. "system" defers to the browser. */
export type LanguagePreference = Locale | "system";

/**
 * types.ts is the contract and stays import-free, so it spells the same union
 * out by hand. This breaks the build the moment the two lists disagree.
 */
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const _languageUnionMatchesContract: Exact<LanguagePreference, Settings["language"]> = true;
void _languageUnionMatchesContract;

export const DEFAULT_LOCALE: Locale = "it";

/**
 * Each language named in itself, because that is what someone hunting for their
 * own language in a list can actually recognise. Endonyms do not change with
 * the UI language, so they live here and not in the dictionaries.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ar: "العربية",
  bn: "বাংলা",
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  ru: "Русский",
  tl: "Tagalog",
  tr: "Türkçe",
  uk: "Українська",
  ur: "اردو",
  zh: "中文",
};

/**
 * Right-to-left scripts. Drives the `dir` attribute on <html>; the layout
 * bootstrap serialises this list so the first paint is already correct.
 */
export const RTL_LOCALES = ["ar", "ur"] as const satisfies readonly Locale[];

const RTL: ReadonlySet<string> = new Set<string>(RTL_LOCALES);

export type Direction = "ltr" | "rtl";

export function directionFor(locale: Locale): Direction {
  return RTL.has(locale) ? "rtl" : "ltr";
}

/**
 * Language subtags that mean one of ours under a different name. Browsers on
 * Android report Filipino as "fil", and "in" is the legacy code for Indonesian
 * that some runtimes still emit. The layout bootstrap serialises this, so it
 * resolves exactly the same tags React does.
 *
 * Null-prototype: a plain object would resolve "constructor" or "toString" to
 * an inherited function and hand it back typed as a Locale.
 */
export const LOCALE_ALIASES: Record<string, Locale> = Object.assign(
  Object.create(null) as Record<string, Locale>,
  {
    fil: "tl",
    in: "id",
    // Written Chinese: every regional tag reduces to the one dictionary we ship.
    cmn: "zh",
    yue: "zh",
  } satisfies Record<string, Locale>,
);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === "system" || isLocale(value);
}

/** "en-GB" and "EN" both mean English; anything unknown falls back to Italian. */
export function localeFromTag(tag: unknown): Locale | null {
  if (typeof tag !== "string") return null;
  const base = tag.trim().toLowerCase().split(/[-_]/)[0];
  if (isLocale(base)) return base;
  const alias = LOCALE_ALIASES[base];
  return alias !== undefined ? alias : null;
}

/** The browser's preferred language, or null when there is no browser. */
export function browserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const list = Array.isArray(navigator.languages) ? navigator.languages : [];
  for (const tag of list) {
    const found = localeFromTag(tag);
    if (found !== null) return found;
  }
  return localeFromTag(navigator.language);
}

/** Turns the stored preference into the language to actually render in. */
export function resolveLocale(preference: LanguagePreference): Locale {
  if (isLocale(preference)) return preference;
  return browserLocale() ?? DEFAULT_LOCALE;
}

/**
 * The stored preference, read straight from localStorage. Used where the
 * settings store is not available: the pre-paint bootstrap and global-error.
 */
export function readStoredLanguage(): LanguagePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (raw === null) return "system";
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return "system";
    const value = (parsed as Record<string, unknown>).language;
    return isLanguagePreference(value) ? value : "system";
  } catch {
    // Storage disabled or a hand-edited value: the default is always safe.
    return "system";
  }
}

// ---------------------------------------------------------------------------
// The locale imperative code can read. The React provider keeps it current, so
// promise callbacks and pure formatters do not have to be handed a locale.
// ---------------------------------------------------------------------------

let active: Locale = DEFAULT_LOCALE;

export function setActiveLocale(locale: Locale): void {
  active = locale;
}

export function activeLocale(): Locale {
  return active;
}
