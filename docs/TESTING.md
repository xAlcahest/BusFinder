# Tests

Unit tests run on Node's own test runner through `tsx`, so there is no test framework in the dependency tree and nothing extra to keep up to date.

```bash
pnpm test        # 64 tests, ~0.3 s, no server and no database needed
pnpm typecheck
```

They cover the parts that are pure logic and expensive to get wrong: every dictionary having the same shape as the Italian one and every parameterised string actually rendering in all 21 languages, CLDR plural categories (Polish few/many, Arabic dual, Romanian's `de` past 20), language-tag resolution including keys inherited from `Object.prototype`, the GTFS service day that rolls over at 04:00, and the polyline codec and snapping tolerance that decide whether a bus is drawn on the road or over a building.

`.github/workflows/ci.yml` runs those three checks on every push and pull request: typecheck, tests, then a production build with no `data/*.db` present, which is also what proves nothing queries the database at build time. A second workflow builds the Docker image whenever something that ships in it changes and checks that the native SQLite binding loads in the runtime image. CodeQL scans every pull request. Dependency updates arrive weekly, grouped by ecosystem, from `.github/dependabot.yml`.
