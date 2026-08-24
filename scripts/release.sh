#!/usr/bin/env bash
# Builds the image for the server's architecture and pushes it to the registry.
#
#   ./scripts/release.sh
#
# Prints the version it published and pins PROBUS_TAG in .env to it, so the
# following deploy.sh ships exactly the build that was just verified rather
# than whatever :latest happens to be by then.
#
# Requires: docker login to the registry, already done once.

set -euo pipefail

cd "$(dirname "$0")/.."

for f in .env .env.server; do
  if [ ! -f "$f" ]; then
    echo "release: $f is missing. See DEPLOY.md." >&2
    exit 1
  fi
done

set -a
# .env.server after .env: the registry reference belongs to the server's
# configuration, not to the local one, and has to win.
# shellcheck disable=SC1091
. ./.env
# shellcheck disable=SC1091
. ./.env.server
set +a

: "${PROBUS_IMAGE:?PROBUS_IMAGE is not set in .env}"
PLATFORM="${PROBUS_PLATFORM:-linux/amd64}"

case "$PROBUS_IMAGE" in
  *CHANGEME*)
    echo "release: PROBUS_IMAGE in .env.server is still the placeholder." >&2
    exit 1
    ;;
  */*) ;;
  *)
    # A bare name would land on Docker Hub under the wrong user, after the
    # whole build has already been spent.
    echo "release: PROBUS_IMAGE ('$PROBUS_IMAGE') is not a registry reference." >&2
    echo "         Expected something like ghcr.io/user/busfinder." >&2
    exit 1
    ;;
esac

# No git here, so the version is the source tree's own fingerprint plus a
# timestamp: two identical trees give the same hash, and the date keeps the
# tags readable and ordered.
tree_hash() {
  find src scripts public Dockerfile docker-entrypoint.sh package.json pnpm-lock.yaml \
       -type f -not -name '*.log' -print0 2>/dev/null \
    | sort -z \
    | xargs -0 sha256sum \
    | sha256sum \
    | cut -c1-12
}

STAMP="$(date -u +%Y%m%d-%H%M)"
HASH="$(tree_hash)"
VERSION="${STAMP}-${HASH}"

echo "release: image      ${PROBUS_IMAGE}"
echo "release: version    ${VERSION}"
echo "release: platform   ${PLATFORM}"
echo

# --provenance=false keeps the pushed artifact a plain image: the attestation
# manifest confuses older dockerd on the server side.
docker buildx build \
  --platform "$PLATFORM" \
  --provenance=false \
  --tag "${PROBUS_IMAGE}:${VERSION}" \
  --tag "${PROBUS_IMAGE}:latest" \
  --push \
  .

# Pin the deploy to this exact build.
if grep -q '^PROBUS_TAG=' .env.server; then
  tmp="$(mktemp)"
  sed "s|^PROBUS_TAG=.*|PROBUS_TAG=${VERSION}|" .env.server > "$tmp" && mv "$tmp" .env.server
else
  printf 'PROBUS_TAG=%s\n' "$VERSION" >> .env.server
fi

echo
echo "release: published ${PROBUS_IMAGE}:${VERSION}"
echo "release: PROBUS_TAG updated in .env.server"
echo "release: next  ./scripts/deploy.sh"
