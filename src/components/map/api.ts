/**
 * Runtime validation for the API responses the map pages consume. Nothing that
 * comes off the wire is trusted: every field is checked before it is rendered.
 */

import { activeDictionary } from "@/lib/i18n/dictionaries";
import type {
  LineDetail,
  NearbyStop,
  RouteDirection,
  RouteSummary,
  Stop,
  Vehicle,
  VehiclesResponse,
} from "@/lib/types";

export class ApiRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isLatLon(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function parseRouteSummary(value: unknown): RouteSummary | null {
  if (!isRecord(value)) return null;
  const routeId = asString(value.routeId);
  const shortName = asString(value.shortName);
  const routeType = asNumber(value.routeType);
  if (routeId === null || shortName === null || routeType === null) return null;
  return {
    routeId,
    shortName,
    longName: asString(value.longName),
    routeType,
    color: asString(value.color),
    textColor: asString(value.textColor),
  };
}

function parseRouteSummaries(value: unknown): RouteSummary[] {
  if (!Array.isArray(value)) return [];
  const out: RouteSummary[] = [];
  for (const raw of value) {
    const route = parseRouteSummary(raw);
    if (route !== null) out.push(route);
  }
  return out;
}

export function parseStop(value: unknown): Stop | null {
  if (!isRecord(value)) return null;
  const stopId = asString(value.stopId);
  const stopName = asString(value.stopName);
  const lat = asNumber(value.lat);
  const lon = asNumber(value.lon);
  if (stopId === null || stopName === null || lat === null || lon === null) return null;
  if (!isLatLon(lat, lon)) return null;
  return {
    stopId,
    stopCode: asString(value.stopCode),
    stopName,
    lat,
    lon,
    wheelchair: asNumber(value.wheelchair),
  };
}

export function parseNearbyStops(value: unknown): NearbyStop[] | null {
  if (!isRecord(value) || !Array.isArray(value.stops)) return null;
  const out: NearbyStop[] = [];
  const seen = new Set<string>();
  for (const raw of value.stops) {
    if (!isRecord(raw)) continue;
    const stop = parseStop(raw);
    const distanceM = asNumber(raw.distanceM);
    if (stop === null || distanceM === null || distanceM < 0) continue;
    if (seen.has(stop.stopId)) continue;
    seen.add(stop.stopId);
    out.push({ ...stop, distanceM, routes: parseRouteSummaries(raw.routes) });
  }
  return out;
}

function parseDirection(value: unknown): RouteDirection | null {
  if (!isRecord(value)) return null;
  const directionId = asNumber(value.directionId);
  const headsign = asString(value.headsign);
  const tripCount = asNumber(value.tripCount);
  if (directionId === null || headsign === null) return null;
  return { directionId, headsign, tripCount: tripCount ?? 0 };
}

export function parseLineDetail(value: unknown): LineDetail | null {
  if (!isRecord(value)) return null;
  const route = parseRouteSummary(value.route);
  if (route === null) return null;

  const directions: RouteDirection[] = [];
  if (Array.isArray(value.directions)) {
    for (const raw of value.directions) {
      const dir = parseDirection(raw);
      if (dir !== null) directions.push(dir);
    }
  }

  const stops: Stop[] = [];
  if (Array.isArray(value.stops)) {
    for (const raw of value.stops) {
      const stop = parseStop(raw);
      if (stop !== null) stops.push(stop);
    }
  }

  const activeDirection = asNumber(value.activeDirection);
  return {
    route,
    agencyName: asString(value.agencyName) ?? "",
    directions,
    activeDirection: activeDirection ?? directions[0]?.directionId ?? 0,
    stops,
    polyline: asString(value.polyline),
  };
}

function parseVehicle(value: unknown): Vehicle | null {
  if (!isRecord(value)) return null;
  const vehicleId = asString(value.vehicleId);
  const lat = asNumber(value.lat);
  const lon = asNumber(value.lon);
  if (vehicleId === null || lat === null || lon === null) return null;
  if (!isLatLon(lat, lon)) return null;
  const bearing = asNumber(value.bearing);
  return {
    vehicleId,
    vehicleLabel: asNonEmptyString(value.vehicleLabel),
    tripId: asString(value.tripId),
    routeId: asString(value.routeId),
    routeShortName: asString(value.routeShortName),
    lat,
    lon,
    bearing: bearing === null ? null : ((bearing % 360) + 360) % 360,
    timestamp: asNumber(value.timestamp) ?? 0,
  };
}

export function parseVehiclesResponse(value: unknown): VehiclesResponse | null {
  if (!isRecord(value) || !Array.isArray(value.vehicles)) return null;
  const vehicles: Vehicle[] = [];
  const seen = new Set<string>();
  for (const raw of value.vehicles) {
    const vehicle = parseVehicle(raw);
    if (vehicle === null || seen.has(vehicle.vehicleId)) continue;
    seen.add(vehicle.vehicleId);
    vehicles.push(vehicle);
  }
  return {
    vehicles,
    feedTimestamp: asNumber(value.feedTimestamp),
    degraded: value.degraded === true,
  };
}

/** The stop record embedded in an arrivals response, used to resolve ?focus=. */
export function parseStopFromArrivals(value: unknown): Stop | null {
  if (!isRecord(value)) return null;
  return parseStop(value.stop);
}

export async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  const text = await res.text();
  let body: unknown = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!res.ok) {
    let message = activeDictionary().errors.httpStatus(res.status);
    if (isRecord(body) && typeof body.error === "string") {
      message = typeof body.detail === "string" ? `${body.error}: ${body.detail}` : body.error;
    }
    throw new ApiRequestError(message, res.status);
  }
  return body;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function errorMessage(err: unknown): string {
  const words = activeDictionary().errors;
  if (err instanceof ApiRequestError) return err.message;
  if (err instanceof TypeError) return words.connectionFailed;
  if (err instanceof Error && err.message.length > 0) return err.message;
  return words.unexpectedDot;
}
