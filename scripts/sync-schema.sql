-- Schema of data/sync.db, the writable store for device sync.
--
-- This database is NOT scripts/schema.sql: gtfs.db is read-only and gets
-- replaced wholesale by the daily ingest, this one takes concurrent writes and
-- must survive it. src/lib/syncdb.ts applies these statements on first use, so
-- a fresh volume needs no manual step; running this file by hand is equivalent.
--
-- The server cannot read what it stores. sync_id is derived in the browser via
-- HKDF from a code the server never sees, and ciphertext is AES-256-GCM under a
-- key derived from the same code. Everything here is opaque bytes.

PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS sync_blobs (
  -- 64 lowercase hex chars: HKDF output, opaque to the server.
  sync_id    TEXT PRIMARY KEY,
  ciphertext BLOB NOT NULL,
  -- 12-byte AES-GCM nonce.
  iv         BLOB NOT NULL,
  -- Bumped on every accepted write; drives optimistic concurrency.
  version    INTEGER NOT NULL,
  -- Unix milliseconds of the server-side write.
  updated_at INTEGER NOT NULL,
  bytes      INTEGER NOT NULL
);

-- Only the retention purge scans by age.
CREATE INDEX IF NOT EXISTS idx_sync_blobs_updated_at ON sync_blobs (updated_at);
