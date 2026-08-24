"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { IconChevronDown, IconClose, IconRefresh } from "@/components/Icons";
import { useMounted } from "@/components/hooks";
import { useSync } from "@/hooks/useSync";
import { formatClock } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import { normaliseCode } from "@/lib/sync";
import { STORAGE_KEYS } from "@/lib/types";

const CARD_CLASS = "rounded-card border border-line bg-surface p-3.5 shadow-card";
const BUTTON_CLASS =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line " +
  "bg-surface px-4 text-sm font-semibold active:bg-surface-2 disabled:opacity-50";
const PRIMARY_CLASS =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 " +
  "text-sm font-bold text-on-accent active:scale-[0.98] disabled:opacity-50";
const DANGER_CLASS =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-danger " +
  "px-4 text-sm font-semibold text-danger active:bg-danger-soft disabled:opacity-50";
const LINK_CLASS = "text-sm font-semibold text-accent underline underline-offset-2";

const COPIED_MS = 2_000;

/** Relative when it is recent, clock time when it is not. */
function lastSyncLabel(at: number | null, t: Dictionary): string {
  if (at === null) return t.dataAge.never;
  const diff = Date.now() - at;
  if (diff < 0 || diff < 60_000) return t.sync.justNow;
  if (diff < 3_600_000) return t.sync.minutesAgo(Math.floor(diff / 60_000));
  return t.sync.atClock(formatClock(Math.floor(at / 1_000)));
}

const BODY_ID = "sync-panel-body";

/** Reading a preference must never be the thing that breaks a render. */
function readExpanded(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.syncPanel) === "1";
  } catch {
    // Storage disabled (cookies off, embedded webview): stay collapsed.
    return false;
  }
}

function writeExpanded(value: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.syncPanel, value ? "1" : "0");
  } catch (err) {
    console.warn("[probus] preferenza del pannello sync non salvata", err);
  }
}

export interface SyncPanelProps {
  className?: string;
  /**
   * Collapse to a one-line summary until the user opens it. On by default:
   * the panel lives at the bottom of the sidebar on every page.
   */
  collapsible?: boolean;
}

/**
 * The collapsed header. It is the toggle, so the whole line is one 44px target
 * and the state is on it, not only in the icon.
 */
function PanelShell({
  collapsible,
  expanded,
  onToggle,
  summary,
  badge,
  className,
  children,
  t,
}: {
  collapsible: boolean;
  expanded: boolean;
  onToggle: () => void;
  summary: string;
  badge: ReactNode;
  className: string;
  children: ReactNode;
  t: Dictionary;
}) {
  if (!collapsible) {
    return (
      <section className={`${CARD_CLASS} ${className}`} aria-labelledby="sync-title">
        <div className="mb-2 flex items-center gap-2">
          <h2 id="sync-title" className="flex-1 text-sm font-bold">
            {t.sync.titleFull}
          </h2>
          {badge}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      <h2 id="sync-title">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={BODY_ID}
          className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-start transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[0.8125rem] font-bold leading-tight">
              {t.sync.titleCollapsed}
            </span>
            <span className="block truncate text-[0.6875rem] leading-tight text-muted">
              {summary}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 text-muted transition-transform motion-reduce:transition-none ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <IconChevronDown size={17} />
          </span>
        </button>
      </h2>
      <div id={BODY_ID} hidden={!expanded} className="border-t border-line px-3.5 py-3">
        {children}
      </div>
    </section>
  );
}

/**
 * The whole sync UI in one card: off, connecting, on, error and conflict.
 * Narrow enough for the sidebar, and the same component serves /settings.
 */
export default function SyncPanel({ className = "", collapsible = false }: SyncPanelProps) {
  const { status, code, canSync, unavailableReason, busy, enable, connect, disconnect, syncNow, deleteRemote } =
    useSync();

  const t = useT();
  const mounted = useMounted();
  // Collapsed on the server and on the first client render, whatever is stored:
  // the two have to agree, and collapsed is the safe half of the disagreement.
  const [expanded, setExpanded] = useState(false);
  const [joining, setJoining] = useState(false);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const isOn = code !== null;
  // crypto.subtle always exists while rendering on the server, so canSync is
  // true there and can be false on the first client pass: gate every use on mount.
  const unavailable = mounted && !canSync;

  useEffect(() => {
    if (!collapsible) return;
    setExpanded(readExpanded());
  }, [collapsible]);

  const toggle = (): void => {
    setExpanded((value) => {
      writeExpanded(!value);
      return !value;
    });
  };

  // Collapsed, this line is the whole panel: it has to say the state, not the
  // feature name. Gated on mount so a stored value cannot desync hydration.
  let summary: string;
  if (!mounted) summary = t.sync.summaryLoading;
  else if (unavailable) summary = t.sync.summaryUnavailable;
  else if (!isOn) summary = t.sync.summaryOff;
  else if (status.phase === "syncing") summary = t.sync.summarySyncing;
  else if (status.phase === "error") summary = t.sync.summaryError;
  else if (status.phase === "conflict") summary = t.sync.summaryConflict;
  else summary = t.sync.summaryOn(lastSyncLabel(status.lastSyncAt, t));

  // Sync just turned on or off: the connect form and the exposed code go away.
  useEffect(() => {
    setJoining(false);
    setInput("");
    setSubmitted(false);
    setShowCode(false);
    setConfirmDelete(false);
  }, [isOn]);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const live = normaliseCode(input);
  const typedSymbols = input.replace(/[\s\-_.]/g, "").length;
  // Bad characters are worth flagging while typing; a half-typed code is not.
  const showLiveError =
    !live.ok && input.trim().length > 0 && (submitted || live.reason === "invalidChars");

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
    setSubmitted(false);
  };

  const handleJoin = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
    if (!live.ok) return;
    void connect(live.formatted);
  };

  const handleCopy = async (): Promise<void> => {
    if (code === null) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // Clipboard denied (no permission, insecure context): the code is on
      // screen anyway, so tell the user to copy it by hand.
      setShowCode(true);
      setCopied(false);
    }
  };

  const shell = (body: ReactNode) => (
    <PanelShell
      collapsible={collapsible}
      expanded={expanded}
      onToggle={toggle}
      summary={summary}
      t={t}
      badge={
        isOn ? (
          <span className="rounded-chip bg-live-soft px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-live">
            {t.sync.badgeOn}
          </span>
        ) : null
      }
      className={className}
    >
      {body}
    </PanelShell>
  );

  // Before mount the body stays the normal off state the server sent, so the
  // two renders agree and nobody but the insecure-context reader sees a change.
  if (unavailable) {
    return shell(<p className="text-sm text-muted">{unavailableReason}</p>);
  }

  return shell(
    <>
      {status.message !== null ? (
        <p
          role={status.phase === "error" || status.phase === "conflict" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-2 rounded-chip px-2.5 py-2 text-sm ${
            status.phase === "error" || status.phase === "conflict"
              ? "bg-danger-soft text-danger"
              : "bg-surface-2 text-muted"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      {!isOn && !joining ? (
        <>
          <p className="mt-2 text-sm text-muted">{t.sync.intro}</p>
          <div className="mt-3 space-y-2">
            <button type="button" className={PRIMARY_CLASS} onClick={() => void enable()} disabled={busy}>
              {t.sync.enable}
            </button>
            <button
              type="button"
              className={`${BUTTON_CLASS} w-full`}
              onClick={() => setJoining(true)}
              disabled={busy}
            >
              {t.sync.haveCode}
            </button>
          </div>
        </>
      ) : null}

      {!isOn && joining ? (
        <form className="mt-3" onSubmit={handleJoin}>
          <label htmlFor="sync-code" className="text-sm font-semibold">
            {t.sync.codeLabel}
          </label>
          <p className="mt-1 text-xs text-muted">{t.sync.codeHint}</p>
          <input
            id="sync-code"
            name="sync-code"
            value={input}
            onChange={handleInput}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            maxLength={40}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
            aria-invalid={showLiveError}
            aria-describedby="sync-code-feedback"
            className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 font-mono text-base uppercase tracking-[0.12em] text-ink outline-none focus:border-accent"
          />
          <p
            id="sync-code-feedback"
            aria-live="polite"
            className={`mt-1.5 text-xs ${showLiveError ? "text-danger" : "text-muted"}`}
          >
            {showLiveError ? live.error : t.sync.codeProgress(Math.min(typedSymbols, 20), 20)}
          </p>
          <div className="mt-3 flex gap-2">
            <button type="submit" className={BUTTON_CLASS} disabled={busy}>
              {t.sync.join}
            </button>
            <button
              type="button"
              className={BUTTON_CLASS}
              onClick={() => {
                setJoining(false);
                setInput("");
                setSubmitted(false);
              }}
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      ) : null}

      {isOn ? (
        <>
          <p className="mt-2 text-sm text-muted">{t.sync.onIntro}</p>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {t.sync.code}
              </span>
              <button
                type="button"
                className={LINK_CLASS}
                aria-pressed={showCode}
                onClick={() => setShowCode((value) => !value)}
              >
                {showCode ? t.sync.hideCode : t.sync.showCode}
              </button>
            </div>
            {showCode ? (
              <>
                <p className="mt-1.5 select-all break-all rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-[0.95rem] font-bold leading-relaxed tracking-[0.14em]">
                  {code}
                </p>
                <button
                  type="button"
                  className={`${BUTTON_CLASS} mt-2 w-full`}
                  onClick={() => void handleCopy()}
                >
                  {copied ? t.sync.copied : t.sync.copyCode}
                </button>
              </>
            ) : (
              <p className="mt-1.5 rounded-xl border border-dashed border-line px-3 py-2.5 font-mono text-sm text-muted">
                •••••-•••••-•••••-•••••
              </p>
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            {t.sync.lastSync}{" "}
            <span className="font-semibold">{lastSyncLabel(status.lastSyncAt, t)}</span>
            {status.phase === "syncing" ? t.sync.inProgress : ""}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={BUTTON_CLASS} onClick={() => void syncNow()} disabled={busy}>
              <IconRefresh className="h-4 w-4" aria-hidden="true" />
              {t.sync.syncNow}
            </button>
            <button type="button" className={BUTTON_CLASS} onClick={disconnect} disabled={busy}>
              <IconClose className="h-4 w-4" aria-hidden="true" />
              {t.sync.disconnect}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">{t.sync.disconnectNote}</p>

          <div className="mt-3 border-t border-line pt-3">
            {confirmDelete ? (
              <>
                <p className="text-sm text-danger">{t.sync.deleteWarning}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className={DANGER_CLASS}
                    onClick={() => void deleteRemote()}
                    disabled={busy}
                  >
                    {t.sync.deleteConfirm}
                  </button>
                  <button type="button" className={BUTTON_CLASS} onClick={() => setConfirmDelete(false)}>
                    {t.common.cancel}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="text-sm font-semibold text-danger underline underline-offset-2"
                onClick={() => setConfirmDelete(true)}
              >
                {t.sync.deleteRemote}
              </button>
            )}
          </div>
        </>
      ) : null}
    </>,
  );
}
