"use client";

/**
 * Runtime validation for /api/journey. Same rule as the rest of the client:
 * nothing from the wire is trusted, and one malformed itinerary is dropped
 * rather than allowed to blank the screen.
 */

import { parseRouteSummary } from "@/components/api";
import type {
  Journey,
  JourneyEndpointKind,
  JourneyLeg,
  JourneyPlace,
  JourneyPoint,
  JourneyResponse,
} from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseArray<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    const parsed = parse(item);
    if (parsed !== null) out.push(parsed);
  }
  return out;
}

function parsePoint(raw: unknown): JourneyPoint | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name);
  const lat = asNumber(raw.lat);
  const lon = asNumber(raw.lon);
  if (name === null || lat === null || lon === null) return null;
  return { name, lat, lon, stopId: asString(raw.stopId), stopCode: asString(raw.stopCode) };
}

function parseKind(raw: unknown): JourneyEndpointKind | null {
  return raw === "stop" || raw === "coord" || raw === "place" ? raw : null;
}

export function parsePlace(raw: unknown): JourneyPlace | null {
  const point = parsePoint(raw);
  if (point === null || !isRecord(raw)) return null;
  const kind = parseKind(raw.kind);
  if (kind === null) return null;
  return { ...point, kind, label: asString(raw.label) };
}

/**
 * Longest encoded geometry we will carry. The densest pattern in the feed is
 * under 5 000 characters, so this is generous; it exists only so a malformed
 * response cannot hand the decoder an unbounded string.
 */
const MAX_GEOMETRY_CHARS = 32_768;

function parseGeometry(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value.length === 0 || value.length > MAX_GEOMETRY_CHARS) return null;
  return value;
}

function parseLeg(raw: unknown): JourneyLeg | null {
  if (!isRecord(raw)) return null;
  const from = parsePoint(raw.from);
  const to = parsePoint(raw.to);
  const departureTime = asNumber(raw.departureTime);
  const arrivalTime = asNumber(raw.arrivalTime);
  if (from === null || to === null || departureTime === null || arrivalTime === null) return null;

  if (raw.kind === "walk") {
    const distanceM = asNumber(raw.distanceM);
    const durationSec = asNumber(raw.durationSec);
    if (distanceM === null || durationSec === null) return null;
    return { kind: "walk", from, to, distanceM, durationSec, departureTime, arrivalTime };
  }
  if (raw.kind !== "ride") return null;

  const route = parseRouteSummary(raw.route);
  const tripId = asString(raw.tripId);
  const directionId = asNumber(raw.directionId);
  const durationSec = asNumber(raw.durationSec);
  const stopCount = asNumber(raw.stopCount);
  const serviceDate = asString(raw.serviceDate);
  if (
    route === null ||
    tripId === null ||
    directionId === null ||
    durationSec === null ||
    stopCount === null ||
    serviceDate === null
  ) {
    return null;
  }
  return {
    kind: "ride",
    route,
    directionId,
    tripId,
    headsign: asString(raw.headsign) ?? "",
    from,
    to,
    departureTime,
    arrivalTime,
    durationSec,
    stopCount,
    serviceDate,
    geometry: parseGeometry(raw.geometry),
  };
}

function parseJourney(raw: unknown): Journey | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id);
  const departureTime = asNumber(raw.departureTime);
  const arrivalTime = asNumber(raw.arrivalTime);
  const durationSec = asNumber(raw.durationSec);
  const transfers = asNumber(raw.transfers);
  if (
    id === null ||
    departureTime === null ||
    arrivalTime === null ||
    durationSec === null ||
    transfers === null
  ) {
    return null;
  }
  const legs = parseArray(raw.legs, parseLeg);
  // An itinerary with no legs left after validation is not an itinerary.
  if (legs.length === 0) return null;
  return {
    id,
    legs,
    departureTime,
    arrivalTime,
    durationSec,
    transfers,
    walkDistanceM: asNumber(raw.walkDistanceM) ?? 0,
    walkDurationSec: asNumber(raw.walkDurationSec) ?? 0,
    source: "scheduled",
  };
}

export function parseJourneyResponse(raw: unknown): JourneyResponse | null {
  if (!isRecord(raw)) return null;
  const origin = parsePlace(raw.origin);
  const destination = parsePlace(raw.destination);
  const departAfter = asNumber(raw.departAfter);
  if (origin === null || destination === null || departAfter === null) return null;
  return {
    origin,
    destination,
    departAfter,
    journeys: parseArray(raw.journeys, parseJourney),
    notice: asString(raw.notice),
    generatedAt: asNumber(raw.generatedAt) ?? Math.floor(Date.now() / 1000),
  };
}

export function parsePlacesResponse(raw: unknown): { places: JourneyPlace[] } | null {
  if (!isRecord(raw)) return null;
  return { places: parseArray(raw.places, parsePlace) };
}

// ---------------------------------------------------------------------------
// Endpoint encoding, shared by the form and the URL
// ---------------------------------------------------------------------------

/** How an endpoint travels in a query string. See the API route's own grammar. */
export function encodePlace(place: JourneyPlace): string {
  if (place.stopId !== null) return `stop:${place.stopId}`;
  if (place.kind === "coord") return `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`;
  return place.name;
}
