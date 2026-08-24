/**
 * Pluralisation.
 *
 * Two-form languages (Italian, English, German, Spanish, Turkish…) are covered
 * by `plural`: one vs the rest. Languages with more categories — Russian and
 * Ukrainian with one/few/many, Polish, Romanian, Arabic with all six — build a
 * picker with `pluralRules`, which asks CLDR through Intl instead of trying to
 * restate the rules by hand. Languages with no plural distinction at all
 * (Chinese, Japanese, Korean, Indonesian) just fill in `other`.
 */

/** The CLDR categories. A language uses a subset; every language has "other". */
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * The wordings for one noun. Only `other` is required: a category the language
 * never selects can be left out, and a category it does select falls back to
 * `other` rather than rendering nothing.
 */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface PluralPicker {
  /** The right wording for this count. */
  pick(count: number, forms: PluralForms): string;
  /** The count and its noun, e.g. "3 остановки". */
  count(count: number, forms: PluralForms): string;
}

// ---------------------------------------------------------------------------
// Two forms, one vs the rest.
// ---------------------------------------------------------------------------

export function plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other;
}

/** The count and its noun, e.g. "3 corse". */
export function counted(count: number, one: string, other: string): string {
  return `${count} ${plural(count, one, other)}`;
}

// ---------------------------------------------------------------------------
// CLDR categories, for everything the rule above does not fit.
// ---------------------------------------------------------------------------

const SELECTORS = new Map<string, (count: number) => PluralCategory>();

function selectorFor(tag: string): (count: number) => PluralCategory {
  const cached = SELECTORS.get(tag);
  if (cached !== undefined) return cached;

  let select: (count: number) => PluralCategory;
  try {
    const rules = new Intl.PluralRules(tag);
    select = (count) => rules.select(count) as PluralCategory;
  } catch {
    // A runtime without ICU data for this tag. One-vs-rest is right for most of
    // the list and is never worse than throwing while a dictionary loads.
    select = (count) => (count === 1 ? "one" : "other");
  }

  SELECTORS.set(tag, select);
  return select;
}

/**
 * A picker bound to one language. Built once per dictionary at module load, so
 * the Intl object is created once and not on every render.
 */
export function pluralRules(tag: string): PluralPicker {
  const select = selectorFor(tag);
  const pick = (count: number, forms: PluralForms): string => {
    // Number.isFinite guards NaN, which Intl reports as "other" but which would
    // read as a real count to the caller.
    const category = Number.isFinite(count) ? select(count) : "other";
    return forms[category] ?? forms.other;
  };
  return { pick, count: (count, forms) => `${count} ${pick(count, forms)}` };
}
