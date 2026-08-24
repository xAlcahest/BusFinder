import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Without this, a stray lockfile in a parent directory makes Next pick that
// directory as the tracing root and nest standalone output under it.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  // Keep the ~400 MB gtfs.db out of the standalone bundle. Not "data/**": Next
  // matches excludes with picomatch contains:true, so that pattern also drops
  // next/dist/lib/metadata/** and standalone server.js then fails to boot.
  outputFileTracingExcludes: {
    "**/*": ["data/*.db", "data/*.db.tmp", "data/tmp/**"],
  },
  // better-sqlite3 is a native module: keep it external so Next does not try to bundle it.
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    optimizePackageImports: ["maplibre-gl"],
  },
};

export default nextConfig;
