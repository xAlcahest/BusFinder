# Deploy

Two commands. `release.sh` builds and publishes the image, `deploy.sh` ships it
to the server and smoke-tests it. The server never compiles and never sees the
source: it pulls a ready-made image, the same one you tried here.

```
./scripts/release.sh     # builds, publishes, and pins PROBUS_TAG in .env.server
./scripts/deploy.sh      # updates the server, waits for healthy, smoke-tests, rolls back on failure
```

---

## The files

| file | what it is for |
|---|---|
| `docker-compose.yml` | the stack. Same file here and on the server; only `.env` differs |
| `docker-compose.build.yml` | overlay for building locally instead of pulling |
| `Caddyfile` | HTTPS with an automatic certificate. Only needed on the server |
| `.env` | this machine |
| `.env.server` | the server. `deploy.sh` copies it over as `.env` |
| `.env.example` | every variable, explained |

`.env` and `.env.server` never enter the image: `.dockerignore` excludes them.

---

## One-time setup

**1. The registry.** You need somewhere for the server to pull from. With
GitHub Container Registry a token with `write:packages` is enough:

```
echo "$TOKEN" | docker login ghcr.io -u YOUR_USER --password-stdin
```

Then put `PROBUS_IMAGE=ghcr.io/YOUR_USER/busfinder` in `.env.server`, which is
where `release.sh` reads the destination from.

A GHCR package starts out private: either make it public from the package
settings, or run `docker login ghcr.io` on the server too.

**2. The server's architecture.** `PROBUS_PLATFORM` in `.env` describes the
**server**, not this machine. An Ampere or Graviton VPS is `linux/arm64` and an
amd64 image will not start there. When in doubt:

```
ssh YOUR_SERVER uname -m     # x86_64 → linux/amd64 · aarch64 → linux/arm64
```

**3. DNS.** The domain's A record (and AAAA if you have IPv6) must already
point at the server, and ports 80 and 443 must be reachable, before the first
deploy: Caddy fetches the certificate at startup and Let's Encrypt allows five
attempts per week per domain.

**4. `.env.server`.** Fill in `PROBUS_IMAGE`, `PROBUS_DOMAIN`,
`PROBUS_ACME_EMAIL` and `PROBUS_CONTACT`. `deploy.sh` refuses to start if the
`CHANGEME` placeholders are still there.

**5. The server.** All it needs is Docker and the compose plugin. `deploy.sh`
creates `PROBUS_REMOTE_DIR` itself and copies the configuration and `.env` into
it. SSH access has to be key-based: the script is non-interactive and will not
prompt for a password.

---

## What happens on every deploy

`deploy.sh`, in order:

1. refuses to start if `.env.server` still contains a `CHANGEME`;
2. notes which image is running right now, so it can go back to it;
3. copies `docker-compose.yml`, `Caddyfile` and `.env.server` to the server —
   configuration only, never source;
4. pulls the new image and restarts;
5. waits up to five minutes for the container to become `healthy`;
6. runs `scripts/smoke.ts` against the public URL: eighteen checks across every
   route, including a full write-and-delete round trip through sync;
7. if the container never becomes healthy or the smoke test fails, it **puts
   the previous image back** and exits non-zero.

The first deploy has nothing to roll back to, and says so.

---

## The first boot is slow

On the first boot, or after emptying `data/`, the entrypoint ingests the GTFS
feed before it even starts listening: roughly 214 MB of `stop_times.txt`,
several minutes. That is why the healthcheck has a ten-minute `start-period`
and `deploy.sh` waits up to five. On a small VPS it can take longer: if the
first deploy fails on a timeout, the container is probably still ingesting.
Check `docker logs -f busfinder` before concluding it is broken.

The memory limit is `2g`. Below about `1.5g` the ingest risks being OOM-killed
halfway through.

---

## The data

Three databases in `${PROBUS_DATA}`, mounted as a bind mount and not as a
Docker volume, deliberately: that way `docker compose down -v` cannot delete
them.

| file | if you lose it |
|---|---|
| `gtfs.db` | rebuilds itself on restart, ~400 MB |
| `motion.db` | only rebuilds by watching traffic for weeks |
| `sync.db` | **unrecoverable.** No upstream, no backup. It holds the encrypted data of every synced device |

`sync.db` is the only one that deserves a real backup. It is tiny:

```
ssh YOUR_SERVER "cd /opt/busfinder && tar czf - data/sync.db" > sync-$(date +%F).tar.gz
```

---

## HTTPS is not a nicety

`crypto.subtle` only exists in a secure context. Over plain HTTP the browser
takes it away, and device sync disables itself with "Not available on this
connection". That is why Caddy sits in front of the app.

The `tls` profile starts Caddy; with no profile you get the app alone, which is
how this machine runs on the LAN.

---

## Locally

```
docker compose up -d                                              # uses the image already built
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build   # rebuilds
docker compose logs -f app
```

Here `PROBUS_BIND` is `0.0.0.0:3200` because LAN access is wanted. On the
server it is `127.0.0.1:3200`: from outside you go through Caddy, never
straight at the app.

---

## When something goes wrong

**The smoke test fails and the rollback kicks in.** The old image comes back on
its own. Read what the smoke test says: if it complains about `/api/vehicles`
or `/api/alerts`, it is probably Rome's feed not answering, not your deploy.

**The certificate never arrives.** `docker compose logs caddy`. Almost always
it is DNS not pointing here yet, or port 80 closed by the provider's firewall.

**Manual rollback**, if you need a specific version:

```
ssh YOUR_SERVER "cd /opt/busfinder && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=THE_VERSION|' .env && docker compose --profile tls up -d"
```

Tags are `YYYYMMDD-hhmm-<fingerprint>`: the fingerprint is of the source tree,
so two identical builds give the same hash and are recognisable at a glance.

---

## Before you release

`release.sh` fingerprints the working tree, not a commit, so uncommitted
changes ship too. Run the checks first, the same ones CI runs:

```
pnpm typecheck && pnpm test && pnpm build
```
