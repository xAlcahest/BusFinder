"use client";

import DataAge from "@/components/DataAge";
import { IconRefresh } from "@/components/Icons";
import { RefreshFeedbackPill, useRefreshFeedback } from "@/components/RefreshFeedback";
import type { ResourceState } from "@/components/api";
import { useT } from "@/lib/i18n";

export interface RefreshIndicatorProps {
  state: ResourceState;
  /** Epoch ms of the data currently on screen. */
  fetchedAt: number | null;
  onRefresh: () => void;
  /**
   * Fingerprint of what is on screen, so a refresh can say whether anything
   * changed. Without it the control still spins, it just cannot be specific.
   */
  signature?: string | null;
  label?: string;
  staleAfterSec?: number;
  className?: string;
}

export default function RefreshIndicator({
  state,
  fetchedAt,
  onRefresh,
  signature = null,
  label,
  staleAfterSec = 120,
  className = "",
}: RefreshIndicatorProps) {
  const t = useT();
  const loading = state === "loading" || state === "refreshing";
  const feedback = useRefreshFeedback({ state, signature });
  // Covers the frames between the click and the resource reporting itself busy.
  const busy = loading || feedback.pending;
  // One slot: the outcome of the refresh you just asked for matters more than
  // the age of the data it replaced, and only until it clears itself. The pill
  // itself stays mounted either way, so its live region can be announced.
  const showOutcome = feedback.busy || feedback.outcome !== null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showOutcome ? null : <DataAge timestampMs={fetchedAt} staleAfterSec={staleAfterSec} />}
      <RefreshFeedbackPill feedback={feedback} variant="short" />
      <button
        type="button"
        onClick={() => {
          feedback.start();
          onRefresh();
        }}
        disabled={busy}
        aria-busy={busy}
        aria-label={label ?? t.favorites.refreshArrivals}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors active:bg-surface-2 disabled:opacity-60"
      >
        <IconRefresh size={17} className={busy ? "animate-spin-slow" : undefined} />
      </button>
    </div>
  );
}
