import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  count?: number;
  /** Right-hand slot: refresh control, "svuota" link, and so on. */
  action?: ReactNode;
  id?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  count,
  action,
  id,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-3 flex items-center gap-3 ${className}`}>
      <h2
        id={id}
        className="shrink-0 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted"
      >
        {title}
        {count !== undefined ? <span className="ms-1.5 tabular-nums">{count}</span> : null}
      </h2>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-line" />
      {action}
    </div>
  );
}
