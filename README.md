# BusFinder

Live arrivals, timetables, line maps, service alerts and an A-to-B planner for Rome public transport, as a single Next.js app.

It started as a web clone of the Android app "Probus Rome" and has since grown its own shape: a live vehicle map on every stop page, a desktop layout, and optional encrypted sync between devices.

**This is an unofficial, community project.** It is not affiliated with, endorsed by, or supported by ATAC or Roma Servizi per la Mobilità.

There are no accounts and no login. Favourites, recents and settings live in the browser's `localStorage`. If you want the same favourites on your phone and your laptop you can turn on device sync, which uploads an encrypted blob the server has no way to read (see [Device sync](#device-sync)). There are no ads and no analytics.

## Data source and attribution

Everything comes from the open transit feeds published by **Roma Servizi per la Mobilità** at `romamobilita.it`:

| Feed | What it gives us | Refreshed |
|---|---|---|
| `rome_static_gtfs.zip` | stops, routes, trips, timetables, shapes | most mornings, around 05:30 |
| `rome_rtgtfs_trip_updates_feed.pb` | arrival predictions and cancellations | ~60 s |
| `rome_rtgtfs_vehicle_positions_feed.pb` | vehicle positions | ~60 s |
| `rome_rtgtfs_service_alerts_feed.pb` | service alerts | irregular |

Attribution to Roma Servizi per la Mobilità is a condition of the licence. It appears in the site footer and on `/info`, and both must stay. This app never calls ATAC's or Probus's own backend.

One other third party is involved, and only for the journey planner: free-text place lookup goes to OpenStreetMap Nominatim. Their usage policy asks for an identifying User-Agent, so set `PROBUS_CONTACT` to an email or a repository URL before running this anywhere public. Set `PROBUS_GEOCODING=off` to disable the lookup entirely, in which case the planner still accepts stops and coordinates and only loses free-text addresses.

## Quick start

Node 22+ and pnpm. Dependencies are pinned in `pnpm-lock.yaml`.

```bash
pnpm install
pnpm ingest   # downloads the static feed and builds data/gtfs.db
pnpm dev      # http://localhost:3000
```

The ingest downloads a 42 MB zip and turns it into a ~390 MB SQLite database (`stop_times.txt` alone is 4.5 M rows and 214 MB). It takes about 20 s. If you already have the zip:

```bash
pnpm ingest --from-file=/path/to/rome_static_gtfs.zip --db=data/gtfs.db
```

`pnpm ingest --help` lists every flag. Pass them directly rather than after `--`: pnpm 10 forwards a literal `--` to the script and the ingest rejects it as an unknown argument.

## Running with Docker

```bash
docker compose up --build
```

That builds the image, starts one container on port 3000 and mounts a named volume at `/app/data`. The image is ~300 MB and never ships any of the databases. On first boot, with no `gtfs.db` on the volume, the entrypoint runs the ingest before the server starts listening, so the first boot takes a couple of minutes and later ones take about a second.

To reuse a database you already built on the host, bind-mount its directory instead:

```bash
docker build -t probus-web .
docker run -d --name probus -p 3000:3000 -v "$PWD/data:/app/data" probus-web
curl -s 'localhost:3000/api/stops/nearby?lat=41.9008&lon=12.5013&radius=400'
```

The container declares a `HEALTHCHECK` on `/api/alerts` with a 10 minute `start-period`, so the first-boot ingest is not counted as a failure. It runs as the unprivileged `node` user, and the entrypoint refuses to start if `/app/data` is not writable, because a read-only mount would otherwise boot fine and then fail every sync write with a 500.

### How the image is built, and why

The runtime image ships Next's `standalone` output plus five packages copied by hand, not the whole `node_modules` (~480 MB on its own).

Four things in here are deliberate and easy to break:

- `next.config.ts` must not exclude `data/**` from output file tracing. Next matches `outputFileTracingExcludes` with picomatch in `contains` mode, so `data/**` also matches `node_modules/next/dist/lib/metadata/**`, because the substring `data/` appears in `metadata/`. That silently drops three files from the traced `next` package and `.next/standalone/server.js` then dies at startup with `Cannot find module '../../../lib/metadata/get-metadata-route'`. The config excludes `data/*.db`, `data/*.db.tmp` and `data/tmp/**` instead, which keeps every database out of the bundle without eating `metadata/`.
- The build stage installs with `node-linker=hoisted`. The runtime stage copies individual packages (`tsx`, `esbuild`, `yauzl`, …) out of the builder, and under pnpm's default symlinked store those copies would be symlinks dangling into a `.pnpm` directory the runtime image does not ship.
- `node_modules/.bin/tsx` is recreated with `ln -s`, not copied. Docker dereferences a symlink named directly in a `COPY`, which turns the shim into a loose file whose sibling imports no longer resolve.
- `scripts/sync-schema.sql` has to be in the image. `src/lib/syncdb.ts` reads it at runtime to create `sync.db` on first use, and Next's server trace never sees it, so nothing else would notice it going missing.

The Dockerfile guards all four: it boots `standalone/server.js` and waits for a real HTTP response in the build stage, runs `tsx scripts/ingest.ts --help` in the runtime stage to walk the ingest's whole import graph, and asserts the sync schema is present. Any of them failing fails the build instead of the container.

## Deploying to Fly.io

```bash
fly launch --no-deploy   # review fly.toml, create the app
fly volumes create probus_data --region fra --size 3
fly deploy
```

`fly.toml` targets Frankfurt (`fra`), the closest Fly region to Rome with the full volume tier, and sizes the VM at 1 GB of memory: the ingest streams and parses `stop_times.txt` and builds several indexes before writing SQLite, which peaks well above Fly's default 256 MB.

The volume is not optional and it is not a cache. It holds `sync.db`, the one piece of state in this system that cannot be rebuilt from anything, and `motion.db`, which can be rebuilt only by relearning traffic for weeks. Destroy the volume and every device that had turned on sync loses what was stored under its code. Only `gtfs.db` comes back on its own.

## The daily refresh

`scripts/refresh-cron.sh` re-runs the ingest into a scratch directory under the data volume and moves the resulting `gtfs.db` into place with `mv`, which is atomic on the same filesystem. Schedule it after the feed refresh, around 06:30 Europe/Rome:

```
30 6 * * * /app/scripts/refresh-cron.sh >> /app/data/refresh.log 2>&1
```

Verified behaviour:

- A failed ingest exits 1 and leaves the previous `gtfs.db` byte-for-byte untouched, with the scratch directory cleaned up.
- The swap is atomic. Polling `stat` every 50 ms across a live refresh only ever observes the old size or the new one, never a partial file and never a missing one.
- `refresh.lock` is created with `set -C`, so of three refreshes started at the same moment exactly one proceeds and the other two abort with exit 1.
- `src/lib/db.ts` notices the new inode and reopens the database on the next request, so a refresh does not need a server restart. A client polling `/api/stops/nearby` five times a second through a live refresh saw 86 consecutive `200`s and correct data on both sides of the swap.
- `sync.db` comes out of the refresh with the same inode it went in with. The ingest only ever writes inside the scratch directory, and only its `gtfs.db` is moved out. The script checks this at the end and exits non-zero if the sync store ever went missing across a refresh.

**Caveat:** the lock is a plain file removed by an `EXIT` trap. If a refresh is `SIGKILL`ed (OOM, `docker kill`) the lock survives, and every later cron refresh aborts until someone deletes `/app/data/refresh.lock`. Watch for repeated `another refresh appears to be running` lines in `refresh.log`. The entrypoint handles the one case that would otherwise be unrecoverable: a lock left behind with no database at all used to make the container fail to boot forever, so it now clears that lock and re-ingests.

## Tests

Unit tests run on Node's own test runner through `tsx`, so there is no test framework in the dependency tree and nothing extra to keep up to date.

```bash
pnpm test        # 64 tests, ~0.3 s, no server and no database needed
pnpm typecheck
```

They cover the parts that are pure logic and expensive to get wrong: every dictionary having the same shape as the Italian one and every parameterised string actually rendering in all 21 languages, CLDR plural categories (Polish few/many, Arabic dual, Romanian's `de` past 20), language-tag resolution including keys inherited from `Object.prototype`, the GTFS service day that rolls over at 04:00, and the polyline codec and snapping tolerance that decide whether a bus is drawn on the road or over a building.

`.github/workflows/ci.yml` runs those three checks on every push and pull request: typecheck, tests, then a production build with no `data/*.db` present, which is also what proves nothing queries the database at build time. Dependency updates arrive weekly, grouped by ecosystem, from `.github/dependabot.yml`.

## Smoke test

`scripts/smoke.ts` hits every API route against a running server and checks real values, not just status codes: nearby stops sorted by distance and inside the requested radius, `minutesAway` consistent with `arrivalTime` and `generatedAt`, timetable labels matching their `departureSec`, `routeId` filters that do not leak other lines, vehicles inside the Rome bounding box with fixes from the last hour, journey legs that chain end to end and add up to their own summary, and every documented error path returning an `ApiError` body with the right 4xx status.

Two endpoints are checked against each other rather than in isolation. Every vehicle that `/api/stops/[stopId]/vehicles` reports as approaching must be a trip `/api/arrivals/[stopId]` also knows is coming, on the same line and at the same predicted time, because both read the same realtime snapshot.

```bash
pnpm smoke                                  # against http://localhost:3000
pnpm smoke http://localhost:3000            # explicit base URL
PROBUS_URL=https://busfinder.example.com pnpm smoke
```

It exits non-zero on the first failing assertion set and prints what it expected. It also ships inside the image:

```bash
docker exec busfinder node_modules/.bin/tsx scripts/smoke.ts http://127.0.0.1:3000
```

The sync checks write as well as read: they do a full round trip on a random `syncId` and delete it again, so a run leaves nothing behind and can be repeated. The sync routes are rate limited at 60 requests a minute per client, of which 20 may be GETs, and one run spends roughly 20 and 5 of those, so a third run inside the same minute will start seeing 429s.

## Architecture

Three SQLite databases live side by side in `data/`, and the difference between them is the single most important thing to understand about deploying this. One is disposable, one is irreplaceable, one is expensive to lose.

`data/gtfs.db` is the static schedule: stops, routes, trips, stop times, shapes, service calendar. It is built by `scripts/ingest.ts`, opened read-only, and **thrown away and rebuilt every morning**. Nothing may ever be stored in it that you would miss.

`data/sync.db` is the device sync store. It is created by `src/lib/syncdb.ts` on first use, opened for writing in WAL mode, and **must survive the daily rebuild**. It is small and it is the only state on the server that has no upstream to be recovered from at all. Delete it and every device that had turned on sync loses what was stored under its code, permanently.

`data/motion.db` holds vehicle speeds learned from the realtime feed, per line and per 250 m grid cell (`scripts/motion-schema.sql`, served by `/api/motion`). It is written continuously while the server runs and it **must survive the daily rebuild** too. Losing it is not fatal the way losing `sync.db` is: the numbers rebuild themselves by observing traffic again. But that takes weeks of running, and until then the map animates vehicles on defaults instead of on what this city actually does.

All three sit on the same volume, so backing up the volume backs up the two that matter. The WAL sidecars (`sync.db-wal`, `sync.db-shm`, `motion.db-wal`, `motion.db-shm`) belong to their databases and must be copied with them. `scripts/refresh-cron.sh` checks after every refresh that `sync.db` and `motion.db` are still there and exits non-zero if either went missing.

Around those:

- An in-process realtime poller (`src/lib/realtime.ts`) refreshes the three GTFS-RT feeds every 30 s and keeps the decoded result in memory. One fetch serves every user. The browser never talks to the origin feeds directly, since they send no CORS headers.
- The journey planner (`src/lib/journey.ts`) searches connectivity in memory against a cached route/stop network and only touches `stop_times` for the few route and stop pairs that survive that search, because better-sqlite3 is synchronous on the only Node thread and a slow query stalls every other request.
- `localStorage` (`src/lib/storage.ts`) holds favourites, recent stops and settings. It stays the source of truth even with sync on.

### Device sync

There are no accounts. One device generates a 20 symbol code, you type it on the other, and both derive two things from it with HKDF-SHA256: an opaque 64 hex character `syncId`, and an AES-256-GCM key that never leaves the browser. The server receives the id and a blob of ciphertext, stores them in `sync.db`, and hands them back on request. It cannot decrypt them and there is nothing on the server to log in to.

Consequences worth being clear about:

- The code is the only secret. Whoever has it can read the favourites. Losing it means losing the data, because nobody can recover it, including us.
- Writes use optimistic concurrency: a `PUT` carries the version it is based on, and a stale one gets a 409 rather than silently overwriting the other device. The merge happens client-side and is commutative and idempotent, so two devices that have never seen each other converge.
- The code is 100 bits, so guessing a `syncId` is hopeless on paper. The rate limiter in `src/app/api/_lib/ratelimit.ts` is what keeps it hopeless in practice, and it also caps how hard one client can hammer `sync.db`.
- Blobs untouched for 180 days are purged. An abandoned code costs nothing.
- `crypto.subtle` only exists in a secure context, so sync needs HTTPS or localhost. Over a plain LAN address it degrades to an explanation instead of a broken button.

### The stop map, and polling

Every stop page carries a live map with two modes: `approaching` shows only vehicles with a live prediction for that stop, `all` adds every vehicle currently on a line that serves it. Tapping one follows it. The map polls every few seconds, which is fast enough to be worth handling carefully:

- Responses carry a strong `ETag` over the exact bytes, so a client that already has the current body gets a 304 and skips both the download and the re-render.
- The server renders each stop, mode and 15 s clock tick once and caches the string, so many tabs on one stop cost one render.
- Two sliding windows guard the endpoint, 120 requests a minute and 20 in any 5 s, so a client that has lost its interval cannot take the process down.

### Layout

The app is mobile-first and stays that way, since the plan is to ship it wrapped as an Android app. From `lg` (1024 px) up it becomes a desktop app instead of a stretched phone: a persistent sidebar carries the brand, search and navigation, the top bar disappears, and the map pages go two-column with a sticky full-height map. `DESKTOP.md` is the contract for that layer and lists the shared tokens.

## Known limits

- The journey planner is schedule-only. It never reads the realtime feed, so a plan does not know that your bus is nine minutes late. Check the stop page for that.
- There is no street network. Walking legs are straight lines with a detour factor, which makes their distances a lower bound, and the UI says so.
- Free-text place search depends on Nominatim, a free service on donated hardware. It is cached and throttled, it degrades to stop-name matching when unreachable, and it can be turned off entirely.
- Night coverage is only as good as the static feed. A night line that is not in `rome_static_gtfs.zip` does not exist here either.
- No fares, no ticket purchase, no ticket office locations.
- Realtime coverage is not uniform. Plenty of lines have no AVM data at all, and those passages fall back to the timetable and are labelled as scheduled rather than live.
