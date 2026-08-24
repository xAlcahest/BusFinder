/**
 * One radius ladder for the whole app. The settings select and the nearby map
 * chips must offer the same values, otherwise picking one on the map leaves the
 * select with no matching option and the browser silently resets it.
 */

export const RADIUS_OPTIONS: readonly number[] = [250, 500, 1000, 1500, 2000, 3000];

/**
 * The ladder plus whatever is stored right now, so a value written by an older
 * build or by a hand-edited localStorage still shows up as the current choice.
 */
export function radiusChoices(current: number): number[] {
  const values = new Set<number>(RADIUS_OPTIONS);
  if (Number.isFinite(current) && current > 0) values.add(Math.round(current));
  return Array.from(values).sort((a, b) => a - b);
}
