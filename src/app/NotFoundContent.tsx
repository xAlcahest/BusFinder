"use client";

import Link from "next/link";
import { IconPin, IconSearch } from "@/components/Icons";
import { useT } from "@/lib/i18n";

/** Split from not-found.tsx so that file can still export metadata. */
export default function NotFoundContent() {
  const t = useT();

  return (
    <section className="py-6">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-muted">
        {t.notFound.kicker}
      </p>
      <h1 className="mt-1.5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
        {t.notFound.title}
      </h1>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">{t.notFound.body}</p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg active:scale-[0.98]"
        >
          <IconSearch size={17} />
          {t.notFound.searchCta}
        </Link>
        <Link
          href="/nearby"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink active:bg-surface-2"
        >
          <IconPin size={17} />
          {t.notFound.nearbyCta}
        </Link>
      </div>
    </section>
  );
}
