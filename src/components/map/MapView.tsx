"use client";

import { useEffect, useRef, useState } from "react";
import {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { activeDictionary } from "@/lib/i18n/dictionaries";
import { metresBetween } from "@/lib/pathmotion";

import type { MotionMapViewProps, MotionProvider } from "./motion";
import type { LatLon, MapMarker, MapMarkerKind, MapPath } from "./types";

// Next never emits the worker's maplibre-gl-shared.mjs sibling, so the bundled
// worker URL is unusable; scripts/copy-maplibre-worker.mjs puts both here.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
};

const PATH_SOURCE = "probus-path";
const PATH_CASING_LAYER = "probus-path-casing";
const PATH_LAYER = "probus-path-line";
const DEFAULT_PATH_COLOR = "#1d4ed8";
/** Multi-path layers, in draw order: casing under everything, rides on top. */
const LEGS_SOLID_SOURCE = "probus-legs-solid";
const LEGS_DASH_SOURCE = "probus-legs-dash";
const LEGS_CASING_LAYER = "probus-legs-casing";
const LEGS_DASH_LAYER = "probus-legs-dash-line";
const LEGS_SOLID_LAYER = "probus-legs-solid-line";
const ANIM_MS = 700;
/** How long a programmatic camera move owns the viewport, easing included. */
const CAMERA_BUSY_MS = 700;
/** Smallest centre change worth pushing to the map while following. */
const CENTRE_EPSILON_DEG = 1e-7;
/**
 * How far the centre has to end up from where we last put it before we call it
 * a pan. A zoom keeps the centre exactly, so it stays at zero and never takes
 * the camera off the followed vehicle by accident.
 */
const USER_PAN_M = 8;

interface MarkerRecord {
  marker: Marker;
  el: HTMLButtonElement;
  body: HTMLDivElement;
  rotator: HTMLDivElement | null;
  onClick: () => void;
  kind: MapMarkerKind;
  lng: number;
  lat: number;
  /**
   * The motion provider owns this marker's position; no tween applies. Refreshed
   * by the frame loop, not by the marker diff: a shape can land at any moment
   * and a flag sampled once per poll would be stale for whole seconds.
   */
  driven: boolean;
  /** Last value written to style.opacity, so a frame that changes nothing writes nothing. */
  opacity: string;
}

interface Anim {
  fromLng: number;
  fromLat: number;
  toLng: number;
  toLat: number;
  start: number;
}

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

/** GeoJSON wants [lon, lat]; we carry [lat, lon]. Unusable pairs are dropped. */
function toCoordinates(points: ReadonlyArray<readonly [number, number]>): number[][] {
  const out: number[][] = [];
  for (const [lat, lon] of points) {
    if (Number.isFinite(lat) && Number.isFinite(lon)) out.push([lon, lat]);
  }
  return out;
}

interface LegFeature {
  type: "Feature";
  properties: { color: string };
  geometry: { type: "LineString"; coordinates: number[][] };
}

/** The drawable legs of one style. Colour is per feature, dash is per layer. */
function legFeatures(paths: MapPath[] | null | undefined, dashed: boolean): LegFeature[] {
  const out: LegFeature[] = [];
  for (const leg of paths ?? []) {
    if (leg.dashed !== dashed) continue;
    const coordinates = toCoordinates(leg.points);
    if (coordinates.length < 2) continue;
    out.push({
      type: "Feature",
      properties: { color: HEX_COLOR.test(leg.color) ? leg.color : DEFAULT_PATH_COLOR },
      geometry: { type: "LineString", coordinates },
    });
  }
  return out;
}

function setCollection(map: MapLibreMap, id: string, features: LegFeature[]): void {
  const data = { type: "FeatureCollection" as const, features };
  // Never addSource over an id that exists: maplibre throws rather than replace.
  const source = map.getSource(id);
  if (source !== undefined) {
    if (source instanceof GeoJSONSource) source.setData(data);
    return;
  }
  map.addSource(id, { type: "geojson", data });
}

function markerColor(m: MapMarker): string {
  if (m.selected) return "#dc2626";
  if (m.color !== null && HEX_COLOR.test(m.color)) return m.color;
  if (m.kind === "vehicle") return "#15803d";
  if (m.kind === "user") return "#1d4ed8";
  return "#0f172a";
}

function markerSize(m: MapMarker): number {
  if (m.kind === "vehicle") return m.selected ? 32 : 28;
  if (m.kind === "user") return 18;
  return m.selected ? 26 : 16;
}

function buildMarkerElement(kind: MapMarkerKind): {
  el: HTMLButtonElement;
  body: HTMLDivElement;
  rotator: HTMLDivElement | null;
} {
  const el = document.createElement("button");
  el.type = "button";
  // Out of the tab order: up to 360 markers sit before the page content.
  el.tabIndex = -1;
  // position:absolute is what .maplibregl-marker sets; an inline position:relative
  // overrides it, drops every marker into normal flow and makes them jump on zoom.
  el.style.cssText =
    "position:absolute;top:0;left:0;display:block;padding:0;margin:0;border:0;background:none;cursor:pointer;line-height:0;";

  let rotator: HTMLDivElement | null = null;
  if (kind === "vehicle") {
    rotator = document.createElement("div");
    rotator.style.cssText =
      "position:absolute;inset:0;transform-origin:50% 50%;pointer-events:none;";
    const tip = document.createElement("div");
    tip.style.cssText =
      "position:absolute;left:50%;top:-3px;margin-left:-5px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #ffffff;filter:drop-shadow(0 1px 1px rgba(0,0,0,.4));";
    rotator.appendChild(tip);
    el.appendChild(rotator);
  }

  const body = document.createElement("div");
  el.appendChild(body);
  return { el, body, rotator };
}

function setBearing(rotator: HTMLDivElement, bearing: number | null): void {
  if (bearing === null || !Number.isFinite(bearing)) {
    rotator.style.display = "none";
    return;
  }
  rotator.style.display = "block";
  rotator.style.transform = `rotate(${bearing}deg)`;
}

/**
 * Fades the parts of the marker we built ourselves. Deliberately not the
 * element maplibre was handed: it writes style.opacity on that one for its own
 * occlusion handling, and two writers on one property means one of them loses.
 */
function setOpacity(rec: MarkerRecord, opacity: string): void {
  rec.body.style.opacity = opacity;
  if (rec.rotator !== null) rec.rotator.style.opacity = opacity;
  rec.opacity = opacity;
}

function styleMarker(rec: MarkerRecord, m: MapMarker): void {
  const size = markerSize(m);
  const color = markerColor(m);
  rec.el.style.width = `${size}px`;
  rec.el.style.height = `${size}px`;
  rec.el.style.zIndex = m.selected ? "4" : m.kind === "vehicle" ? "3" : m.kind === "user" ? "2" : "1";
  rec.el.setAttribute("aria-label", m.title);
  rec.el.setAttribute("aria-pressed", m.selected ? "true" : "false");
  rec.el.title = m.title;

  const inset = m.kind === "vehicle" ? 4 : 0;
  const halo = m.kind === "user" ? ",0 0 0 5px rgba(29,78,216,.25)" : "";
  const ring = m.selected ? "3px" : "2px";
  // Off route: dashed amber ring. This one is not snapped to the line, so it
  // sits wherever the feed put it — often across a building.
  const diverted = m.diverted === true;
  const border = diverted ? `${ring} dashed #f59e0b` : `${ring} solid #ffffff`;
  const divertedHalo = diverted ? ",0 0 0 3px rgba(245,158,11,.35)" : "";
  rec.body.style.cssText = `position:absolute;inset:${inset}px;border-radius:9999px;background:${color};border:${border};box-shadow:0 1px 3px rgba(0,0,0,.45)${halo}${divertedHalo};display:flex;align-items:center;justify-content:center;overflow:hidden;color:#ffffff;font:700 9px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:-.03em;`;
  rec.body.textContent = m.label ?? "";
  // cssText above replaced the whole declaration, mid-crossfade included.
  if (rec.opacity !== "") setOpacity(rec, rec.opacity);

  // A driven marker gets its heading from the path on the very next frame;
  // writing the raw fix bearing here would flicker it.
  if (rec.rotator !== null && !rec.driven) setBearing(rec.rotator, m.bearing);
}

function destroyMarker(rec: MarkerRecord): void {
  rec.el.removeEventListener("click", rec.onClick);
  rec.marker.remove();
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function documentHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

export default function MapView({
  center,
  zoom,
  markers,
  path = null,
  pathColor = DEFAULT_PATH_COLOR,
  paths = null,
  fitPoints = null,
  fitKey = null,
  focus = null,
  motion = null,
  followMarkerId = null,
  onMarkerSelect,
  onUserMove,
  onUserGesture,
  className,
  ariaLabel,
}: MotionMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MarkerRecord>>(new Map());
  const animsRef = useRef<Map<string, Anim>>(new Map());
  const rafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const lastFitRef = useRef<string | null>(null);
  const lastFocusRef = useRef<number | null>(null);
  const suppressMoveUntilRef = useRef(0);
  const cameraBusyUntilRef = useRef(0);
  const interactingRef = useRef(false);
  /** Where we last aimed the camera: the yardstick for "did the user move it". */
  const commandedRef = useRef<LatLon | null>(null);
  const onMarkerSelectRef = useRef(onMarkerSelect);
  const onUserMoveRef = useRef(onUserMove);
  const onUserGestureRef = useRef(onUserGesture);
  const motionRef = useRef<MotionProvider | null>(motion);
  const followRef = useRef<string | null>(followMarkerId);
  const initialViewRef = useRef({ center, zoom });
  /** Kicks the animation loop; set once the map exists. */
  const ensureFrameRef = useRef<() => void>(() => undefined);
  const [styleReady, setStyleReady] = useState(false);

  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect;
    onUserMoveRef.current = onUserMove;
    onUserGestureRef.current = onUserGesture;
  }, [onMarkerSelect, onUserMove, onUserGesture]);

  useEffect(() => {
    motionRef.current = motion;
    if (motion === null) return;
    // A frame loop that wound down because nothing was drivable has to be told
    // when that changes: a shape landing moves no React state of its own.
    const unsubscribe = motion.subscribe(() => ensureFrameRef.current());
    ensureFrameRef.current();
    return unsubscribe;
  }, [motion]);

  useEffect(() => {
    followRef.current = followMarkerId;
    // Taking the wheel, or handing it back, both need a frame to settle on.
    ensureFrameRef.current();
  }, [followMarkerId]);

  // Mount-only: the map is created once and driven through refs afterwards.
  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    const initial = initialViewRef.current;
    const map = new MapLibreMap({
      container,
      style: MAP_STYLE,
      center: [initial.center.lon, initial.center.lat],
      zoom: initial.zoom,
      minZoom: 8,
      maxZoom: 19,
      attributionControl: { compact: false },
      dragRotate: false,
      pitchWithRotate: false,
      maplibreLogo: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    const nav = new NavigationControl({ showCompass: false });
    map.addControl(nav, "top-right");

    const records = markersRef.current;
    const anims = animsRef.current;

    /**
     * The single animation driver: it advances the predicted vehicles, the
     * plain tweens and the follow camera on one clock, and it schedules another
     * frame only while something still needs one.
     */
    const tick = (): void => {
      rafRef.current = null;
      const now = performance.now();
      const provider = motionRef.current;
      let alive = false;

      if (provider !== null) {
        for (const [id, rec] of records) {
          if (rec.kind !== "vehicle") continue;
          // Asked every frame rather than read off a flag the marker diff set:
          // positionAt is null for exactly the vehicles the provider is not
          // driving, so this is also how `driven` stays honest between polls.
          const point = provider.positionAt(id, now);
          if (point === null) {
            // Handed back to the plain tween: nothing else would ever clear an
            // inline opacity left behind by a re-anchor crossfade.
            if (rec.driven) {
              rec.driven = false;
              if (rec.opacity !== "") setOpacity(rec, "");
            }
            continue;
          }
          rec.driven = true;
          alive = true;
          rec.marker.setLngLat([point.lon, point.lat]);
          if (rec.rotator !== null) setBearing(rec.rotator, point.bearing);
          // Only a re-anchor crossfade ever drops this below 1.
          const opacity = point.opacity >= 1 ? "" : point.opacity.toFixed(2);
          if (rec.opacity !== opacity) setOpacity(rec, opacity);
        }
      }

      for (const [id, a] of anims) {
        const rec = records.get(id);
        if (rec === undefined || rec.driven) {
          anims.delete(id);
          continue;
        }
        const raw = (now - a.start) / ANIM_MS;
        const t = raw >= 1 ? 1 : raw > 0 ? raw : 0;
        const eased = t * (2 - t);
        rec.marker.setLngLat([
          a.fromLng + (a.toLng - a.fromLng) * eased,
          a.fromLat + (a.toLat - a.fromLat) * eased,
        ]);
        if (t === 1) anims.delete(id);
      }
      if (anims.size > 0) alive = true;

      const followId = followRef.current;
      if (followId !== null) {
        const rec = records.get(followId);
        if (rec !== undefined) {
          alive = true;
          if (!interactingRef.current && now >= cameraBusyUntilRef.current) {
            // peek, never positionAt: the marker loop above already stepped it.
            const point = rec.driven ? (provider?.peek(followId) ?? null) : null;
            const here = rec.marker.getLngLat();
            const lon = point === null ? here.lng : point.lon;
            const lat = point === null ? here.lat : point.lat;
            const centre = map.getCenter();
            if (
              Math.abs(centre.lng - lon) > CENTRE_EPSILON_DEG ||
              Math.abs(centre.lat - lat) > CENTRE_EPSILON_DEG
            ) {
              commandedRef.current = { lat, lon };
              map.setCenter([lon, lat]);
            }
          }
        }
      }

      if (alive && !documentHidden()) rafRef.current = requestAnimationFrame(tick);
    };

    const ensureFrame = (): void => {
      if (rafRef.current !== null || documentHidden()) return;
      rafRef.current = requestAnimationFrame(tick);
    };
    ensureFrameRef.current = ensureFrame;

    const onLoad = (): void => setStyleReady(true);
    const onMoveEnd = (): void => {
      interactingRef.current = false;
      const c = map.getCenter();
      // While following we own the viewport, so the only question left is
      // whether the centre ended up somewhere we did not put it.
      if (followRef.current !== null) {
        const anchor = commandedRef.current;
        if (anchor === null) return;
        if (metresBetween(c.lat, c.lng, anchor.lat, anchor.lon) > USER_PAN_M) {
          onUserGestureRef.current?.();
        }
        return;
      }
      if (performance.now() < suppressMoveUntilRef.current) return;
      onUserMoveRef.current?.({ lat: c.lat, lon: c.lng });
    };
    // Only a real gesture carries an originalEvent; our own moves do not. This
    // just stops the follow camera fighting the hand that is dragging the map.
    const onGesture = (ev: { originalEvent?: unknown }): void => {
      if (ev.originalEvent === undefined || ev.originalEvent === null) return;
      interactingRef.current = true;
    };
    const onError = (ev: { error?: { message?: string } }): void => {
      console.warn("Errore mappa:", ev.error?.message ?? "sconosciuto");
    };
    const onVisibility = (): void => {
      if (documentHidden()) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      ensureFrame();
    };

    map.on("load", onLoad);
    map.on("moveend", onMoveEnd);
    map.on("dragstart", onGesture);
    map.on("zoomstart", onGesture);
    map.on("rotatestart", onGesture);
    map.on("error", onError);
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new ResizeObserver(() => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        mapRef.current?.resize();
      });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ensureFrameRef.current = () => undefined;
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      anims.clear();
      for (const rec of records.values()) destroyMarker(rec);
      records.clear();
      map.off("load", onLoad);
      map.off("moveend", onMoveEnd);
      map.off("dragstart", onGesture);
      map.off("zoomstart", onGesture);
      map.off("rotatestart", onGesture);
      map.off("error", onError);
      map.removeControl(nav);
      mapRef.current = null;
      lastFitRef.current = null;
      lastFocusRef.current = null;
      setStyleReady(false);
      map.remove();
    };
  }, []);

  // Marker diff: create, update in place, animate vehicles, drop the rest.
  useEffect(() => {
    const map = mapRef.current;
    if (map === null) return;
    const records = markersRef.current;
    const anims = animsRef.current;
    const provider = motionRef.current;
    const smooth = !prefersReducedMotion();
    const seen = new Set<string>();

    for (const m of markers) {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lon)) continue;
      seen.add(m.id);
      const driven = m.kind === "vehicle" && provider !== null && provider.driven(m.id);
      let rec = records.get(m.id);
      if (rec !== undefined && rec.kind !== m.kind) {
        destroyMarker(rec);
        records.delete(m.id);
        anims.delete(m.id);
        rec = undefined;
      }

      if (rec === undefined) {
        const { el, body, rotator } = buildMarkerElement(m.kind);
        el.dataset.markerId = m.id;
        const markerId = m.id;
        const markerKind = m.kind;
        const onClick = (): void => onMarkerSelectRef.current?.(markerId, markerKind);
        el.addEventListener("click", onClick);
        // Without this maplibre rounds the marker's translate to whole pixels.
        // A bus covers well under a pixel per frame, so every sub-pixel step of
        // the prediction was being thrown away and the marker only moved once
        // the rounding tipped over: exactly the jump the motion exists to remove.
        const marker = new Marker({ element: el, anchor: "center", subpixelPositioning: true })
          .setLngLat([m.lon, m.lat])
          .addTo(map);
        rec = {
          marker,
          el,
          body,
          rotator,
          onClick,
          kind: m.kind,
          lng: m.lon,
          lat: m.lat,
          driven,
          opacity: "",
        };
        records.set(m.id, rec);
        styleMarker(rec, m);
        continue;
      }

      rec.driven = driven;
      // Handed back to the plain tween mid-crossfade: nothing else will ever
      // clear the inline opacity, and a marker stuck half transparent is a bug.
      if (!driven && rec.opacity !== "") setOpacity(rec, "");
      if (driven) {
        // The provider owns this one now; any half-finished tween is stale.
        anims.delete(m.id);
        rec.lng = m.lon;
        rec.lat = m.lat;
      } else if (rec.lng !== m.lon || rec.lat !== m.lat) {
        if (m.kind === "vehicle" && smooth) {
          const from = rec.marker.getLngLat();
          anims.set(m.id, {
            fromLng: from.lng,
            fromLat: from.lat,
            toLng: m.lon,
            toLat: m.lat,
            start: performance.now(),
          });
        } else {
          anims.delete(m.id);
          rec.marker.setLngLat([m.lon, m.lat]);
        }
        rec.lng = m.lon;
        rec.lat = m.lat;
      }
      styleMarker(rec, m);
    }

    for (const [id, rec] of records) {
      if (seen.has(id)) continue;
      destroyMarker(rec);
      records.delete(id);
      anims.delete(id);
    }

    ensureFrameRef.current();
  }, [markers]);

  // Line path. A null path is a normal state: drop the layers and carry on.
  useEffect(() => {
    const map = mapRef.current;
    if (map === null || !styleReady || !map.isStyleLoaded()) return;

    const coords = path === null ? [] : toCoordinates(path);

    if (coords.length < 2) {
      if (map.getLayer(PATH_LAYER) !== undefined) map.removeLayer(PATH_LAYER);
      if (map.getLayer(PATH_CASING_LAYER) !== undefined) map.removeLayer(PATH_CASING_LAYER);
      if (map.getSource(PATH_SOURCE) !== undefined) map.removeSource(PATH_SOURCE);
      return;
    }

    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: coords },
    };
    const source = map.getSource(PATH_SOURCE);
    if (source instanceof GeoJSONSource) {
      source.setData(data);
      if (map.getLayer(PATH_LAYER) !== undefined) {
        map.setPaintProperty(PATH_LAYER, "line-color", pathColor);
      }
      return;
    }
    map.addSource(PATH_SOURCE, { type: "geojson", data });
    map.addLayer({
      id: PATH_CASING_LAYER,
      type: "line",
      source: PATH_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.85 },
    });
    map.addLayer({
      id: PATH_LAYER,
      type: "line",
      source: PATH_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": pathColor, "line-width": 4.5 },
    });
  }, [path, pathColor, styleReady]);

  // Itinerary legs. Two sources because line-dasharray is not data driven, so
  // solid and dashed cannot share a layer; the colour is, so each stroke keeps
  // its own. Both layers are created together, which fixes their draw order.
  useEffect(() => {
    const map = mapRef.current;
    if (map === null || !styleReady || !map.isStyleLoaded()) return;

    const solid = legFeatures(paths, false);
    const dashed = legFeatures(paths, true);

    if (solid.length === 0 && dashed.length === 0) {
      for (const layer of [LEGS_SOLID_LAYER, LEGS_DASH_LAYER, LEGS_CASING_LAYER]) {
        if (map.getLayer(layer) !== undefined) map.removeLayer(layer);
      }
      for (const source of [LEGS_SOLID_SOURCE, LEGS_DASH_SOURCE]) {
        if (map.getSource(source) !== undefined) map.removeSource(source);
      }
      return;
    }

    setCollection(map, LEGS_SOLID_SOURCE, solid);
    setCollection(map, LEGS_DASH_SOURCE, dashed);
    if (map.getLayer(LEGS_CASING_LAYER) !== undefined) return;

    map.addLayer({
      id: LEGS_CASING_LAYER,
      type: "line",
      source: LEGS_SOLID_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.85 },
    });
    map.addLayer({
      id: LEGS_DASH_LAYER,
      type: "line",
      source: LEGS_DASH_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 4,
        "line-dasharray": [0.1, 1.8],
      },
    });
    map.addLayer({
      id: LEGS_SOLID_LAYER,
      type: "line",
      source: LEGS_SOLID_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": ["get", "color"], "line-width": 5 },
    });
  }, [paths, styleReady]);

  // Fit only when fitKey changes, so live vehicles never move the viewport.
  useEffect(() => {
    const map = mapRef.current;
    if (map === null || !styleReady) return;
    if (fitKey === null || fitPoints === null || fitPoints.length === 0) return;
    if (lastFitRef.current === fitKey) return;

    const bounds = new LngLatBounds();
    let count = 0;
    for (const [lat, lon] of fitPoints) {
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      bounds.extend([lon, lat]);
      count += 1;
    }
    if (count === 0) return;
    lastFitRef.current = fitKey;
    suppressMoveUntilRef.current = performance.now() + 900;
    cameraBusyUntilRef.current = performance.now() + CAMERA_BUSY_MS;
    // A fit lands wherever the bounds say, so we have no anchor to compare
    // against until the follow camera commands the next centre itself.
    commandedRef.current = null;
    map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 500 });
  }, [fitKey, fitPoints, styleReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (map === null || focus === null) return;
    if (lastFocusRef.current === focus.nonce) return;
    if (!Number.isFinite(focus.lat) || !Number.isFinite(focus.lon)) return;
    lastFocusRef.current = focus.nonce;
    suppressMoveUntilRef.current = performance.now() + 900;
    cameraBusyUntilRef.current = performance.now() + CAMERA_BUSY_MS;
    commandedRef.current = { lat: focus.lat, lon: focus.lon };
    map.easeTo({
      center: [focus.lon, focus.lat],
      zoom: focus.zoom ?? Math.max(map.getZoom(), 16),
      duration: 500,
    });
  }, [focus]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full"}
      role="application"
      aria-label={ariaLabel ?? activeDictionary().map.fallbackAria}
    />
  );
}
