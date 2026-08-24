"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconClose } from "@/components/Icons";
import LineBadge, { displayLineName } from "@/components/LineBadge";
import { useT } from "@/lib/i18n";
import type { RouteSummary } from "@/lib/types";

export interface TagDialogProps {
  open: boolean;
  stopName: string;
  initialTag: string | null;
  onClose: () => void;
  /** null clears the tag. */
  onSave: (tag: string | null) => void;
  /** Lines calling at this stop. Passing them enables the line picker. */
  routes?: readonly RouteSummary[];
  /** Route ids currently pinned. Empty means "show every line". */
  initialPinned?: readonly string[];
  /** Omit to hide the picker even when routes are known. */
  onSavePinned?: (routeIds: string[]) => void;
}

const MAX_TAG_LENGTH = 32;

interface LineOption {
  routeId: string;
  route: RouteSummary | null;
}

/**
 * Every line the user can pin: the ones calling here now, plus any id already
 * pinned that the current arrivals do not mention (a seasonal or night line),
 * which must not be dropped just because it is quiet right now.
 */
function lineOptions(routes: readonly RouteSummary[], pinned: readonly string[]): LineOption[] {
  const options: LineOption[] = [];
  const seen = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.routeId)) continue;
    seen.add(route.routeId);
    options.push({ routeId: route.routeId, route });
  }
  for (const routeId of pinned) {
    if (seen.has(routeId)) continue;
    seen.add(routeId);
    options.push({ routeId, route: null });
  }
  return options;
}

/** Native <dialog>: real focus trap, real Esc handling, no extra dependency. */
export default function TagDialog({
  open,
  stopName,
  initialTag,
  onClose,
  onSave,
  routes,
  initialPinned,
  onSavePinned,
}: TagDialogProps) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialTag ?? "");
  const [pinned, setPinned] = useState<ReadonlySet<string>>(new Set());

  // Read through refs: the arrays are fresh objects on every parent render, so
  // depending on them directly would reset the form while the user types.
  const initialTagRef = useRef(initialTag);
  initialTagRef.current = initialTag;
  const initialPinnedRef = useRef(initialPinned);
  initialPinnedRef.current = initialPinned;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open) {
      setValue(initialTagRef.current ?? "");
      setPinned(new Set(initialPinnedRef.current ?? []));
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => inputRef.current?.select(), 0);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const options = useMemo(
    () => lineOptions(routes ?? [], initialPinned ?? []),
    [routes, initialPinned],
  );
  const showPicker = onSavePinned !== undefined && options.length > 0;

  const toggle = (routeId: string): void => {
    setPinned((current) => {
      const next = new Set(current);
      if (next.has(routeId)) next.delete(routeId);
      else next.add(routeId);
      return next;
    });
  };

  const commit = (tag: string | null, routeIds: string[] | null): void => {
    onSave(tag);
    if (routeIds !== null) onSavePinned?.(routeIds);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tag-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      className="m-auto max-h-[85dvh] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-line bg-surface p-0 text-ink shadow-card"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = value.trim().slice(0, MAX_TAG_LENGTH);
          commit(trimmed.length === 0 ? null : trimmed, showPicker ? Array.from(pinned) : null);
        }}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="tag-dialog-title" className="text-base font-bold">
              {showPicker ? t.tagDialog.titleFavorite : t.tagDialog.titleTag}
            </h2>
            <p className="mt-0.5 truncate text-xs text-muted caps-data">{stopName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="-me-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <label htmlFor="tag-dialog-input" className="text-sm font-medium">
            {t.tagDialog.label}
          </label>
          <input
            id="tag-dialog-input"
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={MAX_TAG_LENGTH}
            enterKeyHint="done"
            placeholder={t.tagDialog.placeholder}
            className="mt-2 h-12 w-full rounded-xl border border-line bg-bg px-3.5 text-base text-ink outline-none placeholder:text-muted focus:border-accent"
          />
          <p className="mt-2 text-xs text-muted">{t.tagDialog.hint(MAX_TAG_LENGTH)}</p>
        </div>

        {showPicker ? (
          <fieldset className="border-t border-line px-5 py-4">
            <legend className="text-sm font-medium">{t.tagDialog.linesLegend}</legend>
            <p className="mt-1 text-xs text-muted">
              {pinned.size === 0
                ? t.tagDialog.linesNone
                : t.tagDialog.linesSome(pinned.size)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((option) => {
                const active = pinned.has(option.routeId);
                const label =
                  option.route === null
                    ? option.routeId
                    : displayLineName(option.route.shortName, option.route.routeType);
                return (
                  <button
                    key={option.routeId}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(option.routeId)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-2.5 text-sm font-semibold ${
                      active
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-surface active:bg-surface-2"
                    }`}
                  >
                    {option.route !== null ? (
                      <LineBadge
                        shortName={option.route.shortName}
                        routeType={option.route.routeType}
                        color={option.route.color}
                        textColor={option.route.textColor}
                        size="sm"
                        decorative
                      />
                    ) : (
                      <span className="tabular-nums">{label}</span>
                    )}
                    <span className="sr-only">{t.lines.named(label)}</span>
                    <span aria-hidden="true" className="text-xs">
                      {active ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            {pinned.size > 0 ? (
              <button
                type="button"
                onClick={() => setPinned(new Set())}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-2"
              >
                {t.tagDialog.showAllLines}
              </button>
            ) : null}
          </fieldset>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
          {initialTag !== null && initialTag.length > 0 ? (
            <button
              type="button"
              onClick={() => commit(null, showPicker ? Array.from(pinned) : null)}
              className="me-auto inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold text-danger active:bg-danger-soft"
            >
              {t.tagDialog.removeTag}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold active:bg-surface-2"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent active:scale-[0.98]"
          >
            {t.common.save}
          </button>
        </div>
      </form>
    </dialog>
  );
}
