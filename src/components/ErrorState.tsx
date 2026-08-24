"use client";

import { IconAlert, IconRefresh } from "@/components/Icons";
import { useT } from "@/lib/i18n";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Compact inline banner instead of the full block. */
  inline?: boolean;
  className?: string;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  inline = false,
  className = "",
}: ErrorStateProps) {
  const t = useT();
  const heading = title ?? t.errors.genericTitle;
  const retry = retryLabel ?? t.common.retry;

  if (inline) {
    return (
      <p
        role="status"
        className={`flex items-center gap-2 text-sm text-danger ${className}`}
      >
        <IconAlert size={16} className="shrink-0" />
        <span className="min-w-0 flex-1">{message}</span>
        {onRetry !== undefined ? (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md px-2 py-1 font-semibold underline underline-offset-2"
          >
            {retry}
          </button>
        ) : null}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className={`rounded-card border border-danger/40 bg-danger-soft px-5 py-6 text-center ${className}`}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-danger">
        <IconAlert size={22} />
      </div>
      <p className="text-base font-semibold text-ink">{heading}</p>
      <p className="mx-auto mt-1.5 max-w-[36ch] text-sm leading-relaxed text-muted">{message}</p>
      {onRetry !== undefined ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg active:scale-[0.98]"
        >
          <IconRefresh size={16} />
          {retry}
        </button>
      ) : null}
    </div>
  );
}
