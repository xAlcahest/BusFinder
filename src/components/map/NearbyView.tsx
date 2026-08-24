"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_SETTINGS, type NearbyStop } from "@/lib/types";
import { formatDistance } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import FavoriteButton from "@/components/FavoriteButton";
import { radiusChoices } from "@/components/radius";
import { useSettings } from "@/hooks/useSettings";

import DynamicMapView from "./DynamicMapView";
import RouteBadge, { routeColor } from "./RouteBadge";
import {
  errorMessage,
  fetchJson,
  isAbortError,
  parseNearbyStops,
  parseStopFromArrivals,
} from "./api";
import type { LatLon, MapFocus, MapMarker, MapMarkerKind } from "./types";

const ROME_CENTER: LatLon = { lat: 41.9028, lon: 12.4964 };
const MAX_MARKERS = 80;
const MAX_ROWS = 300;
const PAGE_SIZE = 25;
const SEARCH_HERE_THRESHOLD_M = 150;
const MAX_BADGES = 8;

type GeoIssue = "denied" | "unavailable" | "timeout" | "unsupported";
type OriginSource = "gps" | "fallback" | "stop" | "map";

interface Origin extends LatLon {
  source: OriginSource;
}

function geoMessage(issue: GeoIssue, t: Dictionary): string {
  if (issue === "denied") return t.nearby.geoDenied;
  if (issue === "timeout") return t.nearby.geoTimeout;
  if (issue === "unsupported") return t.nearby.geoUnsupported;
  return t.nearby.geoUnavailable;
}

function haversineM(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Same window /api/stops/nearby accepts: outside it the API answers 400. */
function inServiceArea(lat: number, lon: number): boolean {
  return lat >= 40.5 && lat <= 43.0 && lon >= 11.0 && lon <= 14.2;
}

function clampRadius(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.nearbyRadius;
  return Math.min(3000, Math.max(100, Math.round(value)));
}

function geoIssueFor(code: number): GeoIssue {
  if (code === 1) return "denied";
  if (code === 3) return "timeout";
  return "unavailable";
}

export default function NearbyView({ focusStopId }: { focusStopId: string | null }) {
  const t = useT();
  const { settings, update } = useSettings();
  const radius = clampRadius(settings.nearbyRadius);

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [userPos, setUserPos] = useState<LatLon | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoIssue, setGeoIssue] = useState<GeoIssue | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [areaNotice, setAreaNotice] = useState<string | null>(null);

  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [stopsError, setStopsError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLon | null>(null);
  const [scrollTarget, setScrollTarget] = useState<{ id: string; nonce: number } | null>(null);

  const mountedRef = useRef(true);
  const focusSeqRef = useRef(0);
  const scrollSeqRef = useRef(0);
  const stopsRef = useRef<NearbyStop[]>([]);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    stopsRef.current = stops;
  }, [stops]);

  const moveMapTo = useCallback((lat: number, lon: number, zoom?: number) => {
    focusSeqRef.current += 1;
    setFocus({ lat, lon, zoom, nonce: focusSeqRef.current });
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || navigator.geolocation === undefined) {
      setGeoIssue("unsupported");
      setOrigin({ ...ROME_CENTER, source: "fallback" });
      return;
    }
    setLocating(true);
    setGeoIssue(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setLocating(false);
        const here = { lat: position.coords.latitude, lon: position.coords.longitude };
        if (!Number.isFinite(here.lat) || !Number.isFinite(here.lon)) {
          setGeoIssue("unavailable");
          setOrigin({ ...ROME_CENTER, source: "fallback" });
          return;
        }
        setUserPos(here);
        if (!inServiceArea(here.lat, here.lon)) {
          setAreaNotice(t.nearby.outsideRome);
          setOrigin((current) => current ?? { ...ROME_CENTER, source: "fallback" });
          return;
        }
        setAreaNotice(null);
        setOrigin({ ...here, source: "gps" });
        moveMapTo(here.lat, here.lon, 16);
      },
      (error) => {
        if (!mountedRef.current) return;
        setLocating(false);
        setGeoIssue(geoIssueFor(error.code));
        setOrigin((current) => current ?? { ...ROME_CENTER, source: "fallback" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, [moveMapTo, t]);

  // ?focus=<stopId>: centre on that stop instead of asking for the position.
  useEffect(() => {
    if (focusStopId === null) {
      requestLocation();
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    const run = async (): Promise<void> => {
      try {
        const body = await fetchJson(
          `/api/arrivals/${encodeURIComponent(focusStopId)}`,
          controller.signal,
        );
        const stop = parseStopFromArrivals(body);
        if (cancelled || !mountedRef.current) return;
        if (stop === null) {
          setNotice(t.nearby.focusStopMissing);
          requestLocation();
          return;
        }
        setOrigin({ lat: stop.lat, lon: stop.lon, source: "stop" });
        setSelectedId(stop.stopId);
        moveMapTo(stop.lat, stop.lon, 17);
      } catch (err) {
        if (cancelled || isAbortError(err) || !mountedRef.current) return;
        setNotice(t.nearby.focusStopFailed(errorMessage(err)));
        requestLocation();
      }
    };
    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [focusStopId, requestLocation, moveMapTo, t]);

  const originLat = origin?.lat ?? null;
  const originLon = origin?.lon ?? null;

  useEffect(() => {
    if (originLat === null || originLon === null) return;
    if (!inServiceArea(originLat, originLon)) {
      setStops([]);
      setStopsError(null);
      setLoadingStops(false);
      setAreaNotice(t.nearby.outsideCoverage);
      return;
    }
    setAreaNotice(null);

    const controller = new AbortController();
    let cancelled = false;
    setLoadingStops(true);
    setStopsError(null);

    const url = `/api/stops/nearby?lat=${originLat.toFixed(6)}&lon=${originLon.toFixed(6)}&radius=${radius}`;
    fetchJson(url, controller.signal)
      .then((body) => {
        if (cancelled || !mountedRef.current) return;
        const parsed = parseNearbyStops(body);
        if (parsed === null) {
          setStops([]);
          setStopsError(t.errors.badResponseDot);
          return;
        }
        setStops(parsed.slice(0, MAX_ROWS));
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err: unknown) => {
        if (cancelled || isAbortError(err) || !mountedRef.current) return;
        setStops([]);
        setStopsError(errorMessage(err));
      })
      .finally(() => {
        if (cancelled || !mountedRef.current) return;
        setLoadingStops(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [originLat, originLon, radius, t]);

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    if (userPos !== null) {
      list.push({
        id: "__user__",
        lat: userPos.lat,
        lon: userPos.lon,
        kind: "user",
        label: null,
        title: t.map.yourPosition,
        color: null,
        bearing: null,
        selected: false,
      });
    }
    for (const stop of stops.slice(0, MAX_MARKERS)) {
      const first = stop.routes[0];
      list.push({
        id: stop.stopId,
        lat: stop.lat,
        lon: stop.lon,
        kind: "stop",
        label: null,
        title: stop.stopName,
        color: first === undefined ? null : routeColor(first),
        bearing: null,
        selected: stop.stopId === selectedId,
      });
    }
    return list;
  }, [stops, userPos, selectedId, t]);

  const handleMarkerSelect = useCallback((id: string, kind: MapMarkerKind) => {
    if (kind !== "stop") return;
    const index = stopsRef.current.findIndex((s) => s.stopId === id);
    if (index >= 0) {
      setVisibleCount((count) => Math.max(count, Math.ceil((index + 1) / PAGE_SIZE) * PAGE_SIZE));
    }
    setSelectedId(id);
    scrollSeqRef.current += 1;
    setScrollTarget({ id, nonce: scrollSeqRef.current });
  }, []);

  useEffect(() => {
    if (scrollTarget === null) return;
    rowRefs.current.get(scrollTarget.id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  const handleUserMove = useCallback((center: LatLon) => {
    setMapCenter(center);
  }, []);

  const searchHereDistance =
    mapCenter !== null && origin !== null ? haversineM(mapCenter, origin) : 0;
  const canSearchHere = mapCenter !== null && searchHereDistance > SEARCH_HERE_THRESHOLD_M;

  const visibleStops = stops.slice(0, visibleCount);
  const hasMore = stops.length > visibleStops.length;
  const radiusOptions = radiusChoices(radius);

  return (
    // At lg the page is two columns: the map spans both rows on the right and
    // only the left column scrolls.
    <div className="flex flex-col gap-3 lg:grid lg:h-[var(--map-col-h)] lg:grid-cols-[min(var(--list-col-w),40%)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-5">
      <header className="flex items-baseline justify-between gap-2 lg:col-start-1 lg:row-start-1">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">
          {t.nearby.title}
        </h1>
        <Link href="/" className="text-sm font-semibold text-accent underline underline-offset-2">
          {t.common.home}
        </Link>
      </header>

      <div className="relative h-[42vh] min-h-56 w-full overflow-hidden rounded-card border border-line lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-0">
        <DynamicMapView
          center={ROME_CENTER}
          zoom={12}
          markers={markers}
          focus={focus}
          onMarkerSelect={handleMarkerSelect}
          onUserMove={handleUserMove}
          ariaLabel={t.nearby.mapAria}
        />
        {canSearchHere ? (
          <button
            type="button"
            onClick={() => {
              if (mapCenter === null) return;
              setOrigin({ ...mapCenter, source: "map" });
              setMapCenter(null);
            }}
            className="absolute bottom-8 left-1/2 min-h-11 -translate-x-1/2 rounded-full bg-accent px-4 text-sm font-bold text-on-accent shadow-card"
          >
            {t.nearby.searchHere}
          </button>
        ) : null}
      </div>

      {/* `contents` below lg so the phone stack keeps the exact same flow; at lg
          this is the only column that scrolls. */}
      <div className="contents lg:col-start-1 lg:row-start-2 lg:flex lg:min-h-0 lg:flex-col lg:gap-3 lg:overflow-y-auto lg:overscroll-contain lg:pe-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted">
            {t.nearby.radius}
          </span>
          {radiusOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={radius === option}
              onClick={() => update({ nearbyRadius: option })}
              className={
                radius === option
                  ? "min-h-11 rounded-full bg-accent px-3.5 text-sm font-bold text-on-accent"
                  : "min-h-11 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
              }
            >
              {formatDistance(option)}
            </button>
          ))}
          <button
            type="button"
            onClick={requestLocation}
            disabled={locating}
            className="ms-auto min-h-11 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold transition-colors hover:bg-surface-2 disabled:opacity-60"
          >
            {locating ? t.nearby.locating : t.nearby.myPosition}
          </button>
        </div>

        <div aria-live="polite" className="flex flex-col gap-2 text-sm">
          {geoIssue !== null ? (
            <p className="rounded-chip bg-late-soft px-3 py-2 text-late">{geoMessage(geoIssue, t)}</p>
          ) : null}
          {areaNotice !== null ? (
            <p className="rounded-chip bg-late-soft px-3 py-2 text-late">{areaNotice}</p>
          ) : null}
          {notice !== null ? (
            <p className="rounded-chip bg-surface-2 px-3 py-2">{notice}</p>
          ) : null}
          {stopsError !== null ? (
            <p className="rounded-chip bg-danger-soft px-3 py-2 text-danger">
              {t.nearby.stopsFailed(stopsError)}
            </p>
          ) : null}
          {loadingStops ? <p className="text-muted">{t.nearby.loadingStops}</p> : null}
          {!loadingStops && stopsError === null && areaNotice === null && stops.length === 0 && origin !== null ? (
            <p className="text-muted">{t.nearby.noStopsInRadius(formatDistance(radius))}</p>
          ) : null}
        </div>

        {stops.length > 0 ? (
          <p className="text-sm text-muted">
            {t.stops.countLabel(stops.length)}
            {stops.length > MAX_MARKERS ? t.nearby.onMapCap(MAX_MARKERS) : ""}
          </p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {visibleStops.map((stop) => {
            const selected = stop.stopId === selectedId;
            return (
              <li
                key={stop.stopId}
                ref={(el) => {
                  if (el === null) rowRefs.current.delete(stop.stopId);
                  else rowRefs.current.set(stop.stopId, el);
                }}
                className={
                  selected
                    ? "flex items-stretch gap-2 rounded-card border-2 border-accent bg-surface shadow-card"
                    : "flex items-stretch gap-2 rounded-card border border-line bg-surface shadow-card transition-colors hover:bg-surface-2"
                }
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSelectedId(stop.stopId);
                    moveMapTo(stop.lat, stop.lon, 17);
                  }}
                  className="flex min-w-0 flex-1 flex-col items-start gap-1 px-3 py-[var(--row-py)] text-start"
                >
                  <span className="flex w-full items-baseline justify-between gap-2">
                    <span className="truncate font-semibold caps-data">{stop.stopName}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {formatDistance(stop.distanceM)}
                    </span>
                  </span>
                  {stop.stopCode !== null ? (
                    <span className="text-xs text-muted">{t.stops.pole(stop.stopCode)}</span>
                  ) : null}
                  <span className="flex flex-wrap gap-1">
                    {stop.routes.slice(0, MAX_BADGES).map((route) => (
                      <RouteBadge key={route.routeId} route={route} />
                    ))}
                    {stop.routes.length > MAX_BADGES ? (
                      <span className="self-center text-xs text-muted">
                        +{stop.routes.length - MAX_BADGES}
                      </span>
                    ) : null}
                    {stop.routes.length === 0 ? (
                      <span className="text-xs text-muted">{t.nearby.noLines}</span>
                    ) : null}
                  </span>
                </button>
                {/* Saving a stop must not cost a page load: the star is on the
                    row itself, before the link that opens it. */}
                <div className="flex shrink-0 items-center border-s border-line px-2">
                  <FavoriteButton kind="stop" id={stop.stopId} name={stop.stopName} size="row" />
                </div>
                <Link
                  href={`/stop/${encodeURIComponent(stop.stopId)}`}
                  className="flex shrink-0 items-center border-s border-line px-4 text-sm font-semibold text-accent"
                >
                  {t.nearby.arrivalsLink}
                </Link>
              </li>
            );
          })}
        </ul>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="min-h-12 rounded-card border border-line bg-surface px-4 font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            {t.nearby.showMoreStops}
          </button>
        ) : null}
      </div>
    </div>
  );
}
