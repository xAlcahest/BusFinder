/**
 * Language resolution. `localeFromTag` reads a browser-supplied string, so it
 * has to survive whatever arrives, including keys that exist on every object
 * in JavaScript.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_LOCALE,
  directionFor,
  isLanguagePreference,
  isLocale,
  LOCALE_ALIASES,
  LOCALES,
  localeFromTag,
  resolveLocale,
  RTL_LOCALES,
} from "@/lib/i18n/locale";

test("a regional tag reduces to its language", () => {
  assert.equal(localeFromTag("en-GB"), "en");
  assert.equal(localeFromTag("it_IT"), "it");
  assert.equal(localeFromTag("  PT-br  "), "pt");
  assert.equal(localeFromTag("zh-Hant-TW"), "zh");
});

test("aliases land on a language we actually ship", () => {
  assert.equal(localeFromTag("fil-PH"), "tl");
  assert.equal(localeFromTag("in-ID"), "id");
  assert.equal(localeFromTag("cmn"), "zh");
  assert.equal(localeFromTag("yue-HK"), "zh");
});

test("a language we do not ship does not invent a result", () => {
  assert.equal(localeFromTag("sv"), null);
  assert.equal(localeFromTag(""), null);
  assert.equal(localeFromTag("   "), null);
  assert.equal(localeFromTag(undefined), null);
  assert.equal(localeFromTag(42), null);
  assert.equal(localeFromTag(null), null);
});

test("keys inherited from Object do not pass for languages", () => {
  // With an ordinary-prototype map, ALIASES["constructor"] returns a function,
  // which then travels typed as a Locale.
  for (const probe of ["constructor", "toString", "hasOwnProperty", "valueOf", "__proto__"]) {
    assert.equal(localeFromTag(probe), null, `"${probe}" was accepted as a language`);
  }
  assert.equal(Object.getPrototypeOf(LOCALE_ALIASES), null, "the alias map still has a prototype");
});

test("every alias points at a language that exists", () => {
  for (const [from, to] of Object.entries(LOCALE_ALIASES)) {
    assert.ok(isLocale(to), `alias ${from} points at "${to}", which we do not ship`);
    assert.ok(!isLocale(from), `alias ${from} is already a language: the entry is dead weight`);
  }
});

test("resolveLocale honours an explicit choice and falls back to the default", () => {
  for (const locale of LOCALES) {
    assert.equal(resolveLocale(locale), locale);
  }
  // No window here, so "system" can only land on the default. Node has had a
  // global navigator since v21, which is why browserLocale tests for window.
  assert.equal(resolveLocale("system"), DEFAULT_LOCALE);
});

test("the type guards accept and reject the right things", () => {
  assert.ok(isLocale("it"));
  assert.ok(!isLocale("system"));
  assert.ok(!isLocale("sv"));
  assert.ok(isLanguagePreference("system"));
  assert.ok(isLanguagePreference("ar"));
  assert.ok(!isLanguagePreference("nope"));
});

test("right-to-left languages are declared and consistent", () => {
  assert.deepEqual([...RTL_LOCALES].sort(), ["ar", "ur"]);
  for (const locale of RTL_LOCALES) {
    assert.ok(isLocale(locale), `${locale} is declared RTL but is not among the languages`);
    assert.equal(directionFor(locale), "rtl");
  }
  for (const locale of LOCALES) {
    if (!RTL_LOCALES.includes(locale as (typeof RTL_LOCALES)[number])) {
      assert.equal(directionFor(locale), "ltr", `${locale} comes out RTL by mistake`);
    }
  }
});

test("the language list has no duplicates and contains the default", () => {
  assert.equal(new Set(LOCALES).size, LOCALES.length);
  assert.ok(LOCALES.includes(DEFAULT_LOCALE));
});
