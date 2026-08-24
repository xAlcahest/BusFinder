"use client";

/**
 * Live map for one stop: the stop itself plus the vehicles either inbound to
 * it or running on the lines that serve it. Client-only, because MapView pulls
 * in maplibre-gl and that touches `window` at import time.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LineBadge, { displayLineName } from "@/components/LineBadge";
import { parseStop, useVehiclePoll } from "@/components/api";
import { useIsDesktop, useNow } from "@/components/hooks";
import { formatClock, formatMinutes } from "@/lib/format";
import { activeDictionary, useT } from "@/lib/i18n";
import { metresBetween } from "@/lib/pathmotion";
import type { Stop, StopVehicle, StopVehiclesResponse } from "@/lib/types";

import DynamicMapView from "./DynamicMapView";
import FollowBanner, { type FollowState } from "./FollowBanner";
import { cssColor } from "./RouteBadge";
import { VEHICLE_MARKER_PREFIX, useVehicleMotion } from "./motion";
import type { MapFocus, MapMarker, MapMarkerKind } from "./types";

type Mode = "approaching" | "all";

/** Vehicles within this range are framed on open; the rest need the button. */
const NEAR_FIT_M = 2500;
/** Frame at least this many, so a quiet stop still shows where its buses are. */
const MIN_FIT_VEHICLES = 4;

/** Session-only: a map left open on one stop should not follow the user forever. */
const SESSION_KEY = "probus.stopmap.v1";
/** Same ceiling the API enforces, so a fat payload cannot melt the phone. */
const MAX_MARKERS = 250;
/** Feed ages at which the position pill stops claiming to be live. */
const FEED_STALE_SEC = 180;
/** Zoom applied when follow mode starts: close enough to read the street. */
const FOLLOW_ZOOM = 16.5;
/** Past this, the followed vehicle's own fix is too old to be called live. */
const FOLLOW_STALE_SEC = 120;
/** How long the prediction has to sit still before the banner admits it. */
const HELD_BANNER_SEC = 12;
const TYPE_FALLBACK: Record<number, string> = {
  0: "#c2410c",
  1: "#b91c1c",
  2: "#0369a1",
  3: "#1e3a8a",
};
/** Alpha suffix for vehicles that are on the line but not inbound here. */
const ON_LINE_ALPHA = "66";

// --- wire parsing -----------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFinite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseStopVehicle(raw: unknown): StopVehicle | null {
  if (!isRecord(raw)) return null;
  const vehicleId = typeof raw.vehicleId === "string" && raw.vehicleId.length > 0 ? raw.vehicleId : null;
  const lat = asFinite(raw.lat);
  const lon = asFinite(raw.lon);
  const timestamp = asFinite(raw.timestamp);
  const relation = raw.relation === "approaching" || raw.relation === "onLine" ? raw.relation : null;
  if (vehicleId === null || lat === null || lon === null || relation === null) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return {
    vehicleId,
    vehicleLabel: asNonEmptyString(raw.vehicleLabel),
    tripId: asNullableString(raw.tripId),
    routeId: asNullableString(raw.routeId),
    routeShortName: asNullableString(raw.routeShortName),
    lat,
    lon,
    bearing: asFinite(raw.bearing),
    timestamp: timestamp ?? 0,
    relation,
    minutesAway: asFinite(raw.minutesAway),
    arrivalTime: asFinite(raw.arrivalTime),
    headsign: asNullableString(raw.headsign),
    routeColor: asNullableString(raw.routeColor),
    routeType: asFinite(raw.routeType),
  };
}

export function parseStopVehiclesResponse(raw: unknown): StopVehiclesResponse | null {
  if (!isRecord(raw)) return null;
  const stop = parseStop(raw.stop);
  const mode = raw.mode === "approaching" || raw.mode === "all" ? raw.mode : null;
  if (stop === null || mode === null) return null;
  const vehicles: StopVehicle[] = [];
  if (Array.isArray(raw.vehicles)) {
    for (const item of raw.vehicles) {
      if (vehicles.length >= MAX_MARKERS) break;
      const parsed = parseStopVehicle(item);
      if (parsed !== null) vehicles.push(parsed);
    }
  }
  return {
    stop,
    mode,
    vehicles,
    feedTimestamp: asFinite(raw.feedTimestamp),
    degraded: typeof raw.degraded === "boolean" ? raw.degraded : false,
  };
}

// --- presentation helpers ---------------------------------------------------

function lineLabel(vehicle: StopVehicle): string {
  if (vehicle.routeShortName === null || vehicle.routeShortName.length === 0) {
    return vehicle.routeId ?? "?";
  }
  return displayLineName(vehicle.routeShortName, vehicle.routeType ?? 3);
}

function vehicleColor(vehicle: StopVehicle): string {
  const base = cssColor(vehicle.routeColor, TYPE_FALLBACK[vehicle.routeType ?? 3] ?? "#334155");
  return vehicle.relation === "approaching" ? base : `${base}${ON_LINE_ALPHA}`;
}

function vehicleTitle(vehicle: StopVehicle, followed: boolean): string {
  const t = activeDictionary();
  const line = lineLabel(vehicle);
  if (vehicle.relation !== "approaching" || vehicle.minutesAway === null) {
    return t.map.vehicleTitleOnLine(line, followed);
  }
  return t.map.vehicleTitleInbound(line, formatMinutes(vehicle.minutesAway), followed);
}

/** Kept apart from the live vehicle so the banner can still name a lost line. */
interface FollowInfo {
  shortName: string;
  routeType: number;
  color: string | null;
  headsign: string | null;
}

function followInfoOf(vehicle: StopVehicle): FollowInfo {
  return {
    shortName: vehicle.routeShortName ?? vehicle.routeId ?? "?",
    routeType: vehicle.routeType ?? 3,
    color: vehicle.routeColor,
    headsign: vehicle.headsign,
  };
}

function sameFollowInfo(a: FollowInfo, b: FollowInfo): boolean {
  return (
    a.shortName === b.shortName &&
    a.routeType === b.routeType &&
    a.color === b.color &&
    a.headsign === b.headsign
  );
}

function readSessionState(): { open: boolean; mode: Mode } | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    return {
      open: parsed.open === true,
      mode: parsed.mode === "all" ? "all" : "approaching",
    };
  } catch {
    // Private mode, quota, or a hand-edited value: the defaults are fine.
    return null;
  }
}

function writeSessionState(state: { open: boolean; mode: Mode }): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // Persisting the preference is a nicety; never break the map over it.
  }
}

// --- component --------------------------------------------------------------

export interface StopMapProps {
  stopId: string;
  /** Comes from the arrivals response, so the map opens already centred. */
  stop: Stop | null;
  /** Bumped by the page poll: drives the refresh on the settings interval. */
  nonce: number;
  /** Trip highlighted in the arrivals list; the map mirrors it on its markers. */
  selectedTripId?: string | null;
  /** Fires when the map changes which trip is highlighted. */
  onSelectTrip?: (tripId: string | null) => void;
  className?: string;
}

export default function StopMap({
  stopId,
  stop,
  nonce,
  selectedTripId = null,
  onSelectTrip,
  className,
}: StopMapProps) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const [fitScope, setFitScope] = useState<"near" | "all">("near");
  const autoFitRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  // At lg the map is furniture, not a disclosure: the column exists to hold it,
  // so it is always open there and the toggle is hidden.
  const mapOpen = isDesktop || open;
  const [mode, setMode] = useState<Mode>("approaching");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [fitNonce, setFitNonce] = useState(0);
  const firstWriteRef = useRef(true);
  const focusSeqRef = useRef(0);
  const [followId, setFollowId] = useState<string | null>(null);
  const [followPaused, setFollowPaused] = useState(false);
  const [followInfo, setFollowInfo] = useState<FollowInfo | null>(null);
  // Set for the one camera move that opens follow mode: only that one picks the
  // zoom, every later one leaves it to the user.
  const followZoomRef = useRef(false);
  const followResumeRef = useRef(false);
  const now = useNow(15_000);

  // Restore after hydration only: reading sessionStorage during render would
  // make the server and client markup disagree.
  useEffect(() => {
    const stored = readSessionState();
    if (stored === null) return;
    setOpen(stored.open);
    setMode(stored.mode);
  }, []);

  useEffect(() => {
    // Skip the mount pass: it still holds the defaults and would overwrite the
    // stored choice before the restore above lands.
    if (firstWriteRef.current) {
      firstWriteRef.current = false;
      return;
    }
    writeSessionState({ open, mode });
  }, [open, mode]);

  const url =
    mapOpen && stop !== null
      ? `/api/stops/${encodeURIComponent(stopId)}/vehicles?mode=${mode}`
      : null;
  // Vehicle positions poll on their own fast timer, not the page interval: the
  // hook keeps `data` identical across unchanged polls, so the markers are not
  // rebuilt ten times per real update.
  const { data, error, state, refresh } = useVehiclePoll(url, parseStopVehiclesResponse);

  // The page's manual refresh button should move the buses too.
  const firstNonceRef = useRef(true);
  useEffect(() => {
    if (firstNonceRef.current) {
      firstNonceRef.current = false;
      return;
    }
    refresh();
  }, [nonce, refresh]);

  // A response for the mode the user just left says nothing about this one.
  const payload = data !== null && data.mode === mode ? data : null;
  const vehicles = useMemo(() => payload?.vehicles ?? [], [payload]);

  const approaching = useMemo(
    () => vehicles.filter((vehicle) => vehicle.relation === "approaching"),
    [vehicles],
  );

  const selected = useMemo(
    () => vehicles.find((vehicle) => vehicle.vehicleId === selectedId) ?? null,
    [vehicles, selectedId],
  );

  const followed = useMemo(
    () => vehicles.find((vehicle) => vehicle.vehicleId === followId) ?? null,
    [vehicles, followId],
  );

  // The markers move on the animation clock, not on the poll: every fix is
  // snapped onto the shape of its own line and the marker is carried along that
  // shape until the next one lands. The followed line's shape is fetched first.
  const motion = useVehicleMotion(vehicles, {
    enabled: mapOpen,
    priorityRouteId: followed?.routeId ?? null,
    feedTimestamp: payload?.feedTimestamp ?? null,
  });
  const followMarkerId = followId === null ? null : `${VEHICLE_MARKER_PREFIX}${followId}`;

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    if (stop !== null && Number.isFinite(stop.lat) && Number.isFinite(stop.lon)) {
      list.push({
        id: `stop:${stop.stopId}`,
        lat: stop.lat,
        lon: stop.lon,
        kind: "stop",
        label: null,
        title: t.stops.named(stop.stopName),
        color: null,
        bearing: null,
        // Renders as the large red pin: the one fixed point on this map.
        selected: true,
      });
    }
    for (const vehicle of vehicles) {
      const following = vehicle.vehicleId === followId;
      const markerId = `veh:${vehicle.vehicleId}`;
      const diverted = motion.diverted(markerId);
      list.push({
        id: markerId,
        lat: vehicle.lat,
        lon: vehicle.lon,
        kind: "vehicle",
        label: lineLabel(vehicle),
        title: diverted
          ? vehicleTitle(vehicle, following) + t.map.divertedSuffix
          : vehicleTitle(vehicle, following),
        color: vehicleColor(vehicle),
        bearing: vehicle.bearing,
        selected: vehicle.vehicleId === selectedId || following,
        diverted,
      });
    }
    return list;
  }, [stop, vehicles, selectedId, followId, motion, t]);

  /** Drives the legend: without it an off-route pin has no explanation. */
  const hasDiverted = useMemo(() => markers.some((m) => m.diverted === true), [markers]);

  // Opening framed on the stop alone shows two of twenty-six vehicles: the rest
  // are inbound from kilometres away. Frame the near ones instead, and keep the
  // far ones for the explicit "show them all" button, or one bus 8 km out would
  // zoom the map to half the city.
  const fitPoints = useMemo<Array<[number, number]> | null>(() => {
    if (stop === null) return null;
    const withDistance = approaching
      .map((vehicle) => ({ vehicle, m: metresBetween(stop.lat, stop.lon, vehicle.lat, vehicle.lon) }))
      .sort((a, b) => a.m - b.m);
    const chosen =
      fitScope === "all"
        ? withDistance
        : withDistance.filter((item, index) => item.m <= NEAR_FIT_M || index < MIN_FIT_VEHICLES);
    const points: Array<[number, number]> = [[stop.lat, stop.lon]];
    for (const item of chosen) points.push([item.vehicle.lat, item.vehicle.lon]);
    return points;
  }, [stop, approaching, fitScope]);

  // Frame once per stop and mode, as soon as the first positions land.
  useEffect(() => {
    if (!mapOpen || stop === null || payload === null) return;
    const key = `${stopId}:${mode}`;
    if (autoFitRef.current === key) return;
    autoFitRef.current = key;
    setFitScope("near");
    setFitNonce((value) => value + 1);
  }, [mapOpen, stop, payload, stopId, mode]);

  const moveTo = useCallback((lat: number, lon: number, zoom?: number) => {
    focusSeqRef.current += 1;
    setFocus({ lat, lon, zoom, nonce: focusSeqRef.current });
  }, []);

  // --- follow mode ----------------------------------------------------------

  const followedRef = useRef<StopVehicle | null>(null);
  useEffect(() => {
    followedRef.current = followed;
  }, [followed]);

  const stopFollow = useCallback(() => {
    followZoomRef.current = false;
    followResumeRef.current = false;
    setFollowId(null);
    setFollowPaused(false);
    setFollowInfo(null);
  }, []);

  const startFollow = useCallback((vehicle: StopVehicle) => {
    followZoomRef.current = true;
    followResumeRef.current = false;
    setFollowId(vehicle.vehicleId);
    setFollowPaused(false);
    setFollowInfo(followInfoOf(vehicle));
    setSelectedId(vehicle.vehicleId);
  }, []);

  const resumeFollow = useCallback(() => {
    followResumeRef.current = true;
    setFollowPaused(false);
  }, []);

  /** Any camera move the user asked for by hand takes follow off the wheel. */
  const releaseCamera = useCallback(() => {
    setFollowPaused((paused) => paused || followId !== null);
  }, [followId]);

  // One camera move per follow, on start and on resume. From there MapView
  // keeps the viewport on the marker frame by frame, so a new fix landing must
  // not queue an easeTo of its own: that is what used to make it lurch.
  useEffect(() => {
    if (followId === null || followPaused) return;
    const vehicle = followedRef.current;
    if (vehicle === null) return;
    const withZoom = followZoomRef.current;
    followZoomRef.current = false;
    followResumeRef.current = false;
    // Resuming mid-glide has to land on the marker as it is drawn now, not on
    // the fix it is still moving towards.
    const live = motion.peek(`${VEHICLE_MARKER_PREFIX}${followId}`);
    const lat = live?.lat ?? vehicle.lat;
    const lon = live?.lon ?? vehicle.lon;
    moveTo(lat, lon, withZoom ? FOLLOW_ZOOM : undefined);
  }, [followId, followPaused, moveTo, motion]);

  // Keep the banner's line and headsign current without churning state.
  useEffect(() => {
    if (followed === null) return;
    const next = followInfoOf(followed);
    setFollowInfo((prev) => (prev !== null && sameFollowInfo(prev, next) ? prev : next));
  }, [followed]);

  const vehiclesRef = useRef<StopVehicle[]>(vehicles);
  const onSelectTripRef = useRef(onSelectTrip);
  /** Last trip the two sides agreed on, so the sync cannot ping-pong. */
  const appliedTripRef = useRef<string | null>(null);
  useEffect(() => {
    vehiclesRef.current = vehicles;
    onSelectTripRef.current = onSelectTrip;
  }, [vehicles, onSelectTrip]);

  const emitTrip = useCallback((tripId: string | null) => {
    appliedTripRef.current = tripId;
    onSelectTripRef.current?.(tripId);
  }, []);

  const selectVehicle = useCallback(
    (vehicle: StopVehicle) => {
      setSelectedId(vehicle.vehicleId);
      emitTrip(vehicle.tripId);
      if (vehicle.vehicleId !== followId) releaseCamera();
      moveTo(vehicle.lat, vehicle.lon, 16);
    },
    [moveTo, followId, releaseCamera, emitTrip],
  );

  const handleMarkerSelect = useCallback(
    (id: string, kind: MapMarkerKind) => {
      // Tapping the stop only clears the selection; it must not move the camera.
      if (kind !== "vehicle") {
        setSelectedId(null);
        emitTrip(null);
        return;
      }
      const vehicleId = id.slice(VEHICLE_MARKER_PREFIX.length);
      setSelectedId(vehicleId);
      const match = vehiclesRef.current.find((item) => item.vehicleId === vehicleId);
      emitTrip(match?.tripId ?? null);
    },
    [emitTrip],
  );

  // The other half of the join: a row picked in the arrivals list highlights its
  // vehicle here. The trip id is the key the two sides already share.
  useEffect(() => {
    if (selectedTripId === appliedTripRef.current) return;
    if (selectedTripId === null) {
      appliedTripRef.current = null;
      setSelectedId(null);
      return;
    }
    const vehicle = vehicles.find((item) => item.tripId === selectedTripId);
    // No live vehicle for that arrival yet: retry when the next fixes land.
    if (vehicle === undefined) return;
    appliedTripRef.current = selectedTripId;
    setSelectedId(vehicle.vehicleId);
    releaseCamera();
    moveTo(vehicle.lat, vehicle.lon, 16);
  }, [selectedTripId, vehicles, moveTo, releaseCamera]);

  const frameVehicles = (scope: "near" | "all"): void => {
    releaseCamera();
    setFitScope(scope);
    setFitNonce((value) => value + 1);
  };

  const toggleOpen = (): void => {
    const next = !open;
    setOpen(next);
    if (next) return;
    setSelectedId(null);
    emitTrip(null);
    stopFollow();
    // Drop the pending camera request, or the next mount would replay it.
    setFocus(null);
  };

  const switchMode = (next: Mode): void => {
    if (next === mode) return;
    // The new set gets auto-framed, so hand the camera back before it fights.
    releaseCamera();
    setMode(next);
    setSelectedId(null);
    emitTrip(null);
  };

  const feedTimestamp = payload?.feedTimestamp ?? null;
  const degraded = payload?.degraded ?? false;
  const feedAgeSec =
    feedTimestamp === null ? null : Math.max(0, Math.floor(Date.now() / 1000) - feedTimestamp);
  const feedStale = degraded || (feedAgeSec !== null && feedAgeSec > FEED_STALE_SEC);
  const loading = url !== null && payload === null && state !== "error";

  // "Lost" only on a response we actually parsed: a failed refresh keeps the
  // previous payload, and must not be reported as the vehicle disappearing.
  const followLost = followId !== null && followed === null && payload !== null;
  const followAgeSec =
    followed !== null && followed.timestamp > 0 && now !== null
      ? Math.max(0, Math.floor(now / 1000) - followed.timestamp)
      : null;
  // Prediction has reached its horizon and the marker has been parked there for
  // a while: stop calling the position live even before the fix itself ages out.
  // The delay is what keeps the banner from blinking at the tail of every cycle.
  const followHeld =
    followMarkerId !== null && now !== null && (motion.peek(followMarkerId)?.heldSec ?? 0) > HELD_BANNER_SEC;
  const followState: FollowState = followLost
    ? "lost"
    : followPaused
      ? "paused"
      : followHeld || (followAgeSec !== null && followAgeSec > FOLLOW_STALE_SEC)
        ? "stale"
        : "live";
  const followHint =
    followLost && mode === "approaching"
      ? t.follow.lostHint
      : null;

  return (
    <section
      className={`${className ?? ""} lg:flex lg:min-h-0 lg:flex-col`}
      aria-labelledby="stop-map-heading"
    >
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls="stop-map-panel"
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 py-2 text-start active:bg-surface-2 lg:hidden"
      >
        <span className="text-sm font-bold">{t.map.vehiclesHeading}</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-muted">
          {open ? t.map.hide : t.map.show}
          <span aria-hidden="true">{open ? "▲" : "▼"}</span>
        </span>
      </button>

      <h2 id="stop-map-heading" className="sr-only lg:not-sr-only lg:mb-2 lg:text-sm lg:font-bold">
        {t.map.vehiclesHeading}
      </h2>

      <div id="stop-map-panel" hidden={!mapOpen} className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        {mapOpen ? (
          <div className="mt-2 flex flex-col gap-2 lg:mt-0 lg:min-h-0 lg:flex-1">
            <div role="group" aria-label={t.map.modeGroup} className="flex gap-1 rounded-full bg-surface-2 p-1">
              {(
                [
                  { key: "approaching" as const, label: t.map.modeApproaching },
                  { key: "all" as const, label: t.map.modeAllLines },
                ]
              ).map((item) => {
                const active = mode === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => switchMode(item.key)}
                    className={`inline-flex h-9 flex-1 items-center justify-center rounded-full px-3 text-[0.8125rem] font-bold transition-colors ${
                      active ? "bg-surface text-ink shadow-card" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {stop === null ? (
              <p className="rounded-card border border-line bg-surface px-3 py-6 text-center text-sm text-muted">
                {t.map.loadingStop}
              </p>
            ) : (
              <>
                {followInfo !== null ? (
                  <FollowBanner
                    shortName={followInfo.shortName}
                    routeType={followInfo.routeType}
                    color={followInfo.color}
                    headsign={followInfo.headsign}
                    state={followState}
                    ageSec={followAgeSec}
                    hint={followHint}
                    onResume={resumeFollow}
                    onStop={stopFollow}
                  />
                ) : null}

                {/* Flex, not absolute: maplibre-gl.css sets .maplibregl-map to
                    position:relative and wins over Tailwind's .absolute, which
                    collapses the container and pins the canvas at 300px. */}
                <div className="h-[38vh] min-h-52 w-full overflow-hidden rounded-card border border-line lg:h-auto lg:min-h-0 lg:flex-1">
                  <DynamicMapView
                    center={{ lat: stop.lat, lon: stop.lon }}
                    zoom={15}
                    markers={markers}
                    fitPoints={fitPoints}
                    fitKey={fitNonce === 0 ? null : `fit:${fitNonce}`}
                    focus={focus}
                    motion={motion}
                    followMarkerId={followPaused ? null : followMarkerId}
                    onMarkerSelect={handleMarkerSelect}
                    onUserGesture={releaseCamera}
                    ariaLabel={t.map.stopMapAria(stop.stopName)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      releaseCamera();
                      moveTo(stop.lat, stop.lon, 16);
                    }}
                    className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold active:bg-surface-2"
                  >
                    {t.map.centreOnStop}
                  </button>
                  <button
                    type="button"
                    onClick={() => frameVehicles("near")}
                    disabled={approaching.length === 0}
                    className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold active:bg-surface-2 disabled:opacity-50"
                  >
                    {t.map.nearbyVehicles}
                  </button>
                  <button
                    type="button"
                    onClick={() => frameVehicles("all")}
                    disabled={approaching.length === 0}
                    className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold active:bg-surface-2 disabled:opacity-50"
                  >
                    {t.map.allVehicles}
                  </button>
                </div>

                <p aria-live="polite" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span className="font-semibold text-ink">
                    {loading
                      ? t.map.loadingVehicles
                      : mode === "approaching"
                        ? approaching.length === 0
                          ? t.map.noneApproaching
                          : t.map.approachingCount(approaching.length)
                        : t.map.onTheseLines(vehicles.length)}
                  </span>
                  {feedTimestamp !== null ? (
                    <span>{t.map.positionsAt(formatClock(feedTimestamp))}</span>
                  ) : null}
                  {feedStale ? (
                    <span className="rounded-full bg-late-soft px-2 py-0.5 font-semibold text-late">
                      {t.map.positionsStale}
                    </span>
                  ) : null}
                  {error !== null ? <span className="text-danger">{error}</span> : null}
                </p>

                {mode === "all" ? (
                  <p className="text-xs text-muted">{t.map.allLinesNote}</p>
                ) : null}

                {hasDiverted ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <span
                      aria-hidden="true"
                      className="inline-block size-2.5 shrink-0 rounded-full border-2 border-dashed border-[#f59e0b]"
                    />
                    <span>
                      <span className="font-semibold text-ink">{t.map.divertedBadge}</span>
                      {": "}
                      {t.map.divertedNote}
                    </span>
                  </p>
                ) : null}

                {approaching.length > 0 ? (
                  <ul className="flex gap-2 overflow-x-auto pb-1" aria-label={t.map.approachingList}>
                    {approaching.map((vehicle) => {
                      const active = vehicle.vehicleId === selectedId;
                      return (
                        <li key={vehicle.vehicleId} className="shrink-0">
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => selectVehicle(vehicle)}
                            className={`flex min-h-11 items-center gap-2 rounded-full border px-2.5 ${
                              active ? "border-accent bg-accent-soft" : "border-line bg-surface"
                            }`}
                          >
                            <LineBadge
                              shortName={vehicle.routeShortName ?? vehicle.routeId ?? "?"}
                              routeType={vehicle.routeType ?? 3}
                              color={vehicle.routeColor}
                              size="sm"
                              decorative
                            />
                            <span className="text-xs font-bold tabular-nums">
                              {vehicle.minutesAway === null
                                ? t.common.dash
                                : formatMinutes(vehicle.minutesAway)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {selected !== null ? (
                  <div className="flex flex-col gap-2 rounded-card border border-accent bg-surface px-3 py-2">
                    <div className="flex items-center gap-3">
                      <LineBadge
                        shortName={selected.routeShortName ?? selected.routeId ?? "?"}
                        routeType={selected.routeType ?? 3}
                        color={selected.routeColor}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold caps-data">
                          {selected.headsign !== null && selected.headsign.length > 0
                            ? selected.headsign
                            : t.lines.noHeadsign}
                        </p>
                        <p className="text-xs text-muted">
                          {selected.relation === "approaching" && selected.minutesAway !== null
                            ? selected.arrivalTime === null
                              ? t.map.hereIn(formatMinutes(selected.minutesAway))
                              : t.map.hereInAt(
                                  formatMinutes(selected.minutesAway),
                                  formatClock(selected.arrivalTime),
                                )
                            : t.map.notInbound}
                          {selected.bearing === null ? t.map.noBearing : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(null);
                          emitTrip(null);
                        }}
                        className="shrink-0 rounded-full px-2 text-xs font-semibold text-muted"
                      >
                        {t.common.close}
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-pressed={selected.vehicleId === followId}
                      onClick={() =>
                        selected.vehicleId === followId ? stopFollow() : startFollow(selected)
                      }
                      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-bold ${
                        selected.vehicleId === followId
                          ? "border border-line bg-surface-2 active:opacity-80"
                          : "bg-accent text-on-accent active:opacity-80"
                      }`}
                    >
                      {selected.vehicleId === followId ? (
                        t.map.unfollow
                      ) : (
                        <>
                          <span aria-hidden="true">◎</span>
                          {t.map.follow}
                        </>
                      )}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
