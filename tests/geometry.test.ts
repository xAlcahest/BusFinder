/**
 * Polyline codec and path projection. This is the machinery that decides
 * whether a bus is drawn on the road or floating over a building, so the
 * snapping tolerance is worth pinning down.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { decodePolyline, encodePolyline } from "@/lib/polyline";
import { buildPath, DEFAULT_MOTION, metresBetween, projectOnPath } from "@/lib/pathmotion";

/** A straight stretch of Via Cristoforo Colombo, roughly north to south. */
const LINE: Array<[number, number]> = [
  [41.8600, 12.4750],
  [41.8580, 12.4755],
  [41.8560, 12.4760],
  [41.8540, 12.4765],
];

test("encoding then decoding a polyline is a round trip", () => {
  const round = decodePolyline(encodePolyline(LINE));
  assert.equal(round.length, LINE.length);
  for (const [i, [lat, lon]] of LINE.entries()) {
    // Precision 5 rounds to 1e-5 degrees, a little over a metre.
    assert.ok(Math.abs(round[i][0] - lat) < 1e-5, `point ${i} latitude`);
    assert.ok(Math.abs(round[i][1] - lon) < 1e-5, `point ${i} longitude`);
  }
});

test("an empty polyline decodes to no points", () => {
  assert.deepEqual(decodePolyline(""), []);
});

test("a corrupt polyline throws instead of returning bent coordinates", () => {
  // Every call site wraps this in try/catch precisely because it throws: a
  // silent empty array would draw a line that is not there.
  assert.throws(() => decodePolyline("!!!not-a-polyline!!!"), /invalid character/);
  assert.throws(() => decodePolyline(encodePolyline(LINE).slice(0, 3)), /truncated value/);
  assert.throws(() => decodePolyline(42 as unknown as string), TypeError);
});

test("encoding refuses coordinates that are not on Earth", () => {
  assert.throws(() => encodePolyline([[Number.NaN, 12.5]]), TypeError);
  assert.throws(() => encodePolyline([[91, 12.5]]), RangeError);
  assert.throws(() => encodePolyline([[41.9, 181]]), RangeError);
});

test("the distance between two points is symmetric and sane", () => {
  const d = metresBetween(41.9008, 12.5013, 41.9028, 12.5013);
  assert.ok(d > 200 && d < 240, `expected ~222 m, got ${Math.round(d)}`);
  assert.equal(
    Math.round(metresBetween(41.9, 12.5, 41.91, 12.51)),
    Math.round(metresBetween(41.91, 12.51, 41.9, 12.5)),
  );
  assert.equal(metresBetween(41.9, 12.5, 41.9, 12.5), 0);
});

test("a path builds and knows its own length", () => {
  const path = buildPath(LINE);
  assert.notEqual(path, null);
  assert.ok(path!.lengthM > 600 && path!.lengthM < 700, `length ${Math.round(path!.lengthM)} m`);
});

test("a path with no usable points is not built at all", () => {
  assert.equal(buildPath([]), null);
  assert.equal(buildPath([[41.9, 12.5]]), null);
});

test("a vehicle on the road snaps almost exactly onto it", () => {
  const path = buildPath(LINE)!;
  // A point on the line, nudged a few metres off as a real GPS fix would be.
  const onRoad = projectOnPath(path, 41.8570, 12.47575, null, DEFAULT_MOTION.projectWindowM, DEFAULT_MOTION.snapToleranceM);
  assert.notEqual(onRoad, null, "a vehicle on the road failed to snap");
  assert.ok(onRoad!.distanceM < 20, `distance from the shape ${Math.round(onRoad!.distanceM)} m`);
});

test("past the tolerance a vehicle is not glued onto the path", () => {
  const path = buildPath(LINE)!;
  // Roughly 400 m east of the line: a diverted bus, not a GPS error.
  const off = projectOnPath(path, 41.8570, 12.4808, null, DEFAULT_MOTION.projectWindowM, DEFAULT_MOTION.snapToleranceM);
  if (off !== null) {
    assert.ok(
      off.distanceM > DEFAULT_MOTION.snapToleranceM,
      `a point 400 m away snapped at ${Math.round(off.distanceM)} m`,
    );
  }
});

test("the snap tolerance stays in the range of urban GPS error", () => {
  // Raising it much means gluing diverted vehicles onto the wrong street,
  // which is exactly the surprise we do not want to hand a rider.
  assert.ok(
    DEFAULT_MOTION.snapToleranceM >= 20 && DEFAULT_MOTION.snapToleranceM <= 80,
    `tolerance out of scale: ${DEFAULT_MOTION.snapToleranceM} m`,
  );
});
