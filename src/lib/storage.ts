/**
 * The only module allowed to touch localStorage.
 *
 * Everything here is SSR safe (window may not exist), defensive on read
 * (localStorage is user-writable and survives version changes, so a corrupt or
 * hand-edited value must degrade to a default, never crash) and tolerant on
 * write (private mode and full quotas fail silently for the user, loudly in the
 * console). Parsed values are cached in module scope so that every hook
 * instance in the page shares one source of truth, and subscribers are notified
 * on every change, including changes made in another tab.
 */

import {
  DEFAULT_SETTINGS,
  DEFAULT_SYNC_STATE,
  STORAGE_KEYS,
  type Favorite,
  type FavoriteKind,
  type FavoriteTarget,
  type RecentStop,
  type Settings,
  type SyncPayload,
  type SyncState,
  type SyncTombstone,
} from "@/lib/types";
import { LOCALES } from "@/lib/i18n/locale";

// ---------------------------------------------------------------------------
// Limits. All of them bound how much a hostile or broken value can cost us.
// ---------------------------------------------------------------------------

const MAX_FAVORITES = 200;
const MAX_RECENTS = 20;
/** Upper bound on how many stored entries we are willing to even look at. */
const MAX_PARSED_ENTRIES = 2_000;
const MAX_ID_CHARS = 64;
const MAX_NAME_CHARS = 120;
const MAX_TAG_CHARS = 60;
/** "#RRGGBB" plus room for whatever the feed actually publishes. */
const MAX_COLOR_CHARS = 16;
const MAX_PINNED_ROUTES = 30;
const MAX_IMPORT_CHARS = 1_000_000;
const MAX_TOMBSTONES = 500;
const MAX_CODE_CHARS = 40;
const SYNC_ID_RE = /^[0-9a-f]{64}$/;

/** A deletion older than this is assumed to have reached every device. */
export const TOMBSTONE_TTL_MS = 90 * 86_400_000;

const REFRESH_MIN_SEC = 10;
const REFRESH_MAX_SEC = 600;
const RADIUS_MIN_M = 100;
const RADIUS_MAX_M = 5_000;
const ARRIVALS_MIN = 1;
const ARRIVALS_MAX = 50;

const THEMES: ReadonlyArray<Settings["theme"]> = ["system", "light", "dark"];
const LANGUAGES: ReadonlyArray<Settings["language"]> = ["system", ...LOCALES];

/** Dispatched on `window` after any local mutation, for non-React listeners. */
export const STORAGE_EVENT = "probus:storage";

const OWN_KEYS: readonly string[] = [
  STORAGE_KEYS.favorites,
  STORAGE_KEYS.recents,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.tombstones,
  STORAGE_KEYS.sync,
];

// Stable references: React's useSyncExternalStore compares snapshots by
// identity, so the "nothing loaded yet" value must always be the same object.
const EMPTY_FAVORITES: Favorite[] = [];
const EMPTY_RECENTS: RecentStop[] = [];
const EMPTY_TOMBSTONES: SyncTombstone[] = [];

/**
 * Sync bookkeeping as it is actually stored. `settingsUpdatedAt` is local only:
 * Settings carries no timestamp of its own and types.ts is frozen, so the last
 * settings write has to be remembered here for the merge to resolve conflicts.
 */
interface LocalSyncState extends SyncState {
  settingsUpdatedAt: number;
}

const DEFAULT_LOCAL_SYNC_STATE: LocalSyncState = { ...DEFAULT_SYNC_STATE, settingsUpdatedAt: 0 };

interface CacheState {
  favorites: Favorite[] | null;
  recents: RecentStop[] | null;
  settings: Settings | null;
  tombstones: SyncTombstone[] | null;
  sync: LocalSyncState | null;
}

const cache: CacheState = {
  favorites: null,
  recents: null,
  settings: null,
  tombstones: null,
  sync: null,
};

// ---------------------------------------------------------------------------
// Low level access
// ---------------------------------------------------------------------------

function getStore(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Storage disabled by the browser (cookies off, embedded webview).
    return null;
  }
}

function readJson(key: string): unknown {
  const store = getStore();
  if (store === null) return undefined;
  let raw: string | null = null;
  try {
    raw = store.getItem(key);
  } catch (err) {
    console.warn(`[probus] localStorage read failed for ${key}`, err);
    return undefined;
  }
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    // Corrupt or hand-edited value: treat it as absent.
    return undefined;
  }
}

function persist(key: string, value: unknown): boolean {
  const store = getStore();
  if (store === null) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Quota exceeded or storage disabled: the in-memory state stays correct.
    console.warn(`[probus] localStorage write failed for ${key}`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Free text: truncated to a sane length, since it is only ever displayed. */
function asTrimmedString(value: unknown, maxChars: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, maxChars);
}

/** Identifiers are never truncated: half an id is a wrong id, so reject it. */
function asId(value: unknown, maxChars: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed.length > maxChars ? null : trimmed;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = asFiniteNumber(value);
  if (parsed === null) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

/**
 * Identity of a favourite. A stop and a line can carry the same number, so the
 * id alone is not enough to tell two entries apart.
 */
export function favoriteKey(item: { kind: FavoriteKind; id: string }): string {
  return `${item.kind}:${item.id}`;
}

/** Anything that is not the string "line" is a stop, v1 entries included. */
function parseKind(raw: unknown): FavoriteKind {
  return raw === "line" ? "line" : "stop";
}

/** One malformed entry is dropped on its own; the rest of the list survives. */
function parseFavorite(raw: unknown, index: number): Favorite | null {
  if (!isRecord(raw)) return null;
  const kind = parseKind(raw.kind);
  // v1 wrote stopId/stopName and no kind. Both shapes load, nothing is lost.
  const id = asId(raw.id, MAX_ID_CHARS) ?? asId(raw.stopId, MAX_ID_CHARS);
  if (id === null) return null;
  const name =
    asTrimmedString(raw.name, MAX_NAME_CHARS) ?? asTrimmedString(raw.stopName, MAX_NAME_CHARS);
  if (name === null) return null;

  const pinnedRoutes =
    kind === "stop" && Array.isArray(raw.pinnedRoutes)
      ? Array.from(
          new Set(
            raw.pinnedRoutes
              .map((entry) => asId(entry, MAX_ID_CHARS))
              .filter(isNotNull),
          ),
        ).slice(0, MAX_PINNED_ROUTES)
      : [];

  const routeType = asFiniteNumber(raw.routeType);
  const updatedAt = asFiniteNumber(raw.updatedAt);
  return {
    kind,
    id,
    name,
    routeType: kind === "line" && routeType !== null ? Math.round(routeType) : null,
    color: kind === "line" ? asTrimmedString(raw.color, MAX_COLOR_CHARS) : null,
    tag: asTrimmedString(raw.tag, MAX_TAG_CHARS),
    pinnedRoutes,
    addedAt: asFiniteNumber(raw.addedAt) ?? Date.now(),
    order: asFiniteNumber(raw.order) ?? index,
    updatedAt: updatedAt === null || updatedAt <= 0 ? undefined : updatedAt,
  };
}

/** When a favourite was last touched. Entries older than sync only have addedAt. */
export function favoriteTouchedAt(item: Favorite): number {
  const updated = item.updatedAt;
  return typeof updated === "number" && Number.isFinite(updated) ? updated : item.addedAt;
}

/** Everything a sync conflict cares about, excluding the timestamp itself. */
function favoriteFingerprint(item: Favorite): string {
  return JSON.stringify([
    item.kind,
    item.id,
    item.name,
    item.routeType,
    item.color,
    item.tag,
    item.pinnedRoutes,
    item.addedAt,
    item.order,
  ]);
}

/** Stamps updatedAt on every entry whose content differs from the stored one. */
function stampChanged(
  previous: readonly Favorite[],
  next: readonly Favorite[],
  now: number,
): Favorite[] {
  const before = new Map(previous.map((item) => [favoriteKey(item), favoriteFingerprint(item)]));
  return next.map((item) =>
    before.get(favoriteKey(item)) === favoriteFingerprint(item) ? item : { ...item, updatedAt: now },
  );
}

/** Deduplicates by (kind, id), applies the manual ordering, renumbers it densely. */
function normalizeFavorites(items: readonly Favorite[]): Favorite[] {
  const seen = new Set<string>();
  const unique: Favorite[] = [];
  for (const item of items) {
    const key = favoriteKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  unique.sort((a, b) => (a.order === b.order ? a.addedAt - b.addedAt : a.order - b.order));
  return unique
    .slice(0, MAX_FAVORITES)
    .map((item, index) => (item.order === index ? item : { ...item, order: index }));
}

/** The ordering every device agrees on, given the same entries. */
function compareFavorites(a: Favorite, b: Favorite): number {
  if (a.order !== b.order) return a.order - b.order;
  if (a.addedAt !== b.addedAt) return a.addedAt - b.addedAt;
  return compareIds(favoriteKey(a), favoriteKey(b));
}

/**
 * Like parseFavoriteList but it never renumbers `order`. Dense renumbering
 * depends on which entries are present, so applying it inside the sync path
 * would make the merge disagree with itself as soon as the two devices hold
 * different sets: the merge would keep pulling entries back and forth.
 */
function parseSyncFavoriteList(raw: unknown): Favorite[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const items: Favorite[] = [];
  raw.slice(0, MAX_PARSED_ENTRIES).forEach((entry, index) => {
    const item = parseFavorite(entry, index);
    if (item === null || seen.has(favoriteKey(item))) return;
    seen.add(favoriteKey(item));
    items.push(item);
  });
  return items.sort(compareFavorites).slice(0, MAX_FAVORITES);
}

function parseFavoriteList(raw: unknown): Favorite[] {
  if (!Array.isArray(raw)) return [];
  return normalizeFavorites(
    raw.slice(0, MAX_PARSED_ENTRIES).map(parseFavorite).filter(isNotNull),
  );
}

function ensureFavorites(): void {
  if (cache.favorites !== null || getStore() === null) return;
  cache.favorites = parseFavoriteList(readJson(STORAGE_KEYS.favorites));
}

/**
 * The single write path for favourites. Every local mutation goes through here,
 * so change stamping and tombstones can never be forgotten by a caller.
 */
function commitFavorites(next: Favorite[]): void {
  const previous = readFavorites();
  const now = Date.now();
  const stamped = stampChanged(previous, next, now);
  cache.favorites = stamped;
  persist(STORAGE_KEYS.favorites, stamped);
  trackDeletions(previous, stamped, now);
  notify();
}

/** A removal here must not be resurrected by a device that still has the entry. */
function trackDeletions(
  previous: readonly Favorite[],
  next: readonly Favorite[],
  now: number,
): void {
  const alive = new Set(next.map(favoriteKey));
  const removed = previous.filter((item) => !alive.has(favoriteKey(item)));
  const current = readTombstones();
  // Adding an entry back clears its tombstone, otherwise it would delete itself.
  const kept = current.filter((item) => !alive.has(favoriteKey(item)));
  if (removed.length === 0 && kept.length === current.length) return;
  const fresh = removed.map((item) => ({ kind: item.kind, id: item.id, deletedAt: now }));
  commitTombstones(normalizeTombstones([...fresh, ...kept], now));
}

export function readFavorites(): Favorite[] {
  ensureFavorites();
  return cache.favorites ?? EMPTY_FAVORITES;
}

export function writeFavorites(items: Favorite[]): void {
  const validated = Array.isArray(items)
    ? normalizeFavorites(items.map(parseFavorite).filter(isNotNull))
    : [];
  commitFavorites(validated);
}

/** Turns whatever a caller passes into a storable entry, or null if unusable. */
function parseTarget(target: FavoriteTarget, order: number): Favorite | null {
  if (target === null || typeof target !== "object") return null;
  const kind = parseKind(target.kind);
  const id = asId(target.id, MAX_ID_CHARS);
  if (id === null) return null;
  const routeType = asFiniteNumber(target.routeType);
  return {
    kind,
    id,
    name: asTrimmedString(target.name, MAX_NAME_CHARS) ?? id,
    routeType: kind === "line" && routeType !== null ? Math.round(routeType) : null,
    color: kind === "line" ? asTrimmedString(target.color, MAX_COLOR_CHARS) : null,
    tag: null,
    pinnedRoutes: [],
    addedAt: Date.now(),
    order,
  };
}

export function addFavorite(target: FavoriteTarget): void {
  const current = readFavorites();
  const entry = parseTarget(target, current.length);
  if (entry === null) return;
  if (current.some((item) => favoriteKey(item) === favoriteKey(entry))) return;
  commitFavorites(normalizeFavorites([...current, entry]));
}

/** Returns the entry that was removed, so the caller can offer an undo. */
export function removeFavorite(kind: FavoriteKind, id: string): Favorite | null {
  const current = readFavorites();
  const key = favoriteKey({ kind, id });
  const removed = current.find((item) => favoriteKey(item) === key) ?? null;
  if (removed === null) return null;
  commitFavorites(normalizeFavorites(current.filter((item) => favoriteKey(item) !== key)));
  return removed;
}

/**
 * Puts a removed entry back where it was, tag and pinned lines included. The
 * stored `order` is a hint: normalizeFavorites decides the final positions.
 */
export function restoreFavorite(item: Favorite): boolean {
  const entry = parseFavorite(item, 0);
  if (entry === null) return false;
  const current = readFavorites();
  if (current.some((existing) => favoriteKey(existing) === favoriteKey(entry))) return false;
  commitFavorites(normalizeFavorites([...current, entry]));
  return true;
}

/**
 * Refreshes the snapshot fields of a saved line once its detail is known. A
 * line starred before the request came back holds the raw route id and no
 * colours; this fixes the label without a second tap. Writes only on a real
 * difference, so it cannot turn every visit into a sync push.
 */
export function refreshLineFavorite(
  id: string,
  patch: { name: string; routeType: number | null; color: string | null },
): void {
  const key = favoriteKey({ kind: "line", id });
  const current = readFavorites();
  const existing = current.find((item) => favoriteKey(item) === key) ?? null;
  if (existing === null) return;
  const name = asTrimmedString(patch.name, MAX_NAME_CHARS) ?? existing.name;
  const rawType = asFiniteNumber(patch.routeType);
  const routeType = rawType === null ? null : Math.round(rawType);
  const color = asTrimmedString(patch.color, MAX_COLOR_CHARS);
  if (existing.name === name && existing.routeType === routeType && existing.color === color) {
    return;
  }
  commitFavorites(
    current.map((item) =>
      favoriteKey(item) === key ? { ...item, name, routeType, color } : item,
    ),
  );
}

export function setFavoriteTag(kind: FavoriteKind, id: string, tag: string | null): void {
  const current = readFavorites();
  const key = favoriteKey({ kind, id });
  if (!current.some((item) => favoriteKey(item) === key)) return;
  const cleaned = tag === null ? null : asTrimmedString(tag, MAX_TAG_CHARS);
  commitFavorites(
    current.map((item) => (favoriteKey(item) === key ? { ...item, tag: cleaned } : item)),
  );
}

export function setFavoritePinnedRoutes(stopId: string, routeIds: string[]): void {
  const current = readFavorites();
  const key = favoriteKey({ kind: "stop", id: stopId });
  if (!current.some((item) => favoriteKey(item) === key)) return;
  const cleaned = Array.isArray(routeIds)
    ? Array.from(new Set(routeIds.map((id) => asId(id, MAX_ID_CHARS)).filter(isNotNull))).slice(
        0,
        MAX_PINNED_ROUTES,
      )
    : [];
  commitFavorites(
    current.map((item) => (favoriteKey(item) === key ? { ...item, pinnedRoutes: cleaned } : item)),
  );
}

/** Moves a favorite one slot up (-1) or down (+1) in the manual ordering. */
export function moveFavorite(kind: FavoriteKind, id: string, direction: -1 | 1): void {
  const current = readFavorites();
  const key = favoriteKey({ kind, id });
  const from = current.findIndex((item) => favoriteKey(item) === key);
  if (from < 0) return;
  const to = from + direction;
  if (to < 0 || to >= current.length) return;
  const next = [...current];
  const moved = next[from];
  next[from] = next[to];
  next[to] = moved;
  commitFavorites(next.map((item, index) => ({ ...item, order: index })));
}

export function clearFavorites(): void {
  commitFavorites([]);
}

/** Import strategy "unisci": keeps what is here, appends the unknown entries. */
export function mergeFavorites(incoming: Favorite[]): number {
  const current = readFavorites();
  const known = new Set(current.map(favoriteKey));
  const additions = (Array.isArray(incoming) ? incoming : [])
    .map(parseFavorite)
    .filter(isNotNull)
    .filter((item) => !known.has(favoriteKey(item)))
    .map((item, index) => ({ ...item, order: current.length + index }));
  if (additions.length === 0) return 0;
  commitFavorites(normalizeFavorites([...current, ...additions]));
  return additions.length;
}

// ---------------------------------------------------------------------------
// Favorites backup file (the local replacement for the old cloud sync)
// ---------------------------------------------------------------------------

interface FavoritesBackup {
  app: "BusFinder-web";
  kind: "favorites";
  version: 1;
  exportedAt: number;
  favorites: Favorite[];
}

/** Why a backup file was rejected. The UI translates it; `error` is the Italian original. */
export type FavoritesImportProblem = "empty" | "too-large" | "not-json" | "no-list" | "none-valid";

export type FavoritesImport =
  | { ok: true; favorites: Favorite[]; skipped: number }
  | { ok: false; reason: FavoritesImportProblem; error: string };

export function exportFavoritesJson(): string {
  const backup: FavoritesBackup = {
    app: "BusFinder-web",
    kind: "favorites",
    version: 1,
    exportedAt: Date.now(),
    favorites: readFavorites(),
  };
  return JSON.stringify(backup, null, 2);
}

/** Validates a user-supplied backup file. Never applies it: the caller decides. */
export function parseFavoritesImport(text: string): FavoritesImport {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, reason: "empty", error: "Il file è vuoto." };
  }
  if (text.length > MAX_IMPORT_CHARS) {
    return {
      ok: false,
      reason: "too-large",
      error: "Il file è troppo grande per essere un backup dei preferiti.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, reason: "not-json", error: "Il file non è un JSON valido." };
  }

  let list: unknown[];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (isRecord(parsed) && Array.isArray(parsed.favorites)) {
    list = parsed.favorites;
  } else {
    return { ok: false, reason: "no-list", error: "Il file non contiene un elenco di preferiti." };
  }

  const valid = list.slice(0, MAX_PARSED_ENTRIES).map(parseFavorite).filter(isNotNull);
  if (valid.length === 0) {
    return { ok: false, reason: "none-valid", error: "Nessun preferito valido trovato nel file." };
  }
  const favorites = normalizeFavorites(valid);
  return { ok: true, favorites, skipped: list.length - favorites.length };
}

// ---------------------------------------------------------------------------
// Tombstones: the record of what was deleted, so sync does not undo a deletion
// ---------------------------------------------------------------------------

function parseTombstone(raw: unknown): SyncTombstone | null {
  if (!isRecord(raw)) return null;
  // Same v1 shape as favourites: a bare stopId with no kind is a stop.
  const id = asId(raw.id, MAX_ID_CHARS) ?? asId(raw.stopId, MAX_ID_CHARS);
  if (id === null) return null;
  const deletedAt = asFiniteNumber(raw.deletedAt);
  if (deletedAt === null || deletedAt <= 0) return null;
  return { kind: parseKind(raw.kind), id, deletedAt };
}

/** One entry per (kind, id), newest deletion wins. `now` null skips the pruning. */
function normalizeTombstones(
  items: readonly SyncTombstone[],
  now: number | null,
): SyncTombstone[] {
  const byKey = new Map<string, SyncTombstone>();
  for (const item of items) {
    if (now !== null && now - item.deletedAt > TOMBSTONE_TTL_MS) continue;
    const key = favoriteKey(item);
    const existing = byKey.get(key);
    if (existing === undefined || existing.deletedAt < item.deletedAt) byKey.set(key, item);
  }
  return Array.from(byKey.values())
    .sort((a, b) =>
      b.deletedAt === a.deletedAt
        ? compareIds(favoriteKey(a), favoriteKey(b))
        : b.deletedAt - a.deletedAt,
    )
    .slice(0, MAX_TOMBSTONES);
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function parseTombstoneList(raw: unknown, now: number | null): SyncTombstone[] {
  if (!Array.isArray(raw)) return [];
  return normalizeTombstones(
    raw.slice(0, MAX_PARSED_ENTRIES).map(parseTombstone).filter(isNotNull),
    now,
  );
}

function ensureTombstones(): void {
  if (cache.tombstones !== null || getStore() === null) return;
  cache.tombstones = parseTombstoneList(readJson(STORAGE_KEYS.tombstones), Date.now());
}

function commitTombstones(next: SyncTombstone[]): void {
  cache.tombstones = next;
  persist(STORAGE_KEYS.tombstones, next);
}

export function readTombstones(): SyncTombstone[] {
  ensureTombstones();
  return cache.tombstones ?? EMPTY_TOMBSTONES;
}

// ---------------------------------------------------------------------------
// Recents
// ---------------------------------------------------------------------------

function parseRecent(raw: unknown): RecentStop | null {
  if (!isRecord(raw)) return null;
  const stopId = asId(raw.stopId, MAX_ID_CHARS);
  if (stopId === null) return null;
  const stopName = asTrimmedString(raw.stopName, MAX_NAME_CHARS);
  if (stopName === null) return null;
  return { stopId, stopName, visitedAt: asFiniteNumber(raw.visitedAt) ?? 0 };
}

/** Most recent first, one entry per stop, capped. */
function normalizeRecents(items: readonly RecentStop[]): RecentStop[] {
  const byStop = new Map<string, RecentStop>();
  for (const item of items) {
    const existing = byStop.get(item.stopId);
    if (existing === undefined || existing.visitedAt < item.visitedAt) {
      byStop.set(item.stopId, item);
    }
  }
  return Array.from(byStop.values())
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, MAX_RECENTS);
}

function ensureRecents(): void {
  if (cache.recents !== null || getStore() === null) return;
  const raw = readJson(STORAGE_KEYS.recents);
  cache.recents = Array.isArray(raw)
    ? normalizeRecents(raw.slice(0, MAX_PARSED_ENTRIES).map(parseRecent).filter(isNotNull))
    : [];
}

function commitRecents(next: RecentStop[]): void {
  cache.recents = next;
  if (!persist(STORAGE_KEYS.recents, next) && next.length > 5) {
    // Quota full: history is the most expendable thing we store.
    persist(STORAGE_KEYS.recents, next.slice(0, 5));
  }
  notify();
}

export function readRecents(): RecentStop[] {
  ensureRecents();
  return cache.recents ?? EMPTY_RECENTS;
}

export function pushRecent(stop: { stopId: string; stopName: string }): void {
  if (stop === null || typeof stop !== "object") return;
  const stopId = asId(stop.stopId, MAX_ID_CHARS);
  if (stopId === null) return;
  const stopName = asTrimmedString(stop.stopName, MAX_NAME_CHARS) ?? stopId;

  const current = readRecents();
  const entry: RecentStop = { stopId, stopName, visitedAt: Date.now() };
  const next = normalizeRecents([entry, ...current.filter((item) => item.stopId !== stopId)]);
  commitRecents(next);
}

export function clearRecents(): void {
  commitRecents([]);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** Every field is validated on its own: a bad one falls back, the rest stay. */
function parseSettings(raw: unknown, base: Settings = DEFAULT_SETTINGS): Settings {
  if (!isRecord(raw)) return base;
  const theme = raw.theme;
  // Settings written before the language existed simply have no field here.
  const language = raw.language;
  return {
    refreshInterval: clampInt(
      raw.refreshInterval,
      REFRESH_MIN_SEC,
      REFRESH_MAX_SEC,
      base.refreshInterval,
    ),
    nearbyRadius: clampInt(raw.nearbyRadius, RADIUS_MIN_M, RADIUS_MAX_M, base.nearbyRadius),
    maxArrivals: clampInt(raw.maxArrivals, ARRIVALS_MIN, ARRIVALS_MAX, base.maxArrivals),
    theme:
      typeof theme === "string" && (THEMES as readonly string[]).includes(theme)
        ? (theme as Settings["theme"])
        : base.theme,
    showScheduledFallback:
      typeof raw.showScheduledFallback === "boolean"
        ? raw.showScheduledFallback
        : base.showScheduledFallback,
    language:
      typeof language === "string" && (LANGUAGES as readonly string[]).includes(language)
        ? (language as Settings["language"])
        : base.language,
  };
}

function ensureSettings(): void {
  if (cache.settings !== null || getStore() === null) return;
  cache.settings = parseSettings(readJson(STORAGE_KEYS.settings));
}

export function readSettings(): Settings {
  ensureSettings();
  return cache.settings ?? DEFAULT_SETTINGS;
}

export function writeSettings(patch: Partial<Settings>): void {
  const base = readSettings();
  const merged: Record<string, unknown> = { ...base };
  if (isRecord(patch)) {
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) merged[key] = value;
    }
  }
  const next = parseSettings(merged, base);
  cache.settings = next;
  persist(STORAGE_KEYS.settings, next);
  touchSettings();
  notify();
}

export function resetSettings(): void {
  cache.settings = DEFAULT_SETTINGS;
  persist(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  touchSettings();
  notify();
}

// ---------------------------------------------------------------------------
// Sync bookkeeping. The code lives here and nowhere else on the device.
// ---------------------------------------------------------------------------

function parseSyncState(raw: unknown): LocalSyncState {
  if (!isRecord(raw)) return DEFAULT_LOCAL_SYNC_STATE;
  const code = asId(raw.code, MAX_CODE_CHARS);
  const syncId = asId(raw.syncId, 64);
  // A code without its derived id (or the other way round) is unusable: half a
  // sync setup would push to an id nobody can name. Treat it as "off".
  const paired = code !== null && syncId !== null && SYNC_ID_RE.test(syncId);
  const version = asFiniteNumber(raw.version);
  const lastSyncAt = asFiniteNumber(raw.lastSyncAt);
  const settingsUpdatedAt = asFiniteNumber(raw.settingsUpdatedAt);
  return {
    code: paired ? code : null,
    syncId: paired ? syncId : null,
    version: paired && version !== null && version >= 0 ? Math.floor(version) : 0,
    lastSyncAt: paired && lastSyncAt !== null && lastSyncAt > 0 ? lastSyncAt : null,
    autoSync: typeof raw.autoSync === "boolean" ? raw.autoSync : DEFAULT_SYNC_STATE.autoSync,
    settingsUpdatedAt:
      settingsUpdatedAt !== null && settingsUpdatedAt > 0 ? settingsUpdatedAt : 0,
  };
}

function ensureSyncState(): void {
  if (cache.sync !== null || getStore() === null) return;
  cache.sync = parseSyncState(readJson(STORAGE_KEYS.sync));
}

function localSyncState(): LocalSyncState {
  ensureSyncState();
  return cache.sync ?? DEFAULT_LOCAL_SYNC_STATE;
}

function commitSyncState(next: LocalSyncState): void {
  cache.sync = next;
  persist(STORAGE_KEYS.sync, next);
  notify();
}

export function readSyncState(): SyncState {
  return localSyncState();
}

export function writeSyncState(patch: Partial<SyncState>): void {
  const base = localSyncState();
  const merged: Record<string, unknown> = { ...base };
  if (isRecord(patch)) {
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) merged[key] = value;
    }
  }
  commitSyncState(parseSyncState(merged));
}

/** Forgets the code on this device. The data stays, the server blob stays. */
export function clearSyncState(): void {
  const base = localSyncState();
  commitSyncState({
    ...DEFAULT_LOCAL_SYNC_STATE,
    autoSync: base.autoSync,
    settingsUpdatedAt: base.settingsUpdatedAt,
  });
}

/** Records when settings last changed, since Settings itself carries no clock. */
function touchSettings(): void {
  const base = localSyncState();
  const next: LocalSyncState = { ...base, settingsUpdatedAt: Date.now() };
  cache.sync = next;
  persist(STORAGE_KEYS.sync, next);
}

// ---------------------------------------------------------------------------
// Sync payload: the whole local state as one object, and back again
// ---------------------------------------------------------------------------

/**
 * Validates anything claiming to be a SyncPayload, field by field, dropping bad
 * entries one at a time. Used on decrypted server data, which is only as
 * trustworthy as whoever holds the code.
 */
export function sanitizeSyncPayload(raw: unknown): SyncPayload {
  const record = isRecord(raw) ? raw : {};
  const recents = Array.isArray(record.recents)
    ? normalizeRecents(
        record.recents.slice(0, MAX_PARSED_ENTRIES).map(parseRecent).filter(isNotNull),
      )
    : [];
  const updatedAt = asFiniteNumber(record.updatedAt);
  return {
    schema: 1,
    favorites: parseSyncFavoriteList(record.favorites),
    recents,
    settings: parseSettings(record.settings),
    // No age pruning here: that needs a clock, and the merge owns it.
    tombstones: parseTombstoneList(record.tombstones, null),
    updatedAt: updatedAt !== null && updatedAt > 0 ? updatedAt : 0,
  };
}

/** Everything this device would send, with the timestamp of its newest change. */
export function readSyncPayload(): SyncPayload {
  const favorites = readFavorites();
  const recents = readRecents();
  const tombstones = readTombstones();
  let updatedAt = localSyncState().settingsUpdatedAt;
  for (const item of favorites) updatedAt = Math.max(updatedAt, favoriteTouchedAt(item));
  for (const item of recents) updatedAt = Math.max(updatedAt, item.visitedAt);
  for (const item of tombstones) updatedAt = Math.max(updatedAt, item.deletedAt);
  return {
    schema: 1,
    favorites,
    recents,
    settings: readSettings(),
    tombstones,
    updatedAt,
  };
}

/**
 * Writes a merged payload back. Timestamps come from the merge, so this path
 * deliberately skips the change stamping and tombstone tracking of the local
 * mutations: stamping here would make this device look newer than every other
 * one and would overwrite edits it has never seen.
 */
export function applySyncPayload(payload: SyncPayload): void {
  const safe = sanitizeSyncPayload(payload);
  cache.favorites = safe.favorites;
  persist(STORAGE_KEYS.favorites, safe.favorites);
  cache.recents = safe.recents;
  if (!persist(STORAGE_KEYS.recents, safe.recents) && safe.recents.length > 5) {
    persist(STORAGE_KEYS.recents, safe.recents.slice(0, 5));
  }
  cache.settings = safe.settings;
  persist(STORAGE_KEYS.settings, safe.settings);
  cache.tombstones = safe.tombstones;
  persist(STORAGE_KEYS.tombstones, safe.tombstones);

  const base = localSyncState();
  const next: LocalSyncState = {
    ...base,
    settingsUpdatedAt: Math.max(base.settingsUpdatedAt, safe.updatedAt),
  };
  cache.sync = next;
  persist(STORAGE_KEYS.sync, next);
  notify();
}

// ---------------------------------------------------------------------------
// Subscriptions: one store, many hook instances, many tabs
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();
let windowBound = false;

function notify(): void {
  for (const listener of Array.from(listeners)) {
    try {
      listener();
    } catch (err) {
      console.error("[probus] storage listener failed", err);
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  }
}

function onCrossTabChange(event: StorageEvent): void {
  // key === null means the whole storage was cleared.
  if (event.key !== null && !OWN_KEYS.includes(event.key)) return;
  cache.favorites = null;
  cache.recents = null;
  cache.settings = null;
  cache.tombstones = null;
  cache.sync = null;
  // Re-read now: snapshots are pure cache reads and must already be correct.
  ensureFavorites();
  ensureRecents();
  ensureSettings();
  ensureTombstones();
  ensureSyncState();
  notify();
}

function bindWindow(): void {
  if (windowBound || typeof window === "undefined") return;
  windowBound = true;
  window.addEventListener("storage", onCrossTabChange);
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  bindWindow();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Loads everything from localStorage. Call from an effect, never during render:
 * the first client render must match the server, which has no storage.
 */
export function hydrate(): void {
  if (getStore() === null) return;
  const alreadyLoaded =
    cache.favorites !== null &&
    cache.recents !== null &&
    cache.settings !== null &&
    cache.tombstones !== null &&
    cache.sync !== null;
  if (alreadyLoaded) return;
  ensureFavorites();
  ensureRecents();
  ensureSettings();
  ensureTombstones();
  ensureSyncState();
  notify();
}

// Snapshots for useSyncExternalStore: pure cache reads, stable identity, no
// localStorage access, so calling them during render is safe.
export function favoritesSnapshot(): Favorite[] {
  return cache.favorites ?? EMPTY_FAVORITES;
}

export function recentsSnapshot(): RecentStop[] {
  return cache.recents ?? EMPTY_RECENTS;
}

export function settingsSnapshot(): Settings {
  return cache.settings ?? DEFAULT_SETTINGS;
}

export function syncStateSnapshot(): SyncState {
  return cache.sync ?? DEFAULT_LOCAL_SYNC_STATE;
}

// Server snapshots must ignore the cache entirely: during hydration React
// compares against what the server rendered, which is always the default.
export function serverFavoritesSnapshot(): Favorite[] {
  return EMPTY_FAVORITES;
}

export function serverRecentsSnapshot(): RecentStop[] {
  return EMPTY_RECENTS;
}

export function serverSettingsSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

export function serverSyncStateSnapshot(): SyncState {
  return DEFAULT_LOCAL_SYNC_STATE;
}
