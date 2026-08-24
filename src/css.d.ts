/**
 * Side-effect CSS imports. Next resolves these through its own loader, and
 * nothing in the toolchain declares them, so from TypeScript 7 on an untyped
 * side-effect import is an error (TS2882) instead of being waved through.
 */

declare module "*.css";
