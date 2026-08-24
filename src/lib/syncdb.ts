/**
 * Writable store for device sync, at data/sync.db.
 *
 * Deliberately not the gtfs.db handle from db.ts: that one is opened read-only
 * and is swapped wholesale by the daily ingest, this one takes concurrent
 * writes and must outlive it. Created with its schema on first use, so a fresh
 * volume needs no manual step. One handle per process, cached on globalThis so
 * Next's dev HMR does not leak file descriptors across module reloads.
 *
 * Nothing here can read what it stores: sync_id and the AES-GCM key are derived
 * in the browser from a code the server never sees. Blobs are opaque bytes.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

type Db = Database.Database;

interface SyncDbHandle {
  db: Db;
  file: string;
  /** Unix ms of the last retention purge, so it runs at most hourly. */
  lastPurgeAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusSyncDbHandle: SyncDbHandle | undefined;
}

/** Blobs untouched for this long are dropped: an abandoned code costs nothing. */
export const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
const PURGE_INTERVAL_MS = 60 * 60 * 1000;

/** Kept identical to scripts/sync-schema.sql, which is read in preference to it. */
const FALLBACK_SCHEMA = `
CREATE TABLE IF NOT EXISTS sync_blobs (
  sync_id    TEXT PRIMARY KEY,
  ciphertext BLOB NOT NULL,
  iv         BLOB NOT NULL,
  version    INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  bytes      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sync_blobs_updated_at ON sync_blobs (updated_at);
`;

const SYNC_ID_RE = /^[0-9a-f]{64}$/;

export interface SyncBlobRow {
  ciphertext: Buffer;
  iv: Buffer;
  version: number;
  /** Unix ms. */
  updatedAt: number;
}

export type SyncWriteResult =
  | { ok: true; version: number; updatedAt: number }
  | { ok: false; conflict: true; currentVersion: number };

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Absolute path of the sync database. Overridable for tests and containers. */
export function syncDbPath(): string {
  const override = process.env.PROBUS_SYNC_DB_PATH;
  if (typeof override === "string" && override.trim().length > 0) {
    return path.resolve(override.trim());
  }
  return path.join(process.cwd(), "data", "sync.db");
}

/** Prefers the on-disk schema so the file stays the single source of truth. */
function schemaSql(): string {
  const file = path.join(process.cwd(), "scripts", "sync-schema.sql");
  try {
    const sql = fs.readFileSync(file, "utf8");
    if (sql.trim().length > 0) return sql;
  } catch {
    // Missing or unreadable in a trimmed deployment: the embedded copy is equivalent.
  }
  return FALLBACK_SCHEMA;
}

function open(file: string): SyncDbHandle {
  let db: Db;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    db = new Database(file);
  } catch (err) {
    throw new Error(`Apertura del database di sincronizzazione ${file} fallita: ${describe(err)}`);
  }
  try {
    // WAL: unlike gtfs.db this file takes concurrent writes from many requests.
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("busy_timeout = 5000");
    db.pragma("foreign_keys = ON");
    db.exec(schemaSql());
  } catch (err) {
    try {
      db.close();
    } catch {
      // Nothing useful to do while unwinding a failed open.
    }
    throw new Error(`Inizializzazione di ${file} fallita: ${describe(err)}`);
  }
  return { db, file, lastPurgeAt: 0 };
}

function handle(): SyncDbHandle {
  const file = syncDbPath();
  const cached = globalThis.__probusSyncDbHandle;
  if (cached !== undefined && cached.file === file && cached.db.open) return cached;
  if (cached !== undefined) {
    try {
      cached.db.close();
    } catch (err) {
      console.warn(`[syncdb] chiusura del vecchio handle fallita: ${describe(err)}`);
    }
    globalThis.__probusSyncDbHandle = undefined;
  }
  const opened = open(file);
  globalThis.__probusSyncDbHandle = opened;
  return opened;
}

/** Shared writable handle, opening the file and its schema on first use. */
export function getSyncDb(): Db {
  return handle().db;
}

/** Closes the shared handle, if any. For scripts, not for request paths. */
export function closeSyncDb(): void {
  const cached = globalThis.__probusSyncDbHandle;
  if (cached === undefined) return;
  globalThis.__probusSyncDbHandle = undefined;
  try {
    cached.db.close();
  } catch (err) {
    console.warn(`[syncdb] chiusura del database fallita: ${describe(err)}`);
  }
}

function assertSyncId(syncId: string): void {
  if (!SYNC_ID_RE.test(syncId)) throw new Error("syncId non valido");
}

function toBuffer(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return null;
}

/** The stored blob, or null when the id is unknown. */
export function readSyncBlob(syncId: string): SyncBlobRow | null {
  assertSyncId(syncId);
  const row = getSyncDb()
    .prepare("SELECT ciphertext, iv, version, updated_at FROM sync_blobs WHERE sync_id = ?")
    .raw()
    .get(syncId);
  if (!Array.isArray(row)) return null;
  const [ciphertext, iv, version, updatedAt] = row;
  const cipherBuf = toBuffer(ciphertext);
  const ivBuf = toBuffer(iv);
  if (cipherBuf === null || ivBuf === null) return null;
  if (typeof version !== "number" || typeof updatedAt !== "number") return null;
  return { ciphertext: cipherBuf, iv: ivBuf, version, updatedAt };
}

/**
 * Optimistic write: baseVersion must equal the stored version, or 0 when the
 * row does not exist. Read and write share one IMMEDIATE transaction, so two
 * devices racing on the same id cannot both win.
 */
export function writeSyncBlob(args: {
  syncId: string;
  ciphertext: Buffer;
  iv: Buffer;
  baseVersion: number;
  now: number;
}): SyncWriteResult {
  const { syncId, ciphertext, iv, baseVersion, now } = args;
  assertSyncId(syncId);
  if (!Number.isSafeInteger(baseVersion) || baseVersion < 0) throw new Error("baseVersion non valido");
  if (!Number.isSafeInteger(now) || now <= 0) throw new Error("timestamp non valido");

  const db = getSyncDb();
  const tx = db.transaction((): SyncWriteResult => {
    const existing = db.prepare("SELECT version FROM sync_blobs WHERE sync_id = ?").raw().get(syncId);
    const currentVersion = Array.isArray(existing) && typeof existing[0] === "number" ? existing[0] : 0;
    if (currentVersion !== baseVersion) return { ok: false, conflict: true, currentVersion };

    const nextVersion = currentVersion + 1;
    db.prepare(
      `INSERT INTO sync_blobs (sync_id, ciphertext, iv, version, updated_at, bytes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(sync_id) DO UPDATE SET
         ciphertext = excluded.ciphertext,
         iv = excluded.iv,
         version = excluded.version,
         updated_at = excluded.updated_at,
         bytes = excluded.bytes`,
    ).run(syncId, ciphertext, iv, nextVersion, now, ciphertext.length);
    return { ok: true, version: nextVersion, updatedAt: now };
  });
  return tx.immediate();
}

/** Removes the row if present. Deleting an unknown id is not an error. */
export function deleteSyncBlob(syncId: string): void {
  assertSyncId(syncId);
  getSyncDb().prepare("DELETE FROM sync_blobs WHERE sync_id = ?").run(syncId);
}

/** Drops blobs untouched for more than RETENTION_MS. Returns the row count. */
export function purgeStaleSyncBlobs(now: number): number {
  if (!Number.isSafeInteger(now) || now <= 0) return 0;
  const cutoff = now - RETENTION_MS;
  const result = getSyncDb().prepare("DELETE FROM sync_blobs WHERE updated_at < ?").run(cutoff);
  return result.changes;
}

/**
 * Opportunistic retention pass: at most once an hour, and off the request path,
 * so a request never waits on it. Failures are logged and never propagate.
 */
export function maybePurgeSyncBlobs(): void {
  let current: SyncDbHandle;
  try {
    current = handle();
  } catch (err) {
    console.warn(`[syncdb] purge non pianificata: ${describe(err)}`);
    return;
  }
  const now = Date.now();
  if (now - current.lastPurgeAt < PURGE_INTERVAL_MS) return;
  // Claim the slot before scheduling, so concurrent requests queue only one pass.
  current.lastPurgeAt = now;
  setTimeout(() => {
    try {
      const removed = purgeStaleSyncBlobs(Date.now());
      if (removed > 0) console.info(`[syncdb] purge: ${removed} blob rimossi`);
    } catch (err) {
      console.warn(`[syncdb] purge fallita: ${describe(err)}`);
    }
  }, 0);
}
