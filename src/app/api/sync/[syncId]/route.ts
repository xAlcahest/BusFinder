/**
 * Device sync: an encrypted key-value store keyed by an opaque id.
 *
 * The browser derives both the id and the AES-256-GCM key from a code with
 * HKDF-SHA256 and uploads only ciphertext, so this route cannot read what it
 * stores and there is nothing here to authenticate against. Consequences:
 * the id is validated to the byte before it reaches SQL, bodies are capped,
 * writes are rate limited, and neither the id nor the ciphertext is ever logged.
 */

import { NextResponse } from "next/server";
import { apiError, badRequest, notFound } from "@/app/api/_lib/http";
import { SYNC_READ_RULE, SYNC_RULE, enforceRateLimit } from "@/app/api/_lib/ratelimit";
import {
  deleteSyncBlob,
  maybePurgeSyncBlobs,
  readSyncBlob,
  writeSyncBlob,
} from "@/lib/syncdb";
import type { ApiError, SyncPullResponse, SyncPushResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/** HKDF output, hex encoded. Nothing else is ever a valid id. */
const SYNC_ID_RE = /^[0-9a-f]{64}$/;
/** Whole request body, base64 included. */
const MAX_BODY_BYTES = 256 * 1024;
/** Ciphertext must survive base64 expansion inside the body cap. */
const MAX_CIPHERTEXT_BYTES = 180 * 1024;
/** An AES-GCM output is at least the 16-byte tag plus one byte of payload. */
const MIN_CIPHERTEXT_BYTES = 17;
const IV_BYTES = 12;

const NO_STORE: Record<string, string> = { "Cache-Control": "no-store, max-age=0" };

/** Logs without the id or the blob: both are user data even when opaque. */
function logFailure(scope: string, cause: unknown): void {
  const message = cause instanceof Error ? `${cause.name}: ${cause.message}` : "errore sconosciuto";
  console.error(`[api:sync:${scope}] ${message}`);
}

function serverFailure(scope: string, cause: unknown): NextResponse<ApiError> {
  logFailure(scope, cause);
  return apiError(500, "Errore interno del server");
}

function readSyncId(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;
  // No trimming and no decoding: the id is exactly these 64 bytes or nothing.
  return SYNC_ID_RE.test(raw) ? raw : null;
}

const INVALID_ID = "identificativo di sincronizzazione non valido";

/** Rejects the lenient decoding Buffer.from would otherwise accept. */
function decodeBase64(value: string): Buffer | null {
  if (value.length === 0 || value.length % 4 !== 0) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64");
  // Round-trip: catches padding that decodes to fewer bytes than it claims.
  return decoded.toString("base64") === value ? decoded : null;
}

interface BodyTooLarge {
  tooLarge: true;
}

/**
 * Reads the body with a hard byte cap. The declared content-length is only a
 * hint, so the actual bytes are counted too: a lying header must not get in.
 */
async function readCappedBody(request: Request): Promise<string | BodyTooLarge> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) return { tooLarge: true };
  }
  const body = request.body;
  if (body === null) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const chunks: string[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value === undefined) continue;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { tooLarge: true };
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
  } finally {
    reader.releaseLock();
  }
  chunks.push(decoder.decode());
  return chunks.join("");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ParsedPush {
  ciphertext: Buffer;
  iv: Buffer;
  baseVersion: number;
}

type PushParse = { ok: true; value: ParsedPush } | { ok: false; detail: string };

function parsePush(raw: string): PushParse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, detail: "corpo della richiesta non e JSON valido" };
  }
  if (!isRecord(parsed)) return { ok: false, detail: "corpo della richiesta non valido" };

  const { ciphertext, iv, baseVersion } = parsed;
  if (typeof ciphertext !== "string") return { ok: false, detail: "campo ciphertext mancante" };
  if (typeof iv !== "string") return { ok: false, detail: "campo iv mancante" };
  if (typeof baseVersion !== "number" || !Number.isSafeInteger(baseVersion) || baseVersion < 0) {
    return { ok: false, detail: "campo baseVersion non valido" };
  }

  const cipherBytes = decodeBase64(ciphertext);
  if (cipherBytes === null) return { ok: false, detail: "campo ciphertext non e base64 valido" };
  if (cipherBytes.length < MIN_CIPHERTEXT_BYTES) {
    return { ok: false, detail: "ciphertext troppo corto" };
  }
  if (cipherBytes.length > MAX_CIPHERTEXT_BYTES) {
    return { ok: false, detail: "ciphertext troppo grande" };
  }

  const ivBytes = decodeBase64(iv);
  if (ivBytes === null) return { ok: false, detail: "campo iv non e base64 valido" };
  if (ivBytes.length !== IV_BYTES) return { ok: false, detail: `iv deve essere di ${IV_BYTES} byte` };

  return { ok: true, value: { ciphertext: cipherBytes, iv: ivBytes, baseVersion } };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ syncId: string }> },
): Promise<Response> {
  const limited = enforceRateLimit(request, [SYNC_RULE, SYNC_READ_RULE]);
  if (limited !== null) return limited;
  try {
    const { syncId: raw } = await context.params;
    const syncId = readSyncId(raw);
    if (syncId === null) return badRequest(INVALID_ID);

    const row = readSyncBlob(syncId);
    maybePurgeSyncBlobs();
    if (row === null) return notFound("Nessun dato sincronizzato per questo codice");

    const body: SyncPullResponse = {
      ciphertext: row.ciphertext.toString("base64"),
      iv: row.iv.toString("base64"),
      version: row.version,
      updatedAt: row.updatedAt,
    };
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (cause) {
    return serverFailure("get", cause);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ syncId: string }> },
): Promise<Response> {
  const limited = enforceRateLimit(request, [SYNC_RULE]);
  if (limited !== null) return limited;
  try {
    const { syncId: raw } = await context.params;
    const syncId = readSyncId(raw);
    if (syncId === null) return badRequest(INVALID_ID);

    const body = await readCappedBody(request);
    if (typeof body !== "string") {
      return apiError(413, "Dati troppo grandi", `il limite e ${MAX_BODY_BYTES} byte`);
    }
    const parsed = parsePush(body);
    if (!parsed.ok) return badRequest(parsed.detail);

    const result = writeSyncBlob({
      syncId,
      ciphertext: parsed.value.ciphertext,
      iv: parsed.value.iv,
      baseVersion: parsed.value.baseVersion,
      now: Date.now(),
    });
    maybePurgeSyncBlobs();
    if (!result.ok) {
      return apiError(
        409,
        "Conflitto di versione",
        `il server ha la versione ${result.currentVersion}: scarica, unisci e riprova`,
      );
    }

    const response: SyncPushResponse = { version: result.version, updatedAt: result.updatedAt };
    return NextResponse.json(response, { headers: NO_STORE });
  } catch (cause) {
    return serverFailure("put", cause);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ syncId: string }> },
): Promise<Response> {
  const limited = enforceRateLimit(request, [SYNC_RULE]);
  if (limited !== null) return limited;
  try {
    const { syncId: raw } = await context.params;
    const syncId = readSyncId(raw);
    if (syncId === null) return badRequest(INVALID_ID);

    // Removing an unknown id is a success: the client's goal is "it is gone".
    deleteSyncBlob(syncId);
    maybePurgeSyncBlobs();
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  } catch (cause) {
    return serverFailure("delete", cause);
  }
}
