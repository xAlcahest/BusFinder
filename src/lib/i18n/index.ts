/**
 * One import point for the UI: `import { useT } from "@/lib/i18n"`.
 * Adding a language means adding a dictionary module and registering it in
 * dictionaries.ts; nothing here changes.
 */

export { LocaleProvider, useLocale, useStandaloneT, useT } from "./provider";
export { activeDictionary, dictionaryFor, type Dictionary } from "./dictionaries";
export {
  activeLocale,
  browserLocale,
  DEFAULT_LOCALE,
  directionFor,
  isLanguagePreference,
  isLocale,
  LOCALE_NAMES,
  LOCALES,
  readStoredLanguage,
  resolveLocale,
  setActiveLocale,
  type Direction,
  type LanguagePreference,
  type Locale,
} from "./locale";
export {
  counted,
  plural,
  pluralRules,
  type PluralCategory,
  type PluralForms,
  type PluralPicker,
} from "./plural";
