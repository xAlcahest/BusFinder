<p align="center">
  <img src="src/app/icon.svg" width="96" height="96" alt="BusFinder">
</p>

<h1 align="center">BusFinder</h1>

<p align="center">
  Live arrivals, moving buses and a journey planner for Rome's public transport.<br>
  Self-hosted, no accounts, no tracking, twenty-one languages.
</p>

<p align="center">
  <a href="https://github.com/xAlcahest/BusFinder/actions/workflows/ci.yml"><img src="https://github.com/xAlcahest/BusFinder/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/xAlcahest/BusFinder/actions/workflows/codeql.yml"><img src="https://github.com/xAlcahest/BusFinder/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/licence-AGPL--3.0-blue.svg" alt="Licence: AGPL-3.0"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="DEPLOY.md">Deploy</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="SECURITY.md">Security</a>
</p>

---

BusFinder answers one question, *when is my bus coming*, and tries to answer it more honestly than the apps you already have: every time is labelled live or scheduled, every position is drawn where the bus really is, and the data never pretends to be fresher than it is.

It is an independent, community project, not affiliated with ATAC or Roma Servizi per la Mobilità. Rome is the first city; other Italian cities that publish GTFS and GTFS-RT feeds are the plan.

## Features

- **Live arrivals** with the delay against the timetable and the age of the data on every row. No realtime for a trip means a scheduled time, marked as such.
- **A map where the buses move.** Positions snapped to the line's real shape, animated between feed updates, paced by speeds learned per line and per part of the city. A bus off its route is shown as diverted, not glued to the wrong street.
- **Journey planner** with RAPTOR search over the full network, walking transfers, departure now or at a chosen time, and legs drawn along the real geometry. Runs on your server; addresses go through OpenStreetMap Nominatim and can be switched off.
- **Timetables, line pages and service alerts**, with the 04:00 service-day boundary handled and alerts matched to the stops and lines they affect.
- **Favourites without an account.** Everything lives in the browser. Optional device sync encrypts it on the device with a key derived from a code you type on your other phone; the server stores ciphertext it cannot read.
- **Twenty-one languages**, with CLDR plural rules and right-to-left layouts, each loaded on demand.
- **Mobile-first and installable** as a PWA, and a proper desktop layout from 1024 px.
- **One process, three SQLite files**, a ~300 MB image, and a nightly refresh that swaps the schedule atomically. Runs on a small VPS or a Raspberry Pi with 4 GB.

## Quick start

```bash
pnpm install
pnpm ingest   # downloads the static feed and builds data/gtfs.db, ~20 s
pnpm dev      # http://localhost:3000
```

Node 22 and pnpm 10; `corepack enable` picks up the pinned version. With Docker instead:

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build   # http://localhost:3200
```

Set `PROBUS_CONTACT` before running anywhere public: it goes into the User-Agent sent to Nominatim, whose usage policy asks for a way to reach the operator. `.env.example` documents every variable; `DEPLOY.md` covers a real server with HTTPS, releases and rollback.

## Data

Everything comes from the open GTFS and GTFS-RT feeds published by **Roma Servizi per la Mobilità** at `romamobilita.it`. Attribution is a condition of their licence; it appears in the site footer and on `/info`, and both must stay. The app talks to those feeds, to Nominatim for addresses, and to nothing else.

Known limits: the planner is schedule-only and does not know your bus is late; walking legs are straight lines with a detour factor; realtime coverage depends on the line, and passages without it are labelled as scheduled; no fares or tickets.

## Documentation

| | |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | the three databases and why one must never be lost, the realtime poller, device sync, the live map, languages |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | the nightly refresh, how the image is built and why, the smoke test |
| [`DEPLOY.md`](DEPLOY.md) | release and deploy scripts, HTTPS, rollback |
| [`docs/TESTING.md`](docs/TESTING.md) | unit tests and CI |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | setup, the rules of the codebase, the names that must never change |

## Contributing

Issues and pull requests are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first; it is short. Security problems go through private vulnerability reporting, see [`SECURITY.md`](SECURITY.md).

## Licence

[GNU AGPL-3.0](LICENSE). Run it, change it, redistribute it, build on it, commercially or not; if you distribute it or offer it over a network, the source of your version has to be available under the same licence. "BusFinder" is the project's name, not part of the licence: forks are welcome to the code, please give yours its own name.
