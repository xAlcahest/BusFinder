/**
 * The registry. One entry per language; adding a language is one import and
 * one line here, and the compiler then demands a complete dictionary for it.
 *
 * Italian ships inside the main bundle because it is the default and the one
 * the server renders. Every other language is its own chunk, fetched when the
 * reader actually selects it: bundling all of them cost ~200 kB gzip on first
 * paint for twenty languages nobody reads.
 *
 * `dictionaryFor` stays synchronous — formatters and promise callbacks call it
 * without a hook — so it answers with Italian until the chunk lands. Callers
 * that care wait on `loadDictionary` first; the provider does.
 */

import { it, type Dictionary } from "./it";
import { activeLocale, DEFAULT_LOCALE, type Locale } from "./locale";

type Loader = () => Promise<Dictionary>;

/** null for the language already in the bundle. */
const LOADERS: Record<Locale, Loader | null> = {
  it: null,
  en: () => import("./en").then((m) => m.en),
  ar: () => import("./ar").then((m) => m.ar),
  bn: () => import("./bn").then((m) => m.bn),
  de: () => import("./de").then((m) => m.de),
  es: () => import("./es").then((m) => m.es),
  fr: () => import("./fr").then((m) => m.fr),
  hi: () => import("./hi").then((m) => m.hi),
  id: () => import("./id").then((m) => m.id),
  ja: () => import("./ja").then((m) => m.ja),
  ko: () => import("./ko").then((m) => m.ko),
  nl: () => import("./nl").then((m) => m.nl),
  pl: () => import("./pl").then((m) => m.pl),
  pt: () => import("./pt").then((m) => m.pt),
  ro: () => import("./ro").then((m) => m.ro),
  ru: () => import("./ru").then((m) => m.ru),
  tl: () => import("./tl").then((m) => m.tl),
  tr: () => import("./tr").then((m) => m.tr),
  uk: () => import("./uk").then((m) => m.uk),
  ur: () => import("./ur").then((m) => m.ur),
  zh: () => import("./zh").then((m) => m.zh),
};

const READY = new Map<Locale, Dictionary>([[DEFAULT_LOCALE, it]]);
const PENDING = new Map<Locale, Promise<void>>();

/** True when `dictionaryFor(locale)` will answer in that language. */
export function hasDictionary(locale: Locale): boolean {
  return READY.has(locale);
}

/**
 * Resolves once this language is in memory. Never rejects: a chunk that fails
 * to load (offline, or a deploy that moved it) leaves the default dictionary in
 * place, which keeps the app readable instead of blanking it.
 */
export function loadDictionary(locale: Locale): Promise<void> {
  if (READY.has(locale)) return Promise.resolve();

  const inflight = PENDING.get(locale);
  if (inflight !== undefined) return inflight;

  const load = LOADERS[locale];
  if (load === null || load === undefined) return Promise.resolve();

  const promise = load()
    .then((dictionary) => {
      READY.set(locale, dictionary);
    })
    .catch(() => {
      // Deliberate: see the contract above.
    })
    .finally(() => {
      PENDING.delete(locale);
    });

  PENDING.set(locale, promise);
  return promise;
}

/** The strings for a language, or the default while its chunk is in flight. */
export function dictionaryFor(locale: Locale): Dictionary {
  return READY.get(locale) ?? it;
}

/**
 * The dictionary for whatever the UI is currently rendering in. For imperative
 * code (promise callbacks, pure formatters) that cannot call a hook; React
 * components use useT() so they re-render when the language changes.
 */
export function activeDictionary(): Dictionary {
  return dictionaryFor(activeLocale());
}

export type { Dictionary };
