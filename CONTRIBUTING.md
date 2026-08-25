# Contributing

Thanks for looking. This file is the short version of how the project works;
`README.md` has the architecture and `DEPLOY.md` the operations side.

## Before you start

- **Bugs**: open an issue with the bug template. A stop id, a line number and
  the time of day get you a long way, because most transit bugs only exist at
  a particular stop at a particular hour.
- **Features**: open an issue first. Some things are deliberately out of
  scope (fares, ticketing, anything that calls ATAC's or Probus's own
  backend), and it is better to find that out before writing the code.
- **Security**: see `SECURITY.md`. Do not open a public issue.

## Setting up

Node 22 and pnpm 10. The version is pinned in `package.json`, so `corepack
enable` gets you the right one.

```bash
pnpm install
pnpm ingest       # builds data/gtfs.db from the live feed, ~20 s
pnpm dev          # http://localhost:3000
```

`pnpm ingest --from-file` uses `data/rome_static_gtfs.zip` instead of
downloading, which is what you want while iterating on the ingest itself.
Please do not hammer `romamobilita.it`: the zip is 42 MB and refreshed once a
day, so one download per day is plenty.

## Checks

The same three run in CI on every pull request:

```bash
pnpm typecheck
pnpm test
pnpm build
```

The build has to pass with no `data/*.db` present. If it does not, something
is querying the database at build time, and that is the bug to fix.

Tests use Node's own runner through `tsx` (`tests/*.test.ts`). Add one when
you fix a bug in pure logic: formatting, plural rules, locale resolution,
polyline maths, the service-day cutoff. UI and API behaviour is covered by
`scripts/smoke.ts` against a running server instead.

## Rules of the codebase

- TypeScript strict. No `any`, no non-null assertions on external data, no
  unchecked casts. Validate everything that comes from a URL, a query string,
  `localStorage` or a network response.
- Every async path handles its own errors. A failing realtime feed degrades to
  scheduled data; it never throws a 500 at the user.
- Every screen must be usable with no realtime data at all.
- Comments: one or two lines, only where the reason is not obvious from the
  code. No essays above an `if`.
- User-facing text goes through the dictionaries in `src/lib/i18n/`. Every key
  exists in all 21 languages, and the test suite fails if one is missing. Do
  not hardcode a string in a component.
- The layout has to hold in both text directions (`ar` and `ur` are RTL) and
  at every width from 320 px to 2560 px. `DESKTOP.md` has the tokens.
- Identifiers, comments, commits and docs are in English.

Some names cannot change, because changing them silently discards users'
data or breaks every existing sync code:

- `localStorage` keys `probus.*`
- the HKDF constants `probus-sync-*-v1` in `src/lib/sync.ts`
- the `PROBUS_*` environment variables

## Feed quirks that will bite you

- There is no `calendar.txt`. Every service day is an explicit
  `calendar_dates` row with `exception_type=1`.
- CSV quoting is inconsistent: `stop_times.txt` is unquoted, `stops.txt` and
  `trips.txt` quote some fields. Use the CSV parser in the ingest, never split
  on commas.
- `stop_times.txt` is 4.5 million rows. Stream it; never read it whole.
- Realtime timestamps are protobuf Longs serialised as strings. Convert with
  `Number()` before doing arithmetic.
- A `stopTimeUpdate` may carry `arrival`, `departure`, both or neither.
- Never assume the realtime feed is non-empty. At night it nearly is.

## Pull requests

- One change per PR. Small is good.
- Title in conventional-commits form (`fix:`, `feat:`, `fix(i18n):`), matching
  the commit.
- The template asks for a summary and a list of changes. Keep the summary
  short: what was wrong, where, and what the fix does.
- `main` is protected. Everything lands through a pull request with green
  checks, squash-merged, so the branch history is yours to mess up.

The protection itself is versioned in `.github/rulesets/main.json` and applied
with `gh api repos/xAlcahest/BusFinder/rulesets --input .github/rulesets/main.json`.
Edit the file and re-apply rather than clicking around in the settings.

## Licence

The project is under the GNU AGPL-3.0 (`LICENSE`). By contributing you agree
that your contribution is licensed under the same terms, and you confirm you
have the right to contribute it. There is no separate contributor agreement.
