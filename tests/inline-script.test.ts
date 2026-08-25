/**
 * Values interpolated into the pre-paint <script> in layout.tsx. The parser
 * closes a script element at the first "</script" it sees, before JavaScript
 * ever runs, so the serialiser has to make that sequence impossible.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { jsLiteral } from "@/lib/inline-script";
import { logLine } from "@/app/api/_lib/http";

function evaluate(source: string): unknown {
  return new Function(`return ${source};`)();
}

test("a closing script tag inside a string cannot end the element", () => {
  const out = jsLiteral("</script><script>alert(1)</script>");
  assert.ok(!out.includes("</script"), out);
  assert.ok(!out.includes("<"), out);
  assert.equal(evaluate(out), "</script><script>alert(1)</script>");
});

test("the Unicode line separators are escaped, not emitted raw", () => {
  const raw = "a\u2028b\u2029c";
  const out = jsLiteral(raw);
  assert.ok(!out.includes("\u2028") && !out.includes("\u2029"), out);
  assert.equal(evaluate(out), raw);
});

test("the values the layout actually serialises round-trip unchanged", () => {
  // The alias map is null-prototype in the source; the client gets a plain
  // object, which is fine because the bootstrap reads it with hasOwnProperty.
  const aliases = Object.assign(Object.create(null) as Record<string, string>, { fil: "tl", in: "id" });
  const samples: Array<[unknown, unknown]> = [
    ["probus.settings.v1", "probus.settings.v1"],
    [["it", "en", "ar"], ["it", "en", "ar"]],
    [aliases, { fil: "tl", in: "id" }],
    [null, null],
    [42, 42],
  ];
  for (const [value, expected] of samples) {
    assert.deepEqual(evaluate(jsLiteral(value)), expected);
  }
});

test("a log line cannot carry a newline from a request", () => {
  const forged = "stop 123\n[api:auth] admin login ok\r\n";
  const out = logLine(new Error(forged));
  assert.ok(!/[\r\n]/.test(out), out);
  assert.ok(out.startsWith("Error: stop 123"), out);
});

test("a log line is capped so a huge message cannot flood the log", () => {
  assert.ok(logLine("x".repeat(10_000)).length <= 2000);
  assert.equal(logLine(undefined), "undefined");
});
