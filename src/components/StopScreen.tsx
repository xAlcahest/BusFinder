"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import ArrivalsList from "@/components/ArrivalsList";
import DataAge from "@/components/DataAge";
import ErrorState from "@/components/ErrorState";
import FavoriteButton from "@/components/FavoriteButton";
import LineBadge from "@/components/LineBadge";
import SectionHeader from "@/components/SectionHeader";
import { ArrivalsSkeleton, Skeleton } from "@/components/Skeleton";
import { RefreshFeedbackPill, useRefreshFeedback } from "@/components/RefreshFeedback";
import TagDialog from "@/components/TagDialog";
import TimetablePanel from "@/components/TimetablePanel";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMap,
  IconRefresh,
  IconTag,
  IconWheelchair,
} from "@/components/Icons";
import StopMap from "@/components/map/StopMap";
import AlertsForContext from "@/components/AlertsForContext";
import { parseArrivalsResponse, useJsonResource } from "@/components/api";
import { useMounted, useNow, usePoll } from "@/components/hooks";
import { useFavorites, useSettings } from "@/components/state";
import { formatClock } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import { pushRecent } from "@/lib/storage";

type TabKey = "arrivi" | "orari";

const TABS: Array<{ key: TabKey; label: (t: Dictionary) => string; icon: typeof IconClock }> = [
  { key: "arrivi", label: (t) => t.stop.tabArrivals, icon: IconClock },
  { key: "orari", label: (t) => t.stop.tabTimetable, icon: IconCalendar },
];

/** Range the arrivals API accepts for ?limit=; a 400 here would blank the list. */
const LIMIT_MIN = 1;
const LIMIT_MAX = 50;
/** Feed ages at which the freshness pill goes amber and then red. */
const FEED_STALE_SEC = 180;
const FEED_CRITICAL_SEC = 600;

function safeLimit(value: number): number {
  if (!Number.isFinite(value)) return LIMIT_MIN;
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, Math.round(value)));
}

/**
 * Two columns from `lg`: arrivals left, live map right. Below `lg` the grid is
 * off and the three blocks fall back to today's single stacked column.
 * The shell zeroes its own vertical padding at `lg`, so the page owns it here.
 */
const PAGE_GRID =
  "lg:grid lg:items-start lg:gap-x-5 lg:py-6 xl:gap-x-6 2xl:gap-x-8 " +
  "lg:grid-cols-[var(--arrivals-col-w)_minmax(0,1fr)]";
/** Sticky map column: the viewport minus the header, less this page's padding. */
const MAP_COLUMN =
  "lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:block lg:min-w-0 lg:self-start " +
  "lg:sticky lg:top-6 lg:h-[calc(var(--map-col-h)-3rem)]";

export default function StopScreen({ stopId }: { stopId: string }) {
  const t = useT();
  const router = useRouter();
  const mounted = useMounted();
  const { settings } = useSettings();
  const { favorites, setTag } = useFavorites();
  const poll = usePoll(settings.refreshInterval);
  const nowMs = useNow(15_000);
  const [retry, setRetry] = useState(0);
  const [tab, setTab] = useState<TabKey>("arrivi");
  const [timetableOpened, setTimetableOpened] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  // Shared by the list and the map: both sides key on the trip, so picking a
  // row highlights its vehicle and picking a vehicle highlights its row.
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const { data, error, state, fetchedAt, stale } = useJsonResource(
    `/api/arrivals/${encodeURIComponent(stopId)}?limit=${safeLimit(settings.maxArrivals)}`,
    parseArrivalsResponse,
    poll.nonce + retry,
  );

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  // Record the visit once we know the real name, so recents never show a guess.
  const recordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (data === null || recordedRef.current === data.stop.stopId) return;
    recordedRef.current = data.stop.stopId;
    pushRecent({ stopId: data.stop.stopId, stopName: data.stop.stopName });
  }, [data]);

  useEffect(() => {
    if (tab === "orari") setTimetableOpened(true);
  }, [tab]);

  const stop = data?.stop ?? null;
  const favorite = mounted
    ? (favorites.find((item) => item.kind === "stop" && item.id === stopId) ?? null)
    : null;
  const stopName = stop?.stopName ?? null;
  const stopCode = stop?.stopCode ?? null;
  const favoriteTag =
    favorite !== null && favorite.tag !== null && favorite.tag.length > 0 ? favorite.tag : null;
  const arrivals =
    data === null
      ? []
      : settings.showScheduledFallback
        ? data.arrivals
        : data.arrivals.filter((arrival) => arrival.source === "realtime");
  const busy = state === "loading" || state === "refreshing";
  // What "changed" means for a refresh: the feed clock plus every prediction on
  // screen. A new generatedAt with identical predictions is not a change.
  const signature = useMemo(
    () =>
      data === null
        ? null
        : JSON.stringify([
            data.feedTimestamp,
            data.degraded,
            data.arrivals.map((item) => [
              item.tripId,
              item.arrivalTime,
              item.delaySec,
              item.source,
              item.skipped,
            ]),
          ]),
    [data],
  );
  const refreshFeedback = useRefreshFeedback({ state, signature });
  // Covers the frames between the click and the resource reporting itself busy.
  const refreshBusy = busy || refreshFeedback.pending;
  // The freshness badge must age with the feed, not with our own fetch.
  const feedTimestampMs = data === null || data.feedTimestamp === null ? null : data.feedTimestamp * 1000;

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.findIndex((item) => item.key === tab);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];
    setTab(next.key);
    document.getElementById(`tab-${next.key}`)?.focus();
  };

  const arrivalsHidden = tab !== "arrivi";

  return (
    <>
      <div className={PAGE_GRID}>
        {/* Left column, upper half: identity, tabs and the freshness of the feed. */}
        <div className="lg:col-start-1 lg:row-start-1 lg:min-w-0">
          <div className="mb-4">
            {canGoBack ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="relative -ms-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-muted transition-colors after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] hover:bg-surface-2 active:bg-surface-2 lg:after:hidden"
              >
                <IconArrowLeft size={18} />
                {t.common.back}
              </button>
            ) : (
              <Link
                href="/"
                className="relative -ms-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-muted transition-colors after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] hover:bg-surface-2 active:bg-surface-2 lg:after:hidden"
              >
                <IconArrowLeft size={18} />
                {t.common.home}
              </Link>
            )}

            {/* The star sits beside the name, so it is the first thing next to
                the stop you are looking at and never below the fold. */}
            <div className="flex items-start gap-3">
              {/* Plain flow on phones; from `lg` the pole code sits beside the name. */}
              <div className="min-w-0 flex-1 lg:flex lg:flex-wrap lg:items-center lg:gap-x-3">
                <p className="mt-1 flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted lg:order-2 lg:mt-1.5 lg:rounded-full lg:bg-surface-2 lg:px-2.5 lg:py-1">
                  <span className="tabular-nums">
                    {t.stops.code(stopCode !== null && stopCode.length > 0 ? stopCode : stopId)}
                  </span>
                  {stop?.wheelchair === 1 ? (
                    <span className="inline-flex items-center gap-1 text-live" title={t.stops.accessible}>
                      <IconWheelchair size={14} />
                      <span className="sr-only">{t.stops.accessible}</span>
                    </span>
                  ) : null}
                </p>

                <h1 className="mt-1 text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] caps-data lg:order-1">
                  {stopName !== null ? (
                    stopName
                  ) : state === "error" ? (
                    t.stops.code(stopId)
                  ) : (
                    <Skeleton className="h-7 w-3/4" />
                  )}
                </h1>
              </div>

              <FavoriteButton
                kind="stop"
                id={stopId}
                name={stopName ?? t.stops.code(stopId)}
                withLabel
                className="mt-1"
              />
            </div>

            {favoriteTag !== null ? (
              <p className="mt-1.5 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-accent">
                {favoriteTag}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {favorite !== null ? (
                <button
                  type="button"
                  onClick={() => setTagOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
                >
                  <IconTag size={17} />
                  {favoriteTag !== null ? t.stop.editTag : t.stop.addTag}
                </button>
              ) : null}
              <Link
                href={`/nearby?focus=${encodeURIComponent(stopId)}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
              >
                <IconMap size={17} />
                {t.stop.map}
              </Link>
            </div>
          </div>

          {/* Deviazioni e interruzioni che toccano questa fermata o le sue linee. */}
          <AlertsForContext
            stopId={stopId}
            routeIds={(stop?.routes ?? []).map((route) => route.routeId)}
            className="mb-4"
          />

          <div className="mb-3 flex items-center justify-between gap-3">
            <div role="tablist" aria-label={t.stop.tabsAria} className="flex gap-1 rounded-full bg-surface-2 p-1">
              {TABS.map((item) => {
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    id={`tab-${item.key}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`panel-${item.key}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(item.key)}
                    onKeyDown={onTabKeyDown}
                    className={`relative inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-bold transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] lg:after:hidden ${
                      active ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
                    }`}
                  >
                    <item.icon size={15} />
                    {item.label(t)}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                refreshFeedback.start();
                poll.refresh();
              }}
              disabled={refreshBusy}
              aria-busy={refreshBusy}
              aria-label={t.favorites.refreshArrivals}
              // The circle stays 36px so the phone layout is untouched; the
              // pseudo-element widens the touch target to 44px.
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors after:absolute after:-inset-1.5 after:content-[''] hover:bg-surface-2 active:bg-surface-2 disabled:opacity-60 disabled:hover:bg-surface lg:after:hidden"
            >
              <IconRefresh size={17} className={refreshBusy ? "animate-spin-slow" : undefined} />
            </button>
          </div>

          {/* Outside the row above so a long outcome cannot squeeze the tabs. */}
          <RefreshFeedbackPill feedback={refreshFeedback} className="mb-3 empty:hidden" />


          {/* Feed freshness lives outside the tabpanel so the map can be a column. */}
          <div className={arrivalsHidden ? "hidden" : undefined}>
            {stale && error !== null ? (
              <ErrorState
                inline
                message={t.stop.lastDataSuffix(error)}
                onRetry={() => setRetry((value) => value + 1)}
                className="mb-3"
              />
            ) : null}

            {data !== null ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                <DataAge
                  variant="pill"
                  prefix={t.stop.realtimePrefix}
                  timestampMs={feedTimestampMs}
                  staleAfterSec={FEED_STALE_SEC}
                  criticalAfterSec={FEED_CRITICAL_SEC}
                  unknownLabel={t.stop.noRealtime}
                />
                <span className="text-xs text-muted">
                  {fetchedAt === null
                    ? t.stop.pageNotUpdated
                    : t.stop.pageUpdatedAt(formatClock(Math.floor(fetchedAt / 1000)))}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Map: inline above the list on phones, the sticky right column from `lg`. */}
        <div className={`${arrivalsHidden ? "hidden" : ""} ${MAP_COLUMN}`}>
          {data !== null ? (
            <StopMap
              stopId={stopId}
              stop={data.stop}
              nonce={poll.nonce + retry}
              selectedTripId={selectedTripId}
              onSelectTrip={setSelectedTripId}
              className="mb-3 lg:mb-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col"
            />
          ) : null}
        </div>

        {/* Left column, lower half: the arrivals and the timetable. */}
        <div className="lg:col-start-1 lg:row-start-2 lg:min-w-0">
          <div
            id="panel-arrivi"
            role="tabpanel"
            aria-labelledby="tab-arrivi"
            hidden={tab !== "arrivi"}
          >
            {data === null && state === "error" ? (
              <ErrorState
                title={t.stop.arrivalsUnavailable}
                message={error ?? t.errors.unexpected}
                onRetry={() => setRetry((value) => value + 1)}
              />
            ) : data === null ? (
              <ArrivalsSkeleton rows={5} />
            ) : (
              <ArrivalsList
                arrivals={arrivals}
                nowMs={nowMs}
                max={safeLimit(settings.maxArrivals)}
                degraded={data.degraded}
                feedTimestamp={data.feedTimestamp}
                selectedTripId={selectedTripId}
                onSelectTrip={setSelectedTripId}
                emptyHint={t.stop.emptyHint}
                emptyAction={
                  <button
                    type="button"
                    onClick={() => setTab("orari")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition-colors hover:opacity-90"
                  >
                    <IconCalendar size={17} />
                    {t.stop.seeTimetable}
                  </button>
                }
              />
            )}
          </div>

          <div
            id="panel-orari"
            role="tabpanel"
            aria-labelledby="tab-orari"
            hidden={tab !== "orari"}
          >
            {timetableOpened ? (
              <TimetablePanel stopId={stopId} routes={stop?.routes ?? []} />
            ) : null}
          </div>

          {stop !== null && stop.routes.length > 0 ? (
            <section className="mt-8" aria-labelledby="lines-heading">
              <SectionHeader id="lines-heading" title={t.stop.linesHere} count={stop.routes.length} />
              <div className="flex flex-wrap gap-2">
                {stop.routes.map((route) => (
                  <Link
                    key={route.routeId}
                    href={`/line/${encodeURIComponent(route.routeId)}`}
                    aria-label={t.lines.named(route.shortName)}
                    // 44px on the phone: these sit in a wrapping row, so the
                    // pseudo-element trick used elsewhere would overlap the row
                    // above. Desktop keeps the tighter box.
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface p-1 pe-3 shadow-card transition-colors hover:bg-surface-2 active:bg-surface-2 lg:min-h-9"
                  >
                    <LineBadge
                      shortName={route.shortName}
                      routeType={route.routeType}
                      color={route.color}
                      textColor={route.textColor}
                      size="sm"
                    />
                    <span className="text-xs font-semibold text-muted">{t.lines.details}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <TagDialog
        open={tagOpen && favorite !== null}
        stopName={stopName ?? t.stops.code(stopId)}
        initialTag={favorite?.tag ?? null}
        onClose={() => setTagOpen(false)}
        onSave={(tag) => setTag("stop", stopId, tag)}
      />
    </>
  );
}
