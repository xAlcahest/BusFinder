"use client";

/**
 * Device sync driver: pull, merge, push, and the timers that decide when.
 *
 * The rules that keep this honest: never two syncs at once, never a stacked
 * debounce timer, every request has a timeout and dies with the component, and
 * a conflict the server keeps refusing is reported instead of retried forever.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { activeDictionary, useT } from "@/lib/i18n";
import {
  applySyncPayload,
  clearSyncState,
  hydrate,
  readSyncPayload,
  readSyncState,
  serverSyncStateSnapshot,
  subscribe,
  syncStateSnapshot,
  writeSyncState,
} from "@/lib/storage";
import {
  decryptPayload,
  deleteBlob,
  deriveKeys,
  encryptPayload,
  generateCode,
  mergePayloads,
  normaliseCode,
  payloadSignature,
  pullBlob,
  pushBlob,
  syncErrorMessage,
  syncSupport,
  type DerivedKeys,
} from "@/lib/sync";
import type { SyncPayload, SyncPhase, SyncStatus } from "@/lib/types";

/** Long enough that typing a tag is one request, not one per keystroke. */
const DEBOUNCE_MS = 6_000;
/** Coming back to the tab does not re-sync if we just did. */
const VISIBILITY_MIN_GAP_MS = 30_000;
const MAX_PUSH_ATTEMPTS = 4;
const BACKOFF_MS = [400, 900, 2_000];

export interface UseSync {
  status: SyncStatus;
  /** The code, only when sync is on. It is the only secret in the system. */
  code: string | null;
  /** False when the browser cannot do crypto at all (plain http, no subtle). */
  canSync: boolean;
  /** Why it cannot, in the reader's language, or null when it can. */
  unavailableReason: string | null;
  busy: boolean;
  enable(): Promise<void>;
  connect(code: string): Promise<void>;
  disconnect(): void;
  syncNow(): Promise<void>;
  deleteRemote(): Promise<void>;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort(): void {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function useSync(): UseSync {
  const t = useT();
  const syncState = useSyncExternalStore(subscribe, syncStateSnapshot, serverSyncStateSnapshot);
  const [phase, setPhase] = useState<SyncPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const mounted = useRef(true);
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const scheduleRef = useRef<(() => void) | null>(null);
  const keysRef = useRef<{ code: string; keys: DerivedKeys } | null>(null);
  /** Signature of the payload we last agreed with the server about. */
  const lastSignature = useRef<string | null>(null);
  const firstSyncFor = useRef<string | null>(null);

  // Only the verdict is memoised: the sentence explaining it is resolved on
  // every read, so switching language retranslates it.
  const canSync = useMemo(() => syncSupport().ok, []);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abortRef.current?.abort();
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const report = useCallback((next: SyncPhase, text: string | null): void => {
    if (!mounted.current) return;
    setPhase(next);
    setMessage(text);
  }, []);

  const keysFor = useCallback(async (code: string): Promise<DerivedKeys> => {
    const cached = keysRef.current;
    if (cached !== null && cached.code === code) return cached.keys;
    const keys = await deriveKeys(code);
    keysRef.current = { code, keys };
    return keys;
  }, []);

  /**
   * One full cycle. Reads its own state from storage rather than from props, so
   * the callback identity never changes and the effects below stay stable.
   */
  const runSync = useCallback(async (): Promise<void> => {
    if (inFlight.current) return;
    const state = readSyncState();
    if (state.code === null || state.syncId === null) return;
    if (!canSync) {
      report("error", activeDictionary().sync.errors.insecureContext);
      return;
    }

    inFlight.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    report("syncing", null);

    try {
      const keys = await keysFor(state.code);
      for (let attempt = 0; ; attempt += 1) {
        const pulled = await pullBlob(keys.syncId, controller.signal);
        let remote: SyncPayload | null = null;
        let baseVersion = 0;
        if (pulled.kind === "found") {
          remote = await decryptPayload(pulled.blob, keys.key);
          baseVersion = pulled.version;
        }

        const local = readSyncPayload();
        const merged = remote === null ? local : mergePayloads(local, remote);
        const mergedSignature = payloadSignature(merged);
        // Apply first: this device benefits from the merge even if the push
        // then fails because someone else got there first.
        if (remote !== null && mergedSignature !== payloadSignature(local)) {
          applySyncPayload(merged);
        }
        lastSignature.current = mergedSignature;

        if (remote !== null && mergedSignature === payloadSignature(remote)) {
          writeSyncState({ version: baseVersion, lastSyncAt: Date.now() });
          report("idle", null);
          return;
        }

        const encrypted = await encryptPayload(merged, keys.key);
        const pushed = await pushBlob(
          keys.syncId,
          { ciphertext: encrypted.ciphertext, iv: encrypted.iv, baseVersion },
          controller.signal,
        );
        if (pushed.kind === "ok") {
          writeSyncState({ version: pushed.version, lastSyncAt: Date.now() });
          report("idle", null);
          return;
        }

        // 409: someone wrote between our pull and our push. Pull again, merge
        // again, retry. A few times only, then say so instead of looping.
        if (attempt + 1 >= MAX_PUSH_ATTEMPTS) {
          report("conflict", activeDictionary().sync.errors.conflict);
          return;
        }
        await delay(BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)], controller.signal);
      }
    } catch (err) {
      if (isAbort(err) || !mounted.current) return;
      console.warn("[probus] sync failed", err);
      report("error", syncErrorMessage(err));
    } finally {
      inFlight.current = false;
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [canSync, keysFor, report]);

  const scheduleSync = useCallback((): void => {
    if (typeof window === "undefined") return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const state = readSyncState();
      if (state.syncId === null || !state.autoSync) return;
      if (payloadSignature(readSyncPayload()) === lastSignature.current) return;
      // Never queue behind a running sync: come back after it has finished.
      if (inFlight.current) {
        scheduleRef.current?.();
        return;
      }
      void runSync();
    }, DEBOUNCE_MS);
  }, [runSync]);

  useEffect(() => {
    scheduleRef.current = scheduleSync;
  }, [scheduleSync]);

  // Local data changed: debounce, then sync if it really is different.
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const state = readSyncState();
      if (state.syncId === null || !state.autoSync) return;
      if (payloadSignature(readSyncPayload()) === lastSignature.current) return;
      scheduleSync();
    });
    return unsubscribe;
  }, [scheduleSync]);

  // First sync after the code is known, once per code.
  useEffect(() => {
    const id = syncState.syncId;
    if (id === null || !syncState.autoSync) return;
    if (firstSyncFor.current === id) return;
    firstSyncFor.current = id;
    void runSync();
  }, [syncState.syncId, syncState.autoSync, runSync]);

  // Back to the tab: the other device may have written while we were away.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = (): void => {
      if (document.visibilityState !== "visible") return;
      const state = readSyncState();
      if (state.syncId === null || !state.autoSync) return;
      if (state.lastSyncAt !== null && Date.now() - state.lastSyncAt < VISIBILITY_MIN_GAP_MS) {
        return;
      }
      void runSync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [runSync]);

  const activate = useCallback(
    async (rawCode: string): Promise<void> => {
      if (!canSync) {
        report("error", activeDictionary().sync.errors.insecureContext);
        return;
      }
      const check = normaliseCode(rawCode);
      if (!check.ok) {
        report("error", check.error);
        return;
      }
      try {
        const keys = await deriveKeys(check.formatted);
        keysRef.current = { code: check.formatted, keys };
        lastSignature.current = null;
        firstSyncFor.current = keys.syncId;
        writeSyncState({
          code: check.formatted,
          syncId: keys.syncId,
          version: 0,
          lastSyncAt: null,
        });
        await runSync();
      } catch (err) {
        if (isAbort(err)) return;
        report("error", syncErrorMessage(err));
      }
    },
    [canSync, report, runSync],
  );

  const enable = useCallback(async (): Promise<void> => {
    if (!canSync) {
      report("error", activeDictionary().sync.errors.insecureContext);
      return;
    }
    let code: string;
    try {
      code = generateCode();
    } catch (err) {
      report("error", syncErrorMessage(err));
      return;
    }
    await activate(code);
  }, [activate, canSync, report]);

  const connect = useCallback(
    async (code: string): Promise<void> => {
      await activate(code);
    },
    [activate],
  );

  const disconnect = useCallback((): void => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlight.current = false;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    keysRef.current = null;
    lastSignature.current = null;
    firstSyncFor.current = null;
    clearSyncState();
    report("off", activeDictionary().sync.status.disconnected);
  }, [report]);

  const syncNow = useCallback(async (): Promise<void> => {
    await runSync();
  }, [runSync]);

  /** Destructive and separate from disconnect: this one cannot be undone. */
  const deleteRemote = useCallback(async (): Promise<void> => {
    const state = readSyncState();
    if (state.code === null) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    report("syncing", null);
    try {
      const keys = await keysFor(state.code);
      await deleteBlob(keys.syncId, controller.signal);
      keysRef.current = null;
      lastSignature.current = null;
      firstSyncFor.current = null;
      clearSyncState();
      report("off", activeDictionary().sync.status.deleted);
    } catch (err) {
      if (isAbort(err) || !mounted.current) return;
      report("error", syncErrorMessage(err));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [keysFor, report]);

  const status = useMemo<SyncStatus>(() => {
    const off = syncState.syncId === null;
    return {
      phase: off && phase !== "error" ? "off" : phase,
      lastSyncAt: syncState.lastSyncAt,
      message,
    };
  }, [message, phase, syncState.lastSyncAt, syncState.syncId]);

  return {
    status,
    code: syncState.code,
    canSync,
    unavailableReason: canSync ? null : t.sync.errors.insecureContext,
    busy: phase === "syncing",
    enable,
    connect,
    disconnect,
    syncNow,
    deleteRemote,
  };
}
