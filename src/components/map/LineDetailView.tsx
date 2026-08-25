"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_SETTINGS, type LineDetail, type Vehicle } from "@/lib/types";
import { formatClock } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import { decodePolyline } from "@/lib/polyline";
import AlertsForContext from "@/components/AlertsForContext";
import FavoriteButton from "@/components/FavoriteButton";
import { displayLineName } from "@/components/LineBadge";
import { useNow } from "@/components/hooks";
import { refreshLineFavorite } from "@/lib/storage";
import { useSettings } from "@/hooks/useSettings";

import DynamicMapView from "./DynamicMapView";
import { NextDepartures, useLineService } from "./LineService";
import RouteBadge, { routeColor } from "./RouteBadge";
import {
  errorMessage,
  fetchJson,
  isAbortError,
  parseLineDetail,
  parseVehiclesResponse,
} from "./api";
import type { LatLon, MapFocus, MapMarker, MapMarkerKind } from "./types";

const ROME_CENTER: LatLon = { lat: 41.9028, lon: 12.4964 };
const MAX_STOP_MARKERS = 160;
const MAX_VEHICLE_MARKERS = 200;
const STOP_PAGE_SIZE = 150;
/** Upper bound on one vehicles request, well above any healthy response. */
const REQUEST_TIMEOUT_MS = 20_000;

function clampRefresh(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.refreshInterval;
  return Math.min(120, Math.max(10, Math.round(value)));
}

/** Decoding is a pure function over untrusted text: never let it kill the page. */
function safeDecode(encoded: string | null): Array<[number, number]> | null {
  if (encoded === null || encoded.length === 0) return null;
  let points: Array<[number, number]>;
  try {
    points = decodePolyline(encoded);
  } catch (err) {
    console.warn("Polyline could not be decoded:", errorMessage(err));
    return null;
  }
  if (!Array.isArray(points)) return null;
  const clean: Array<[number, number]> = [];
  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const [lat, lon] = point;
    if (typeof lat !== "number" || typeof lon !== "number") continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
    clean.push([lat, lon]);
  }
  return clean.length > 1 ? clean : null;
}

function ageLabel(feedTimestamp: number | null, fetchedAt: number, t: Dictionary): string {
  if (feedTimestamp !== null && feedTimestamp > 0) {
    return t.line.dataAt(formatClock(feedTimestamp));
  }
  return t.line.updatedAt(formatClock(Math.round(fetchedAt / 1000)));
}

export default function LineDetailView({
  routeId,
  initialDirection,
}: {
  routeId: string;
  initialDirection: number | null;
}) {
  const t = useT();
  const { settings } = useSettings();
  const refreshSec = clampRefresh(settings.refreshInterval);

  const [requestedDirection, setRequestedDirection] = useState<number | null>(initialDirection);
  const [detail, setDetail] = useState<LineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [feedTimestamp, setFeedTimestamp] = useState<number | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  // Selection is by position, not by id: a circular line calls at a stop twice.
  const nowMs = useNow(30_000);
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [visibleStops, setVisibleStops] = useState(STOP_PAGE_SIZE);
  const [scrollTarget, setScrollTarget] = useState<{ index: number; nonce: number } | null>(null);

  const mountedRef = useRef(true);
  const focusSeqRef = useRef(0);
  const scrollSeqRef = useRef(0);
  const rowRefs = useRef<Map<number, HTMLLIElement>>(new Map());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const moveMapTo = useCallback((lat: number, lon: number, zoom?: number) => {
    focusSeqRef.current += 1;
    setFocus({ lat, lon, zoom, nonce: focusSeqRef.current });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = requestedDirection === null ? "" : `?direction=${requestedDirection}`;
    fetchJson(`/api/line/${encodeURIComponent(routeId)}${query}`, controller.signal)
      .then((body) => {
        if (cancelled || !mountedRef.current) return;
        const parsed = parseLineDetail(body);
        if (parsed === null) {
          setDetail(null);
          setError(t.errors.badResponseDot);
          return;
        }
        setDetail(parsed);
        setVisibleStops(STOP_PAGE_SIZE);
        setSelectedStop(null);
      })
      .catch((err: unknown) => {
        if (cancelled || isAbortError(err) || !mountedRef.current) return;
        setDetail(null);
        setError(errorMessage(err));
      })
      .finally(() => {
        if (cancelled || !mountedRef.current) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routeId, requestedDirection, t]);

  // Live vehicles: chained timeout so a slow answer never stacks requests.
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending: AbortController | null = null;

    const schedule = (): void => {
      if (cancelled) return;
      timer = setTimeout(() => void tick(), refreshSec * 1000);
    };

    const tick = async (): Promise<void> => {
      if (cancelled || inFlight) return;
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }
      inFlight = true;
      // A socket that stalls without an RST (phone losing signal) would
      // otherwise hold inFlight forever and kill the chain.
      const controller = new AbortController();
      pending = controller;
      let timedOut = false;
      const guard = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
      try {
        const body = await fetchJson(
          `/api/vehicles?routeId=${encodeURIComponent(routeId)}`,
          controller.signal,
        );
        if (cancelled || !mountedRef.current) return;
        const parsed = parseVehiclesResponse(body);
        if (parsed === null) {
          setVehiclesError(t.errors.badResponseDot);
        } else {
          setVehicles(parsed.vehicles.slice(0, MAX_VEHICLE_MARKERS));
          setFeedTimestamp(parsed.feedTimestamp);
          setDegraded(parsed.degraded);
          setVehiclesError(null);
        }
        setFetchedAt(Date.now());
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        if (timedOut) setVehiclesError(t.errors.timedOutDot);
        else if (!isAbortError(err)) setVehiclesError(errorMessage(err));
      } finally {
        clearTimeout(guard);
        if (pending === controller) pending = null;
        inFlight = false;
        schedule();
      }
    };

    void tick();
    const onVisible = (): void => {
      if (document.visibilityState !== "visible") return;
      // A request is already running: its finally reschedules the chain, and
      // dropping the pending timer here would leave nothing to fall back on.
      if (inFlight) return;
      if (timer !== null) clearTimeout(timer);
      void tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      pending?.abort();
      if (timer !== null) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [routeId, refreshSec, t]);

  const path = useMemo(() => safeDecode(detail?.polyline ?? null), [detail?.polyline]);
  const stops = useMemo(() => detail?.stops ?? [], [detail]);
  const activeDirection = detail?.activeDirection ?? 0;
  const lineColor = detail === null ? "#1d4ed8" : routeColor(detail.route);

  const fitPoints = useMemo<Array<[number, number]> | null>(() => {
    if (path !== null) return path;
    if (stops.length === 0) return null;
    return stops.map((stop): [number, number] => [stop.lat, stop.lon]);
  }, [path, stops]);

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    stops.slice(0, MAX_STOP_MARKERS).forEach((stop, index) => {
      list.push({
        id: `stop:${index}`,
        lat: stop.lat,
        lon: stop.lon,
        kind: "stop",
        label: null,
        title: stop.stopName,
        color: lineColor,
        bearing: null,
        selected: index === selectedStop,
      });
    });
    const badge = detail?.route.shortName ?? null;
    for (const vehicle of vehicles) {
      list.push({
        id: `veh:${vehicle.vehicleId}`,
        lat: vehicle.lat,
        lon: vehicle.lon,
        kind: "vehicle",
        label: badge ?? vehicle.routeShortName,
        // vehicleId is the internal identity ("1001#3742"); the rider gets the painted label.
        title: t.map.vehicleTitle(vehicle.vehicleLabel ?? vehicle.vehicleId),
        color: lineColor,
        bearing: vehicle.bearing,
        selected: false,
      });
    }
    return list;
  }, [stops, vehicles, selectedStop, lineColor, detail?.route.shortName, t]);

  const handleMarkerSelect = useCallback((id: string, kind: MapMarkerKind) => {
    if (kind !== "stop") return;
    const index = Number.parseInt(id.slice("stop:".length), 10);
    if (!Number.isInteger(index) || index < 0) return;
    setSelectedStop(index);
    setVisibleStops((count) => Math.max(count, Math.ceil((index + 1) / STOP_PAGE_SIZE) * STOP_PAGE_SIZE));
    scrollSeqRef.current += 1;
    setScrollTarget({ index, nonce: scrollSeqRef.current });
  }, []);

  useEffect(() => {
    if (scrollTarget === null) return;
    rowRefs.current
      .get(scrollTarget.index)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  const switchDirection = (direction: number): void => {
    if (direction === activeDirection) return;
    setRequestedDirection(direction);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("direction", String(direction));
      window.history.replaceState(null, "", url.toString());
    }
  };

  const service = useLineService({
    routeId,
    originStop: stops[0] ?? null,
    vehicleCount: vehicles.length,
    degraded,
    vehiclesError,
    vehiclesLoaded: fetchedAt !== null || vehiclesError !== null,
    nowMs,
  });

  const shownStops = stops.slice(0, visibleStops);
  // The short name riders use ("MA", not "MEA"). The raw id stands in until the
  // detail lands, so nothing ever renders "Linea Linea 503".
  const lineName =
    detail === null ? routeId : displayLineName(detail.route.shortName, detail.route.routeType);
  const routeType = detail?.route.routeType ?? null;
  const routeColorHex = detail?.route.color ?? null;

  // A line starred before its detail arrived holds the raw id and no colours.
  useEffect(() => {
    if (detail === null) return;
    refreshLineFavorite(routeId, { name: lineName, routeType, color: routeColorHex });
  }, [detail, routeId, lineName, routeType, routeColorHex]);

  return (
    // At lg the page is two columns: stop sequence left, path and vehicles
    // right. The map cell spans every row so it fills the viewport height.
    <div className="flex flex-col gap-3 lg:grid lg:h-[var(--map-col-h)] lg:grid-cols-[min(var(--list-col-w),40%)_minmax(0,1fr)] lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-x-5">
      <header className="flex items-center gap-3 lg:col-start-1 lg:row-start-1">
        {detail !== null ? <RouteBadge route={detail.route} large /> : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-[-0.02em] caps-data">
            {detail?.route.longName ?? t.lines.named(lineName)}
          </h1>
          {detail !== null ? (
            <p className="truncate text-sm text-muted">
              {t.lines.typeShort(detail.route.routeType)}
              {detail.agencyName.length > 0 ? ` · ${detail.agencyName}` : ""}
            </p>
          ) : null}
        </div>
        {/* The star for the line itself, beside its name and never in a menu:
            the same gesture as on a stop, in the same relative position. */}
        <FavoriteButton
          kind="line"
          id={routeId}
          name={lineName}
          routeType={routeType}
          color={routeColorHex}
          withLabel
        />
        <Link
          href="/"
          className="hidden shrink-0 text-sm font-semibold text-accent underline underline-offset-2 lg:inline"
        >
          {t.common.home}
        </Link>
      </header>

      {/* `contents` below lg keeps the phone stack untouched; at lg this is the
          fixed head of the left column, above the scrolling stop sequence. */}
      <div className="contents lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:gap-3">
        {loading && detail === null ? <p className="text-muted">{t.line.loading}</p> : null}

        {error !== null ? (
          <p className="rounded-chip bg-danger-soft px-3 py-2 text-danger">
            {t.line.loadFailed(error)}
          </p>
        ) : null}

        {/* Capped at lg: a line with many alerts would otherwise push the stop
            sequence out of the column. */}
        <div className="contents lg:block lg:max-h-44 lg:overflow-y-auto lg:overscroll-contain lg:rounded-card">
          <AlertsForContext routeId={routeId} />
        </div>

        {detail !== null && detail.directions.length > 0 ? (
          <div
            className="flex flex-col gap-1 rounded-card lg:border lg:border-line lg:bg-surface-2 lg:p-1.5"
            role="group"
            aria-label={t.lines.direction}
          >
            <span className="hidden px-1.5 pt-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted lg:block">
              {t.lines.direction}
            </span>
            {detail.directions.map((direction) => {
              const active = direction.directionId === activeDirection;
              return (
                <button
                  key={direction.directionId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchDirection(direction.directionId)}
                  disabled={loading}
                  className={
                    active
                      ? "flex min-h-12 items-center gap-2 rounded-card bg-accent px-3 text-start font-bold text-on-accent disabled:opacity-70"
                      : "flex min-h-12 items-center gap-2 rounded-card border border-line bg-surface px-3 text-start font-semibold transition-colors hover:bg-surface-2 disabled:opacity-70"
                  }
                >
                  <span aria-hidden="true">{active ? "▸" : "▹"}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {t.lines.towardsCapital(
                      direction.headsign.length > 0 ? direction.headsign : t.lines.terminus,
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Map plus its live-vehicle strip: one cell, spanning every row at lg. */}
      <div className="contents lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:min-h-0 lg:flex-col lg:gap-3">
        <div className="h-[42vh] min-h-56 w-full overflow-hidden rounded-card border border-line lg:h-auto lg:min-h-0 lg:flex-1">
          <DynamicMapView
            center={ROME_CENTER}
            zoom={11}
            markers={markers}
            path={path}
            pathColor={lineColor}
            fitPoints={fitPoints}
            fitKey={detail === null ? null : `${routeId}:${activeDirection}:${stops.length}`}
            focus={focus}
            onMarkerSelect={handleMarkerSelect}
            ariaLabel={t.line.mapAria(lineName)}
          />
        </div>

        <div aria-live="polite" className="flex flex-col gap-2 text-sm lg:shrink-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{service.title}</span>
            {fetchedAt !== null ? (
              <span className="text-muted">{ageLabel(feedTimestamp, fetchedAt, t)}</span>
            ) : null}
            {vehiclesError !== null ? (
              <span className="text-danger">{t.line.vehiclesStale(vehiclesError)}</span>
            ) : null}
            {detail !== null && path === null ? (
              <span className="text-muted">{t.line.noPathForDirection}</span>
            ) : null}
          </div>
          {service.detail !== null ? <p className="text-muted">{service.detail}</p> : null}
          <NextDepartures service={service} />
        </div>
      </div>

      {detail !== null ? (
        <div className="contents lg:col-start-1 lg:row-start-3 lg:flex lg:min-h-0 lg:flex-col lg:gap-3 lg:overflow-y-auto lg:overscroll-contain lg:pe-1">
          <h2 className="mt-1 text-base font-bold lg:mt-0">{t.line.stopsHeading(stops.length)}</h2>
          {stops.length === 0 ? (
            <p className="text-muted">{t.line.noStopsForDirection}</p>
          ) : null}
          <ul className="flex flex-col gap-1.5">
            {shownStops.map((stop, index) => {
              const selected = index === selectedStop;
              return (
                <li
                  key={`${stop.stopId}-${index}`}
                  ref={(el) => {
                    if (el === null) rowRefs.current.delete(index);
                    else rowRefs.current.set(index, el);
                  }}
                  className={
                    selected
                      ? "flex items-stretch gap-2 rounded-card border-2 border-accent bg-surface"
                      : "flex items-stretch gap-2 rounded-card border border-line bg-surface transition-colors hover:bg-surface-2"
                  }
                >
                  <Link
                    href={`/stop/${encodeURIComponent(stop.stopId)}`}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-[var(--row-py)]"
                  >
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-full border-2 border-white"
                      style={{ backgroundColor: lineColor }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold caps-data">{stop.stopName}</span>
                      {stop.stopCode !== null ? (
                        <span className="block text-xs text-muted">{t.stops.pole(stop.stopCode)}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{index + 1}</span>
                  </Link>
                  {/* Browsing a line is when you decide a stop is worth keeping:
                      save it from here, without opening it first. */}
                  <div className="flex shrink-0 items-center border-s border-line px-2">
                    <FavoriteButton kind="stop" id={stop.stopId} name={stop.stopName} size="row" />
                  </div>
                  <button
                    type="button"
                    aria-label={t.map.showOnMap(stop.stopName)}
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedStop(index);
                      moveMapTo(stop.lat, stop.lon, 17);
                    }}
                    className="shrink-0 border-s border-line px-4 text-lg text-muted active:bg-surface-2"
                  >
                    <span aria-hidden="true">◎</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {stops.length > shownStops.length ? (
            <button
              type="button"
              onClick={() => setVisibleStops((count) => count + STOP_PAGE_SIZE)}
              className="min-h-12 rounded-card border border-line bg-surface px-4 font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
            >
              {t.line.showAllStops}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
