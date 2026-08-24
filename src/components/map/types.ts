/**
 * Props and data shapes for the shared MapView. Kept in a separate module so
 * the next/dynamic wrapper can import types without pulling in maplibre-gl.
 */

export type MapMarkerKind = "stop" | "vehicle" | "user";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  kind: MapMarkerKind;
  /** Short text drawn inside the marker (a line number, usually). */
  label: string | null;
  /** Accessible name, also used as the native tooltip. */
  title: string;
  /** CSS colour; falls back to a per-kind default when null. */
  color: string | null;
  /** Degrees clockwise from north. Only vehicles use it. */
  bearing: number | null;
  selected: boolean;
  /**
   * Vehicle confirmed off every shape of its route, so it is drawn where the
   * feed puts it instead of snapped to the line. Marked, because otherwise it
   * just looks like a bus sitting on a building.
   */
  diverted?: boolean;
}

export interface LatLon {
  lat: number;
  lon: number;
}

/** A request to recentre the map. Bump `nonce` to replay the same target. */
export interface MapFocus extends LatLon {
  zoom?: number;
  nonce: number;
}

/** One stroke on the map: the geometry plus how it is drawn. */
export interface MapPath {
  /** Decoded polyline as [lat, lon] pairs. Fewer than two points draws nothing. */
  points: Array<[number, number]>;
  /** CSS hex colour. Anything else falls back to the default path colour. */
  color: string;
  /** Dashed reads as "estimated": walking legs, and rides with no shape. */
  dashed: boolean;
}

export interface MapViewProps {
  /** Initial centre. Later changes are ignored: use `focus` to move the map. */
  center: LatLon;
  /** Initial zoom. Later changes are ignored. */
  zoom: number;
  markers: MapMarker[];
  /** Decoded polyline as [lat, lon] pairs, or null when the line has no shape. */
  path?: Array<[number, number]> | null;
  pathColor?: string;
  /**
   * Several strokes at once, each with its own colour and style: an itinerary
   * is one per leg. Independent of `path`, which stays the single-line case.
   */
  paths?: MapPath[] | null;
  /** Points to fit in view; only applied when `fitKey` changes. */
  fitPoints?: Array<[number, number]> | null;
  fitKey?: string | null;
  focus?: MapFocus | null;
  onMarkerSelect?: (id: string, kind: MapMarkerKind) => void;
  /** Fired after a pan/zoom the user drove, never after a programmatic move. */
  onUserMove?: (center: LatLon) => void;
  className?: string;
  ariaLabel?: string;
}
