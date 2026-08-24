#!/usr/bin/env bash
# Ships the released image to the server and proves it works before walking away.
#
#   ./scripts/deploy.sh
#
# Sends configuration only, never source: compose.yaml, Caddyfile and
# .env.server. Then pulls the image, restarts, waits for the container to be
# healthy, and runs the full smoke test against the public URL. If any of that
# fails it puts the previous image back and exits non-zero.
#
# Requires: key-based SSH to PROBUS_SSH, and ./scripts/release.sh already run.

set -euo pipefail

cd "$(dirname "$0")/.."

for f in .env .env.server; do
  if [ ! -f "$f" ]; then
    echo "deploy: $f mancante. Vedi DEPLOY.md." >&2
    exit 1
  fi
done

set -a
# .env porta le impostazioni dell'operatore (SSH); .env.server quelle che
# viaggiano, e sull'immagine e sul tag deve vincere lui.
# shellcheck disable=SC1091
. ./.env
# shellcheck disable=SC1091
. ./.env.server
set +a

: "${PROBUS_SSH:?PROBUS_SSH non impostata in .env}"
: "${PROBUS_IMAGE:?PROBUS_IMAGE non impostata in .env}"
: "${PROBUS_TAG:?PROBUS_TAG non impostata in .env.server: lancia prima ./scripts/release.sh}"
: "${PROBUS_URL:?PROBUS_URL non impostata in .env}"
REMOTE_DIR="${PROBUS_REMOTE_DIR:-/opt/busfinder}"

TARGET="${PROBUS_IMAGE}:${PROBUS_TAG}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=10)

say() { printf 'deploy: %s\n' "$*"; }
remote() { ssh "${SSH_OPTS[@]}" "$PROBUS_SSH" "$@"; }

# Caddy needs these and compose cannot demand them without breaking the
# app-only stack, so this is where a missing domain has to be caught.
for key in PROBUS_DOMAIN PROBUS_ACME_EMAIL PROBUS_IMAGE; do
  value="$(grep -E "^${key}=" .env.server | head -1 | cut -d= -f2-)"
  if [ -z "$value" ] || case "$value" in *CHANGEME*) true ;; *) false ;; esac; then
    echo "deploy: ${key} non compilata in .env.server (valore: '${value}')." >&2
    exit 1
  fi
done

say "server    ${PROBUS_SSH}:${REMOTE_DIR}"
say "immagine  ${TARGET}"
say "collaudo  ${PROBUS_URL}"
echo

if ! remote true; then
  echo "deploy: SSH verso ${PROBUS_SSH} non riuscito. Serve una chiave, non una password." >&2
  exit 1
fi

# What is running now, so a failed rollout can be undone. Empty on first deploy.
PREVIOUS="$(remote "docker inspect -f '{{.Config.Image}}' busfinder 2>/dev/null || true" | tr -d '\r')"
if [ -n "$PREVIOUS" ]; then
  say "in esecuzione ora: ${PREVIOUS}"
else
  say "primo deploy su questo host"
fi

say "invio la configurazione"
remote "mkdir -p '${REMOTE_DIR}'"
scp "${SSH_OPTS[@]}" -q docker-compose.yml Caddyfile "${PROBUS_SSH}:${REMOTE_DIR}/"
scp "${SSH_OPTS[@]}" -q .env.server "${PROBUS_SSH}:${REMOTE_DIR}/.env"
# The tag lives in the local .env; the server's copy must agree with it.
remote "cd '${REMOTE_DIR}' && (grep -q '^PROBUS_TAG=' .env \
  && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=${PROBUS_TAG}|' .env \
  || echo 'PROBUS_TAG=${PROBUS_TAG}' >> .env)"

bring_up() {
  remote "cd '${REMOTE_DIR}' && docker compose --profile tls pull --quiet && docker compose --profile tls up -d"
}

say "scarico e riavvio"
bring_up

say "attendo che il container sia healthy"
healthy=""
for _ in $(seq 1 60); do
  state="$(remote "docker inspect -f '{{.State.Health.Status}}' busfinder 2>/dev/null || echo none" | tr -d '\r')"
  if [ "$state" = "healthy" ]; then healthy="yes"; break; fi
  if [ "$state" = "unhealthy" ]; then break; fi
  sleep 5
done

rollback() {
  if [ -z "$PREVIOUS" ]; then
    echo "deploy: nessuna versione precedente da ripristinare. Il server resta com'è." >&2
    return
  fi
  echo "deploy: ripristino ${PREVIOUS}" >&2
  old_tag="${PREVIOUS##*:}"
  remote "cd '${REMOTE_DIR}' && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=${old_tag}|' .env && docker compose --profile tls up -d" || true
}

if [ -z "$healthy" ]; then
  echo "deploy: il container non è diventato healthy." >&2
  remote "docker logs --tail 40 busfinder" >&2 || true
  rollback
  exit 1
fi
say "container healthy"

# tsx ships as a dependency; fall back to npx only if the local bin is missing.
if [ -x node_modules/.bin/tsx ]; then
  SMOKE=(node_modules/.bin/tsx)
elif command -v npx >/dev/null 2>&1; then
  SMOKE=(npx --no-install tsx)
else
  echo "deploy: tsx non disponibile, impossibile eseguire il collaudo." >&2
  rollback
  exit 1
fi

say "collaudo end-to-end su ${PROBUS_URL}"
if "${SMOKE[@]}" scripts/smoke.ts "$PROBUS_URL"; then
  say "collaudo superato"
else
  echo "deploy: il collaudo è fallito sull'URL pubblico." >&2
  rollback
  exit 1
fi

echo
say "fatto: ${TARGET} è in produzione su ${PROBUS_URL}"
