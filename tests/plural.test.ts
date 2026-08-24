/**
 * Plural forms. The old helper knew only "one vs the rest", which is right for
 * Italian and wrong for most of what the app now ships. These pin down the
 * cases that rule got wrong.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { counted, plural, pluralRules } from "@/lib/i18n/plural";

test("one vs the rest, for Italian and English", () => {
  assert.equal(plural(1, "fermata", "fermate"), "fermata");
  assert.equal(plural(0, "fermata", "fermate"), "fermate");
  assert.equal(plural(2, "fermata", "fermate"), "fermate");
  assert.equal(counted(3, "corsa", "corse"), "3 corse");
});

test("French: zero is singular", () => {
  const { count } = pluralRules("fr");
  assert.equal(count(0, { one: "arrêt", other: "arrêts" }), "0 arrêt");
  assert.equal(count(1, { one: "arrêt", other: "arrêts" }), "1 arrêt");
  assert.equal(count(2, { one: "arrêt", other: "arrêts" }), "2 arrêts");
});

test("Portuguese: zero is singular", () => {
  const { count } = pluralRules("pt");
  assert.equal(count(0, { one: "paragem", other: "paragens" }), "0 paragem");
  assert.equal(count(2, { one: "paragem", other: "paragens" }), "2 paragens");
});

test("Romanian: from 20 up it takes 'de'", () => {
  const { count } = pluralRules("ro");
  const f = { one: "stație", few: "stații", other: "de stații" };
  assert.equal(count(1, f), "1 stație");
  assert.equal(count(2, f), "2 stații");
  assert.equal(count(19, f), "19 stații");
  assert.equal(count(21, f), "21 de stații");
  assert.equal(count(100, f), "100 de stații");
});

test("Polish: one, few and many are three distinct forms", () => {
  const { count } = pluralRules("pl");
  const f = { one: "przystanek", few: "przystanki", other: "przystanków" };
  assert.equal(count(1, f), "1 przystanek");
  assert.equal(count(2, f), "2 przystanki");
  assert.equal(count(5, f), "5 przystanków");
  assert.equal(count(22, f), "22 przystanki");
  assert.equal(count(25, f), "25 przystanków");
});

test("Russian and Ukrainian: 21 goes back to singular, 11 does not", () => {
  for (const tag of ["ru", "uk"]) {
    const { pick } = pluralRules(tag);
    const f = { one: "one", few: "few", other: "many" };
    assert.equal(pick(1, f), "one", tag);
    assert.equal(pick(2, f), "few", tag);
    assert.equal(pick(5, f), "many", tag);
    assert.equal(pick(11, f), "many", tag);
    assert.equal(pick(21, f), "one", tag);
    assert.equal(pick(22, f), "few", tag);
  }
});

test("Arabic: the dual exists", () => {
  const { pick } = pluralRules("ar");
  const f = { zero: "zero", one: "one", two: "two", few: "few", many: "many", other: "other" };
  assert.equal(pick(2, f), "two");
  assert.equal(pick(3, f), "few");
  assert.equal(pick(11, f), "many");
});

test("languages without number inflection always use 'other'", () => {
  for (const tag of ["zh", "ja", "ko", "id"]) {
    const { pick } = pluralRules(tag);
    for (const n of [0, 1, 2, 5, 21]) {
      assert.equal(pick(n, { one: "wrong", other: "right" }), "right", `${tag} with ${n}`);
    }
  }
});

test("a missing category falls back to 'other' instead of vanishing", () => {
  const { pick } = pluralRules("ru");
  assert.equal(pick(2, { other: "only this one" }), "only this one");
});

test("a non-finite count does not break the selector", () => {
  const { pick } = pluralRules("ru");
  for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.equal(typeof pick(bad, { one: "a", few: "b", other: "c" }), "string");
  }
});

test("a tag ICU does not know degrades instead of throwing", () => {
  const { pick } = pluralRules("xx-not-a-language");
  assert.equal(typeof pick(1, { one: "a", other: "b" }), "string");
});
