#!/bin/sh
# Prepares /app/data and starts the server.
#
# Two databases live on the volume and they have opposite lifecycles:
#   gtfs.db  read-only, ~391 MB, never shipped in the image, rebuilt from the
#            live feed on first boot and replaced wholesale by every refresh.
#   sync.db  writable, tiny, created by src/lib/syncdb.ts on first use, holds
#            ciphertext this server cannot read. Nothing may ever recreate it.
# refresh-cron.sh ingests into a scratch dir and moves only gtfs.db into place,
# so the refresh cannot touch sync.db. This script must not either.
set -e

DATA_DIR="/app/data"
DB_PATH="$DATA_DIR/gtfs.db"
SYNC_DB_PATH="${PROBUS_SYNC_DB_PATH:-$DATA_DIR/sync.db}"
LOCK_PATH="$DATA_DIR/refresh.lock"

log() {
  echo "[entrypoint] $(date -Iseconds) $*"
}

mkdir -p "$DATA_DIR"

# A read-only mount would let the server boot and then fail every sync write
# with a 500. Fail here instead, while the reason is still obvious.
rm -f "$DATA_DIR"/.write-probe.* 2>/dev/null || true
PROBE="$DATA_DIR/.write-probe.$$"
if ! (umask 077; : > "$PROBE") 2>/dev/null; then
  log "FATAL: $DATA_DIR is not writable by uid $(id -u); mount it read-write"
  exit 1
fi
rm -f "$PROBE"

# -s, not -f: a zero-byte gtfs.db is not a database, and starting on one only
# turns every request into a 500.
if [ ! -s "$DB_PATH" ]; then
  # A lock with no database behind it can only be left over from an ingest that
  # was killed; refresh-cron.sh would abort and the container would never boot.
  if [ -e "$LOCK_PATH" ]; then
    log "stale $LOCK_PATH with no database, clearing it"
    rm -f "$LOCK_PATH"
  fi
  log "no database at $DB_PATH, running initial ingest..."
  # Reused so the first build takes the same scratch-dir-then-atomic-swap path
  # as every later refresh: a crash here must not leave a half-written gtfs.db.
  /app/scripts/refresh-cron.sh
fi

# Reported, never created or reset here: an empty sync.db would silently drop
# every device's saved data, so only the app is allowed to bring it into being.
if [ -s "$SYNC_DB_PATH" ]; then
  log "device sync store present at $SYNC_DB_PATH ($(wc -c <"$SYNC_DB_PATH" | tr -d ' ') bytes)"
else
  log "no device sync store yet at $SYNC_DB_PATH, it is created on the first sync"
fi

exec node server.js
