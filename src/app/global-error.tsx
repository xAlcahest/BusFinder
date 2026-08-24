"use client";

import { useEffect } from "react";
import { useStandaloneT } from "@/lib/i18n";
import { activeLocale, directionFor } from "@/lib/i18n/locale";
import "./globals.css";

/**
 * Last resort: replaces the root layout, so it ships its own html/body and has
 * no locale provider above it. useStandaloneT reads the stored language after
 * hydration, which is as much as this screen can do.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useStandaloneT();
  // useStandaloneT swaps the words after hydration; keep lang and dir with them.
  const locale = activeLocale();

  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang={locale} dir={directionFor(locale)}>
      <body className="min-h-dvh antialiased">
        <main
          role="alert"
          className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-gutter py-10"
        >
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-muted">
            {t.brand.name}
          </p>
          <h1 className="mt-1.5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]">
            {t.appError.globalTitle}
          </h1>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">
            {t.appError.globalBody}
          </p>
          {error.digest !== undefined ? (
            <p className="mt-2 font-mono text-xs text-muted">{t.appError.digest(error.digest)}</p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-bg active:scale-[0.98]"
          >
            {t.appError.reload}
          </button>
        </main>
      </body>
    </html>
  );
}
