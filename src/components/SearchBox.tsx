"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import LineBadge, { displayLineName } from "@/components/LineBadge";
import { IconChevronRight, IconClose, IconRefresh, IconSearch } from "@/components/Icons";
import { parseSearchResponse, useJsonResource } from "@/components/api";
import { useT } from "@/lib/i18n";
import type { RouteSummary, Stop } from "@/lib/types";

type Option =
  | { kind: "route"; key: string; href: string; route: RouteSummary }
  | { kind: "stop"; key: string; href: string; stop: Stop };

const DEBOUNCE_MS = 300;
const MAX_QUERY_LENGTH = 60;

export default function SearchBox({ className = "" }: { className?: string }) {
  const t = useT();
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const trimmed = query.trim().slice(0, MAX_QUERY_LENGTH);
    const id = window.setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  const url =
    debounced.length >= 1 ? `/api/search?q=${encodeURIComponent(debounced)}` : null;
  const { data, error, state } = useJsonResource(url, parseSearchResponse, 0);

  const options = useMemo<Option[]>(() => {
    if (data === null) return [];
    const routes: Option[] = data.routes.map((route) => ({
      kind: "route",
      key: `r-${route.routeId}`,
      href: `/line/${encodeURIComponent(route.routeId)}`,
      route,
    }));
    const stops: Option[] = data.stops.map((stop) => ({
      kind: "stop",
      key: `s-${stop.stopId}`,
      href: `/stop/${encodeURIComponent(stop.stopId)}`,
      stop,
    }));
    return [...routes, ...stops];
  }, [data]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [options]);

  const searching = url !== null && state === "loading";
  const showPanel = open && url !== null;
  const activeId = activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  const go = (option: Option | undefined) => {
    if (option === undefined) return;
    setOpen(false);
    inputRef.current?.blur();
    router.push(option.href);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open && options.length > 0) setOpen(false);
      else setQuery("");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (options.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = current + step;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(options[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  return (
    <search ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"
        >
          <IconSearch size={19} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
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
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label={t.search.inputAria}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={MAX_QUERY_LENGTH}
          placeholder={t.search.placeholder}
          className="h-14 w-full rounded-2xl border border-line bg-surface ps-12 pe-12 text-base font-medium text-ink shadow-card outline-none transition-colors placeholder:font-normal placeholder:text-muted hover:border-line-strong focus:border-accent lg:h-12 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <div className="absolute end-2.5 top-1/2 flex -translate-y-1/2 items-center">
          {searching ? (
            <span className="px-2 text-muted" role="status" aria-label={t.common.searchInProgress}>
              <IconRefresh size={17} className="animate-spin-slow" />
            </span>
          ) : query.length > 0 ? (
            <button
              type="button"
              aria-label={t.common.clearSearch}
              onClick={() => {
                setQuery("");
                setDebounced("");
                inputRef.current?.focus();
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2 lg:h-9 lg:w-9"
            >
              <IconClose size={18} />
            </button>
          ) : null}
        </div>
      </div>

      {showPanel ? (
        <div
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 max-h-[60vh] overflow-y-auto overscroll-contain rounded-card border border-line bg-surface shadow-card"
        >
          {error !== null ? (
            <p className="px-4 py-4 text-sm text-danger">{error}</p>
          ) : data === null && state === "loading" ? (
            <p className="px-4 py-4 text-sm text-muted" role="status">
              {t.search.searchingFor(debounced)}
            </p>
          ) : options.length === 0 && state === "ready" ? (
            <div className="px-4 py-5">
              <p className="text-sm font-semibold">{t.search.noResultsFor(debounced)}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t.search.noResultsHint}</p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={t.search.resultsList}>
              {options.map((option, index) => {
                const active = index === activeIndex;
                return (
                  <li
                    key={option.key}
                    id={`${listId}-opt-${index}`}
                    role="option"
                    aria-selected={active}
                    className={`flex items-stretch border-b border-line last:border-b-0 transition-colors hover:bg-surface-2 ${active ? "bg-surface-2" : ""}`}
                  >
                    <Link
                      href={option.href}
                      tabIndex={-1}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[3.25rem] min-w-0 flex-1 items-center gap-3 px-4 py-2.5 lg:min-h-[3rem]"
                    >
                      {option.kind === "route" ? (
                        <>
                          <LineBadge
                            shortName={option.route.shortName}
                            routeType={option.route.routeType}
                            color={option.route.color}
                            textColor={option.route.textColor}
                            size="md"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9375rem] font-semibold caps-data">
                              {option.route.longName !== null && option.route.longName.length > 0
                                ? option.route.longName
                                : t.lines.named(
                                    displayLineName(
                                      option.route.shortName,
                                      option.route.routeType,
                                    ),
                                  )}
                            </span>
                            <span className="block text-xs capitalize text-muted">
                              {t.lines.typeLower(option.route.routeType)}
                            </span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted"
                          >
                            <IconSearch size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9375rem] font-semibold caps-data">
                              {option.stop.stopName}
                            </span>
                            <span className="block text-xs tabular-nums text-muted">
                              {option.stop.stopCode !== null && option.stop.stopCode.length > 0
                                ? t.stops.code(option.stop.stopCode)
                                : t.stops.codeOnly}
                            </span>
                          </span>
                        </>
                      )}
                      <IconChevronRight size={17} className="shrink-0 text-muted" />
                    </Link>
                    {/* Save straight from the results, without opening anything. */}
                    <span className="flex shrink-0 items-center border-s border-line px-2">
                      {option.kind === "route" ? (
                        <FavoriteButton
                          kind="line"
                          id={option.route.routeId}
                          name={displayLineName(option.route.shortName, option.route.routeType)}
                          routeType={option.route.routeType}
                          color={option.route.color}
                          size="row"
                        />
                      ) : (
                        <FavoriteButton
                          kind="stop"
                          id={option.stop.stopId}
                          name={option.stop.stopName}
                          size="row"
                        />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Keyboard hint: desktop only, and it duplicates behaviour that
              already works without it. */}
          {options.length > 0 ? (
            <p className="hidden border-t border-line px-4 py-2 text-xs text-muted lg:block">
              {t.search.keyboardHint}
            </p>
          ) : null}
        </div>
      ) : null}
    </search>
  );
}
