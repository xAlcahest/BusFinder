"use client";

import Link from "next/link";
import { IconInfo } from "@/components/Icons";
import { useT } from "@/lib/i18n";

export default function TopBar() {
  const t = useT();

  return (
    // Gone at lg: the sidebar already carries the brand, the search and the
    // Info link, so a top bar there would only repeat them and cost 3.5rem.
    <header className="sticky top-0 z-30 border-b border-line bg-bg/88 backdrop-blur-md pt-safe lg:hidden">
      {/* Still capped at max-w-2xl: SidebarToggle overlays this row and mirrors
          the same box, so the two must keep the same width below lg. */}
      <div className="mx-auto flex h-[var(--shell-header-h)] max-w-2xl items-center gap-3 px-gutter">
        <Link href="/" className="flex items-center gap-2.5" aria-label={t.brand.homeAria}>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-[0.5rem] bg-accent text-on-accent"
          >
            <span className="h-2.5 w-2.5 rounded-[2px] bg-current" />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-[1.0625rem] font-extrabold tracking-[-0.035em]">BusFinder</span>
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-muted">
              Roma
            </span>
          </span>
        </Link>

        <span className="flex-1" />

        <Link
          href="/info"
          aria-label={t.nav.infoAria}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-surface-2"
        >
          <IconInfo size={19} />
        </Link>
      </div>
    </header>
  );
}
