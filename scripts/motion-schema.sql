-- Schema of data/motion.db, the writable store for learned vehicle speeds.
--
-- This database is NOT scripts/schema.sql. gtfs.db is opened read-only and is
-- replaced wholesale by the nightly ingest; anything written there is gone by
-- morning. This file has the same lifecycle as data/sync.db: created by the
-- app on first use, written continuously, never touched by the refresh.
-- src/lib/motionstats.ts applies these statements on first use, so a fresh
-- volume needs no manual step; running this file by hand is equivalent.
--
-- Nothing here is personal. A row says "on this line, in this 250 m square, in
-- this part of the day, vehicles averaged this speed". No vehicle, trip or
-- device identity is stored, and no row can be traced back to one journey.

PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS cell_speed (
  route_id   TEXT    NOT NULL,
  -- Time band: -1 is the all-day aggregate, 0..11 are weekday/weekend crossed
  -- with six four-hour slices. The aggregate is what a rarely-seen cell falls
  -- back to, so a line still predicts sensibly outside its busiest hours.
  band       INTEGER NOT NULL,
  -- Packed 250 m grid cell, see cellKeyOf() in src/lib/pathmotion.ts. Keyed by
  -- place, not by index along a shape: shape ids are renumbered every ingest.
  cell       INTEGER NOT NULL,
  -- Decayed mean speed through the cell, metres per second.
  mps        REAL    NOT NULL,
  -- Decayed sample count. Halves every MOTION_HALF_LIFE_SEC, so last month's
  -- rush hour cannot outvote this morning's, and it is what the client reads
  -- as confidence.
  weight     REAL    NOT NULL,
  -- Unix seconds of the last sample folded in; the decay is measured from it.
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (route_id, band, cell)
) WITHOUT ROWID;

-- Only the retention purge and the row cap scan by age.
CREATE INDEX IF NOT EXISTS idx_cell_speed_updated_at ON cell_speed (updated_at);
