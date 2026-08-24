#!/bin/sh
# Rebuilds data/gtfs.db from the live feed and swaps it in atomically.
# Meant to run daily around 06:30 Europe/Rome, after the ~05:30 feed refresh.
# Schedule with, e.g., cron: 30 6 * * * /app/scripts/refresh-cron.sh
#
# gtfs.db is the only file in $DATA_DIR this script may create, replace or
# delete. Two other databases live here and must come out of every refresh
# intact, because neither can be rebuilt from any feed: data/sync.db (device
# sync) and data/motion.db (learned vehicle speeds, months of observation).
# The ingest runs in a scratch subdirectory and only its gtfs.db is moved out.
set -eu

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${PROBUS_DATA_DIR:-$APP_DIR/data}"
DB_PATH="$DATA_DIR/gtfs.db"
SYNC_DB_PATH="${PROBUS_SYNC_DB_PATH:-$DATA_DIR/sync.db}"
MOTION_DB_PATH="${PROBUS_MOTION_DB_PATH:-$DATA_DIR/motion.db}"
LOCK_PATH="$DATA_DIR/refresh.lock"
LOG_PATH="$DATA_DIR/refresh.log"
# ingest.ts writes to ./data/gtfs.db relative to its cwd, so we point its cwd
# at a scratch directory and move the result into place ourselves, keeping
# the swap atomic without needing an output-path flag on ingest.ts.
SCRATCH_DIR="$DATA_DIR/refresh.tmp"

mkdir -p "$DATA_DIR"

log() {
  echo "[refresh-cron] $(date -Iseconds) $*" | tee -a "$LOG_PATH"
}

# Refuse to overlap with another running ingest; noclobber makes the create
# atomic so two concurrent crons cannot both pass this check.
if ! (set -C; echo $$ > "$LOCK_PATH") 2>/dev/null; then
  log "another refresh appears to be running (lock at $LOCK_PATH), aborting"
  exit 1
fi
trap 'rm -f "$LOCK_PATH"; rm -rf "$SCRATCH_DIR"' EXIT

log "starting ingest in scratch dir $SCRATCH_DIR"
rm -rf "$SCRATCH_DIR"
mkdir -p "$SCRATCH_DIR/data"

# Witnesses for the check at the end. Only existence: the app writes these
# files concurrently, so their size legitimately moves while the ingest runs.
SYNC_EXISTED_BEFORE=no
if [ -s "$SYNC_DB_PATH" ]; then SYNC_EXISTED_BEFORE=yes; fi
MOTION_EXISTED_BEFORE=no
if [ -s "$MOTION_DB_PATH" ]; then MOTION_EXISTED_BEFORE=yes; fi

# Module resolution for scripts/ingest.ts's own imports follows the script's
# real location, not $PWD, so this only redirects its "./data/gtfs.db" output.
if ! (cd "$SCRATCH_DIR" && "$APP_DIR/node_modules/.bin/tsx" "$APP_DIR/scripts/ingest.ts" >>"$LOG_PATH" 2>&1); then
  log "ingest failed, leaving existing database at $DB_PATH untouched"
  rm -rf "$SCRATCH_DIR"
  exit 1
fi

NEW_DB="$SCRATCH_DIR/data/gtfs.db"
if [ ! -s "$NEW_DB" ]; then
  log "ingest produced no database at $NEW_DB, refusing to swap it in"
  rm -rf "$SCRATCH_DIR"
  exit 1
fi

# Rename is atomic on the same filesystem, so readers never see a half-written DB.
mv "$NEW_DB" "$DB_PATH"
rm -rf "$SCRATCH_DIR"

# The refresh must never destroy the writable stores: one holds user data and
# the other months of observation, and neither is reproducible from any feed.
# Exit non-zero so cron mail actually shows up.
if [ "$SYNC_EXISTED_BEFORE" = yes ] && [ ! -s "$SYNC_DB_PATH" ]; then
  log "FATAL: the refresh destroyed $SYNC_DB_PATH; gtfs.db was swapped in, sync data is gone"
  exit 1
fi
if [ "$MOTION_EXISTED_BEFORE" = yes ] && [ ! -s "$MOTION_DB_PATH" ]; then
  log "FATAL: the refresh destroyed $MOTION_DB_PATH; gtfs.db was swapped in, learned speeds are gone"
  exit 1
fi

log "refresh complete, swapped in $DB_PATH (sync store present before: $SYNC_EXISTED_BEFORE, intact; learned speeds present before: $MOTION_EXISTED_BEFORE, intact)"
