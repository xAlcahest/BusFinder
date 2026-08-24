"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck, IconRefresh } from "@/components/Icons";
import type { ResourceState } from "@/components/api";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

/**
 * Feedback for a manual refresh. A poll that finds nothing new looks exactly
 * like a dead button, so the outcome is always stated, "nothing changed"
 * included.
 */
export type RefreshOutcome = "updated" | "unchanged" | "failed";

/** How long the outcome stays on screen before it clears itself. */
const DISMISS_MS = 6_000;
/** Give up waiting for the request to start, rather than spin forever. */
const ARM_TIMEOUT_MS = 4_000;

function messageOf(outcome: RefreshOutcome, t: Dictionary): string {
  if (outcome === "updated") return t.refreshFeedback.updated;
  return outcome === "unchanged" ? t.refreshFeedback.unchanged : t.refreshFeedback.failed;
}

/** For slots too narrow for the full sentence, e.g. a section header. */
function shortMessageOf(outcome: RefreshOutcome, t: Dictionary): string {
  if (outcome === "updated") return t.refreshFeedback.updatedShort;
  return outcome === "unchanged"
    ? t.refreshFeedback.unchangedShort
    : t.refreshFeedback.failedShort;
}

export interface RefreshFeedback {
  outcome: RefreshOutcome | null;
  message: string | null;
  /** True only while a refresh the user asked for is in flight. */
  busy: boolean;
  /**
   * True from the click until the refresh resolves, the arming gap included.
   * `busy` only covers the part the resource has already noticed, so a control
   * gated on it alone stays clickable for the frames in between.
   */
  pending: boolean;
  /** Call in the click handler, before triggering the fetch. */
  start: () => void;
}

export interface UseRefreshFeedbackArgs {
  state: ResourceState;
  /**
   * Stable fingerprint of what is on screen. The same string after a refresh
   * means the payload did not change; null while there is nothing to compare.
   */
  signature: string | null;
}

/**
 * Watches one resource and reports what a manual refresh actually did. The
 * click arms it, the first busy render promotes it to running, and the return
 * to a settled state resolves it. Arming alone cannot resolve, so a click can
 * never be answered by the state it was fired from.
 */
export function useRefreshFeedback({ state, signature }: UseRefreshFeedbackArgs): RefreshFeedback {
  const t = useT();
  const loading = state === "loading" || state === "refreshing";
  const [outcome, setOutcome] = useState<RefreshOutcome | null>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "running">("idle");
  const beforeRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    setOutcome(null);
    beforeRef.current = signature;
    setPhase("armed");
  }, [clearTimer, signature]);

  // Armed but nothing ever started: give up quietly instead of spinning on.
  useEffect(() => {
    if (phase !== "armed") return;
    const id = window.setTimeout(() => setPhase("idle"), ARM_TIMEOUT_MS);
    return () => {
      window.clearTimeout(id);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;
    if (phase === "armed") {
      if (loading) setPhase("running");
      return;
    }
    if (loading) return;

    setPhase("idle");
    setOutcome(
      state === "error" ? "failed" : signature !== beforeRef.current ? "updated" : "unchanged",
    );
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setOutcome(null);
    }, DISMISS_MS);
  }, [phase, loading, state, signature, clearTimer]);

  return {
    outcome,
    message: outcome === null ? null : messageOf(outcome, t),
    busy: phase !== "idle" && loading,
    pending: phase !== "idle",
    start,
  };
}

export interface RefreshFeedbackPillProps {
  feedback: RefreshFeedback;
  /** "short" for narrow slots; the full sentence is still announced. */
  variant?: "full" | "short";
  className?: string;
}

/**
 * The spoken and visible half of the feedback. Always mounted so the live
 * region exists before the message lands in it: a screen reader ignores text
 * that appears together with its container.
 */
export function RefreshFeedbackPill({
  feedback,
  variant = "full",
  className = "",
}: RefreshFeedbackPillProps) {
  const t = useT();
  const { busy, outcome } = feedback;
  const shown = busy
    ? t.refreshFeedback.busy
    : outcome === null
      ? null
      : variant === "short"
        ? shortMessageOf(outcome, t)
        : messageOf(outcome, t);
  const spoken = busy
    ? t.refreshFeedback.busySpoken
    : outcome === null
      ? null
      : messageOf(outcome, t);

  return (
    <p role="status" aria-live="polite" className={`min-w-0 text-xs font-semibold ${className}`}>
      {shown === null ? null : (
        <span
          className={`inline-flex items-center gap-1.5 rounded-chip px-2 py-1 ${
            outcome === "failed"
              ? "bg-danger-soft text-danger"
              : outcome === "updated"
                ? "bg-live-soft text-live"
                : "bg-surface-2 text-muted"
          }`}
        >
          <span aria-hidden="true">
            {busy ? (
              <IconRefresh size={13} className="animate-spin-slow" />
            ) : outcome === "failed" ? null : (
              <IconCheck size={13} />
            )}
          </span>
          {/* Only split the two when the short form is not the whole sentence,
              otherwise the live region announces the same words twice. */}
          {spoken === shown ? (
            <span>{shown}</span>
          ) : (
            <>
              <span aria-hidden="true">{shown}</span>
              <span className="sr-only">{spoken}</span>
            </>
          )}
        </span>
      )}
    </p>
  );
}
