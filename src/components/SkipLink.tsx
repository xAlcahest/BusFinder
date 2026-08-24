"use client";

import { useT } from "@/lib/i18n";

/** Its own component so the root layout can stay a server component. */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      href="#contenuto"
      className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg"
    >
      {t.a11y.skipToContent}
    </a>
  );
}
