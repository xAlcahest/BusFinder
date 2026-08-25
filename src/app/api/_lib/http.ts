/** Shared response and query-string helpers for the API routes. */

import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";

const NO_STORE: Record<string, string> = { "Cache-Control": "no-store, max-age=0" };

export function jsonOk<T>(body: T): NextResponse<T> {
  return NextResponse.json(body, { headers: NO_STORE });
}

export function apiError(status: number, error: string, detail?: string): NextResponse<ApiError> {
  const body: ApiError = detail === undefined ? { error } : { error, detail };
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function badRequest(detail: string): NextResponse<ApiError> {
  return apiError(400, "Parametri non validi", detail);
}

export function notFound(error: string, detail?: string): NextResponse<ApiError> {
  return apiError(404, error, detail);
}

/** One log line, whatever the message carries: no newline from a request can forge a second entry. */
export function logLine(value: unknown): string {
  const text = value instanceof Error ? `${value.name}: ${value.message}` : String(value);
  // Newlines dropped outright, in the one form CodeQL recognises as a sanitizer.
  return text
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    .slice(0, 2000);
}

/** Logs the real cause server-side and returns an opaque 500 to the client. */
export function serverError(scope: string, cause: unknown): NextResponse<ApiError> {
  console.error(`[api:${logLine(scope)}] ${logLine(cause)}`);
  if (cause instanceof Error && cause.stack !== undefined) console.error(logLine(cause.stack));
  return apiError(500, "Errore interno del server");
}

/** Thrown by the parsers below; every route turns it into a 400. */
export class BadParam extends Error {}

const ID_RE = /^[A-Za-z0-9._#-]{1,64}$/;

export function requireId(raw: string | undefined, label: string): string {
  const value = (raw ?? "").trim();
  if (!ID_RE.test(value)) throw new BadParam(`${label} non valido`);
  return value;
}

export function optionalId(params: URLSearchParams, key: string, label: string): string | null {
  const raw = params.get(key);
  if (raw === null) return null;
  const value = raw.trim();
  if (value.length === 0) return null;
  if (!ID_RE.test(value)) throw new BadParam(`${label} non valido`);
  return value;
}

export function optionalNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null) return null;
  const value = raw.trim();
  if (value.length === 0) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new BadParam(`parametro "${key}" non numerico`);
  return parsed;
}

export function optionalInt(params: URLSearchParams, key: string, min: number, max: number): number | null {
  const parsed = optionalNumber(params, key);
  if (parsed === null) return null;
  const value = Math.floor(parsed);
  if (value < min || value > max) throw new BadParam(`parametro "${key}" fuori intervallo (${min}..${max})`);
  return value;
}

export function optionalBool(params: URLSearchParams, key: string): boolean | null {
  const raw = params.get(key);
  if (raw === null) return null;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "si") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  throw new BadParam(`parametro "${key}" non booleano`);
}

/** Maps a thrown value to a 400 for bad input, 500 for anything else. */
export function failure(scope: string, cause: unknown): NextResponse<ApiError> {
  if (cause instanceof BadParam) return badRequest(cause.message);
  return serverError(scope, cause);
}
