/**
 * Builds data/gtfs.db from the Rome GTFS static feed.
 *
 *   pnpm ingest                     download the live zip and rebuild
 *   pnpm ingest --from-file         use data/rome_static_gtfs.zip instead
 *   pnpm ingest -- --keep-zip       keep the downloaded zip in data/tmp
 *
 * stop_times.txt is 4.5M rows / 214 MB: it is streamed straight out of the zip
 * into a single transaction and never held in memory.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Readable } from "node:stream";
import Database from "better-sqlite3";
import yauzl from "yauzl";
import type { Entry, ZipFile } from "yauzl";
import { encodePolyline } from "../src/lib/polyline.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_URL = "https://romamobilita.it/sites/default/files/rome_static_gtfs.zip";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Local copy used by a bare --from-file, overridable with GTFS_LOCAL_ZIP. */
const FIXTURE_ZIP =
  process.env.GTFS_LOCAL_ZIP ?? path.join(SCRIPT_DIR, "..", "data", "rome_static_gtfs.zip");
const DOWNLOAD_TIMEOUT_MS = 180_000;
const PROGRESS_EVERY = 1_000_000;

interface Options {
  fromFile: string | null;
  keepZip: boolean;
  url: string;
  dbFile: string;
}

function printUsage(): void {
  process.stderr.write(
    [
      "usage: tsx scripts/ingest.ts [options]",
      "  --from-file[=PATH]  use a local zip instead of downloading",
      "  --keep-zip          keep the downloaded zip under data/tmp",
      "  --url=URL           override the static feed URL",
      "  --db=PATH           override the output database path",
      "",
    ].join("\n"),
  );
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    fromFile: null,
    keepZip: false,
    url: DEFAULT_URL,
    dbFile: path.join(process.cwd(), "data", "gtfs.db"),
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--from-file") {
      const next = i + 1 < argv.length ? argv[i + 1] : undefined;
      if (next !== undefined && !next.startsWith("-")) {
        opts.fromFile = next;
        i += 1;
      } else {
        opts.fromFile = FIXTURE_ZIP;
      }
    } else if (arg.startsWith("--from-file=")) {
      const value = arg.slice("--from-file=".length);
      if (value.length === 0) throw new Error("--from-file= needs a path");
      opts.fromFile = value;
    } else if (arg === "--keep-zip") {
      opts.keepZip = true;
    } else if (arg.startsWith("--url=")) {
      const value = arg.slice("--url=".length);
      if (!/^https?:\/\//.test(value)) throw new Error(`--url must be http(s): ${value}`);
      opts.url = value;
    } else if (arg.startsWith("--db=")) {
      const value = arg.slice("--db=".length);
      if (value.length === 0) throw new Error("--db= needs a path");
      opts.dbFile = path.resolve(value);
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

const startedAt = Date.now();

function elapsed(): string {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;
}

function log(message: string): void {
  process.stderr.write(`[ingest ${elapsed()}] ${message}\n`);
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// ---------------------------------------------------------------------------
// CSV: RFC4180 record reader plus field parser
// ---------------------------------------------------------------------------

/**
 * Feeds complete CSV records (quoted fields may contain newlines) to onRecord.
 * Records exclude the trailing newline; a trailing \r is stripped downstream.
 */
function forEachRecord(stream: Readable, onRecord: (record: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    let buf = "";
    let start = 0; // start of the record being assembled
    let pos = 0; // how far the scanner has looked
    let inQuotes = false;
    let bomChecked = false;
    let settled = false;

    const fail = (err: unknown): void => {
      if (settled) return;
      settled = true;
      stream.destroy();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    stream.setEncoding("utf8");
    stream.on("error", fail);
    stream.on("data", (chunk: unknown) => {
      if (settled) return;
      if (typeof chunk !== "string") {
        fail(new Error("csv stream produced a non-string chunk"));
        return;
      }
      try {
        buf += chunk;
        if (!bomChecked) {
          bomChecked = true;
          if (buf.charCodeAt(0) === 0xfeff) buf = buf.slice(1);
        }
        if (!inQuotes && buf.indexOf('"', pos) === -1) {
          // Fast path: no quoting left in the buffer, split on newlines only.
          let nl = buf.indexOf("\n", pos);
          while (nl !== -1) {
            onRecord(buf.slice(start, nl));
            start = nl + 1;
            pos = start;
            nl = buf.indexOf("\n", pos);
          }
          pos = buf.length;
        } else {
          while (pos < buf.length) {
            if (inQuotes) {
              const q = buf.indexOf('"', pos);
              if (q === -1) {
                pos = buf.length;
                break;
              }
              inQuotes = false;
              pos = q + 1;
              continue;
            }
            const nl = buf.indexOf("\n", pos);
            const q = buf.indexOf('"', pos);
            if (q !== -1 && (nl === -1 || q < nl)) {
              inQuotes = true;
              pos = q + 1;
              continue;
            }
            if (nl === -1) {
              pos = buf.length;
              break;
            }
            onRecord(buf.slice(start, nl));
            start = nl + 1;
            pos = start;
          }
        }
        if (start > 0) {
          buf = buf.slice(start);
          pos -= start;
          start = 0;
        }
      } catch (err) {
        fail(err);
      }
    });
    stream.on("end", () => {
      if (settled) return;
      try {
        const tail = buf.slice(start);
        if (tail.length > 0 && tail !== "\r") onRecord(tail);
        settled = true;
        resolve();
      } catch (err) {
        fail(err);
      }
    });
  });
}

/**
 * Splits one record into fields, writing them into `out` and returning how
 * many were written. Handles RFC4180 quoting and doubled quotes.
 * `limit` stops the unquoted fast path early; the quoted path ignores it and
 * simply returns every field, which callers tolerate.
 */
function parseRecord(record: string, out: string[], limit = Number.MAX_SAFE_INTEGER): number {
  const line =
    record.length > 0 && record.charCodeAt(record.length - 1) === 13 ? record.slice(0, -1) : record;
  let n = 0;
  if (line.indexOf('"') === -1) {
    let from = 0;
    for (;;) {
      const comma = line.indexOf(",", from);
      if (comma === -1) {
        out[n++] = line.slice(from);
        break;
      }
      out[n++] = line.slice(from, comma);
      from = comma + 1;
      if (n >= limit) break;
    }
    return n;
  }
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const code = line.charCodeAt(i);
    if (inQuotes) {
      if (code === 34) {
        if (i + 1 < line.length && line.charCodeAt(i + 1) === 34) {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += line[i];
      }
    } else if (code === 34) {
      inQuotes = true;
    } else if (code === 44) {
      out[n++] = field;
      field = "";
    } else {
      field += line[i];
    }
  }
  out[n++] = field;
  return n;
}

function headerMap(fields: string[], count: number, file: string): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const name = fields[i].trim();
    if (name.length > 0 && !map.has(name)) map.set(name, i);
  }
  if (map.size === 0) throw new Error(`${file}: empty header`);
  return map;
}

function requiredColumn(map: Map<string, number>, name: string, file: string): number {
  const index = map.get(name);
  if (index === undefined) throw new Error(`${file}: missing required column "${name}"`);
  return index;
}

function optionalColumn(map: Map<string, number>, name: string): number {
  return map.get(name) ?? -1;
}

/** Field access that tolerates short rows and absent optional columns. */
function at(fields: string[], count: number, index: number): string {
  if (index < 0 || index >= count) return "";
  return fields[index];
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// ---------------------------------------------------------------------------
// GTFS value helpers
// ---------------------------------------------------------------------------

/** "HH:MM:SS" to seconds after midnight. Hours above 23 are legal and kept. */
function parseGtfsTime(value: string): number | null {
  const s = value.trim();
  if (s.length === 0) return null;
  const c1 = s.indexOf(":");
  if (c1 <= 0) return null;
  const c2 = s.indexOf(":", c1 + 1);
  if (c2 <= c1 + 1) return null;
  const hh = s.slice(0, c1);
  const mm = s.slice(c1 + 1, c2);
  const ss = s.slice(c2 + 1);
  if (mm.length === 0 || ss.length === 0) return null;
  const h = Number(hh);
  const m = Number(mm);
  const sec = Number(ss);
  if (!Number.isInteger(h) || !Number.isInteger(m) || !Number.isInteger(sec)) return null;
  if (h < 0 || h > 96 || m < 0 || m > 59 || sec < 0 || sec > 59) return null;
  return h * 3600 + m * 60 + sec;
}

function parseIntStrict(value: string): number | null {
  const s = value.trim();
  if (s.length === 0) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

function parseFloatStrict(value: string): number | null {
  const s = value.trim();
  if (s.length === 0) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const COMBINING_MARKS = /[\u0300-\u036f]/g;
const WHITESPACE_RUN = /\s+/g;

/** Lowercase, accent-free, whitespace-collapsed key used by the search queries. */
function searchKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(WHITESPACE_RUN, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Zip streaming
// ---------------------------------------------------------------------------

type EntryHandler = (stream: Readable) => Promise<void>;

/** Opens the zip once and runs the matching handler for each wanted entry. */
function readZipEntries(zipPath: string, handlers: Map<string, EntryHandler>): Promise<Set<string>> {
  return new Promise((resolve, reject) => {
    yauzl.open(
      zipPath,
      { lazyEntries: true, autoClose: true, decodeStrings: true, validateEntrySizes: true },
      (openErr: Error | null, zipfile: ZipFile | undefined) => {
        if (openErr !== null) {
          reject(openErr);
          return;
        }
        if (zipfile === undefined) {
          reject(new Error(`cannot open zip ${zipPath}`));
          return;
        }
        const seen = new Set<string>();
        let settled = false;
        const fail = (err: unknown): void => {
          if (settled) return;
          settled = true;
          try {
            zipfile.close();
          } catch (closeErr) {
            log(`warning: closing zip failed: ${describe(closeErr)}`);
          }
          reject(err instanceof Error ? err : new Error(String(err)));
        };
        zipfile.on("error", fail);
        zipfile.on("end", () => {
          if (settled) return;
          settled = true;
          resolve(seen);
        });
        zipfile.on("entry", (entry: Entry) => {
          if (settled) return;
          const name = path.posix.basename(entry.fileName);
          const handler = entry.fileName.endsWith("/") ? undefined : handlers.get(name);
          if (handler === undefined) {
            zipfile.readEntry();
            return;
          }
          zipfile.openReadStream(entry, (streamErr: Error | null, stream: Readable | undefined) => {
            if (settled) return;
            if (streamErr !== null) {
              fail(streamErr);
              return;
            }
            if (stream === undefined) {
              fail(new Error(`cannot read ${entry.fileName}`));
              return;
            }
            handler(stream).then(
              () => {
                if (settled) return;
                seen.add(name);
                zipfile.readEntry();
              },
              (err: unknown) => fail(err),
            );
          });
        });
        zipfile.readEntry();
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Download and hashing
// ---------------------------------------------------------------------------

async function download(url: string, target: string): Promise<void> {
  log(`downloading ${url}`);
  const res = await fetch(url, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    headers: { "user-agent": "probus-web ingest" },
  });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status} ${res.statusText}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength < 1024) throw new Error(`download failed: only ${bytes.byteLength} bytes`);
  await fsp.writeFile(target, bytes);
  log(`downloaded ${(bytes.byteLength / 1048576).toFixed(1)} MB to ${target}`);
}

function sha256File(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = fs.createReadStream(file);
    stream.on("error", reject);
    stream.on("data", (chunk: unknown) => {
      if (typeof chunk === "string" || chunk instanceof Uint8Array) hash.update(chunk);
      else {
        stream.destroy();
        reject(new Error(`unexpected chunk type while hashing ${file}`));
      }
    });
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function rmIfExists(file: string): Promise<void> {
  await fsp.rm(file, { force: true });
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

interface SchemaStatements {
  tables: string[];
  indexes: string[];
}

/**
 * Splits schema.sql into table and index statements so the indexes can be
 * created after the bulk load, which is far faster than maintaining them.
 */
function loadSchema(): SchemaStatements {
  const file = path.join(SCRIPT_DIR, "schema.sql");
  const raw = fs.readFileSync(file, "utf8");
  if (raw.includes("'")) {
    throw new Error("schema.sql contains a quoted literal: the statement splitter is not safe");
  }
  const statements = raw
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const tables: string[] = [];
  const indexes: string[] = [];
  for (const statement of statements) {
    if (/^create\s+(unique\s+)?index/i.test(statement)) indexes.push(statement);
    else tables.push(statement);
  }
  if (tables.length === 0 || indexes.length === 0) {
    throw new Error(`schema.sql parsed into ${tables.length} tables and ${indexes.length} indexes`);
  }
  return { tables, indexes };
}

// ---------------------------------------------------------------------------
// Row validation for the few queries we run back against the database
// ---------------------------------------------------------------------------

function isRow(row: unknown): row is unknown[] {
  return Array.isArray(row);
}

function rowText(row: unknown, index: number, ctx: string): string {
  if (!isRow(row)) throw new Error(`${ctx}: expected a row array`);
  const value = row[index];
  if (typeof value !== "string") throw new Error(`${ctx}: column ${index} is not text`);
  return value;
}

function rowInt(row: unknown, index: number, ctx: string): number {
  if (!isRow(row)) throw new Error(`${ctx}: expected a row array`);
  const value = row[index];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${ctx}: column ${index} is not a number`);
  }
  return value;
}

function countRows(db: Database.Database, table: string): number {
  const row = db.prepare(`SELECT COUNT(*) FROM ${table}`).raw().get();
  return rowInt(row, 0, `count(${table})`);
}

// ---------------------------------------------------------------------------
// Ingest
// ---------------------------------------------------------------------------

interface TripFacts {
  ids: string[];
  index: Map<string, number>;
  routeDir: number[];
  shapeId: Array<string | null>;
  stopCount: number[];
}

interface DirFacts {
  key: Map<string, number>;
  routeId: string[];
  directionId: number[];
  tripCount: number[];
  headsigns: Array<Map<string, number>>;
  stops: Array<Set<string>>;
}

/** One distinct stop sequence of a route+direction, and how many trips run it. */
interface Variant {
  stops: string[];
  trips: number;
}

/**
 * Merges the stop lists of every trip variant of one direction into a single
 * order. stop_sequence numbers are not comparable between variants, so the
 * only usable signal is relative order: the busiest variant becomes the
 * backbone and every other one is spliced into it, each run of stops the
 * backbone lacks landing whole right after the stop the variant reaches it
 * from. Splicing whole runs is what keeps a branch readable as a branch
 * instead of being interleaved with the trunk.
 *
 * Returns the merged stop ids plus how many variants could not be honoured,
 * which happens on loop lines where trips start at different points.
 */
function mergeVariants(variants: Variant[]): { order: string[]; forced: number } {
  const ordered = [...variants].sort((a, b) => {
    if (a.trips !== b.trips) return b.trips - a.trips;
    if (a.stops.length !== b.stops.length) return b.stops.length - a.stops.length;
    return a.stops[0] < b.stops[0] ? -1 : a.stops[0] > b.stops[0] ? 1 : 0;
  });

  const order: string[] = [];
  const position = new Map<string, number>();
  let forced = 0;

  for (const variant of ordered) {
    let cursor = 0; // first index the variant may still write to
    let anchored = false;
    let pending: string[] = [];
    let conflict = false;
    /** Splices the pending run in at `at` and returns the index just past it. */
    const insert = (at: number): number => {
      if (pending.length === 0) return at;
      const count = pending.length;
      order.splice(at, 0, ...pending);
      pending = [];
      for (let i = at; i < order.length; i++) position.set(order[i], i);
      return at + count;
    };
    for (const stopId of variant.stops) {
      const at = position.get(stopId);
      if (at === undefined) {
        pending.push(stopId);
        continue;
      }
      if (at < cursor) {
        // The variant wants this stop after one already placed later: a loop
        // line whose trips start at different points. Keep the backbone.
        conflict = true;
        cursor = insert(cursor);
        continue;
      }
      cursor = insert(at) + 1;
      anchored = true;
    }
    // A variant sharing nothing with the backbone has no anchor to hang off.
    insert(anchored ? cursor : order.length);
    if (conflict) forced += 1;
  }
  return { order, forced };
}

async function ingest(zipPath: string, sourceUrl: string, dbFile: string): Promise<void> {
  const tmpDb = `${dbFile}.tmp`;
  await rmIfExists(tmpDb);
  await rmIfExists(`${tmpDb}-journal`);
  await rmIfExists(`${tmpDb}-wal`);

  const db = new Database(tmpDb);
  let ok = false;
  try {
    db.pragma("page_size = 8192");
    const schema = loadSchema();
    for (const statement of schema.tables) db.exec(statement);
    db.pragma("journal_mode = OFF");
    const journalMode = db.pragma("journal_mode", { simple: true });
    // SQLite 3.51 refuses OFF; MEMORY still keeps the throwaway build journal-free.
    if (typeof journalMode !== "string" || journalMode.toLowerCase() !== "off") {
      db.pragma("journal_mode = MEMORY");
    }
    db.pragma("synchronous = OFF");
    db.pragma("temp_store = MEMORY");
    db.pragma("cache_size = -131072");
    db.pragma("locking_mode = EXCLUSIVE");

    const trips: TripFacts = {
      ids: [],
      index: new Map(),
      routeDir: [],
      shapeId: [],
      stopCount: [],
    };
    const dirs: DirFacts = {
      key: new Map(),
      routeId: [],
      directionId: [],
      tripCount: [],
      headsigns: [],
      stops: [],
    };

    const dirIndex = (routeId: string, directionId: number): number => {
      const key = `${routeId}\u0000${directionId}`;
      const existing = dirs.key.get(key);
      if (existing !== undefined) return existing;
      const created = dirs.routeId.length;
      dirs.key.set(key, created);
      dirs.routeId.push(routeId);
      dirs.directionId.push(directionId);
      dirs.tripCount.push(0);
      dirs.headsigns.push(new Map());
      dirs.stops.push(new Set());
      return created;
    };

    const insertAgency = db.prepare("INSERT OR REPLACE INTO agencies VALUES (?, ?, ?)");
    const insertStop = db.prepare("INSERT OR REPLACE INTO stops VALUES (?, ?, ?, ?, ?, ?, ?)");
    const insertRoute = db.prepare(
      "INSERT OR REPLACE INTO routes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertTrip = db.prepare("INSERT OR REPLACE INTO trips VALUES (?, ?, ?, ?, ?, ?)");
    const insertCalendarDate = db.prepare("INSERT OR IGNORE INTO calendar_dates VALUES (?, ?)");
    const insertShape = db.prepare("INSERT OR REPLACE INTO shapes VALUES (?, ?)");
    const insertStopTime = db.prepare("INSERT INTO stop_times VALUES (?, ?, ?, ?, ?)");
    const insertRouteStop = db.prepare("INSERT OR IGNORE INTO route_stops VALUES (?, ?, ?, ?)");
    const insertPattern = db.prepare(
      "INSERT OR REPLACE INTO route_patterns VALUES (?, ?, ?, ?, ?, ?)",
    );
    const insertMeta = db.prepare("INSERT OR REPLACE INTO meta VALUES (?, ?)");

    const skipped = {
      stops: 0,
      routes: 0,
      trips: 0,
      stopTimes: 0,
      calendarDates: 0,
      shapePoints: 0,
      orphanStopTimes: 0,
    };

    // --- pass 1: everything except stop_times -------------------------------

    const handlers = new Map<string, EntryHandler>();

    handlers.set("agency.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let idCol = -1;
      let nameCol = -1;
      let urlCol = -1;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "agency.txt");
          idCol = optionalColumn(cols, "agency_id");
          nameCol = requiredColumn(cols, "agency_name", "agency.txt");
          urlCol = optionalColumn(cols, "agency_url");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const name = at(fields, n, nameCol).trim();
        if (name.length === 0) return;
        const id = at(fields, n, idCol).trim() || name;
        insertAgency.run(id, name, nullable(at(fields, n, urlCol)));
        rows += 1;
      });
      log(`agency.txt: ${rows} rows`);
    });

    handlers.set("routes.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let idCol = -1;
      let agencyCol = -1;
      let shortCol = -1;
      let longCol = -1;
      let typeCol = -1;
      let urlCol = -1;
      let colorCol = -1;
      let textColorCol = -1;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "routes.txt");
          idCol = requiredColumn(cols, "route_id", "routes.txt");
          agencyCol = optionalColumn(cols, "agency_id");
          shortCol = optionalColumn(cols, "route_short_name");
          longCol = optionalColumn(cols, "route_long_name");
          typeCol = requiredColumn(cols, "route_type", "routes.txt");
          urlCol = optionalColumn(cols, "route_url");
          colorCol = optionalColumn(cols, "route_color");
          textColorCol = optionalColumn(cols, "route_text_color");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const routeId = at(fields, n, idCol).trim();
        const routeType = parseIntStrict(at(fields, n, typeCol));
        if (routeId.length === 0 || routeType === null) {
          skipped.routes += 1;
          return;
        }
        const longName = nullable(at(fields, n, longCol));
        const shortName = at(fields, n, shortCol).trim() || longName || routeId;
        insertRoute.run(
          routeId,
          nullable(at(fields, n, agencyCol)),
          shortName,
          longName,
          routeType,
          nullable(at(fields, n, urlCol)),
          nullable(at(fields, n, colorCol)),
          nullable(at(fields, n, textColorCol)),
          // schema.sql defines route_search as the normalised short name only.
          searchKey(shortName),
        );
        rows += 1;
      });
      log(`routes.txt: ${rows} rows (${skipped.routes} skipped)`);
    });

    handlers.set("stops.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let idCol = -1;
      let codeCol = -1;
      let nameCol = -1;
      let latCol = -1;
      let lonCol = -1;
      let wheelchairCol = -1;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "stops.txt");
          idCol = requiredColumn(cols, "stop_id", "stops.txt");
          codeCol = optionalColumn(cols, "stop_code");
          nameCol = requiredColumn(cols, "stop_name", "stops.txt");
          latCol = requiredColumn(cols, "stop_lat", "stops.txt");
          lonCol = requiredColumn(cols, "stop_lon", "stops.txt");
          wheelchairCol = optionalColumn(cols, "wheelchair_boarding");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const stopId = at(fields, n, idCol).trim();
        const stopName = at(fields, n, nameCol).trim();
        const lat = parseFloatStrict(at(fields, n, latCol));
        const lon = parseFloatStrict(at(fields, n, lonCol));
        if (
          stopId.length === 0 ||
          stopName.length === 0 ||
          lat === null ||
          lon === null ||
          lat < -90 ||
          lat > 90 ||
          lon < -180 ||
          lon > 180
        ) {
          skipped.stops += 1;
          return;
        }
        insertStop.run(
          stopId,
          nullable(at(fields, n, codeCol)),
          stopName,
          searchKey(stopName),
          lat,
          lon,
          parseIntStrict(at(fields, n, wheelchairCol)),
        );
        rows += 1;
      });
      log(`stops.txt: ${rows} rows (${skipped.stops} skipped)`);
    });

    handlers.set("trips.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let routeCol = -1;
      let serviceCol = -1;
      let tripCol = -1;
      let headsignCol = -1;
      let directionCol = -1;
      let shapeCol = -1;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "trips.txt");
          routeCol = requiredColumn(cols, "route_id", "trips.txt");
          serviceCol = requiredColumn(cols, "service_id", "trips.txt");
          tripCol = requiredColumn(cols, "trip_id", "trips.txt");
          headsignCol = optionalColumn(cols, "trip_headsign");
          directionCol = optionalColumn(cols, "direction_id");
          shapeCol = optionalColumn(cols, "shape_id");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const tripId = at(fields, n, tripCol).trim();
        const routeId = at(fields, n, routeCol).trim();
        const serviceId = at(fields, n, serviceCol).trim();
        if (tripId.length === 0 || routeId.length === 0 || serviceId.length === 0) {
          skipped.trips += 1;
          return;
        }
        if (trips.index.has(tripId)) {
          skipped.trips += 1;
          return;
        }
        const parsedDirection = parseIntStrict(at(fields, n, directionCol));
        const directionId = parsedDirection === 1 ? 1 : 0;
        const headsign = nullable(at(fields, n, headsignCol));
        const shapeId = nullable(at(fields, n, shapeCol));
        insertTrip.run(tripId, routeId, serviceId, headsign, directionId, shapeId);

        const dir = dirIndex(routeId, directionId);
        dirs.tripCount[dir] += 1;
        if (headsign !== null) {
          const counts = dirs.headsigns[dir];
          counts.set(headsign, (counts.get(headsign) ?? 0) + 1);
        }
        trips.index.set(tripId, trips.ids.length);
        trips.ids.push(tripId);
        trips.routeDir.push(dir);
        trips.shapeId.push(shapeId);
        trips.stopCount.push(0);
        rows += 1;
      });
      log(`trips.txt: ${rows} rows, ${dirs.routeId.length} route/direction pairs`);
    });

    handlers.set("calendar_dates.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let serviceCol = -1;
      let dateCol = -1;
      let typeCol = -1;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "calendar_dates.txt");
          serviceCol = requiredColumn(cols, "service_id", "calendar_dates.txt");
          dateCol = requiredColumn(cols, "date", "calendar_dates.txt");
          typeCol = requiredColumn(cols, "exception_type", "calendar_dates.txt");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const serviceId = at(fields, n, serviceCol).trim();
        const date = at(fields, n, dateCol).trim();
        // Only added service counts: this feed ships no calendar.txt.
        if (parseIntStrict(at(fields, n, typeCol)) !== 1) return;
        if (serviceId.length === 0 || !/^\d{8}$/.test(date)) {
          skipped.calendarDates += 1;
          return;
        }
        insertCalendarDate.run(serviceId, date);
        rows += 1;
      });
      log(`calendar_dates.txt: ${rows} service days (${skipped.calendarDates} skipped)`);
    });

    handlers.set("shapes.txt", async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let shapeCol = -1;
      let latCol = -1;
      let lonCol = -1;
      let seqCol = -1;
      let points = 0;
      // Shape rows are neither grouped nor sorted in this feed, so collect
      // flat [seq, lat, lon] triples per shape and sort before encoding.
      const byShape = new Map<string, number[]>();
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields);
        if (cols === null) {
          cols = headerMap(fields, n, "shapes.txt");
          shapeCol = requiredColumn(cols, "shape_id", "shapes.txt");
          latCol = requiredColumn(cols, "shape_pt_lat", "shapes.txt");
          lonCol = requiredColumn(cols, "shape_pt_lon", "shapes.txt");
          seqCol = requiredColumn(cols, "shape_pt_sequence", "shapes.txt");
          return;
        }
        if (n === 1 && fields[0].trim().length === 0) return;
        const shapeId = at(fields, n, shapeCol).trim();
        const lat = parseFloatStrict(at(fields, n, latCol));
        const lon = parseFloatStrict(at(fields, n, lonCol));
        const seq = parseIntStrict(at(fields, n, seqCol));
        if (
          shapeId.length === 0 ||
          lat === null ||
          lon === null ||
          seq === null ||
          lat < -90 ||
          lat > 90 ||
          lon < -180 ||
          lon > 180
        ) {
          skipped.shapePoints += 1;
          return;
        }
        let flat = byShape.get(shapeId);
        if (flat === undefined) {
          flat = [];
          byShape.set(shapeId, flat);
        }
        flat.push(seq, lat, lon);
        points += 1;
      });

      let encoded = 0;
      for (const [shapeId, flat] of byShape) {
        const order: number[] = [];
        for (let i = 0; i < flat.length; i += 3) order.push(i);
        order.sort((a, b) => flat[a] - flat[b]);
        const coords: Array<[number, number]> = [];
        for (const i of order) coords.push([flat[i + 1], flat[i + 2]]);
        if (coords.length < 2) continue;
        insertShape.run(shapeId, encodePolyline(coords));
        encoded += 1;
      }
      log(`shapes.txt: ${points} points, ${encoded} shapes encoded`);
    });

    db.exec("BEGIN");
    const seen = await readZipEntries(zipPath, handlers);
    db.exec("COMMIT");

    for (const required of ["agency.txt", "routes.txt", "stops.txt", "trips.txt", "calendar_dates.txt"]) {
      if (!seen.has(required)) throw new Error(`zip is missing ${required}`);
    }
    if (!seen.has("shapes.txt")) log("warning: zip has no shapes.txt, line paths will be empty");
    if (trips.ids.length === 0) throw new Error("trips.txt produced no usable rows");

    // --- pass 2: stop_times -------------------------------------------------

    const stopTimeHandler: EntryHandler = async (stream) => {
      const fields: string[] = [];
      let cols: Map<string, number> | null = null;
      let tripCol = -1;
      let arrCol = -1;
      let depCol = -1;
      let stopCol = -1;
      let seqCol = -1;
      let limit = Number.MAX_SAFE_INTEGER;
      let rows = 0;
      await forEachRecord(stream, (record) => {
        const n = parseRecord(record, fields, limit);
        if (cols === null) {
          cols = headerMap(fields, n, "stop_times.txt");
          tripCol = requiredColumn(cols, "trip_id", "stop_times.txt");
          arrCol = requiredColumn(cols, "arrival_time", "stop_times.txt");
          depCol = requiredColumn(cols, "departure_time", "stop_times.txt");
          stopCol = requiredColumn(cols, "stop_id", "stop_times.txt");
          seqCol = requiredColumn(cols, "stop_sequence", "stop_times.txt");
          // The five columns we need sit early in the row: stop parsing there.
          limit = Math.max(tripCol, arrCol, depCol, stopCol, seqCol) + 1;
          return;
        }
        if (n === 1 && fields[0].length === 0) return;
        const tripId = at(fields, n, tripCol);
        const stopId = at(fields, n, stopCol);
        const seq = parseIntStrict(at(fields, n, seqCol));
        const arrivalRaw = at(fields, n, arrCol);
        const departureRaw = at(fields, n, depCol);
        const arrival = parseGtfsTime(arrivalRaw);
        const departure = departureRaw === arrivalRaw ? arrival : parseGtfsTime(departureRaw);
        const arrivalSec = arrival ?? departure;
        const departureSec = departure ?? arrival;
        if (
          tripId.length === 0 ||
          stopId.length === 0 ||
          seq === null ||
          arrivalSec === null ||
          departureSec === null
        ) {
          skipped.stopTimes += 1;
          return;
        }
        insertStopTime.run(tripId, stopId, arrivalSec, departureSec, seq);
        rows += 1;
        const tripIdx = trips.index.get(tripId);
        if (tripIdx === undefined) {
          skipped.orphanStopTimes += 1;
        } else {
          trips.stopCount[tripIdx] += 1;
          dirs.stops[trips.routeDir[tripIdx]].add(stopId);
        }
        if (rows % PROGRESS_EVERY === 0) log(`stop_times.txt: ${rows} rows`);
      });
      log(
        `stop_times.txt: ${rows} rows inserted (${skipped.stopTimes} skipped, ` +
          `${skipped.orphanStopTimes} without a trip)`,
      );
    };

    db.exec("BEGIN");
    const seenStopTimes = await readZipEntries(
      zipPath,
      new Map<string, EntryHandler>([["stop_times.txt", stopTimeHandler]]),
    );
    db.exec("COMMIT");
    if (!seenStopTimes.has("stop_times.txt")) throw new Error("zip is missing stop_times.txt");

    // --- indexes ------------------------------------------------------------

    for (const statement of schema.indexes) {
      const started = Date.now();
      db.exec(statement);
      const name = /index\s+(\S+)/i.exec(statement);
      log(`index ${name === null ? "?" : name[1]} built in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    }

    // --- route_patterns and route_stops ------------------------------------

    const representative: number[] = new Array<number>(dirs.routeId.length).fill(-1);
    for (let t = 0; t < trips.ids.length; t++) {
      const count = trips.stopCount[t];
      if (count === 0) continue;
      const dir = trips.routeDir[t];
      const current = representative[dir];
      if (
        current === -1 ||
        count > trips.stopCount[current] ||
        (count === trips.stopCount[current] && trips.ids[t] < trips.ids[current])
      ) {
        representative[dir] = t;
      }
    }

    const dirStopsStmt = db
      .prepare(
        `SELECT st.trip_id, st.stop_id FROM stop_times st
         JOIN trips t ON t.trip_id = st.trip_id
         WHERE t.route_id = ? AND t.direction_id = ?
         ORDER BY st.trip_id, st.stop_sequence`,
      )
      .raw();

    /** Distinct stop sequences run by the trips of one route+direction. */
    const collectVariants = (routeId: string, directionId: number): Variant[] => {
      const byKey = new Map<string, Variant>();
      let currentTrip: string | null = null;
      let stops: string[] = [];
      let seen = new Set<string>();
      const flush = (): void => {
        if (stops.length === 0) return;
        const key = stops.join(" ");
        const existing = byKey.get(key);
        if (existing === undefined) byKey.set(key, { stops, trips: 1 });
        else existing.trips += 1;
      };
      for (const row of dirStopsStmt.iterate(routeId, directionId)) {
        const tripId = rowText(row, 0, "direction stop lists");
        const stopId = rowText(row, 1, "direction stop lists");
        if (tripId !== currentTrip) {
          flush();
          currentTrip = tripId;
          stops = [];
          seen = new Set<string>();
        }
        if (seen.has(stopId)) continue; // loop lines call twice: keep the first
        seen.add(stopId);
        stops.push(stopId);
      }
      flush();
      return [...byKey.values()];
    };

    db.exec("BEGIN");
    let patternCount = 0;
    let routeStopCount = 0;
    let emptyDirections = 0;
    let forcedDirections = 0;
    let strandedStops = 0;

    for (let dir = 0; dir < dirs.routeId.length; dir++) {
      const repIdx = representative[dir];
      if (repIdx === -1) {
        emptyDirections += 1;
        continue;
      }
      const repTripId = trips.ids[repIdx];
      let headsign = "";
      let best = -1;
      for (const [candidate, count] of dirs.headsigns[dir]) {
        if (count > best || (count === best && candidate < headsign)) {
          headsign = candidate;
          best = count;
        }
      }
      insertPattern.run(
        dirs.routeId[dir],
        dirs.directionId[dir],
        headsign,
        repTripId,
        trips.shapeId[repIdx],
        dirs.tripCount[dir],
      );
      patternCount += 1;

      const merged = mergeVariants(collectVariants(dirs.routeId[dir], dirs.directionId[dir]));
      if (merged.forced > 0) forcedDirections += 1;
      let order = 0;
      for (const stopId of merged.order) {
        insertRouteStop.run(dirs.routeId[dir], dirs.directionId[dir], stopId, order);
        order += 1;
        routeStopCount += 1;
      }
      // Safety net: the merge draws on the same rows dirs.stops was built from,
      // so a stop reaching here means the two disagreed.
      const placed = new Set(merged.order);
      for (const stopId of dirs.stops[dir]) {
        if (placed.has(stopId)) continue;
        insertRouteStop.run(dirs.routeId[dir], dirs.directionId[dir], stopId, order);
        order += 1;
        routeStopCount += 1;
        strandedStops += 1;
      }
    }
    db.exec("COMMIT");
    log(
      `route_patterns: ${patternCount} (${emptyDirections} directions with no stop_times), ` +
        `route_stops: ${routeStopCount} (${forcedDirections} directions with variants in ` +
        `conflict, ${strandedStops} stops appended)`,
    );

    // --- meta ---------------------------------------------------------------

    const calendarRange = db
      .prepare("SELECT MIN(date), MAX(date) FROM calendar_dates")
      .raw()
      .get();
    const firstDate = Array.isArray(calendarRange) && typeof calendarRange[0] === "string" ? calendarRange[0] : "";
    const lastDate = Array.isArray(calendarRange) && typeof calendarRange[1] === "string" ? calendarRange[1] : "";

    const counts: Record<string, number> = {};
    for (const table of [
      "agencies",
      "stops",
      "routes",
      "trips",
      "stop_times",
      "calendar_dates",
      "shapes",
      "route_stops",
      "route_patterns",
    ]) {
      counts[table] = countRows(db, table);
    }

    const meta: Record<string, string> = {
      feed_sha256: await sha256File(zipPath),
      imported_at: String(Math.floor(Date.now() / 1000)),
      source_url: sourceUrl,
      calendar_first_date: firstDate,
      calendar_last_date: lastDate,
      ingest_seconds: ((Date.now() - startedAt) / 1000).toFixed(1),
    };
    for (const [table, value] of Object.entries(counts)) meta[`rows_${table}`] = String(value);

    db.exec("BEGIN");
    for (const [key, value] of Object.entries(meta)) insertMeta.run(key, value);
    db.exec("COMMIT");

    const analyzeStarted = Date.now();
    db.exec("ANALYZE");
    log(`analyze in ${((Date.now() - analyzeStarted) / 1000).toFixed(1)}s`);

    db.close();
    // Atomic swap: a running server never observes a half-built database.
    await fsp.rename(tmpDb, dbFile);
    ok = true;
    const size = (await fsp.stat(dbFile)).size;
    log(`wrote ${dbFile} (${(size / 1048576).toFixed(1)} MB)`);
    for (const [table, value] of Object.entries(counts)) log(`  ${table}: ${value}`);
    log(`service days ${firstDate} to ${lastDate}`);
  } finally {
    if (db.open) {
      try {
        db.close();
      } catch (err) {
        log(`warning: closing the temporary database failed: ${describe(err)}`);
      }
    }
    if (!ok) await rmIfExists(tmpDb);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  await fsp.mkdir(path.dirname(opts.dbFile), { recursive: true });

  let zipPath: string;
  let downloaded = false;
  if (opts.fromFile !== null) {
    zipPath = path.resolve(opts.fromFile);
    const stats = await fsp.stat(zipPath).catch(() => null);
    if (stats === null || !stats.isFile()) throw new Error(`local zip not found: ${zipPath}`);
    log(`source: local file ${zipPath} (${(stats.size / 1048576).toFixed(1)} MB)`);
  } else {
    const tmpDir = path.join(path.dirname(opts.dbFile), "tmp");
    await fsp.mkdir(tmpDir, { recursive: true });
    zipPath = path.join(tmpDir, "rome_static_gtfs.zip");
    await download(opts.url, zipPath);
    downloaded = true;
  }

  try {
    await ingest(zipPath, opts.fromFile !== null ? `file://${zipPath}` : opts.url, opts.dbFile);
  } finally {
    if (downloaded && !opts.keepZip) {
      await rmIfExists(zipPath).catch((err: unknown) => {
        log(`warning: could not remove ${zipPath}: ${describe(err)}`);
      });
    }
  }
  log("done");
}

main().catch((err: unknown) => {
  process.stderr.write(`[ingest] failed: ${describe(err)}\n`);
  if (err instanceof Error && err.stack !== undefined) process.stderr.write(`${err.stack}\n`);
  process.exitCode = 1;
});
