"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconAlert, IconRefresh } from "@/components/Icons";
import { useT } from "@/lib/i18n";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <section role="alert" className="py-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <IconAlert size={22} />
      </div>
      <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
        {t.appError.title}
      </h1>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">{t.appError.body}</p>
      {error.digest !== undefined ? (
        <p className="mt-2 font-mono text-xs text-muted">{t.appError.digest(error.digest)}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg active:scale-[0.98]"
        >
          <IconRefresh size={17} />
          {t.common.retry}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink active:bg-surface-2"
        >
          {t.appError.backHome}
        </Link>
      </div>
    </section>
  );
}
