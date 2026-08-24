/**
 * Formatting. Two things here are easy to break and expensive to notice: the
 * GTFS service day, which ends at 04:00 and not at midnight, and the promise
 * that every formatter answers with a string even when handed nonsense.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatClock,
  formatDistance,
  formatMinutes,
  formatSecOfDay,
  isAfterMidnight,
  serviceDateFor,
} from "@/lib/format";
import { LOCALES } from "@/lib/i18n/locale";

test("a time past 24:00 wraps back onto the clock face", () => {
  assert.equal(formatSecOfDay(0), "00:00");
  assert.equal(formatSecOfDay(8 * 3600 + 30 * 60), "08:30");
  // 25:30 is the night of the previous service day, not a mistake.
  assert.equal(formatSecOfDay(25 * 3600 + 30 * 60), "01:30");
  assert.equal(formatSecOfDay(30 * 3600), "06:00");
});

test("isAfterMidnight recognises the night tail of a service day", () => {
  assert.equal(isAfterMidnight(23 * 3600), false);
  assert.equal(isAfterMidnight(24 * 3600), true);
  assert.equal(isAfterMidnight(25 * 3600 + 1800), true);
  assert.equal(isAfterMidnight(Number.NaN), false);
});

test("the service day rolls over at 04:00, not at midnight", () => {
  // Rome times throughout: the app always formats in Europe/Rome.
  const beforeCutoff = new Date("2026-08-24T01:30:00+02:00");
  const afterCutoff = new Date("2026-08-24T04:30:00+02:00");
  assert.equal(serviceDateFor(beforeCutoff), "20260823", "01:30 belongs to the day before");
  assert.equal(serviceDateFor(afterCutoff), "20260824");
});

test("an invalid date does not produce a made-up one", () => {
  assert.equal(serviceDateFor(new Date("not a date")), "00000000");
});

test("sub-minute waits read as 'arriving', not '0 min'", () => {
  assert.equal(formatMinutes(0, "it"), "in arrivo");
  assert.equal(formatMinutes(-5, "it"), "in arrivo");
  assert.equal(formatMinutes(1, "it"), "1 min");
  assert.equal(formatMinutes(12.7, "it"), "12 min");
});

test("distances switch to kilometres and use the language's separator", () => {
  assert.equal(formatDistance(250, "it"), "250 m");
  assert.equal(formatDistance(999, "it"), "999 m");
  assert.equal(formatDistance(1200, "it"), "1,2 km");
  assert.equal(formatDistance(1200, "en"), "1.2 km");
  // Below zero does not exist: a negative distance is a bug upstream, not a display.
  assert.equal(formatDistance(-10, "it"), "0 m");
});

test("no formatter ever returns anything other than a string", () => {
  const rubbish = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1, 0];
  for (const locale of LOCALES) {
    for (const value of rubbish) {
      for (const fn of [formatMinutes, formatDistance, formatClock, formatSecOfDay]) {
        const out = fn(value, locale);
        assert.equal(typeof out, "string", `${fn.name}(${value}, ${locale})`);
        assert.notEqual(out.length, 0, `${fn.name}(${value}, ${locale}) came back empty`);
        assert.ok(!out.includes("undefined"), `${fn.name}(${value}, ${locale}) = "${out}"`);
        assert.ok(!out.includes("NaN"), `${fn.name}(${value}, ${locale}) = "${out}"`);
      }
    }
  }
});

test("the clock is 24-hour in every language", () => {
  // 20:14 in Rome. On a 12-hour clock this would show "8" and a suffix.
  const evening = Date.UTC(2026, 7, 24, 18, 14) / 1000;
  for (const locale of LOCALES) {
    const clock = formatClock(evening, locale);
    assert.match(clock, /20/, `${locale} does not show 20: "${clock}"`);
    assert.ok(!/am|pm|AM|PM/.test(clock), `${locale} uses a 12-hour clock: "${clock}"`);
  }
});

test("digits stay Latin even where ICU would pick another set", () => {
  // Rome's stop signs print Latin digits: the numbers have to match.
  for (const locale of ["ar", "bn"] as const) {
    assert.match(formatDistance(250, locale), /250/, `${locale} does not use Latin digits`);
  }
});
