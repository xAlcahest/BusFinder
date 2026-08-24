"use client";

/**
 * The persistent "sto seguendo questo mezzo" bar. It is the only place that
 * says whether the camera is still locked on the vehicle, so it is never
 * hidden while follow mode is on, on any viewport.
 */

import LineBadge from "@/components/LineBadge";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

export type FollowState = "live" | "paused" | "stale" | "lost";

export interface FollowBannerProps {
  shortName: string;
  routeType: number;
  color: string | null;
  headsign: string | null;
  state: FollowState;
  /** Age of the last fix in seconds, when one is known. */
  ageSec: number | null;
  /** Extra line shown when the vehicle is gone and the mode may be the reason. */
  hint: string | null;
  onResume: () => void;
  onStop: () => void;
}

/** A duration, not a moment: it is read as "non trasmette da …". */
function ageText(sec: number, t: Dictionary): string {
  const minutes = Math.max(2, Math.round(sec / 60));
  if (minutes < 60) return t.follow.ageMinutes(minutes);
  return t.follow.ageHours(Math.round(minutes / 60));
}

function headline(state: FollowState, t: Dictionary): string {
  switch (state) {
    case "paused":
      return t.follow.headlinePaused;
    case "stale":
      return t.follow.headlineStale;
    case "lost":
      return t.follow.headlineLost;
    default:
      return t.follow.headlineLive;
  }
}

function detail(state: FollowState, ageSec: number | null, t: Dictionary): string {
  switch (state) {
    case "paused":
      return t.follow.detailPaused;
    case "stale":
      return ageSec === null
        ? t.follow.detailStaleUnknown
        : t.follow.detailStale(ageText(ageSec, t));
    case "lost":
      return t.follow.detailLost;
    default:
      return t.follow.detailLive;
  }
}

const TONE: Record<FollowState, string> = {
  live: "border-accent bg-accent-soft",
  paused: "border-line bg-surface-2",
  stale: "border-late bg-late-soft",
  lost: "border-danger bg-surface-2",
};

export default function FollowBanner({
  shortName,
  routeType,
  color,
  headsign,
  state,
  ageSec,
  hint,
  onResume,
  onStop,
}: FollowBannerProps) {
  const t = useT();
  const showResume = state === "paused";
  // When it is simply working, say so in one line: on a phone this bar sits
  // above the map, and the explanation is only worth its height when something
  // is wrong. The abnormal states keep the full wording.
  const compact = state === "live";
  // Sticky under the top bar: on a phone the followed line has to stay readable
  // while the page scrolls, with no interaction at all.
  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky z-20 top-[calc(var(--shell-header-h)_+_env(safe-area-inset-top))] flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border-2 px-3 py-2 ${TONE[state]}`}
    >
      <LineBadge shortName={shortName} routeType={routeType} color={color} size="md" decorative />
      <div className="min-w-0 flex-1 basis-40">
        {compact ? (
          <p className="truncate text-sm font-bold">
            {t.follow.compact}
            <span className="sr-only">{t.follow.compactSr(shortName)}</span>
            {headsign !== null && headsign.length > 0 ? (
              <span className="font-semibold text-muted caps-data">
                {" · "}
                {t.lines.towards(headsign)}
              </span>
            ) : null}
          </p>
        ) : (
          <>
            <p className="text-sm font-bold">
              {headline(state, t)}
              <span className="sr-only">{t.follow.lineSr(shortName)}</span>
            </p>
            <p className="text-xs text-muted">{detail(state, ageSec, t)}</p>
            {headsign !== null && headsign.length > 0 && state !== "lost" ? (
              <p className="truncate text-xs text-muted caps-data">
                {t.lines.towardsCapital(headsign)}
              </p>
            ) : null}
            {hint !== null ? <p className="text-xs text-muted">{hint}</p> : null}
          </>
        )}
      </div>
      <div className={`flex gap-2 ${compact ? "" : "w-full sm:w-auto"}`}>
        {showResume ? (
          <button
            type="button"
            onClick={onResume}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-4 text-sm font-bold text-on-accent active:opacity-80 sm:flex-none"
          >
            {t.follow.resume}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onStop}
          className={`inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface text-sm font-bold active:bg-surface-2 ${
            compact ? "px-4" : "flex-1 px-4 sm:flex-none"
          }`}
        >
          {state === "lost" ? t.follow.close : t.follow.exit}
        </button>
      </div>
    </div>
  );
}
