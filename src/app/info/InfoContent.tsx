"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

const OPEN_DATA_URL = "https://romamobilita.it/it/tecnologie/open-data";

function faqOf(t: Dictionary): Array<{ question: string; answer: string }> {
  return [
    { question: t.info.faq1Q, answer: t.info.faq1A },
    { question: t.info.faq2Q, answer: t.info.faq2A },
    { question: t.info.faq3Q, answer: t.info.faq3A },
    { question: t.info.faq4Q, answer: t.info.faq4A },
  ];
}

/** The page body. Split from page.tsx so that file can still export metadata. */
export default function InfoContent() {
  const t = useT();

  return (
    // Prose does not get better when you widen it: the measure caps at lg,
    // below it the page keeps the column it has always had.
    <div className="mx-auto w-full max-w-2xl lg:max-w-[var(--measure)]">
      <header className="mb-5">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">
          {t.info.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.info.subtitle}</p>
      </header>

      <section className="mb-6 rounded-card border border-late bg-late-soft p-4">
        <h2 className="font-bold text-late">{t.info.unofficialTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-late">{t.info.unofficialBody}</p>
      </section>

      <section className="mb-6 space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-lg font-bold">{t.info.whatTitle}</h2>
        <p className="text-sm leading-relaxed">{t.info.whatBody1}</p>
        <p className="text-sm leading-relaxed">{t.info.whatBody2}</p>
      </section>

      <section className="mb-6 space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-lg font-bold">{t.info.dataTitle}</h2>
        <p className="text-sm leading-relaxed">
          {t.info.dataBodyBefore}
          <strong>{t.info.dataProvider}</strong>
          {t.info.dataBodyAfter}
        </p>
        <p className="text-sm">
          <a
            href={OPEN_DATA_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 transition-opacity hover:opacity-80 lg:min-h-0"
          >
            {t.info.dataLink}
          </a>
        </p>
        <p className="text-xs leading-relaxed text-muted">{t.info.dataLicence}</p>
      </section>

      <section className="mb-6 space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-lg font-bold">{t.info.privacyTitle}</h2>
        <p className="text-sm leading-relaxed">{t.info.privacyBody}</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-bold">{t.info.faqTitle}</h2>
        <div className="space-y-2">
          {faqOf(t).map((item) => (
            <details
              key={item.question}
              className="group rounded-card border border-line bg-surface shadow-card transition-colors hover:border-line-strong [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold">
                <span className="min-w-0 flex-1">{item.question}</span>
                <span aria-hidden="true" className="shrink-0 text-muted group-open:hidden">
                  +
                </span>
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 text-muted group-open:inline"
                >
                  −
                </span>
              </summary>
              <p className="border-t border-line px-4 py-3 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-sm">
        <Link
          href="/settings"
          className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 transition-opacity hover:opacity-80 lg:min-h-0"
        >
          {t.info.settingsLink}
        </Link>
      </p>
    </div>
  );
}
