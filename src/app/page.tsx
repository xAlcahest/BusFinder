"use client";

import Link from "next/link";
import FavoritesSection from "@/components/FavoritesSection";
import RecentsSection from "@/components/RecentsSection";
import SearchBox from "@/components/SearchBox";
import { IconAlert, IconPin } from "@/components/Icons";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

const QUICK_LINKS = [
  {
    href: "/nearby",
    label: (t: Dictionary) => t.nav.nearby,
    hint: (t: Dictionary) => t.nav.hintNearby,
    icon: <IconPin size={19} />,
  },
  {
    href: "/alerts",
    label: (t: Dictionary) => t.nav.alerts,
    hint: (t: Dictionary) => t.nav.hintAlerts,
    icon: <IconAlert size={19} />,
  },
];

export default function HomePage() {
  const t = useT();

  return (
    // Phone keeps the old 42rem column; the grid only gets the room at lg.
    <div className="mx-auto w-full max-w-2xl lg:max-w-[96rem]">
      <section className="mb-5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-muted">
          {t.home.kicker}
        </p>
        <h1 className="mt-1.5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
          {t.home.title}
        </h1>
        <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">{t.home.intro}</p>
      </section>

      {/* At lg the search stops being a full-width bar and the shortcuts sit
          next to it instead of under it. */}
      <div className="lg:flex lg:items-start lg:gap-4">
        <SearchBox className="lg:w-full lg:max-w-[34rem]" />

        <nav
          aria-label={t.nav.shortcuts}
          className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:w-[30rem] lg:shrink-0"
        >
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-[4.5rem] flex-col justify-center gap-1 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition-colors hover:border-line-strong hover:bg-surface-2 active:bg-surface-2 lg:min-h-0"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <span className="text-accent" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label(t)}
              </span>
              <span className="text-xs text-muted">{link.hint(t)}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Recents move beside the favourites at 2xl, where the grid no longer
          needs the whole width. */}
      <div className="mt-8 lg:mt-[var(--section-gap)] 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:items-start 2xl:gap-8">
        <FavoritesSection />
        <RecentsSection className="2xl:mt-0" />
      </div>
    </div>
  );
}
