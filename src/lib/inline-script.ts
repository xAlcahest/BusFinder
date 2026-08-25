/**
 * JSON.stringify for values interpolated into an inline <script>. "<" and the
 * two Unicode line separators are the characters that can end the tag or the
 * statement early, so they go out as escapes; the result is still valid JSON
 * and valid JavaScript.
 */
export function jsLiteral(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
