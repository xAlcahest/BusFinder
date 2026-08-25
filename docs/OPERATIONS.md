# Operations

How the running system stays healthy: the nightly data refresh, the image, and the smoke test that gates every deploy. `DEPLOY.md` has the release pipeline itself.

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

## How the image is built, and why

The runtime image ships Next's `standalone` output plus five packages copied by hand, not the whole `node_modules` (~480 MB on its own).

Four things in here are deliberate and easy to break:

- `next.config.ts` must not exclude `data/**` from output file tracing. Next matches `outputFileTracingExcludes` with picomatch in `contains` mode, so `data/**` also matches `node_modules/next/dist/lib/metadata/**`, because the substring `data/` appears in `metadata/`. That silently drops three files from the traced `next` package and `.next/standalone/server.js` then dies at startup with `Cannot find module '../../../lib/metadata/get-metadata-route'`. The config excludes `data/*.db`, `data/*.db.tmp` and `data/tmp/**` instead, which keeps every database out of the bundle without eating `metadata/`.
- The build stage installs with `node-linker=hoisted`. The runtime stage copies individual packages (`tsx`, `esbuild`, `yauzl`, …) out of the builder, and under pnpm's default symlinked store those copies would be symlinks dangling into a `.pnpm` directory the runtime image does not ship.
- `node_modules/.bin/tsx` is recreated with `ln -s`, not copied. Docker dereferences a symlink named directly in a `COPY`, which turns the shim into a loose file whose sibling imports no longer resolve.
- `scripts/sync-schema.sql` has to be in the image. `src/lib/syncdb.ts` reads it at runtime to create `sync.db` on first use, and Next's server trace never sees it, so nothing else would notice it going missing.

The Dockerfile guards all four: it boots `standalone/server.js` and waits for a real HTTP response in the build stage, runs `tsx scripts/ingest.ts --help` in the runtime stage to walk the ingest's whole import graph, and asserts the sync schema is present. Any of them failing fails the build instead of the container.

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
