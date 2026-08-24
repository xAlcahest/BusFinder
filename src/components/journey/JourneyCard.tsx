"use client";

import Link from "next/link";

import LineBadge from "@/components/LineBadge";
import { formatClock, formatDistance } from "@/lib/format";
import { activeDictionary, useT } from "@/lib/i18n";
import type { Journey, JourneyLeg, JourneyRideLeg } from "@/lib/types";

/** "1 h 05" past the hour, "42 min" below it. */
export function formatDuration(seconds: number): string {
  const t = activeDictionary();
  if (!Number.isFinite(seconds) || seconds < 0) return t.format.unavailable;
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return t.format.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? t.journey.hours(hours)
    : t.journey.hoursMinutes(hours, String(rest).padStart(2, "0"));
}

/** The line badges in order, so the whole plan is readable before expanding it. */
function Summary({ legs }: { legs: JourneyLeg[] }) {
  const t = useT();
  const rides = legs.filter((leg): leg is JourneyRideLeg => leg.kind === "ride");
  if (rides.length === 0) {
    return <span className="text-sm font-semibold text-muted">{t.journey.walkOnly}</span>;
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {rides.map((leg, index) => (
        <span key={`${leg.tripId}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted">
              ›
            </span>
          ) : null}
          <LineBadge
            shortName={leg.route.shortName}
            routeType={leg.route.routeType}
            color={leg.route.color}
            textColor={leg.route.textColor}
            size="sm"
          />
        </span>
      ))}
    </span>
  );
}

function StopLink({ stopId, name }: { stopId: string | null; name: string }) {
  if (stopId === null) return <span className="caps-data">{name}</span>;
  return (
    <Link
      href={`/stop/${encodeURIComponent(stopId)}`}
      className="caps-data underline decoration-line-strong underline-offset-2 hover:decoration-accent"
    >
      {name}
    </Link>
  );
}

function WalkRow({ leg }: { leg: Extract<JourneyLeg, { kind: "walk" }> }) {
  const t = useT();
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
        <span className="absolute inset-y-0 w-px border-s-2 border-dotted border-line-strong" />
      </span>
      <span className="py-1.5 text-[0.8125rem] text-muted">
        {t.journey.walkLeg(formatDistance(leg.distanceM), formatDuration(leg.durationSec))}
        <span className="font-medium text-ink">
          <StopLink stopId={leg.to.stopId} name={leg.to.name} />
        </span>
      </span>
    </li>
  );
}

function RideRow({ leg }: { leg: JourneyRideLeg }) {
  const t = useT();
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
        <span className="absolute inset-y-0 w-[3px] rounded-full bg-line-strong" />
        <span className="absolute top-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-surface" />
        <span className="absolute bottom-1.5 h-2.5 w-2.5 rounded-full bg-ink ring-2 ring-surface" />
      </span>

      <span className="min-w-0 flex-1 py-0.5">
        <span className="flex items-baseline gap-2">
          <span className="tnum text-[0.8125rem] font-bold">{formatClock(leg.departureTime)}</span>
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
            <StopLink stopId={leg.from.stopId} name={leg.from.name} />
          </span>
        </span>

        <span className="my-1.5 flex flex-wrap items-center gap-2">
          <Link
            href={`/line/${encodeURIComponent(leg.route.routeId)}?direction=${leg.directionId}`}
            className="shrink-0 rounded-lg"
            aria-label={t.journey.lineDetailsAria(leg.route.shortName)}
          >
            <LineBadge
              shortName={leg.route.shortName}
              routeType={leg.route.routeType}
              color={leg.route.color}
              textColor={leg.route.textColor}
              size="sm"
              decorative
            />
          </Link>
          <span className="min-w-0 text-[0.75rem] text-muted">
            {leg.headsign.length > 0 ? (
              <span className="caps-data">{t.lines.towards(leg.headsign)}</span>
            ) : (
              t.journey.inService
            )}
            {" · "}
            {t.journey.stopCount(leg.stopCount)}
            {" · "}
            {formatDuration(leg.durationSec)}
          </span>
        </span>

        <span className="flex items-baseline gap-2">
          <span className="tnum text-[0.8125rem] font-bold">{formatClock(leg.arrivalTime)}</span>
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
            <StopLink stopId={leg.to.stopId} name={leg.to.name} />
          </span>
        </span>
      </span>
    </li>
  );
}

export interface JourneyCardProps {
  journey: Journey;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

export default function JourneyCard({ journey, index, selected, onSelect }: JourneyCardProps) {
  const t = useT();
  const headingId = `itinerario-${journey.id}`;
  const walkOnly = journey.legs.every((leg) => leg.kind === "walk");

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className={`overflow-hidden rounded-card border bg-surface shadow-card transition-colors ${
          selected ? "border-accent" : "border-line hover:border-line-strong"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex w-full items-center gap-3 px-4 py-3 text-start"
        >
          <span className="min-w-0 flex-1">
            <span id={headingId} className="flex items-baseline gap-1.5">
              <span className="tnum text-lg font-extrabold tracking-tight">
                {formatClock(journey.departureTime)}
              </span>
              <span aria-hidden="true" className="text-muted">
                →
              </span>
              <span className="tnum text-lg font-extrabold tracking-tight">
                {formatClock(journey.arrivalTime)}
              </span>
              <span className="sr-only">
                {t.journey.itinerarySr(
                  index + 1,
                  formatClock(journey.departureTime),
                  formatClock(journey.arrivalTime),
                )}
              </span>
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-muted">
              {formatDuration(journey.durationSec)} ·{" "}
              {walkOnly
                ? t.journey.walkOnlyShort
                : journey.transfers === 0
                  ? t.journey.noTransfers
                  : t.journey.transfers(journey.transfers)}
              {journey.walkDistanceM > 0 && !walkOnly
                ? ` · ${t.journey.walkDistance(formatDistance(journey.walkDistanceM))}`
                : ""}
            </span>
          </span>
          <span className="shrink-0">
            <Summary legs={journey.legs} />
          </span>
        </button>

        <div className="border-t border-line px-4 py-3">
          <ol className="flex flex-col gap-0.5">
            {journey.legs.map((leg, legIndex) =>
              leg.kind === "walk" ? (
                <WalkRow key={`w-${legIndex}`} leg={leg} />
              ) : (
                <RideRow key={`r-${leg.tripId}-${legIndex}`} leg={leg} />
              ),
            )}
          </ol>
        </div>
      </article>
    </li>
  );
}
