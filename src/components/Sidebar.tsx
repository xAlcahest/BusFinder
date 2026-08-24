"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { MouseEvent as ReactMouseEvent, ReactElement } from "react";
import LineBadge from "@/components/LineBadge";
import SearchBox from "@/components/SearchBox";
import SyncPanel from "@/components/SyncPanel";
import {
  IconAlert,
  IconChevronRight,
  IconClock,
  IconClose,
  IconInfo,
  IconMap,
  IconPin,
  IconSettings,
  IconStar,
} from "@/components/Icons";
import { parseArrivalsResponse, useJsonResource } from "@/components/api";
import { useMounted, useNow, usePoll } from "@/components/hooks";
import { useFavorites, useRecents, useSettings } from "@/components/state";
import FavoriteUndoBar from "@/components/FavoriteUndo";
import { favoriteKey } from "@/lib/storage";
import { formatClock, formatMinutes } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Arrival, Favorite } from "@/lib/types";

export const SIDEBAR_ID = "barra-laterale";

/** Matches the `lg:` breakpoint: above it the sidebar is furniture, not a dialog. */
const DESKTOP_QUERY = "(min-width: 64rem)";
/** Only this many favourites poll for arrivals, so the drawer cannot flood the API. */
const MAX_FAVORITES = 12;
const MAX_RECENTS = 5;

// --- shared open state ------------------------------------------------------
// A module store, not context: the toggle and the drawer are siblings in the
// root layout and never share a provider.

let sidebarOpen = false;
const listeners = new Set<() => void>();

function subscribeSidebar(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function sidebarSnapshot(): boolean {
  return sidebarOpen;
}

function serverSidebarSnapshot(): boolean {
  return false;
}

export function setSidebarOpen(next: boolean): void {
  if (sidebarOpen === next) return;
  sidebarOpen = next;
  for (const listener of listeners) listener();
}

export function useSidebarOpen(): boolean {
  return useSyncExternalStore(subscribeSidebar, sidebarSnapshot, serverSidebarSnapshot);
}

// --- helpers ----------------------------------------------------------------

interface NavItem {
  href: string;
  label: (t: Dictionary) => string;
  hint: (t: Dictionary) => string;
  icon: (props: { size?: number }) => ReactElement;
  /** Extra path prefixes that keep this entry lit. */
  owns: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/nearby",
    label: (t) => t.nav.nearby,
    hint: (t) => t.nav.hintNearby,
    icon: IconPin,
    owns: ["/line"],
  },
  {
    href: "/journey",
    label: (t) => t.nav.journey,
    hint: (t) => t.nav.hintJourney,
    icon: IconMap,
    owns: [],
  },
  {
    href: "/alerts",
    label: (t) => t.nav.alerts,
    hint: (t) => t.nav.hintAlerts,
    icon: IconAlert,
    owns: [],
  },
  {
    href: "/settings",
    label: (t) => t.nav.settings,
    hint: (t) => t.nav.hintSettings,
    icon: IconSettings,
    owns: [],
  },
  { href: "/info", label: (t) => t.nav.info, hint: (t) => t.nav.hintInfo, icon: IconInfo, owns: [] },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return item.owns.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null,
  );
}

/** True once the viewport is at `lg`. False during SSR and until the first effect. */
function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const apply = (): void => setDesktop(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  return desktop;
}

function minutesFrom(arrival: Arrival, nowMs: number | null): number {
  if (nowMs === null) return arrival.minutesAway;
  return Math.floor((arrival.arrivalTime * 1000 - nowMs) / 60_000);
}

/** First departure worth showing, honouring the favourite's pinned lines. */
function nextArrival(arrivals: Arrival[], pinned: string[], allowScheduled: boolean): Arrival | null {
  const wanted = new Set(pinned);
  for (const arrival of arrivals) {
    if (arrival.skipped) continue;
    if (wanted.size > 0 && !wanted.has(arrival.routeId)) continue;
    if (!allowScheduled && arrival.source !== "realtime") continue;
    return arrival;
  }
  return null;
}

// --- favourite row ----------------------------------------------------------

interface FavoriteRowProps {
  favorite: Favorite;
  /** Poll cycle; every row refreshes on the same tick. */
  nonce: number;
  nowMs: number | null;
  allowScheduled: boolean;
  /** False while the drawer is closed on mobile: do not fetch what nobody sees. */
  active: boolean;
}

function FavoriteRow({ favorite, nonce, nowMs, allowScheduled, active }: FavoriteRowProps) {
  const t = useT();
  const url = active ? `/api/arrivals/${encodeURIComponent(favorite.id)}` : null;
  const { data, error, state } = useJsonResource(url, parseArrivalsResponse, nonce);

  const arrival = data === null ? null : nextArrival(data.arrivals, favorite.pinnedRoutes, allowScheduled);
  const minutes = arrival === null ? 0 : minutesFrom(arrival, nowMs);
  const far = minutes >= 60;
  const hasTag = favorite.tag !== null && favorite.tag.length > 0;

  let value: ReactElement;
  if (arrival === null) {
    const waiting = active && state === "loading" && data === null;
    value = (
      <span className="text-[0.6875rem] font-semibold text-muted">
        {waiting ? "…" : error !== null ? t.favorites.notAvailableShort : t.common.dash}
      </span>
    );
  } else if (far) {
    value = <span className="text-[0.8125rem] font-bold tabular-nums">{formatClock(arrival.arrivalTime)}</span>;
  } else if (minutes <= 0) {
    value = (
      <span className="text-[0.625rem] font-bold uppercase tracking-wide text-accent">
        {t.arrivals.due}
      </span>
    );
  } else {
    value = (
      <span className="text-[0.8125rem] font-bold tabular-nums">
        {minutes}
        <span className="ms-0.5 text-[0.625rem] font-medium text-muted">
          {t.common.minutesShort}
        </span>
      </span>
    );
  }

  const label =
    arrival === null
      ? t.favorites.noDeparture
      : `${t.lines.named(arrival.routeShortName)}, ${
          far ? t.arrivals.atClock(formatClock(arrival.arrivalTime)) : formatMinutes(minutes)
        }`;

  return (
    <li>
      <Link
        href={`/stop/${encodeURIComponent(favorite.id)}`}
        className="flex min-h-11 items-center gap-2 rounded-chip px-2.5 py-1.5 transition-colors hover:bg-surface-2 active:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.875rem] font-semibold leading-tight caps-data">
            {favorite.name}
          </span>
          {hasTag ? (
            <span className="block truncate text-[0.6875rem] font-semibold text-accent">
              {favorite.tag}
            </span>
          ) : null}
        </span>

        <span className="sr-only">
          , {t.favorites.nextDeparture}: {label}
        </span>
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          {arrival !== null ? (
            <LineBadge
              shortName={arrival.routeShortName}
              routeType={arrival.routeType}
              color={arrival.routeColor}
              size="sm"
              decorative
            />
          ) : null}
          {value}
        </span>
      </Link>
    </li>
  );
}

/** A saved line. No arrivals to show here: one tap and you are on the line. */
function FavoriteLineRow({ favorite }: { favorite: Favorite }) {
  const t = useT();
  const hasTag = favorite.tag !== null && favorite.tag.length > 0;
  return (
    <li>
      <Link
        href={`/line/${encodeURIComponent(favorite.id)}`}
        className="flex min-h-11 items-center gap-2 rounded-chip px-2.5 py-1.5 transition-colors hover:bg-surface-2 active:bg-surface-2"
      >
        <LineBadge
          shortName={favorite.name}
          routeType={favorite.routeType ?? 3}
          color={favorite.color}
          size="sm"
          decorative
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.875rem] font-semibold leading-tight">
            {t.lines.named(favorite.name)}
          </span>
          {hasTag ? (
            <span className="block truncate text-[0.6875rem] font-semibold text-accent">
              {favorite.tag}
            </span>
          ) : null}
        </span>
        <IconChevronRight size={15} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}

// --- sidebar ----------------------------------------------------------------

export default function Sidebar() {
  const t = useT();
  const open = useSidebarOpen();
  const desktop = useIsDesktop();
  const mounted = useMounted();
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { favorites } = useFavorites();
  const { recents } = useRecents();
  const { settings } = useSettings();
  const poll = usePoll(settings.refreshInterval);
  const nowMs = useNow(15_000);

  const close = useCallback(() => setSidebarOpen(false), []);

  // Resized past `lg` with the drawer open: the sidebar is furniture again, so
  // drop the modal state instead of leaving a trapped focus ring behind.
  useEffect(() => {
    if (desktop) setSidebarOpen(false);
  }, [desktop]);

  // Any navigation closes the drawer, including router.push from the search box.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Next frame, not this one: the drawer is still `visibility: hidden` while the
  // class change is being committed, and focus() on a hidden element is a no-op.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  // Lock the root as well: body-to-viewport overflow propagation does not hold
  // once the body is the scroll container, and the page keeps scrolling.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement.style;
    const body = document.body.style;
    const previous = { root: root.overflow, body: body.overflow };
    root.overflow = "hidden";
    body.overflow = "hidden";
    return () => {
      root.overflow = previous.root;
      body.overflow = previous.body;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      const node = asideRef.current;
      if (node === null) return;

      if (event.key === "Escape") {
        // Let a filled search field clear itself first. See SearchBox.
        const target = event.target;
        if (target instanceof HTMLInputElement && target.value.length > 0) return;
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusableIn(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && node.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Catches every link, including search results, without wiring each one.
  const onClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLElement>): void => {
      if (!open) return;
      const target = event.target;
      if (target instanceof Element && target.closest("a[href]") !== null) close();
    },
    [open, close],
  );

  const ordered = useMemo(
    () => [...favorites].sort((a, b) => a.order - b.order || a.addedAt - b.addedAt),
    [favorites],
  );

  const recentItems = useMemo(() => {
    const pinned = new Set(
      favorites.filter((favorite) => favorite.kind === "stop").map((favorite) => favorite.id),
    );
    return recents
      .filter((recent) => !pinned.has(recent.stopId))
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, MAX_RECENTS);
  }, [recents, favorites]);

  const shown = ordered.slice(0, MAX_FAVORITES);
  const overflow = ordered.length - shown.length;
  // Nothing is presented on mobile until the drawer opens: stay off the network.
  const active = open || desktop;

  return (
    <>
      {/* Mounted here because the sidebar is the one client component the root
          layout renders on every page. */}
      <FavoriteUndoBar />

      <div
        aria-hidden="true"
        onClick={close}
        // Same scrim as dialog::backdrop in globals.css.
        style={{ backgroundColor: "rgb(10 12 15 / 0.55)" }}
        className={`fixed inset-0 z-40 backdrop-blur-[2px] transition-[opacity,visibility] duration-300 lg:hidden motion-reduce:transition-none ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Only the closed state transitions visibility, so it lingers through the
          slide out; opening flips it at once and the drawer is focusable now. */}
      <aside
        ref={asideRef}
        id={SIDEBAR_ID}
        aria-label={t.nav.sidebar}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        onClickCapture={onClickCapture}
        className={`fixed inset-y-0 start-0 z-50 flex w-[19rem] max-w-[86vw] flex-col border-e border-line bg-surface duration-300 ease-out lg:z-30 lg:w-80 lg:max-w-none lg:visible lg:translate-x-0 motion-reduce:transition-none ${
          open
            ? "visible translate-x-0 shadow-2xl transition-transform"
            : // Only a drawer below lg, and in RTL it slides out the other way.
              "invisible max-lg:-translate-x-full max-lg:rtl:translate-x-full transition-[transform,visibility]"
        }`}
      >
        <div className="shrink-0 border-b border-line px-3.5 pt-safe">
          <div className="flex h-14 items-center gap-2">
            <Link
              href="/"
              aria-label={t.brand.homeAria}
              aria-current={pathname === "/" ? "page" : undefined}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-chip py-1"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.5rem] bg-accent text-on-accent"
              >
                <span className="h-2.5 w-2.5 rounded-[2px] bg-current" />
              </span>
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="text-[1.0625rem] font-extrabold tracking-[-0.035em]">BusFinder</span>
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-muted">
                  Roma
                </span>
              </span>
            </Link>

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t.nav.closeMenu}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2 lg:hidden"
            >
              <IconClose size={19} />
            </button>
          </div>

          <div className="pb-3">
            <SearchBox className="[&_input]:h-11 [&_input]:text-sm" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-4">
          <nav aria-label={t.nav.sidebarNav}>
            <section aria-labelledby="sidebar-favorites">
              <h2
                id="sidebar-favorites"
                className="mb-1.5 px-2.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted"
              >
                {t.favorites.heading}
                {mounted && ordered.length > 0 ? (
                  <span className="ms-1.5 tabular-nums">{ordered.length}</span>
                ) : null}
              </h2>

              {!mounted ? (
                <p className="px-2.5 py-2 text-[0.8125rem] text-muted">{t.common.loading}</p>
              ) : shown.length === 0 ? (
                <p className="flex items-start gap-2 rounded-chip bg-surface-2 px-2.5 py-2.5 text-[0.8125rem] leading-snug text-muted">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-late">
                    <IconStar size={15} strokeWidth={2.2} />
                  </span>
                  {/* One flex item, not four: a bare text node beside a link
                      would each become their own column. */}
                  <span className="min-w-0">
                    {t.favorites.sidebarEmptyBefore}
                    <Link
                      href="/nearby"
                      className="font-semibold text-accent underline underline-offset-2"
                    >
                      {t.nav.nearby}
                    </Link>
                    {t.favorites.sidebarEmptyAfter}
                  </span>
                </p>
              ) : (
                <ul className="-mx-0.5">
                  {shown.map((favorite) =>
                    favorite.kind === "line" ? (
                      <FavoriteLineRow key={favoriteKey(favorite)} favorite={favorite} />
                    ) : (
                      <FavoriteRow
                        key={favoriteKey(favorite)}
                        favorite={favorite}
                        nonce={poll.nonce}
                        nowMs={nowMs}
                        allowScheduled={settings.showScheduledFallback}
                        active={active}
                      />
                    ),
                  )}
                </ul>
              )}

              {overflow > 0 ? (
                <Link
                  href="/"
                  className="mt-1 flex min-h-9 items-center gap-1 rounded-chip px-2.5 text-[0.75rem] font-semibold text-accent"
                >
                  {t.favorites.more(overflow)}
                  <IconChevronRight size={14} />
                </Link>
              ) : null}
            </section>

            {mounted && recentItems.length > 0 ? (
              <section aria-labelledby="sidebar-recents" className="mt-5">
                <h2
                  id="sidebar-recents"
                  className="mb-1.5 px-2.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted"
                >
                  {t.recents.heading}
                </h2>
                <ul className="-mx-0.5">
                  {recentItems.map((recent) => (
                    <li key={recent.stopId}>
                      <Link
                        href={`/stop/${encodeURIComponent(recent.stopId)}`}
                        className="flex min-h-10 items-center gap-2 rounded-chip px-2.5 py-1.5 transition-colors hover:bg-surface-2 active:bg-surface-2"
                      >
                        <span aria-hidden="true" className="shrink-0 text-muted">
                          <IconClock size={15} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium caps-data">
                          {recent.stopName}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="sidebar-sections" className="mt-5">
              <h2
                id="sidebar-sections"
                className="mb-1.5 px-2.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted"
              >
                {t.nav.sections}
              </h2>
              <ul className="-mx-0.5">
                {NAV_ITEMS.map((item) => {
                  const current = isActive(pathname, item);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-2.5 rounded-chip px-2.5 py-1.5 transition-colors hover:bg-surface-2 active:bg-surface-2 ${
                          current ? "bg-accent-soft text-accent" : "text-ink"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`shrink-0 ${current ? "text-accent" : "text-muted"}`}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.875rem] font-semibold">
                            {item.label(t)}
                          </span>
                          <span className="block truncate text-[0.6875rem] text-muted">
                            {item.hint(t)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </nav>
        </div>

        <div className="shrink-0 border-t border-line px-3.5 py-3 pb-safe">
          <SyncPanel collapsible />
        </div>
      </aside>
    </>
  );
}
