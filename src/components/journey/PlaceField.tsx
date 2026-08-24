"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { IconClose, IconPin, IconRefresh, IconSearch } from "@/components/Icons";
import { useJsonResource } from "@/components/api";
import { parsePlacesResponse } from "@/components/journey/api";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { JourneyPlace } from "@/lib/types";

const DEBOUNCE_MS = 350;
const MAX_QUERY_LENGTH = 120;

export interface PlaceFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** Fired when the user commits a suggestion rather than free text. */
  onPick: (place: JourneyPlace) => void;
  /** Shown when the browser can report a position. */
  onUseLocation?: () => void;
  locating?: boolean;
  className?: string;
}

function placeKindLabel(place: JourneyPlace, t: Dictionary): string {
  if (place.kind === "stop") return t.journey.placeStop;
  if (place.kind === "coord") return t.journey.placeCoord;
  return t.journey.placeAddress;
}

/**
 * Text field with suggestions. Stops come from our own database and addresses
 * from the geocoder, both through /api/journey?mode=places, which is throttled
 * and cached server-side: typing fast here cannot turn into abusive traffic.
 */
export default function PlaceField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onPick,
  onUseLocation,
  locating = false,
  className = "",
}: PlaceFieldProps) {
  const t = useT();
  const listId = useId();
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // A pick fills the field; that must not immediately re-open the suggestions.
  const justPickedRef = useRef(false);

  useEffect(() => {
    if (justPickedRef.current) {
      justPickedRef.current = false;
      setDebounced("");
      return;
    }
    const trimmed = value.trim().slice(0, MAX_QUERY_LENGTH);
    const timer = window.setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value]);

  const url =
    debounced.length >= 2 ? `/api/journey?mode=places&q=${encodeURIComponent(debounced)}` : null;
  const { data, state } = useJsonResource(url, parsePlacesResponse, 0);

  const options = useMemo(() => data?.places ?? [], [data]);
  useEffect(() => {
    setActiveIndex(-1);
  }, [options]);

  const commit = (place: JourneyPlace | undefined): void => {
    if (place === undefined) return;
    justPickedRef.current = true;
    setOpen(false);
    onPick(place);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Escape") {
      if (open && options.length > 0) {
        event.stopPropagation();
        setOpen(false);
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (options.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const next = current + (event.key === "ArrowDown" ? 1 : -1);
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }
    // Enter with a highlighted suggestion takes it; otherwise the form submits.
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      commit(options[activeIndex]);
    }
  };

  const showPanel = open && url !== null && (options.length > 0 || state === "loading");
  const busy = url !== null && state === "loading";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label htmlFor={id} className="mb-1 block text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted">
          <IconSearch size={17} />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={placeholder}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && rootRef.current?.contains(next) === true) return;
            setOpen(false);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
          className="h-12 w-full rounded-chip border border-line bg-surface ps-10 pe-20 text-[0.9375rem] font-medium text-ink placeholder:font-normal placeholder:text-muted"
        />

        <div className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {busy ? (
            <span aria-hidden="true" className="px-1 text-muted">
              <IconRefresh size={15} className="animate-spin-slow" />
            </span>
          ) : null}
          {value.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              aria-label={t.journey.clearField(label)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 active:bg-surface-2"
            >
              <IconClose size={16} />
            </button>
          ) : null}
          {onUseLocation !== undefined ? (
            <button
              type="button"
              onClick={onUseLocation}
              disabled={locating}
              aria-label={t.journey.useMyPosition}
              title={t.journey.useMyPosition}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-accent-soft active:bg-accent-soft disabled:opacity-50"
            >
              <IconPin size={17} />
            </button>
          ) : null}
        </div>
      </div>

      {showPanel ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.journey.suggestionsFor(label)}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto overscroll-contain rounded-card border border-line bg-surface py-1 shadow-card"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted">{t.common.searching}</li>
          ) : (
            options.map((place, index) => (
              <li key={`${place.kind}-${place.stopId ?? ""}-${place.lat}-${place.lon}-${index}`}>
                <button
                  type="button"
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(place)}
                  className={`flex w-full min-h-11 items-center gap-2.5 px-3 py-2 text-start transition-colors hover:bg-surface-2 ${
                    index === activeIndex ? "bg-surface-2" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-semibold caps-data">{place.name}</span>
                    <span className="block truncate text-[0.6875rem] text-muted">
                      {place.label ?? placeKindLabel(place, t)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-muted">
                    {placeKindLabel(place, t)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
