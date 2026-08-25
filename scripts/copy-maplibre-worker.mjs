// Copies the maplibre worker and its maplibre-gl-shared.mjs sibling into
// public/maplibre/, the URL MapView hands to setWorkerUrl.

import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const dist = path.join(path.dirname(require.resolve("maplibre-gl/package.json")), "dist");
const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dest = path.join(projectRoot, "public", "maplibre");

mkdirSync(dest, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(dist, file), path.join(dest, file));
}
