# Architecture

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

Mobile-first, because it is used on the street, one-handed, with big tap targets and high contrast. From `lg` (1024 px) up it becomes a desktop app instead of a stretched phone: a persistent sidebar carries the brand, search and navigation, the top bar disappears, and the map pages go two-column with a sticky full-height map. [`DESKTOP.md`](../DESKTOP.md) is the contract for that layer and lists the shared tokens.

### Languages

Twenty-one dictionaries under `src/lib/i18n/`, all typed against the Italian one so a missing key is a compile error, not a blank label. Plurals go through `Intl.PluralRules` with real CLDR categories, so Polish gets its three forms and Arabic its dual. Arabic and Urdu flip the whole layout with `dir="rtl"` and logical CSS properties, and the pre-paint bootstrap resolves the browser's language the same way React does, so there is no flash of the wrong language and no hydration mismatch. Only Italian is in the main bundle; every other language is a chunk fetched on first use.
