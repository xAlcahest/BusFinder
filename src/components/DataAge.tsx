"use client";

import { useNow } from "@/components/hooks";
import { formatClock } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

export interface DataAgeProps {
  /** Epoch ms of the data we are showing, null while we have none. */
  timestampMs: number | null;
  prefix?: string;
  /** Past this age the label turns amber: the numbers are not live any more. */
  staleAfterSec?: number;
  /** Past this age it turns red: the numbers are old enough to mislead. */
  criticalAfterSec?: number;
  /** "pill" is for the prominent freshness badge, "inline" for side notes. */
  variant?: "inline" | "pill";
  /** Shown instead of the age when there is no timestamp at all. */
  unknownLabel?: string;
  className?: string;
}

type Tone = "fresh" | "stale" | "critical" | "unknown";

const TONE_INLINE: Record<Tone, string> = {
  fresh: "text-muted",
  stale: "text-late",
  critical: "text-danger",
  unknown: "text-muted",
};

const TONE_PILL: Record<Tone, string> = {
  fresh: "border-live/40 bg-live-soft text-live",
  stale: "border-late/50 bg-late-soft text-late",
  critical: "border-danger/50 bg-danger-soft text-danger",
  unknown: "border-line bg-surface-2 text-muted",
};

const TONE_DOT: Record<Tone, string> = {
  fresh: "bg-live animate-pulse-live",
  stale: "bg-late",
  critical: "bg-danger",
  unknown: "border border-line-strong",
};

function ageLabel(ageSec: number, timestampMs: number, t: Dictionary): string {
  if (ageSec < 10) return t.dataAge.now;
  if (ageSec < 60) return t.dataAge.secondsAgo(ageSec);
  if (ageSec < 3600) return t.dataAge.minutesAgo(Math.floor(ageSec / 60));
  return t.dataAge.atClock(formatClock(Math.floor(timestampMs / 1000)));
}

/** Never let a rider mistake old numbers for live ones. */
export default function DataAge({
  timestampMs,
  prefix,
  staleAfterSec = 120,
  criticalAfterSec,
  variant = "inline",
  unknownLabel,
  className = "",
}: DataAgeProps) {
  const t = useT();
  const label = prefix ?? t.dataAge.prefix;
  const now = useNow(5000);
  const pill = variant === "pill";
  const shell = pill
    ? "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums"
    : "inline-flex items-center gap-1.5 text-xs tabular-nums";

  if (timestampMs === null || now === null) {
    return (
      <span className={`${shell} ${pill ? TONE_PILL.unknown : TONE_INLINE.unknown} ${className}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${TONE_DOT.unknown}`} />
        {unknownLabel ?? `${label} ${t.common.dash}`}
      </span>
    );
  }

  const ageSec = Math.max(0, Math.floor((now - timestampMs) / 1000));
  const critical = criticalAfterSec !== undefined && ageSec >= criticalAfterSec;
  const tone: Tone = critical ? "critical" : ageSec >= staleAfterSec ? "stale" : "fresh";

  return (
    <span className={`${shell} ${pill ? TONE_PILL[tone] : TONE_INLINE[tone]} ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
      {label} {ageLabel(ageSec, timestampMs, t)}
    </span>
  );
}
