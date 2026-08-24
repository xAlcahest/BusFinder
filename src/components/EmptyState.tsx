import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  /** One line that says what to do next, never just "nessun risultato". */
  hint: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  hint,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-card border border-dashed border-line-strong bg-surface/60 px-5 py-8 text-center ${className}`}
    >
      {icon !== undefined ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
          {icon}
        </div>
      ) : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[34ch] text-sm leading-relaxed text-muted">{hint}</p>
      {action !== undefined ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
