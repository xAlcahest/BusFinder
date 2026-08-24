/**
 * Every dictionary must have exactly the shape of it.ts, and every string in it
 * must actually render. A missing key is already a compile error; what this
 * catches is the rest: a function that throws on some count, one that
 * interpolates `undefined`, an empty string, or Italian left inside another
 * language.
 *
 * Hermetic: pure data, no network, no database, no DOM.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { it as italian } from "@/lib/i18n/it";
import { dictionaryFor, loadDictionary } from "@/lib/i18n/dictionaries";
import { directionFor, LOCALE_NAMES, LOCALES, type Locale } from "@/lib/i18n/locale";

type Leaf = string | ((...args: never[]) => unknown);

/** Plausible arguments per key, so every parameterised string can be called. */
const NUMBERS = [0, 1, 2, 3, 5, 11, 21, 22, 100];

function argsFor(fn: (...a: never[]) => unknown, path: string): unknown[][] {
  if (path.endsWith("typeLower") || path.endsWith("typeShort")) {
    return [[0], [1], [2], [3], [4], [99]];
  }
  if (path.endsWith("bannerFrozenStrong")) return [[null], [5]];
  if (path.endsWith("summary")) return NUMBERS.map((c) => [c, "08:00", "20:00", true]);
  if (path.endsWith("finishedDetail")) return NUMBERS.map((c) => [c, "23:40"]);
  if (path.endsWith("movedTo")) return [["Termini", 2, 5]];
  if (path.endsWith("itinerarySr")) return [[1, "08:00", "08:30"]];
  if (path.endsWith("hoursMinutes")) return [[2, "30"]];
  if (path.endsWith("filteredCount") || path.endsWith("activeCount")) {
    return NUMBERS.map((c) => [c, 7]);
  }
  if (path.endsWith("codeProgress")) return [[10, 20]];
  if (path.endsWith("localDataSummary")) return [[3, 4]];
  if (path.endsWith("vehicleTitleInbound")) return [["64", "tra 3 min", true]];
  if (path.endsWith("vehicleTitleOnLine")) return [["64", false]];
  if (path.endsWith("hereInAt") || path.endsWith("expectedSr")) return [["tra 3 min", "08:15"]];
  if (path.endsWith("windowBetween")) return [["1/9", "3/9"]];
  if (path.endsWith("walkLeg")) return [["300 m", "4 min"]];
  if (path.endsWith("effect")) return [["NO_SERVICE"], ["DETOUR"], ["NOT_A_CODE"]];
  if (path.endsWith("cause")) return [["STRIKE"], ["ACCIDENT"], ["NOT_A_CODE"]];
  if (/count|Count|minutes|hours|seconds|max|typed|total|shown|position|index|radius|favorites|recents|maxChars|status/i.test(path)) {
    return NUMBERS.map((c) => Array.from({ length: fn.length }, () => c));
  }
  return [Array.from({ length: fn.length }, () => "X")];
}

function walk(value: unknown, prefix: string, visit: (path: string, leaf: Leaf) => void): void {
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, prefix === "" ? key : `${prefix}.${key}`, visit);
    }
    return;
  }
  visit(prefix, value as Leaf);
}

function pathsOf(dictionary: unknown): string[] {
  const out: string[] = [];
  walk(dictionary, "", (path) => out.push(path));
  return out.sort();
}

const REFERENCE = pathsOf(italian);

/** Words distinctive enough that finding them elsewhere means a missed translation. */
const ITALIAN_TELLS = ["Fermata ", "Preferiti", "Impostazioni", "Nessun ", "Aggiornato"];

test("the reference dictionary is not empty", () => {
  assert.ok(REFERENCE.length > 400, `only ${REFERENCE.length} keys`);
});

for (const locale of LOCALES) {
  test(`${locale}: same shape as Italian, and every string renders`, async () => {
    await loadDictionary(locale);
    const dictionary = dictionaryFor(locale);

    assert.deepEqual(pathsOf(dictionary), REFERENCE, `${locale} does not match the keys of it`);

    let calls = 0;
    walk(dictionary, "", (path, leaf) => {
      if (typeof leaf === "string") {
        assert.notEqual(leaf.length, 0, `${locale}: empty string at ${path}`);
        if (locale !== "it") {
          for (const tell of ITALIAN_TELLS) {
            assert.ok(!leaf.includes(tell), `${locale}: Italian left at ${path}: "${leaf}"`);
          }
        }
        return;
      }
      assert.equal(typeof leaf, "function", `${locale}: ${path} is neither a string nor a function`);

      for (const args of argsFor(leaf, path)) {
        const out = leaf(...(args as never[]));
        calls += 1;
        // effect/cause answer null for a code they do not know; that is the contract.
        if (out === null && (path.endsWith("effect") || path.endsWith("cause"))) continue;
        assert.equal(typeof out, "string", `${locale}: ${path}(${JSON.stringify(args)}) did not return a string`);
        const text = out as string;
        assert.notEqual(text.length, 0, `${locale}: ${path} returned an empty string`);
        assert.ok(!text.includes("undefined"), `${locale}: ${path}(${JSON.stringify(args)}) = "${text}"`);
        assert.ok(!text.includes("[object"), `${locale}: ${path}(${JSON.stringify(args)}) = "${text}"`);
      }
    });

    assert.ok(calls > 200, `${locale}: only ${calls} calls made`);
  });
}

test("every language has an endonym and a direction", () => {
  for (const locale of LOCALES) {
    const name = LOCALE_NAMES[locale];
    assert.ok(typeof name === "string" && name.length > 0, `${locale} has no endonym`);
    assert.match(directionFor(locale), /^(ltr|rtl)$/);
  }
  assert.equal(directionFor("ar" as Locale), "rtl");
  assert.equal(directionFor("ur" as Locale), "rtl");
  assert.equal(directionFor("it" as Locale), "ltr");
});

test("endonyms are all distinct", () => {
  const names = LOCALES.map((l) => LOCALE_NAMES[l]);
  assert.equal(new Set(names).size, names.length, "two languages share the same endonym");
});

test("the brand is the same in every language", async () => {
  for (const locale of LOCALES) {
    await loadDictionary(locale);
    assert.equal(dictionaryFor(locale).brand.name, "BusFinder", `${locale} uses a different brand`);
  }
});
