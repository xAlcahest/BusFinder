# syntax=docker/dockerfile:1

# ---- Stage 1: deps + build -------------------------------------------------
# better-sqlite3 compiles a native binding at install time, so this stage
# needs a C++ toolchain even though the runtime image does not.
FROM node:22-slim AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Pinned so the image is reproducible and matches pnpm-lock.yaml (lockfile v9).
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# node-linker=hoisted instead of pnpm's symlinked store, so the runtime stage
# can COPY single packages (tsx, yauzl) as real directories instead of symlinks
# dangling into a .pnpm store it does not ship.
RUN printf 'node-linker=hoisted\n' > /app/.npmrc

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN test -d node_modules/next && test ! -L node_modules/next

COPY . .
RUN pnpm build

# Boot the standalone server for real here, so a regressed trace fails the
# build instead of the container.
RUN <<'EOF' node
const { spawn } = require("node:child_process");
const child = spawn(process.execPath, ["server.js"], {
  cwd: "/app/.next/standalone",
  env: { ...process.env, PORT: "3001", HOSTNAME: "127.0.0.1" },
  stdio: "inherit",
});
let exited = false;
child.on("exit", (code) => {
  exited = true;
  console.error(`standalone server.js exited early with code ${code}`);
});
const deadline = Date.now() + 60_000;
(async () => {
  while (Date.now() < deadline && !exited) {
    try {
      await fetch("http://127.0.0.1:3001/api/alerts");
      child.kill("SIGKILL");
      console.log("standalone boot check: server.js listened and responded");
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  child.kill("SIGKILL");
  console.error("standalone boot check failed");
  process.exit(1);
})();
EOF

# ---- Stage 2: runtime -------------------------------------------------------
FROM node:22-slim AS runner

ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0

WORKDIR /app

# Next standalone output: server.js plus the node_modules subset it traced.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# scripts/ingest.ts runs under tsx on first boot and on every daily refresh.
# Next's server trace never sees it, so its runtime deps are copied by hand
# (~13 MB) rather than shipping the whole ~480 MB node_modules.
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib/polyline.ts ./src/lib/polyline.ts
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder /app/node_modules/yauzl ./node_modules/yauzl
COPY --from=builder /app/node_modules/pend ./node_modules/pend

# refresh-cron.sh calls node_modules/.bin/tsx, and COPY would dereference that
# symlink into a loose file whose sibling imports no longer resolve.
RUN mkdir -p node_modules/.bin \
  && ln -s "../tsx/$(node -p 'const b=require("/app/node_modules/tsx/package.json").bin; typeof b === "string" ? b : b.tsx')" node_modules/.bin/tsx

# --help walks ingest.ts's whole import graph (better-sqlite3, yauzl,
# src/lib/polyline), so a missing runtime dep fails here, not on first boot.
RUN node_modules/.bin/tsx scripts/ingest.ts --help

# src/lib/syncdb.ts reads this at runtime to create data/sync.db on first use.
# It is not in the server trace, so nothing else would notice it going missing.
RUN test -s scripts/sync-schema.sql

# Both databases live here: gtfs.db, rebuilt daily by the ingest, and sync.db,
# written by the app and never replaced. The volume must be writable by `node`.
RUN mkdir -p /app/data \
  && chown -R node:node /app/data

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER node

EXPOSE 3000

VOLUME ["/app/data"]

# start-period is 10 min: on first boot (or after a data-volume wipe) the
# entrypoint ingests the ~214 MB stop_times.txt before the server ever
# listens, and that easily takes longer than a typical health-check grace period.
HEALTHCHECK --interval=30s --timeout=5s --start-period=600s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/alerts').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
