"use client";

import { useT } from "@/lib/i18n";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-md bg-surface-2 animate-shimmer ${className}`}
    />
  );
}

/** Placeholder for one arrival row, matching ArrivalRow's rhythm. */
export function ArrivalRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="h-8 w-11 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

export function ArrivalsSkeleton({ rows = 4 }: { rows?: number }) {
  const t = useT();
  return (
    <div
      className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface"
      role="status"
      aria-label={t.arrivals.loadingAria}
    >
      {Array.from({ length: Math.max(1, rows) }, (_, index) => (
        <ArrivalRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function FavoriteCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  const t = useT();
  return (
    <div className="space-y-2" role="status" aria-label={t.skeleton.loading}>
      {Array.from({ length: Math.max(1, rows) }, (_, index) => (
        <Skeleton key={index} className="h-14 rounded-card" />
      ))}
    </div>
  );
}
