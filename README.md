# BusFinder

[![CI](https://github.com/xAlcahest/BusFinder/actions/workflows/ci.yml/badge.svg)](https://github.com/xAlcahest/BusFinder/actions/workflows/ci.yml) [![Licence: AGPL-3.0](https://img.shields.io/badge/licence-AGPL--3.0-blue.svg)](LICENSE)

**When is my bus coming?** That is the whole question, and BusFinder exists to answer it faster and more honestly than anything else on your phone.

Live arrivals, a map where the buses actually move, timetables, line pages, service alerts and an A-to-B planner for Rome's buses, trams and metro, in one self-hosted web app. No accounts, no ads, no analytics, no permissions it does not need. Twenty-one languages. Runs on a small VPS, or on a Raspberry Pi with 4 GB on your shelf.

It is an independent, community project, not affiliated with ATAC or Roma Servizi per la Mobilità. Rome is the first city; other Italian cities that publish GTFS and GTFS-RT feeds are the plan.

## What it does

**Arrivals you can trust.** Every stop page shows the next departures with a live or scheduled label on each one, the delay against the timetable, and the age of the data. When the realtime feed has nothing for a trip you get the scheduled time, clearly marked as such, never a live-looking number that is actually a guess.

**A map where the buses move.** Every stop and line page carries a live map. Vehicle positions are snapped onto the line's real shape, animated between feed updates with dead reckoning, and paced by speeds the server has learned for that line in that part of the city. A bus that has left its route shows up as diverted instead of being glued to a street it is not on. Tap a vehicle to follow it.

**A journey planner that runs on your server, not in someone's cloud.** RAPTOR search over the full network, walking transfers, departure now or at a chosen time, and legs drawn along the real route geometry. Free-text addresses go through OpenStreetMap Nominatim and can be turned off entirely, in which case stops and coordinates still work.

**Timetables, lines and alerts.** Full-day timetables per stop and line, respecting Rome's 04:00 service-day boundary. Line pages with both directions, every stop, and the vehicles on it right now. Service alerts from the official feed, matched to the stops and lines they affect and shown on the pages where they matter.

**Favourites that follow you, without an account.** Favourites, recents and settings live in the browser. Turn on device sync and they are encrypted on the device with a key derived from a code you type on your other phone; the server stores ciphertext it cannot read and holds no identity at all.

**Twenty-one languages, done properly.** Italian, English, Arabic, Bengali, Chinese, Dutch, Filipino, French, German, Hindi, Indonesian, Japanese, Korean, Polish, Portuguese, Romanian, Russian, Spanish, Turkish, Ukrainian and Urdu, with CLDR plural rules and a layout that mirrors correctly in right-to-left scripts. Each language is a chunk loaded on demand, so the other twenty cost nothing to a user who never picks them.

**A real app on every screen.** Mobile-first, one-handed, installable as a PWA. From 1024 px it becomes a desktop app with a persistent sidebar and two-column map pages instead of a stretched phone.

## Data source and attribution

Everything comes from the open transit feeds published by **Roma Servizi per la Mobilità** at `romamobilita.it`:

| Feed | What it gives us | Refreshed |
|---|---|---|
| `rome_static_gtfs.zip` | stops, routes, trips, timetables, shapes | most mornings, around 05:30 |
| `rome_rtgtfs_trip_updates_feed.pb` | arrival predictions and cancellations | ~60 s |
| `rome_rtgtfs_vehicle_positions_feed.pb` | vehicle positions | ~60 s |
| `rome_rtgtfs_service_alerts_feed.pb` | service alerts | irregular |

Attribution to Roma Servizi per la Mobilità is a condition of the licence. It appears in the site footer and on `/info`, and both must stay. The app talks to those feeds and to nothing else that is not listed here.

One other third party is involved, only for the journey planner: free-text place lookup goes to OpenStreetMap Nominatim. Their usage policy asks for an identifying User-Agent, so set `PROBUS_CONTACT` to an email or a repository URL before running this anywhere public. `PROBUS_GEOCODING=off` disables the lookup entirely.

## Quick start

Node 22 and pnpm 10 (`corepack enable` picks up the pinned version).

```bash
pnpm install
pnpm ingest   # downloads the static feed and builds data/gtfs.db, ~20 s
pnpm dev      # http://localhost:3000
```

The ingest downloads a 42 MB zip and turns it into a ~390 MB SQLite database (`stop_times.txt` alone is 4.5 M rows and 214 MB). If you already have the zip:

```bash
pnpm ingest --from-file=/path/to/rome_static_gtfs.zip --db=data/gtfs.db
```

`pnpm ingest --help` lists every flag. Pass them directly rather than after `--`: pnpm 10 forwards a literal `--` to the script and the ingest rejects it as an unknown argument.

## Running with Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
curl -s 'localhost:3200/api/stops/nearby?lat=41.9008&lon=12.5013&radius=400'
```

That builds the image, starts one container named `busfinder` and bind-mounts `./data` at `/app/data`. The image is ~300 MB and never ships any of the databases. On first boot, with no `gtfs.db` in `data/`, the entrypoint runs the ingest before the server starts listening, so the first boot takes a couple of minutes and later ones about a second. `.env.example` documents every variable.

The container declares a `HEALTHCHECK` on `/api/alerts` with a 10 minute `start-period`, so the first-boot ingest is not counted as a failure. It runs as the unprivileged `node` user, and the entrypoint refuses to start if `/app/data` is not writable, because a read-only mount would otherwise boot fine and then fail every sync write with a 500.

### Deploying

`DEPLOY.md` covers the server side in two scripts. `release.sh` builds and pushes the image for the server's architecture and pins the tag. `deploy.sh` ships the configuration over SSH, pulls, waits for the container to become healthy, runs the full smoke test against the public URL, and rolls back to the previous image if any of that fails. Caddy in front provides HTTPS with automatic certificates. A `fly.toml` is included for Fly.io.

HTTPS is not optional in production: `crypto.subtle` only exists in a secure context, and device sync switches itself off with an explanation over plain HTTP.

### How the image is built, and why

The runtime image ships Next's `standalone` output plus five packages copied by hand, not the whole `node_modules` (~480 MB on its own).

Four things in here are deliberate and easy to break:

- `next.config.ts` must not exclude `data/**` from output file tracing. Next matches `outputFileTracingExcludes` with picomatch in `contains` mode, so `data/**` also matches `node_modules/next/dist/lib/metadata/**`, because the substring `data/` appears in `metadata/`. That silently drops three files from the traced `next` package and `.next/standalone/server.js` then dies at startup with `Cannot find module '../../../lib/metadata/get-metadata-route'`. The config excludes `data/*.db`, `data/*.db.tmp` and `data/tmp/**` instead, which keeps every database out of the bundle without eating `metadata/`.
- The build stage installs with `node-linker=hoisted`. The runtime stage copies individual packages (`tsx`, `esbuild`, `yauzl`, …) out of the builder, and under pnpm's default symlinked store those copies would be symlinks dangling into a `.pnpm` directory the runtime image does not ship.
- `node_modules/.bin/tsx` is recreated with `ln -s`, not copied. Docker dereferences a symlink named directly in a `COPY`, which turns the shim into a loose file whose sibling imports no longer resolve.
- `scripts/sync-schema.sql` has to be in the image. `src/lib/syncdb.ts` reads it at runtime to create `sync.db` on first use, and Next's server trace never sees it, so nothing else would notice it going missing.

The Dockerfile guards all four: it boots `standalone/server.js` and waits for a real HTTP response in the build stage, runs `tsx scripts/ingest.ts --help` in the runtime stage to walk the ingest's whole import graph, and asserts the sync schema is present. Any of them failing fails the build instead of the container.

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

## Tests

Unit tests run on Node's own test runner through `tsx`, so there is no test framework in the dependency tree and nothing extra to keep up to date.

```bash
pnpm test        # 64 tests, ~0.3 s, no server and no database needed
pnpm typecheck
```

They cover the parts that are pure logic and expensive to get wrong: every dictionary having the same shape as the Italian one and every parameterised string actually rendering in all 21 languages, CLDR plural categories (Polish few/many, Arabic dual, Romanian's `de` past 20), language-tag resolution including keys inherited from `Object.prototype`, the GTFS service day that rolls over at 04:00, and the polyline codec and snapping tolerance that decide whether a bus is drawn on the road or over a building.

`.github/workflows/ci.yml` runs those three checks on every push and pull request: typecheck, tests, then a production build with no `data/*.db` present, which is also what proves nothing queries the database at build time. A second workflow builds the Docker image whenever something that ships in it changes and checks that the native SQLite binding loads in the runtime image. CodeQL scans every pull request. Dependency updates arrive weekly, grouped by ecosystem, from `.github/dependabot.yml`.

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

One Next.js process, three SQLite files, no other services. The difference between the three files is the single most important thing to understand about running this. One is disposable, one is irreplaceable, one is expensive to lose.

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

Between polls, `src/components/map/motion.ts` projects each vehicle onto its line's shape and moves it forward at the speed learned for that line in that grid cell, so the marker keeps moving along the street rather than jumping every 30 s. A vehicle more than a few dozen metres from any shape is drawn where the GPS says it is and marked as diverted, because gluing it to the wrong street is the one surprise a rider should never get.

### Layout

Mobile-first, because it is used on the street, one-handed, with big tap targets and high contrast. From `lg` (1024 px) up it becomes a desktop app instead of a stretched phone: a persistent sidebar carries the brand, search and navigation, the top bar disappears, and the map pages go two-column with a sticky full-height map. `DESKTOP.md` is the contract for that layer and lists the shared tokens.

### Languages

Twenty-one dictionaries under `src/lib/i18n/`, all typed against the Italian one so a missing key is a compile error, not a blank label. Plurals go through `Intl.PluralRules` with real CLDR categories, so Polish gets its three forms and Arabic its dual. Arabic and Urdu flip the whole layout with `dir="rtl"` and logical CSS properties, and the pre-paint bootstrap resolves the browser's language the same way React does, so there is no flash of the wrong language and no hydration mismatch. Only Italian is in the main bundle; every other language is a chunk fetched on first use.

## Known limits

- The journey planner is schedule-only. It never reads the realtime feed, so a plan does not know that your bus is nine minutes late. Check the stop page for that.
- There is no street network. Walking legs are straight lines with a detour factor, which makes their distances a lower bound, and the UI says so.
- Free-text place search depends on Nominatim, a free service on donated hardware. It is cached and throttled, it degrades to stop-name matching when unreachable, and it can be turned off entirely.
- Night coverage is only as good as the static feed. A night line that is not in `rome_static_gtfs.zip` does not exist here either.
- No fares, no ticket purchase, no ticket office locations.
- Realtime coverage is not uniform. Plenty of lines have no AVM data at all, and those passages fall back to the timetable and are labelled as scheduled rather than live.

## Contributing

Issues and pull requests are welcome. `CONTRIBUTING.md` has the setup, the checks that run in CI, and the handful of names that must never change because users' data depends on them. Security problems go through private vulnerability reporting, see `SECURITY.md`.

## Licence

GNU AGPL-3.0, see `LICENSE`. You can run it, change it, redistribute it and build on it, commercially or not; if you distribute it or offer it to others over a network, the source of your version has to be available under the same licence. Anything else needs a separate licence from the author.

"BusFinder" is the name of this project, not part of the licence. Forks are welcome to the code; please give yours its own name.

The transit data is published by Roma Servizi per la Mobilità under its own terms, and the attribution in the footer and on `/info` is a condition of using it.
