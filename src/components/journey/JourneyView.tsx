"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import DynamicMapView from "@/components/map/DynamicMapView";
import { routeColor } from "@/components/map/RouteBadge";
import type { LatLon, MapMarker, MapPath } from "@/components/map/types";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import SectionHeader from "@/components/SectionHeader";
import { IconClock, IconInbox, IconMap, IconRefresh } from "@/components/Icons";
import { useJsonResource } from "@/components/api";
import JourneyCard from "@/components/journey/JourneyCard";
import PlaceField from "@/components/journey/PlaceField";
import { encodePlace, parseJourneyResponse } from "@/components/journey/api";
import { formatDateTime } from "@/lib/format";
import { activeDictionary, useT, type Dictionary } from "@/lib/i18n";
import type { JourneyNotice } from "@/lib/journey";
import { metresBetween } from "@/lib/pathmotion";
import { decodePolyline } from "@/lib/polyline";
import type { Journey, JourneyPlace, JourneyRideLeg } from "@/lib/types";

const ROME_CENTER: LatLon = { lat: 41.9028, lon: 12.4964 };
const MAX_TEXT_LENGTH = 120;
/** Walking has no line colour of its own, and should not borrow one. */
const WALK_COLOR = "#64748b";
/** How far a drawn shape may end from the stop it claims to serve. */
const GEOMETRY_ENDPOINT_M = 250;

export interface JourneyViewProps {
  initialFrom: string;
  initialTo: string;
  /** Unix seconds, or null for "now". */
  initialAt: number | null;
}

type GeoTarget = "from" | "to";

/** Matches the window /api/journey accepts; outside it the API answers 400. */
function inServiceArea(lat: number, lon: number): boolean {
  return lat >= 40.5 && lat <= 43.0 && lon >= 11.0 && lon <= 14.2;
}

/** "2026-08-05T09:30" in Rome, which is what datetime-local wants. */
function toLocalInput(unixSec: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(unixSec * 1000));
  const read = (type: string): string => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

/**
 * The inverse, honouring Rome's offset rather than the browser's. Two passes
 * converge even across a DST boundary. Returns null for an unparseable value.
 */
function fromLocalInput(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (match === null) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  if (y === undefined || mo === undefined || d === undefined || h === undefined || mi === undefined) {
    return null;
  }
  const naive = Date.UTC(y, mo - 1, d, h, mi) / 1000;
  let guess = naive;
  for (let pass = 0; pass < 2; pass += 1) {
    const back = fromLocalInputParts(guess);
    if (back === null) return null;
    guess = naive - (back - guess);
  }
  return Math.round(guess);
}

function fromLocalInputParts(unixSec: number): number | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(unixSec * 1000));
  const read = (type: string): number => Number(parts.find((part) => part.type === type)?.value);
  const values = ["year", "month", "day", "hour", "minute", "second"].map(read);
  if (values.some((value) => !Number.isFinite(value))) return null;
  const [y, mo, d, h, mi, s] = values as [number, number, number, number, number, number];
  return Date.UTC(y, mo - 1, d, h, mi, s) / 1000;
}

interface Query {
  from: string;
  to: string;
  at: number | null;
  /** Bumped by "cerca ancora" so the same query refetches. */
  nonce: number;
}

function markersFor(journey: Journey | null, origin: JourneyPlace | null, destination: JourneyPlace | null): MapMarker[] {
  const out: MapMarker[] = [];
  if (origin !== null) {
    out.push({
      id: "origin",
      lat: origin.lat,
      lon: origin.lon,
      kind: "user",
      label: null,
      title: activeDictionary().journey.originMarker(origin.name),
      color: null,
      bearing: null,
      selected: false,
    });
  }
  if (destination !== null) {
    out.push({
      id: "destination",
      lat: destination.lat,
      lon: destination.lon,
      kind: "user",
      label: null,
      title: activeDictionary().journey.destinationMarker(destination.name),
      color: null,
      bearing: null,
      selected: true,
    });
  }
  if (journey === null) return out;
  const seen = new Set<string>();
  for (const leg of journey.legs) {
    if (leg.kind !== "ride") continue;
    for (const point of [leg.from, leg.to]) {
      const id = point.stopId;
      if (id === null || seen.has(id)) continue;
      seen.add(id);
      out.push({
        id: `stop:${id}`,
        lat: point.lat,
        lon: point.lon,
        kind: "stop",
        label: null,
        title: point.name,
        color: leg.route.color === null ? null : `#${leg.route.color.replace(/^#/, "")}`,
        bearing: null,
        selected: false,
      });
    }
  }
  return out;
}

/** Decoding is a pure function over untrusted text: never let it blank the map. */
function safeDecode(encoded: string | null): Array<[number, number]> | null {
  if (encoded === null || encoded.length === 0) return null;
  try {
    const points = decodePolyline(encoded);
    return points.length >= 2 ? points : null;
  } catch (err) {
    console.warn("Tracciato della tratta non decodificabile:", err);
    return null;
  }
}

/**
 * The shape of a ride, once it has proved it belongs to that ride. The server
 * slices it between the two stops, so both ends must land on them; anything
 * else is a stale or wrong answer and drawing it would send the rider down a
 * street their bus never takes.
 */
function shapeOfRide(leg: JourneyRideLeg): Array<[number, number]> | null {
  const points = safeDecode(leg.geometry);
  const head = points === null ? undefined : points[0];
  const tail = points === null ? undefined : points[points.length - 1];
  if (points === null || head === undefined || tail === undefined) return null;
  if (metresBetween(head[0], head[1], leg.from.lat, leg.from.lon) > GEOMETRY_ENDPOINT_M) return null;
  if (metresBetween(tail[0], tail[1], leg.to.lat, leg.to.lon) > GEOMETRY_ENDPOINT_M) return null;
  return points;
}

/**
 * One stroke per leg: a ride follows the line's own shape in the line's colour,
 * a walk is a dashed straight line, which is exactly what we know about it. A
 * ride whose pattern has no usable shape falls back to the straight line, and
 * is dashed too so it never passes for the real route.
 */
function pathsFor(journey: Journey | null): MapPath[] {
  if (journey === null) return [];
  const out: MapPath[] = [];
  for (const leg of journey.legs) {
    const straight: Array<[number, number]> = [
      [leg.from.lat, leg.from.lon],
      [leg.to.lat, leg.to.lon],
    ];
    if (leg.kind === "walk") {
      out.push({ points: straight, color: WALK_COLOR, dashed: true });
      continue;
    }
    const shape = shapeOfRide(leg);
    out.push({
      points: shape ?? straight,
      color: routeColor(leg.route),
      dashed: shape === null,
    });
  }
  return out;
}

/** The planner names the case, the reader's dictionary words it. */
const NOTICE_WORDING: Record<JourneyNotice, (dict: Dictionary) => string> = {
  "no-origin-stops": (dict) => dict.journey.noticeNoOriginStops,
  "no-destination-stops": (dict) => dict.journey.noticeNoDestinationStops,
  "no-connection": (dict) => dict.journey.noticeNoConnection,
  "walk-only-left": (dict) => dict.journey.noticeWalkOnlyLeft,
  "later-departures": (dict) => dict.journey.noticeLaterDepartures,
};

function isJourneyNotice(value: string): value is JourneyNotice {
  return Object.hasOwn(NOTICE_WORDING, value);
}

/** A case this build does not know says nothing, rather than showing its name. */
function noticeText(dict: Dictionary, notice: string | null): string | null {
  if (notice === null || !isJourneyNotice(notice)) return null;
  return NOTICE_WORDING[notice](dict);
}

export default function JourneyView({ initialFrom, initialTo, initialAt }: JourneyViewProps) {
  const t = useT();
  const router = useRouter();
  const timeFieldId = useId();

  const [fromText, setFromText] = useState(initialFrom);
  const [toText, setToText] = useState(initialTo);
  const [leaveNow, setLeaveNow] = useState(initialAt === null);
  const [when, setWhen] = useState(() => toLocalInput(initialAt ?? Math.floor(Date.now() / 1000)));
  const [query, setQuery] = useState<Query | null>(
    initialFrom.length > 0 && initialTo.length > 0
      ? { from: initialFrom, to: initialTo, at: initialAt, nonce: 0 }
      : null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geoTarget, setGeoTarget] = useState<GeoTarget | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const url = useMemo(() => {
    if (query === null) return null;
    const params = new URLSearchParams({ from: query.from, to: query.to });
    if (query.at !== null) params.set("at", String(query.at));
    return `/api/journey?${params.toString()}`;
  }, [query]);

  const { data, error, state } = useJsonResource(url, parseJourneyResponse, query?.nonce ?? 0);
  const loading = url !== null && state === "loading" && data === null;

  const journeys = data?.journeys ?? [];
  const notice = noticeText(t, data?.notice ?? null);
  useEffect(() => {
    setSelectedId(journeys[0]?.id ?? null);
  }, [data]);

  const selected = useMemo(
    () => journeys.find((journey) => journey.id === selectedId) ?? journeys[0] ?? null,
    [journeys, selectedId],
  );

  const submit = useCallback(
    (event?: { preventDefault: () => void }) => {
      event?.preventDefault();
      const from = fromText.trim().slice(0, MAX_TEXT_LENGTH);
      const to = toText.trim().slice(0, MAX_TEXT_LENGTH);
      if (from.length === 0 || to.length === 0) {
        setFormError(t.journey.missingEndpoints);
        return;
      }
      let at: number | null = null;
      if (!leaveNow) {
        at = fromLocalInput(when);
        if (at === null) {
          setFormError(t.journey.badDateTime);
          return;
        }
      }
      setFormError(null);
      setQuery((current) => ({ from, to, at, nonce: (current?.nonce ?? 0) + 1 }));

      const params = new URLSearchParams({ from, to });
      if (at !== null) params.set("at", String(at));
      router.replace(`/journey?${params.toString()}`, { scroll: false });
    },
    [fromText, toText, leaveNow, when, router, t],
  );

  const swap = useCallback(() => {
    setFromText(toText);
    setToText(fromText);
  }, [fromText, toText]);

  const useLocation = useCallback((target: GeoTarget) => {
    setGeoError(null);
    if (typeof navigator === "undefined" || navigator.geolocation === undefined) {
      setGeoError(t.journey.geoUnsupported);
      return;
    }
    setGeoTarget(target);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setGeoTarget(null);
        const { latitude, longitude } = position.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setGeoError(t.journey.geoUnavailable);
          return;
        }
        if (!inServiceArea(latitude, longitude)) {
          setGeoError(t.journey.geoOutsideRome);
          return;
        }
        const text = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        if (target === "from") setFromText(text);
        else setToText(text);
      },
      (cause) => {
        if (!mountedRef.current) return;
        setGeoTarget(null);
        setGeoError(
          cause.code === 1
            ? t.journey.geoDenied
            : cause.code === 3
              ? t.journey.geoTimeout
              : t.journey.geoUnavailable,
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }, [t]);

  const onPick = useCallback((target: GeoTarget, place: JourneyPlace) => {
    const text = encodePlace(place);
    if (target === "from") setFromText(place.stopId !== null ? place.name : text);
    else setToText(place.stopId !== null ? place.name : text);
  }, []);

  const markers = useMemo(
    () => markersFor(selected, data?.origin ?? null, data?.destination ?? null),
    [selected, data],
  );
  const paths = useMemo(() => pathsFor(selected), [selected]);
  // The whole itinerary, drawn geometry included: a route can bulge well
  // outside the box its stops sit in, and half a bend off screen looks broken.
  const fitPoints = useMemo<Array<[number, number]> | null>(() => {
    const points: Array<[number, number]> = markers.map((m) => [m.lat, m.lon]);
    for (const leg of paths) for (const point of leg.points) points.push(point);
    return points.length > 0 ? points : null;
  }, [markers, paths]);

  return (
    // Same shape as /stop: the results column is the point of the page, so it
    // gets --arrivals-col-w, scrolls with the page, and the map sticks beside it.
    <div className="lg:grid lg:grid-cols-[var(--arrivals-col-w)_minmax(0,1fr)] lg:items-start lg:gap-x-5 lg:py-6 xl:gap-x-6">
      <div className="min-w-0">
        <header className="mb-4">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-[1.75rem]">
            {t.journey.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.journey.subtitle}</p>
        </header>

        <form onSubmit={submit} className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex flex-col gap-3">
            <PlaceField
              id="journey-from"
              label={t.journey.from}
              placeholder={t.journey.placeholder}
              value={fromText}
              onChange={setFromText}
              onPick={(place) => onPick("from", place)}
              onUseLocation={() => useLocation("from")}
              locating={geoTarget === "from"}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={swap}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-semibold text-accent hover:bg-accent-soft active:bg-accent-soft"
              >
                <span aria-hidden="true">⇅</span>
                {t.journey.swap}
              </button>
            </div>

            <PlaceField
              id="journey-to"
              label={t.journey.to}
              placeholder={t.journey.placeholder}
              value={toText}
              onChange={setToText}
              onPick={(place) => onPick("to", place)}
              onUseLocation={() => useLocation("to")}
              locating={geoTarget === "to"}
            />

            <fieldset className="mt-1">
              <legend className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
                {t.journey.whenLegend}
              </legend>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-chip border border-line p-0.5" role="group">
                  <button
                    type="button"
                    onClick={() => setLeaveNow(true)}
                    aria-pressed={leaveNow}
                    className={`min-h-10 rounded-[0.5rem] px-3 text-[0.8125rem] font-semibold transition-colors ${
                      leaveNow ? "bg-ink text-bg" : "text-muted hover:bg-surface-2"
                    }`}
                  >
                    {t.journey.now}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveNow(false)}
                    aria-pressed={!leaveNow}
                    className={`min-h-10 rounded-[0.5rem] px-3 text-[0.8125rem] font-semibold transition-colors ${
                      leaveNow ? "text-muted hover:bg-surface-2" : "bg-ink text-bg"
                    }`}
                  >
                    {t.journey.pickTime}
                  </button>
                </div>
                {leaveNow ? null : (
                  <>
                    <label htmlFor={timeFieldId} className="sr-only">
                      {t.journey.timeLabel}
                    </label>
                    <input
                      id={timeFieldId}
                      type="datetime-local"
                      value={when}
                      onChange={(event) => setWhen(event.target.value)}
                      className="min-h-11 flex-1 rounded-chip border border-line bg-surface px-3 text-[0.875rem] font-medium tnum"
                    />
                  </>
                )}
              </div>
            </fieldset>

            {formError !== null ? <ErrorState inline message={formError} /> : null}
            {geoError !== null ? <ErrorState inline message={geoError} /> : null}

            <button
              type="submit"
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[0.9375rem] font-bold text-on-accent transition-transform active:scale-[0.98]"
            >
              {loading ? <IconRefresh size={17} className="animate-spin-slow" /> : null}
              {t.journey.submit}
            </button>
          </div>
        </form>

        <section aria-labelledby="risultati-percorso" className="mt-6">
          <SectionHeader
            id="risultati-percorso"
            title={t.journey.resultsHeading}
            count={journeys.length > 0 ? journeys.length : undefined}
            action={
              url !== null ? (
                <button
                  type="button"
                  onClick={() => submit()}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-[0.75rem] font-semibold text-accent"
                >
                  <IconRefresh size={14} />
                  {t.common.refresh}
                </button>
              ) : undefined
            }
          />

          {url === null ? (
            <EmptyState
              icon={<IconMap size={22} />}
              title={t.journey.emptyTitle}
              hint={t.journey.emptyHint}
            />
          ) : error !== null && data === null ? (
            <ErrorState message={error} onRetry={() => submit()} />
          ) : loading ? (
            <p role="status" className="px-1 py-6 text-sm text-muted">
              {t.journey.searching}
            </p>
          ) : (
            <>
              {notice !== null ? (
                <p
                  role="status"
                  className="mb-3 rounded-chip bg-surface-2 px-3 py-2.5 text-[0.8125rem] leading-snug text-muted"
                >
                  {notice}
                </p>
              ) : null}

              {journeys.length === 0 ? (
                <EmptyState
                  icon={<IconInbox size={22} />}
                  title={t.journey.noResultsTitle}
                  hint={t.journey.noResultsHint}
                />
              ) : (
                <>
                  <ul className="flex flex-col gap-3">
                    {journeys.map((journey, index) => (
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        index={index}
                        selected={selected?.id === journey.id}
                        onSelect={() => setSelectedId(journey.id)}
                      />
                    ))}
                  </ul>

                  <p className="mt-4 flex items-start gap-2 px-1 text-[0.75rem] leading-relaxed text-muted">
                    <span aria-hidden="true" className="mt-0.5 shrink-0">
                      <IconClock size={14} />
                    </span>
                    <span>
                      {t.journey.disclaimer}
                      {data !== null
                        ? t.journey.searchedFrom(formatDateTime(data.departAfter))
                        : ""}
                    </span>
                  </p>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {/* Below lg the map sits under the results; at lg it sticks beside them.
          The subtracted rem are the shell's own lg padding plus the caption. */}
      <div className="mt-6 lg:mt-0 lg:sticky lg:top-6 lg:min-w-0">
        <div className="h-[var(--map-h)] min-h-[var(--map-h-min)] overflow-hidden rounded-card border border-line lg:h-[calc(var(--map-col-h)-4.75rem)]">
          <DynamicMapView
            center={ROME_CENTER}
            zoom={12}
            markers={markers}
            paths={paths}
            fitPoints={fitPoints}
            fitKey={selected?.id ?? null}
            ariaLabel={t.journey.mapAria}
            className="h-full w-full"
          />
        </div>
        <p className="mt-2 px-1 text-[0.6875rem] text-muted">{t.journey.mapCaption}</p>
      </div>
    </div>
  );
}
