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
    echo "deploy: $f is missing. See DEPLOY.md." >&2
    exit 1
  fi
done

set -a
# .env carries the operator's settings (SSH); .env.server carries the ones
# that travel, and on the image and the tag it is the one that wins.
# shellcheck disable=SC1091
. ./.env
# shellcheck disable=SC1091
. ./.env.server
set +a

: "${PROBUS_SSH:?PROBUS_SSH is not set in .env}"
: "${PROBUS_IMAGE:?PROBUS_IMAGE is not set in .env}"
: "${PROBUS_TAG:?PROBUS_TAG is not set in .env.server: run ./scripts/release.sh first}"
: "${PROBUS_URL:?PROBUS_URL is not set in .env}"
REMOTE_DIR="${PROBUS_REMOTE_DIR:-/opt/busfinder}"

# Two ways to face the internet: our own Caddy (tls profile), or a reverse
# proxy already on the host that reaches the app over a shared Docker network.
if [ -n "${PROBUS_PROXY_NETWORK:-}" ]; then
  COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.proxy.yml)
  MODE="proxy network ${PROBUS_PROXY_NETWORK}"
else
  COMPOSE=(docker compose --profile tls)
  MODE="caddy on ${PROBUS_DOMAIN:-?}"
fi

TARGET="${PROBUS_IMAGE}:${PROBUS_TAG}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=10)

say() { printf 'deploy: %s\n' "$*"; }
remote() { ssh "${SSH_OPTS[@]}" "$PROBUS_SSH" "$@"; }

# Caddy needs these and compose cannot demand them without breaking the
# app-only stack, so this is where a missing domain has to be caught.
if [ -n "${PROBUS_PROXY_NETWORK:-}" ]; then REQUIRED="PROBUS_IMAGE"; else REQUIRED="PROBUS_DOMAIN PROBUS_ACME_EMAIL PROBUS_IMAGE"; fi
for key in $REQUIRED; do
  value="$(grep -E "^${key}=" .env.server | head -1 | cut -d= -f2-)"
  if [ -z "$value" ] || case "$value" in *CHANGEME*) true ;; *) false ;; esac; then
    echo "deploy: ${key} is not filled in in .env.server (value: '${value}')." >&2
    exit 1
  fi
done

say "server  ${PROBUS_SSH}:${REMOTE_DIR}"
say "image   ${TARGET}"
say "front   ${MODE}"
say "smoke   ${PROBUS_URL}"
echo

if ! remote true; then
  echo "deploy: SSH to ${PROBUS_SSH} failed. It needs a key, not a password." >&2
  exit 1
fi

if [ -n "${PROBUS_PROXY_NETWORK:-}" ] && ! remote "docker network inspect '${PROBUS_PROXY_NETWORK}' >/dev/null 2>&1"; then
  echo "deploy: Docker network '${PROBUS_PROXY_NETWORK}' does not exist on ${PROBUS_SSH}." >&2
  exit 1
fi

# What is running now, so a failed rollout can be undone. Empty on first deploy.
PREVIOUS="$(remote "docker inspect -f '{{.Config.Image}}' busfinder 2>/dev/null || true" | tr -d '\r')"
if [ -n "$PREVIOUS" ]; then
  say "running now: ${PREVIOUS}"
else
  say "first deploy on this host"
fi

say "sending the configuration"
remote "mkdir -p '${REMOTE_DIR}'"
scp "${SSH_OPTS[@]}" -q docker-compose.yml docker-compose.proxy.yml Caddyfile "${PROBUS_SSH}:${REMOTE_DIR}/"
scp "${SSH_OPTS[@]}" -q .env.server "${PROBUS_SSH}:${REMOTE_DIR}/.env"
# The tag lives in the local .env; the server's copy must agree with it.
remote "cd '${REMOTE_DIR}' && (grep -q '^PROBUS_TAG=' .env \
  && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=${PROBUS_TAG}|' .env \
  || echo 'PROBUS_TAG=${PROBUS_TAG}' >> .env)"

bring_up() {
  remote "cd '${REMOTE_DIR}' && ${COMPOSE[*]} pull --quiet && ${COMPOSE[*]} up -d"
}

say "pulling and restarting"
bring_up

say "waiting for the container to become healthy"
healthy=""
for _ in $(seq 1 60); do
  state="$(remote "docker inspect -f '{{.State.Health.Status}}' busfinder 2>/dev/null || echo none" | tr -d '\r')"
  if [ "$state" = "healthy" ]; then healthy="yes"; break; fi
  if [ "$state" = "unhealthy" ]; then break; fi
  sleep 5
done

rollback() {
  if [ -z "$PREVIOUS" ]; then
    echo "deploy: no previous version to roll back to. The server stays as it is." >&2
    return
  fi
  echo "deploy: rolling back to ${PREVIOUS}" >&2
  old_tag="${PREVIOUS##*:}"
  remote "cd '${REMOTE_DIR}' && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=${old_tag}|' .env && ${COMPOSE[*]} up -d" || true
}

if [ -z "$healthy" ]; then
  echo "deploy: the container never became healthy." >&2
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
  echo "deploy: tsx is not available, cannot run the smoke test." >&2
  rollback
  exit 1
fi

say "end-to-end smoke test against ${PROBUS_URL}"
if "${SMOKE[@]}" scripts/smoke.ts "$PROBUS_URL"; then
  say "smoke test passed"
else
  echo "deploy: the smoke test failed against the public URL." >&2
  rollback
  exit 1
fi

echo
say "done: ${TARGET} is live at ${PROBUS_URL}"
