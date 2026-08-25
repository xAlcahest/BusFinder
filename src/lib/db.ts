/**
 * Read-only access to the static GTFS database built by scripts/ingest.ts.
 * One handle per process, cached on globalThis so Next's dev HMR does not leak
 * file descriptors across module reloads.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

type Db = Database.Database;

interface DbHandle {
  db: Db;
  file: string;
  ino: number;
  mtimeMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __probusDbHandle: DbHandle | undefined;
}

/** Absolute path of the database file. Overridable for tests and containers. */
export function dbPath(): string {
  const override = process.env.PROBUS_DB_PATH;
  if (typeof override === "string" && override.trim().length > 0) {
    return path.resolve(override.trim());
  }
  return path.join(process.cwd(), "data", "gtfs.db");
}

function statOrNull(file: string): fs.Stats | null {
  try {
    const stats = fs.statSync(file);
    return stats.isFile() ? stats : null;
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") return null;
    // Anything else (permissions, I/O) is a real problem worth surfacing.
    throw new Error(`Impossibile leggere il database GTFS in ${file}: ${describe(err)}`);
  }
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function missingDbError(file: string): Error {
  return new Error(
    `Database GTFS non trovato in ${file}. Esegui "pnpm ingest" per generarlo ` +
      `(oppure "pnpm ingest:local" per usare lo zip gia scaricato).`,
  );
}

function open(file: string, stats: fs.Stats): DbHandle {
  let db: Db;
  try {
    db = new Database(file, { readonly: true, fileMustExist: true });
  } catch (err) {
    throw new Error(`Apertura del database GTFS ${file} fallita: ${describe(err)}`);
  }
  // Read-only tuning: memory-mapped pages, 64 MB page cache, no disk temp files.
  db.pragma("mmap_size = 268435456");
  db.pragma("cache_size = -65536");
  db.pragma("temp_store = MEMORY");
  db.pragma("query_only = ON");
  db.pragma("busy_timeout = 2000");
  return { db, file, ino: stats.ino, mtimeMs: stats.mtimeMs };
}

/**
 * Returns the shared read-only handle, opening it on first use.
 * Throws with an operator-readable message when the file is missing.
 */
export function getDb(): Db {
  const file = dbPath();
  const cached = globalThis.__probusDbHandle;
  if (cached !== undefined && cached.file === file) {
    const stats = statOrNull(file);
    // A finished ingest renames a new file into place: pick it up without a restart.
    if (stats !== null && (stats.ino !== cached.ino || stats.mtimeMs !== cached.mtimeMs)) {
      try {
        cached.db.close();
      } catch (err) {
        console.warn(`[db] chiusura del vecchio handle fallita: ${describe(err)}`);
      }
      const handle = open(file, stats);
      globalThis.__probusDbHandle = handle;
      return handle.db;
    }
    return cached.db;
  }

  if (cached !== undefined) {
    try {
      cached.db.close();
    } catch (err) {
      console.warn(`[db] chiusura del vecchio handle fallita: ${describe(err)}`);
    }
    globalThis.__probusDbHandle = undefined;
  }

  const stats = statOrNull(file);
  if (stats === null) throw missingDbError(file);
  const handle = open(file, stats);
  globalThis.__probusDbHandle = handle;
  return handle.db;
}

/** True when the database file exists and is non-empty. Never throws. */
export function isDbReady(): boolean {
  try {
    // Turbopack would otherwise trace the whole project into the standalone output.
    const stats = fs.statSync(/*turbopackIgnore: true*/ dbPath());
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}

/** Closes the shared handle, if any. Used by scripts, not by request paths. */
export function closeDb(): void {
  const cached = globalThis.__probusDbHandle;
  if (cached === undefined) return;
  globalThis.__probusDbHandle = undefined;
  try {
    cached.db.close();
  } catch (err) {
    console.warn(`[db] chiusura del database fallita: ${describe(err)}`);
  }
}

/** Every row of the meta table, as written by the ingest. */
export function readMeta(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM meta").raw().all();
  const meta: Record<string, string> = {};
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const [key, value] = row;
    if (typeof key === "string" && typeof value === "string") meta[key] = value;
  }
  return meta;
}

/** One meta value, or null when the key is absent. */
export function readMetaValue(key: string): string | null {
  if (typeof key !== "string" || key.length === 0) return null;
  const row = getDb().prepare("SELECT value FROM meta WHERE key = ?").raw().get(key);
  if (!Array.isArray(row)) return null;
  const value = row[0];
  return typeof value === "string" ? value : null;
}

/** Unix seconds of the last successful ingest, or null when unknown. */
export function feedImportedAt(): number | null {
  const raw = readMetaValue("imported_at");
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
