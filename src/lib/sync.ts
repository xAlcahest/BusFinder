/**
 * Device sync without an account: crypto, merge, transport.
 *
 * The user generates a code on one device and types it on another. Everything
 * else is derived from that code with HKDF-SHA256: an opaque `syncId` the
 * server uses as a filing key, and an AES-256-GCM key that never leaves the
 * browser. The server stores ciphertext it cannot read, so the code is the only
 * secret in the system: whoever has it reads all the favourites.
 *
 * The merge is the delicate part. Two devices that have never seen each other
 * must converge, so `mergePayloads` is commutative (order of the arguments is
 * irrelevant) and idempotent (merging twice changes nothing). Every tie is
 * broken deterministically instead of by argument position.
 */

import { activeDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import {
  favoriteKey,
  favoriteTouchedAt,
  sanitizeSyncPayload,
  TOMBSTONE_TTL_MS,
} from "@/lib/storage";
import type {
  Favorite,
  RecentStop,
  Settings,
  SyncPayload,
  SyncPushRequest,
  SyncTombstone,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Crockford base32: no I, L, O or U, so a code cannot be misread aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_SYMBOLS = 20;
const CODE_GROUP = 5;
/** 20 symbols of 5 bits: 100 bits of entropy, which is what hides the syncId. */
const CODE_BITS = CODE_SYMBOLS * 5;

const HKDF_SALT = "probus-sync-salt-v1";
const INFO_SYNC_ID = "probus-sync-id-v1";
const INFO_SYNC_KEY = "probus-sync-key-v1";
const SYNC_ID_BYTES = 32;
const IV_BYTES = 12;

export { TOMBSTONE_TTL_MS } from "@/lib/storage";

const MAX_MERGED_FAVORITES = 200;
const MAX_MERGED_RECENTS = 20;
const MAX_TOMBSTONES = 500;

const MAX_CODE_INPUT_CHARS = 200;
const MAX_BLOB_CHARS = 2_000_000;
const REQUEST_TIMEOUT_MS = 12_000;

const SYNC_ID_RE = /^[0-9a-f]{64}$/;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// ---------------------------------------------------------------------------
// Errors: always a sentence the panel can show as is, in the reader's language.
// ---------------------------------------------------------------------------

/** Read at throw time, never at import time, or the language freezes. */
function words(): Dictionary["sync"]["errors"] {
  return activeDictionary().sync.errors;
}

export class SyncError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SyncError";
    this.cause = cause;
  }
}

/** Any thrown value turned into a readable sentence. Never leaks a stack. */
export function syncErrorMessage(err: unknown): string {
  if (err instanceof SyncError) return err.message;
  if (err instanceof DOMException && err.name === "AbortError") {
    return words().aborted;
  }
  return words().generic;
}

// ---------------------------------------------------------------------------
// Secure context. crypto.subtle exists only on https or localhost, so a phone
// opening the app on a LAN address over plain http must be told the truth.
// ---------------------------------------------------------------------------

export type SyncSupport = { ok: true } | { ok: false; reason: string };

function subtleCrypto(): SubtleCrypto | null {
  if (typeof globalThis === "undefined") return null;
  const api: Crypto | undefined = globalThis.crypto;
  if (api === undefined || typeof api.getRandomValues !== "function") return null;
  // In an insecure context `subtle` is simply absent.
  const subtle: SubtleCrypto | undefined = api.subtle;
  return subtle !== undefined && typeof subtle.importKey === "function" ? subtle : null;
}

export function syncSupport(): SyncSupport {
  return subtleCrypto() === null
    ? { ok: false, reason: words().insecureContext }
    : { ok: true };
}

function requireSubtle(): SubtleCrypto {
  const subtle = subtleCrypto();
  if (subtle === null) throw new SyncError(words().insecureContext);
  return subtle;
}

function fillRandom(bytes: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const api: Crypto | undefined = globalThis.crypto;
  if (api === undefined || typeof api.getRandomValues !== "function") {
    throw new SyncError(words().insecureContext);
  }
  api.getRandomValues(bytes);
  return bytes;
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

function toHex(bytes: Uint8Array<ArrayBufferLike>): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function toBase64(bytes: Uint8Array<ArrayBufferLike>): string {
  let binary = "";
  // Chunked: a single spread of a large array blows the call stack.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  if (typeof btoa !== "function") {
    throw new SyncError(words().noBase64Encode);
  }
  return btoa(binary);
}

function fromBase64(value: string, what: string): Uint8Array<ArrayBuffer> {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_BLOB_CHARS) {
    throw new SyncError(words().invalidSyncData(what));
  }
  if (!BASE64_RE.test(value)) {
    throw new SyncError(words().invalidSyncData(what));
  }
  if (typeof atob !== "function") {
    throw new SyncError(words().noBase64Decode);
  }
  let binary: string;
  try {
    binary = atob(value);
  } catch {
    throw new SyncError(words().invalidSyncData(what));
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i) & 0xff;
  return bytes;
}

// ---------------------------------------------------------------------------
// The code
// ---------------------------------------------------------------------------

/** Groups of 5, hyphen separated: "K7M2P-3QR8T-9WXYZ-B4NHD". */
export function formatCode(symbols: string): string {
  const groups: string[] = [];
  for (let i = 0; i < symbols.length; i += CODE_GROUP) {
    groups.push(symbols.slice(i, i + CODE_GROUP));
  }
  return groups.join("-");
}

export function generateCode(): string {
  const bytes = fillRandom(new Uint8Array(CODE_SYMBOLS));
  let symbols = "";
  // 32 symbols for 5 bits: masking is uniform, no modulo bias.
  for (let i = 0; i < CODE_SYMBOLS; i += 1) symbols += ALPHABET[bytes[i] & 31];
  return formatCode(symbols);
}

/** Why a code was rejected. The UI branches on this, never on the message. */
export type CodeRejection = "required" | "tooLong" | "invalidChars" | "wrongLength";

export type CodeCheck =
  | { ok: true; symbols: string; formatted: string }
  | { ok: false; reason: CodeRejection; error: string };

/**
 * Accepts what a human types: spaces, hyphens, lower case, and the three
 * confusions Crockford base32 defines away (O is zero, I and L are one).
 */
export function normaliseCode(input: unknown): CodeCheck {
  const t = words();
  if (typeof input !== "string") {
    return { ok: false, reason: "required", error: t.codeRequired };
  }
  if (input.length > MAX_CODE_INPUT_CHARS) {
    return { ok: false, reason: "tooLong", error: t.codeTooLong(CODE_SYMBOLS) };
  }
  const stripped = input.replace(/[\s\-_.]/g, "").toUpperCase();
  if (stripped.length === 0) {
    return { ok: false, reason: "required", error: t.codeRequired };
  }
  const mapped = stripped.replace(/O/g, "0").replace(/[IL]/g, "1");

  const invalid = new Set<string>();
  for (const char of mapped) {
    if (!ALPHABET.includes(char)) invalid.add(char);
  }
  if (invalid.size > 0) {
    return {
      ok: false,
      reason: "invalidChars",
      error: t.codeInvalidChars(Array.from(invalid).join(" ")),
    };
  }
  if (mapped.length !== CODE_SYMBOLS) {
    return {
      ok: false,
      reason: "wrongLength",
      error: t.codeWrongLength(CODE_SYMBOLS, mapped.length),
    };
  }
  return { ok: true, symbols: mapped, formatted: formatCode(mapped) };
}

/** Entropy of a code, so the panel can state it without hardcoding a number. */
export const CODE_ENTROPY_BITS = CODE_BITS;

// ---------------------------------------------------------------------------
// Key derivation
// ---------------------------------------------------------------------------

export interface DerivedKeys {
  /** 64 lowercase hex characters. The only identifier the server ever sees. */
  syncId: string;
  key: CryptoKey;
}

/**
 * HKDF-SHA256 over the normalised code, fixed application salt, two info
 * strings. The id and the key are independent outputs of the same extract, so
 * holding the id tells you nothing about the key.
 */
export async function deriveKeys(code: string): Promise<DerivedKeys> {
  const check = normaliseCode(code);
  if (!check.ok) throw new SyncError(check.error);
  const subtle = requireSubtle();
  const salt = encoder.encode(HKDF_SALT);

  try {
    const material = await subtle.importKey("raw", encoder.encode(check.symbols), "HKDF", false, [
      "deriveBits",
      "deriveKey",
    ]);
    const idBits = await subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode(INFO_SYNC_ID) },
      material,
      SYNC_ID_BYTES * 8,
    );
    const key = await subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode(INFO_SYNC_KEY) },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    return { syncId: toHex(new Uint8Array(idBits)), key };
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError(words().keyDerivationFailed, err);
  }
}

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

export interface EncryptedBlob {
  /** base64 of the AES-GCM ciphertext (tag included). */
  ciphertext: string;
  /** base64 of the 12-byte IV. */
  iv: string;
}

export async function encryptPayload(
  payload: SyncPayload,
  key: CryptoKey,
): Promise<EncryptedBlob> {
  const subtle = requireSubtle();
  const iv = fillRandom(new Uint8Array(IV_BYTES));
  let plaintext: Uint8Array<ArrayBuffer>;
  try {
    plaintext = encoder.encode(JSON.stringify(payload));
  } catch (err) {
    throw new SyncError(words().preparePayloadFailed, err);
  }
  try {
    const cipher = await subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    return { ciphertext: toBase64(new Uint8Array(cipher)), iv: toBase64(iv) };
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError(words().encryptFailed, err);
  }
}

export async function decryptPayload(blob: EncryptedBlob, key: CryptoKey): Promise<SyncPayload> {
  const subtle = requireSubtle();
  const iv = fromBase64(blob?.iv, "iv");
  if (iv.length !== IV_BYTES) throw new SyncError(words().decryptFailed);
  const cipher = fromBase64(blob?.ciphertext, "ciphertext");

  let plaintext: ArrayBuffer;
  try {
    plaintext = await subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  } catch {
    // A wrong key and a corrupt blob are indistinguishable here, and both mean
    // the same thing to the user.
    throw new SyncError(words().decryptFailed);
  }
  try {
    return sanitizeSyncPayload(JSON.parse(decoder.decode(plaintext)) as unknown);
  } catch (err) {
    throw new SyncError(words().decryptFailed, err);
  }
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/** Total order over any two values, so ties never depend on argument order. */
function lesser<T>(a: T, b: T): T {
  return JSON.stringify(a) <= JSON.stringify(b) ? a : b;
}

function mergeFavorite(a: Favorite, b: Favorite): Favorite {
  const ta = favoriteTouchedAt(a);
  const tb = favoriteTouchedAt(b);
  const updatedAt = Math.max(ta, tb);
  // The newest touch decides every field, addedAt included: taking the earliest
  // addedAt instead would make the result depend on the order in which three
  // devices meet, because a tombstone can delete one copy before its addedAt
  // has had a chance to count.
  if (ta !== tb) {
    const winner = ta > tb ? a : b;
    return {
      kind: winner.kind,
      id: winner.id,
      name: winner.name,
      routeType: winner.routeType,
      color: winner.color,
      tag: winner.tag,
      pinnedRoutes: [...winner.pinnedRoutes],
      addedAt: winner.addedAt,
      order: winner.order,
      updatedAt,
    };
  }
  // Same key on both sides by construction, so kind and id need no tie-break.
  return {
    kind: a.kind,
    id: a.id,
    name: lesser(a.name, b.name),
    routeType: lesser(a.routeType, b.routeType),
    color: lesser(a.color, b.color),
    tag: lesser(a.tag, b.tag),
    pinnedRoutes: [...lesser(a.pinnedRoutes, b.pinnedRoutes)],
    addedAt: Math.min(a.addedAt, b.addedAt),
    order: Math.min(a.order, b.order),
    updatedAt,
  };
}

function mergeRecent(a: RecentStop, b: RecentStop): RecentStop {
  if (a.visitedAt !== b.visitedAt) return a.visitedAt > b.visitedAt ? a : b;
  return { stopId: a.stopId, stopName: lesser(a.stopName, b.stopName), visitedAt: a.visitedAt };
}

/** Keyed by (kind, id): a stop and a line sharing a number are two entries. */
function mergeFavorites(local: readonly Favorite[], remote: readonly Favorite[]): Map<string, Favorite> {
  const byKey = new Map<string, Favorite>();
  for (const item of [...local, ...remote]) {
    const key = favoriteKey(item);
    const existing = byKey.get(key);
    byKey.set(key, existing === undefined ? item : mergeFavorite(existing, item));
  }
  return byKey;
}

function mergeTombstones(
  local: readonly SyncTombstone[],
  remote: readonly SyncTombstone[],
  now: number,
): Map<string, SyncTombstone> {
  const byKey = new Map<string, SyncTombstone>();
  for (const item of [...local, ...remote]) {
    if (now - item.deletedAt > TOMBSTONE_TTL_MS) continue;
    const key = favoriteKey(item);
    const existing = byKey.get(key);
    if (existing === undefined || existing.deletedAt < item.deletedAt) byKey.set(key, item);
  }
  return byKey;
}

function mergeRecents(local: readonly RecentStop[], remote: readonly RecentStop[]): RecentStop[] {
  const byStop = new Map<string, RecentStop>();
  for (const item of [...local, ...remote]) {
    const existing = byStop.get(item.stopId);
    byStop.set(item.stopId, existing === undefined ? item : mergeRecent(existing, item));
  }
  return Array.from(byStop.values())
    .sort((a, b) => (b.visitedAt === a.visitedAt ? cmp(a.stopId, b.stopId) : b.visitedAt - a.visitedAt))
    .slice(0, MAX_MERGED_RECENTS);
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function pickSettings(local: SyncPayload, remote: SyncPayload): Settings {
  if (local.updatedAt === remote.updatedAt) return lesser(local.settings, remote.settings);
  return local.updatedAt > remote.updatedAt ? local.settings : remote.settings;
}

/**
 * Converge two payloads. Commutative and idempotent by construction: every
 * pairwise decision is min/max or a deterministic tie-break, never "the first
 * argument wins".
 *
 * `now` is a parameter so the tombstone pruning is testable.
 */
export function mergePayloads(
  localInput: SyncPayload,
  remoteInput: SyncPayload,
  now: number = Date.now(),
): SyncPayload {
  const local = sanitizeSyncPayload(localInput);
  const remote = sanitizeSyncPayload(remoteInput);

  const favorites = mergeFavorites(local.favorites, remote.favorites);
  const tombstones = mergeTombstones(local.tombstones, remote.tombstones, now);

  // A deletion beats an edit it is newer than; an edit newer than the deletion
  // means the entry was added back, so the tombstone has done its job.
  for (const [key, tombstone] of Array.from(tombstones.entries())) {
    const favorite = favorites.get(key);
    if (favorite === undefined) continue;
    if (tombstone.deletedAt >= favoriteTouchedAt(favorite)) {
      favorites.delete(key);
    } else {
      tombstones.delete(key);
    }
  }

  const orderedFavorites = Array.from(favorites.values())
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.addedAt !== b.addedAt) return a.addedAt - b.addedAt;
      return cmp(favoriteKey(a), favoriteKey(b));
    })
    .slice(0, MAX_MERGED_FAVORITES)
    // An explicit updatedAt on every entry, including the ones only one device
    // had: without it the same payload merged with itself would not be byte
    // identical, and every sync would push a "change" that is not one. `order`
    // is left exactly as merged, never renumbered: see parseSyncFavoriteList.
    .map((item) => ({ ...item, updatedAt: favoriteTouchedAt(item) }));

  const orderedTombstones = Array.from(tombstones.values())
    .sort((a, b) =>
      b.deletedAt === a.deletedAt
        ? cmp(favoriteKey(a), favoriteKey(b))
        : b.deletedAt - a.deletedAt,
    )
    .slice(0, MAX_TOMBSTONES);

  return {
    schema: 1,
    favorites: orderedFavorites,
    recents: mergeRecents(local.recents, remote.recents),
    settings: pickSettings(local, remote),
    tombstones: orderedTombstones,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}

/** Stable string for "did anything actually change", used to skip pointless pushes. */
export function payloadSignature(payload: SyncPayload): string {
  return JSON.stringify(sanitizeSyncPayload(payload));
}

// ---------------------------------------------------------------------------
// Transport. The server is a dumb store: an opaque id, a blob, a version.
// ---------------------------------------------------------------------------

export type PullResult =
  | { kind: "found"; blob: EncryptedBlob; version: number; updatedAt: number }
  | { kind: "empty" };

export type PushResult =
  | { kind: "ok"; version: number; updatedAt: number }
  | { kind: "conflict" };

function syncUrl(syncId: string): string {
  if (typeof syncId !== "string" || !SYNC_ID_RE.test(syncId)) {
    throw new SyncError(words().invalidSyncId);
  }
  return `/api/sync/${syncId}`;
}

/** Caller's abort plus our own timeout, without relying on AbortSignal.any. */
function linkedSignal(outer: AbortSignal | undefined, timeoutMs: number): {
  signal: AbortSignal;
  done: () => void;
} {
  const controller = new AbortController();
  const abort = (): void => controller.abort();
  if (outer !== undefined) {
    if (outer.aborted) controller.abort();
    else outer.addEventListener("abort", abort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    done: () => {
      clearTimeout(timer);
      outer?.removeEventListener("abort", abort);
    },
  };
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

interface SyncResponse {
  status: number;
  ok: boolean;
  body: string;
}

/**
 * The body is read inside the same timeout as the request: a response whose
 * headers arrive and whose body then stalls must not outlive the component.
 */
async function request(
  url: string,
  init: RequestInit,
  outer: AbortSignal | undefined,
): Promise<SyncResponse> {
  const link = linkedSignal(outer, REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: link.signal, cache: "no-store" });
    const body = await response.text();
    if (body.length > MAX_BLOB_CHARS * 2) {
      throw new SyncError(words().responseTooLarge);
    }
    return { status: response.status, ok: response.ok, body };
  } catch (err) {
    if (err instanceof SyncError) throw err;
    // Our own timeout aborted while the caller is still alive: say so.
    if (isAbort(err) && outer?.aborted !== true) {
      throw new SyncError(words().timeout, err);
    }
    if (isAbort(err)) throw err;
    throw new SyncError(words().unreachable, err);
  } finally {
    link.done();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asBase64(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_BLOB_CHARS) {
    throw new SyncError(words().invalidResponseField(what));
  }
  return value;
}

function asVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    // Field name stays untranslated, like "ciphertext" and "iv" above.
    throw new SyncError(words().invalidResponseField("version"));
  }
  return Math.floor(value);
}

function readJson(response: SyncResponse): unknown {
  try {
    return JSON.parse(response.body) as unknown;
  } catch (err) {
    throw new SyncError(words().unexpectedFormat, err);
  }
}

export async function pullBlob(syncId: string, signal?: AbortSignal): Promise<PullResult> {
  const response = await request(syncUrl(syncId), { method: "GET" }, signal);
  if (response.status === 404) return { kind: "empty" };
  if (response.status === 429) throw new SyncError(words().rateLimited);
  if (!response.ok) {
    throw new SyncError(words().pullRejected(response.status));
  }
  const body = readJson(response);
  if (!isRecord(body)) throw new SyncError(words().invalidResponse);
  return {
    kind: "found",
    blob: {
      ciphertext: asBase64(body.ciphertext, "ciphertext"),
      iv: asBase64(body.iv, "iv"),
    },
    version: asVersion(body.version),
    updatedAt: typeof body.updatedAt === "number" && Number.isFinite(body.updatedAt) ? body.updatedAt : 0,
  };
}

export async function pushBlob(
  syncId: string,
  body: SyncPushRequest,
  signal?: AbortSignal,
): Promise<PushResult> {
  const response = await request(
    syncUrl(syncId),
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    signal,
  );
  if (response.status === 409) return { kind: "conflict" };
  if (response.status === 413) {
    throw new SyncError(words().payloadTooLarge);
  }
  if (response.status === 429) throw new SyncError(words().rateLimited);
  if (!response.ok) {
    throw new SyncError(words().pushRejected(response.status));
  }
  const parsed = readJson(response);
  if (!isRecord(parsed)) throw new SyncError(words().invalidResponse);
  return {
    kind: "ok",
    version: asVersion(parsed.version),
    updatedAt:
      typeof parsed.updatedAt === "number" && Number.isFinite(parsed.updatedAt)
        ? parsed.updatedAt
        : Date.now(),
  };
}

/** Removes the blob from the server. Already-absent counts as success. */
export async function deleteBlob(syncId: string, signal?: AbortSignal): Promise<void> {
  const response = await request(syncUrl(syncId), { method: "DELETE" }, signal);
  if (response.ok || response.status === 404) return;
  throw new SyncError(words().deleteRejected(response.status));
}
