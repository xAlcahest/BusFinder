/**
 * Display formatting for the whole UI. Pure functions, no side effects, no
 * localStorage, no DOM. Every time is rendered in Europe/Rome regardless of the
 * timezone of the server or of the browser, so SSR and client agree.
 *
 * The words come from the dictionaries and the number/date shapes from Intl, so
 * "1,2 km" in Italian is "1.2 km" in English without a second code path. The
 * locale defaults to whatever the UI is currently rendering in, which keeps
 * every existing call site correct.
 */

import { activeDictionary, dictionaryFor } from "@/lib/i18n/dictionaries";
import { activeLocale, type Locale } from "@/lib/i18n/locale";

const TIME_ZONE = "Europe/Rome";
const SEC_PER_DAY = 86_400;
const SEC_PER_HOUR = 3_600;

/** Service days start at 04:00 local: 01:30 still belongs to the day before. */
const SERVICE_DAY_CUTOFF_HOUR = 4;

/**
 * BCP 47 tags for Intl. Only the shapes differ; the words come from the
 * dictionary. Arabic and Bengali are pinned to Latin digits (-u-nu-latn): stop
 * codes and line numbers have to match what is printed on the pole.
 */
export const INTL_TAG: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  ar: "ar-u-nu-latn",
  bn: "bn-BD-u-nu-latn",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  hi: "hi-IN",
  id: "id-ID",
  ja: "ja-JP",
  ko: "ko-KR",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-PT",
  ro: "ro-RO",
  ru: "ru-RU",
  tl: "fil-PH",
  tr: "tr-TR",
  uk: "uk-UA",
  ur: "ur-PK",
  zh: "zh-CN",
};

/** One Intl instance per locale and kind: building them is not cheap. */
function memo<T>(build: (locale: Locale) => T): (locale: Locale) => T {
  const cache = new Map<Locale, T>();
  return (locale) => {
    const hit = cache.get(locale);
    if (hit !== undefined) return hit;
    const made = build(locale);
    cache.set(locale, made);
    return made;
  };
}

const clockFormatter = memo(
  (locale) =>
    new Intl.DateTimeFormat(INTL_TAG[locale], {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }),
);

const dateTimeFormatter = memo(
  (locale) =>
    new Intl.DateTimeFormat(INTL_TAG[locale], {
      timeZone: TIME_ZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }),
);

const dayFormatter = memo(
  (locale) =>
    new Intl.DateTimeFormat(INTL_TAG[locale], {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
);

const longDateFormatter = memo(
  (locale) =>
    new Intl.DateTimeFormat(INTL_TAG[locale], {
      timeZone: TIME_ZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
);

// en-US keeps the parts in ASCII digits, which we then read numerically.
const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

const kmOneDecimal = memo(
  (locale) =>
    new Intl.NumberFormat(INTL_TAG[locale], {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
);

const kmNoDecimal = memo(
  (locale) => new Intl.NumberFormat(INTL_TAG[locale], { maximumFractionDigits: 0 }),
);

function words(locale: Locale | undefined) {
  return locale === undefined ? activeDictionary().format : dictionaryFor(locale).format;
}

function tag(locale: Locale | undefined): Locale {
  return locale ?? activeLocale();
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && Number.isFinite(date.getTime());
}

function toDate(unixSeconds: number): Date | null {
  if (!Number.isFinite(unixSeconds)) return null;
  const date = new Date(Math.round(unixSeconds) * 1000);
  return isValidDate(date) ? date : null;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Minutes until an arrival. Anything under a minute (including negative, i.e.
 * already due) reads as "in arrivo" / "due".
 */
export function formatMinutes(minutes: number, locale?: Locale): string {
  const w = words(locale);
  if (!Number.isFinite(minutes)) return w.unavailable;
  if (minutes < 1) return w.due;
  return w.minutes(Math.floor(minutes));
}

/** Absolute unix seconds to "20:14" in Rome local time. */
export function formatClock(unixSeconds: number, locale?: Locale): string {
  const date = toDate(unixSeconds);
  if (date === null) return words(locale).clockUnavailable;
  return clockFormatter(tag(locale)).format(date);
}

/** Absolute unix seconds to "2 agosto 2026, 09:00". */
export function formatDateTime(unixSeconds: number, locale?: Locale): string {
  const date = toDate(unixSeconds);
  if (date === null) return words(locale).dateUnavailable;
  return dateTimeFormatter(tag(locale)).format(date);
}

/** Absolute unix seconds to "domenica 2 agosto". */
export function formatDay(unixSeconds: number, locale?: Locale): string {
  const date = toDate(unixSeconds);
  if (date === null) return words(locale).dateUnavailable;
  return dayFormatter(tag(locale)).format(date);
}

/**
 * Seconds after midnight of the service day to "HH:MM". GTFS allows 25:30:00
 * for a trip that runs past midnight: the meaning is kept (it is still the same
 * service day) but the label wraps into 0..23, so 25:30:00 shows as "01:30".
 */
export function formatSecOfDay(sec: number, locale?: Locale): string {
  if (!Number.isFinite(sec)) return words(locale).clockUnavailable;
  const whole = Math.floor(sec);
  const wrapped = ((whole % SEC_PER_DAY) + SEC_PER_DAY) % SEC_PER_DAY;
  const hours = Math.floor(wrapped / SEC_PER_HOUR);
  const minutes = Math.floor((wrapped % SEC_PER_HOUR) / 60);
  return `${pad2(hours)}:${pad2(minutes)}`;
}

/** True when the value belongs to the small hours of the next calendar day. */
export function isAfterMidnight(sec: number): boolean {
  return Number.isFinite(sec) && sec >= SEC_PER_DAY;
}

/** Metres to "250 m" / "1,2 km", with the locale's own decimal separator. */
export function formatDistance(metres: number, locale?: Locale): string {
  const w = words(locale);
  if (!Number.isFinite(metres)) return w.unavailable;
  const clamped = Math.max(0, metres);
  const rounded = Math.round(clamped);
  if (rounded < 1000) return w.metres(rounded);
  const km = clamped / 1000;
  const formatted =
    km < 10 ? kmOneDecimal(tag(locale)).format(km) : kmNoDecimal(tag(locale)).format(km);
  return w.kilometres(formatted);
}

/**
 * Service date (YYYYMMDD) a moment belongs to, with the 04:00 Rome cutoff.
 * Returns "00000000" for an invalid Date so callers degrade to an empty
 * timetable instead of querying a garbage date.
 */
export function serviceDateFor(date: Date): string {
  if (!isValidDate(date)) return "00000000";

  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  for (const part of partsFormatter.formatToParts(date)) {
    const value = Number(part.value);
    if (!Number.isFinite(value)) continue;
    if (part.type === "year") year = value;
    else if (part.type === "month") month = value;
    else if (part.type === "day") day = value;
    else if (part.type === "hour") hour = value;
  }
  if (year === 0 || month === 0 || day === 0) return "00000000";

  // Before the cutoff the service day is the previous calendar day. Stepping
  // back in UTC on a bare date avoids DST arithmetic entirely.
  const asUtc = Date.UTC(year, month - 1, day);
  const shifted = new Date(hour < SERVICE_DAY_CUTOFF_HOUR ? asUtc - SEC_PER_DAY * 1000 : asUtc);
  return `${shifted.getUTCFullYear()}${pad2(shifted.getUTCMonth() + 1)}${pad2(shifted.getUTCDate())}`;
}

/** "YYYYMMDD" to "2 agosto 2026", or null when the string is not a date. */
export function formatServiceDate(serviceDate: string, locale?: Locale): string | null {
  if (!/^\d{8}$/.test(serviceDate)) return null;
  const year = Number(serviceDate.slice(0, 4));
  const month = Number(serviceDate.slice(4, 6));
  const day = Number(serviceDate.slice(6, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Noon UTC: far enough from both midnights that the timezone cannot shift it.
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (!isValidDate(date)) return null;
  return longDateFormatter(tag(locale)).format(date);
}

/**
 * Age of a piece of data: "aggiornato 12 s fa", "aggiornato 3 min fa", or a
 * clock time once it is more than an hour old. `nowMs` is injectable so the
 * function stays pure and testable.
 */
export function formatAge(
  unixSeconds: number,
  nowMs: number = Date.now(),
  locale?: Locale,
): string {
  const w = words(locale);
  if (!Number.isFinite(unixSeconds) || !Number.isFinite(nowMs)) return w.ageUnknown;
  const elapsed = Math.max(0, Math.round(nowMs / 1000 - unixSeconds));
  if (elapsed < 60) return w.ageSeconds(elapsed);
  if (elapsed < SEC_PER_HOUR) return w.ageMinutes(Math.floor(elapsed / 60));
  return w.ageAt(formatClock(unixSeconds, locale));
}

/** Seconds of delay to "+2 min" / "-1 min" / "in orario". */
export function formatDelay(delaySec: number | null, locale?: Locale): string | null {
  if (delaySec === null || !Number.isFinite(delaySec)) return null;
  const w = words(locale);
  const minutes = Math.round(delaySec / 60);
  if (minutes === 0) return w.onTime;
  return minutes > 0 ? w.delayLate(minutes) : w.delayEarly(minutes);
}
