"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import SectionHeader from "@/components/SectionHeader";
import { radiusChoices } from "@/components/radius";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecents } from "@/hooks/useRecents";
import { useSettings } from "@/hooks/useSettings";
import { formatDistance } from "@/lib/format";
import { LOCALE_NAMES, LOCALES, useLocale, useT } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  exportFavoritesJson,
  mergeFavorites,
  parseFavoritesImport,
  writeFavorites,
  type FavoritesImportProblem,
} from "@/lib/storage";
import type { Favorite, Settings } from "@/lib/types";

/** The validator reports a code; the wording lives here, like every other string. */
function importProblem(reason: FavoritesImportProblem, t: Dictionary): string {
  switch (reason) {
    case "empty":
      return t.settings.importEmpty;
    case "too-large":
      return t.settings.fileTooLarge;
    case "not-json":
      return t.settings.importNotJson;
    case "no-list":
      return t.settings.importNoList;
    default:
      return t.settings.importNoneValid;
  }
}

const REFRESH_OPTIONS = [15, 20, 30, 45, 60, 120];
const ARRIVALS_OPTIONS = [5, 8, 10, 12, 20, 30];
const THEME_OPTIONS: Array<{ value: Settings["theme"]; label: (t: Dictionary) => string }> = [
  { value: "system", label: (t) => t.settings.themeSystem },
  { value: "light", label: (t) => t.settings.themeLight },
  { value: "dark", label: (t) => t.settings.themeDark },
];

/**
 * Every shipped language, named in itself and sorted by that name: someone
 * hunting for their own language scans for the word they recognise, not for an
 * Italian or English translation of it.
 *
 * The collator is pinned: a bare localeCompare sorts in the ambient collation,
 * which differs between the rendering server and the reader's browser and
 * reorders the options at hydration.
 */
const LANGUAGE_COLLATOR = new Intl.Collator("en", { sensitivity: "base" });

const LANGUAGE_CHOICES: ReadonlyArray<{ value: Locale; label: string }> = [...LOCALES]
  .map((value) => ({ value, label: LOCALE_NAMES[value] }))
  .sort((a, b) => LANGUAGE_COLLATOR.compare(a.label, b.label));

const MAX_IMPORT_BYTES = 2_000_000;
/** Firefox cancels a download whose blob URL is revoked in the same tick. */
const REVOKE_DELAY_MS = 60_000;

/** YYYY-MM-DD in Rome time, for the backup file name. */
function fileStamp(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type PendingImport = { favorites: Favorite[]; skipped: number };
type Confirming = "favorites" | "recents" | null;

const SELECT_CLASS =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-base text-ink outline-none transition-colors hover:border-line-strong focus:border-accent";
const BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-50 disabled:hover:bg-surface";
const PRIMARY_CLASS =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition-opacity hover:opacity-90 active:scale-[0.98]";
const CARD_CLASS = "rounded-card border border-line bg-surface p-4 shadow-card";
const DANGER_BUTTON_CLASS =
  "min-h-12 w-full rounded-full border border-danger px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft disabled:opacity-50 disabled:hover:bg-transparent";
const CONFIRM_CLASS =
  "inline-flex min-h-12 items-center rounded-full bg-danger px-5 text-sm font-bold text-on-accent transition-opacity hover:opacity-90";
const CANCEL_CLASS =
  "inline-flex min-h-12 items-center px-3 text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-80";

export default function SettingsPage() {
  const t = useT();
  // What "system" currently resolves to. Read from the provider, not from
  // navigator: resolving during render would disagree with the server markup.
  const locale = useLocale();
  const { settings, update, reset } = useSettings();
  const { favorites, clear: clearFavorites } = useFavorites();
  const { recents, clear: clearRecents } = useRecents();

  const fileInput = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const radiusOptions = radiusChoices(settings.nearbyRadius);

  const handleExport = (): void => {
    setMessage(null);
    try {
      const blob = new Blob([exportFavoritesJson()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BusFinder-preferiti-${fileStamp()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Not cleared on unmount: the timer must outlive this screen or the
      // download breaks again the moment the user navigates away.
      window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
      setMessage(t.settings.exported(favorites.length));
    } catch (err) {
      console.error("[BusFinder] export failed", err);
      setMessage(t.settings.exportFailed);
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0] ?? null;
    // Reset the input so the same file can be picked again after an error.
    event.target.value = "";
    setMessage(null);
    setImportError(null);
    setPending(null);
    if (file === null) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError(t.settings.fileTooLarge);
      return;
    }
    try {
      const text = await file.text();
      const result = parseFavoritesImport(text);
      if (!result.ok) {
        setImportError(importProblem(result.reason, t));
        return;
      }
      setPending({ favorites: result.favorites, skipped: result.skipped });
    } catch (err) {
      console.error("[BusFinder] import read failed", err);
      setImportError(t.settings.fileUnreadable);
    }
  };

  const applyImport = (mode: "merge" | "replace"): void => {
    if (pending === null) return;
    if (mode === "replace") {
      writeFavorites(pending.favorites);
      setMessage(t.settings.replaced(pending.favorites.length));
    } else {
      const added = mergeFavorites(pending.favorites);
      setMessage(added === 0 ? t.settings.mergedNone : t.settings.merged(added));
    }
    setPending(null);
  };

  return (
    // Two columns of groups at lg instead of one long scroll. Each column stays
    // near the reading measure, so nothing stretches.
    <div className="mx-auto w-full max-w-2xl lg:max-w-[62rem]">
      <header className="mb-5 lg:max-w-[var(--measure)]">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.settings.subtitle}</p>
      </header>

      {/* Below lg the two wrappers are plain blocks that stack, so the order
          and the spacing stay the ones the phone already had. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6">
        <div>
          <section className="mb-6" aria-labelledby="settings-arrivals">
            <SectionHeader id="settings-arrivals" title={t.settings.sectionArrivals} />
            <div className={`${CARD_CLASS} space-y-4`}>
              <div>
                <label htmlFor="refresh" className="block text-sm font-semibold">
                  {t.settings.autoRefresh}
                </label>
                <select
                  id="refresh"
                  value={settings.refreshInterval}
                  onChange={(e) => update({ refreshInterval: Number(e.target.value) })}
                  className={SELECT_CLASS}
                >
                  {REFRESH_OPTIONS.map((seconds) => (
                    <option key={seconds} value={seconds}>
                      {t.settings.everySeconds(seconds)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-muted">{t.settings.autoRefreshHint}</p>
              </div>

              <div>
                <label htmlFor="maxArrivals" className="block text-sm font-semibold">
                  {t.settings.maxArrivals}
                </label>
                <select
                  id="maxArrivals"
                  value={settings.maxArrivals}
                  onChange={(e) => update({ maxArrivals: Number(e.target.value) })}
                  className={SELECT_CLASS}
                >
                  {ARRIVALS_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start justify-between gap-2">
                <label htmlFor="fallback" className="cursor-pointer text-sm font-semibold">
                  {t.settings.showScheduled}
                  <span className="mt-1 block text-xs font-normal text-muted">
                    {t.settings.showScheduledHint}
                  </span>
                </label>
                {/* The box stays 24 px; the wrapping label is the 44 px target.
                    It carries no text, so the accessible name is unchanged. */}
                <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-surface-2 lg:size-9">
                  <input
                    id="fallback"
                    type="checkbox"
                    checked={settings.showScheduledFallback}
                    onChange={(e) => update({ showScheduledFallback: e.target.checked })}
                    className="size-6 cursor-pointer accent-[var(--p-accent)]"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="mb-6" aria-labelledby="settings-nearby">
            <SectionHeader id="settings-nearby" title={t.settings.sectionNearby} />
            <div className={CARD_CLASS}>
              <label htmlFor="radius" className="block text-sm font-semibold">
                {t.settings.radius}
              </label>
              <select
                id="radius"
                value={settings.nearbyRadius}
                onChange={(e) => update({ nearbyRadius: Number(e.target.value) })}
                className={SELECT_CLASS}
              >
                {radiusOptions.map((metres) => (
                  <option key={metres} value={metres}>
                    {formatDistance(metres)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">{t.settings.radiusHint}</p>
            </div>
          </section>

          <section className="mb-6" aria-labelledby="settings-theme">
            <SectionHeader id="settings-theme" title={t.settings.sectionAppearance} />
            <div className={CARD_CLASS}>
              <fieldset>
                <legend className="sr-only">{t.settings.themeLegend}</legend>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map((option) => {
                    const active = settings.theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update({ theme: option.value })}
                        className={`min-h-12 flex-1 rounded-full px-3 text-sm font-semibold transition-colors ${
                          active
                            ? "bg-accent text-on-accent"
                            : "border border-line bg-surface hover:bg-surface-2 active:bg-surface-2"
                        }`}
                      >
                        {option.label(t)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </section>

          <section className="mb-6" aria-labelledby="settings-language">
            <SectionHeader id="settings-language" title={t.settings.sectionLanguage} />
            <div className={CARD_CLASS}>
              <label htmlFor="language" className="block text-sm font-semibold">
                {t.settings.languageLegend}
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) =>
                  update({ language: e.target.value as Settings["language"] })
                }
                className={SELECT_CLASS}
              >
                <option value="system">{t.settings.languageSystem}</option>
                {LANGUAGE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
              {settings.language === "system" ? (
                <p className="mt-1.5 text-xs text-muted">
                  {t.settings.languageHint(LOCALE_NAMES[locale])}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <div>
          <section className="mb-6" aria-labelledby="settings-backup">
            <SectionHeader id="settings-backup" title={t.settings.sectionBackup} />
            <div className={`${CARD_CLASS} space-y-3`}>
              <p className="text-sm text-muted">{t.settings.backupIntro}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={favorites.length === 0}
                  className={BUTTON_CLASS}
                >
                  {t.settings.exportCount(favorites.length)}
                </button>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className={BUTTON_CLASS}
                >
                  {t.settings.importFromFile}
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => void handleFile(e)}
                  className="hidden"
                />
              </div>

              {importError !== null ? (
                <p role="alert" className="text-sm font-medium text-danger">
                  {importError}
                </p>
              ) : null}

              {pending !== null ? (
                <div className="rounded-chip border border-line bg-surface-2 p-3">
                  <p className="text-sm">
                    {t.settings.importFound(pending.favorites.length)}
                    {pending.skipped > 0
                      ? t.settings.importSkipped(pending.skipped)
                      : t.settings.importFoundEnd}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyImport("merge")}
                      className={PRIMARY_CLASS}
                    >
                      {t.settings.importMerge}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyImport("replace")}
                      className={BUTTON_CLASS}
                    >
                      {t.settings.importReplace}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPending(null)}
                      className={CANCEL_CLASS}
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mb-6" aria-labelledby="settings-data">
            <SectionHeader id="settings-data" title={t.settings.sectionLocalData} />
            <div className="space-y-3 rounded-card border border-danger/40 bg-surface p-4 shadow-card">
              <p className="text-sm text-muted">
                {t.settings.localDataSummary(favorites.length, recents.length)}
              </p>

              {confirming === "favorites" ? (
                <div className="rounded-chip border border-danger bg-danger-soft p-3">
                  <p className="text-sm font-semibold">
                    {t.settings.confirmClearFavorites}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearFavorites();
                        setConfirming(null);
                        setMessage(t.settings.favoritesCleared);
                      }}
                      className={CONFIRM_CLASS}
                    >
                      {t.settings.confirmClearFavoritesYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className={CANCEL_CLASS}
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming("favorites")}
                  disabled={favorites.length === 0}
                  className={DANGER_BUTTON_CLASS}
                >
                  {t.settings.clearFavorites}
                </button>
              )}

              {confirming === "recents" ? (
                <div className="rounded-chip border border-danger bg-danger-soft p-3">
                  <p className="text-sm font-semibold">
                    {t.settings.confirmClearRecents}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearRecents();
                        setConfirming(null);
                        setMessage(t.settings.recentsCleared);
                      }}
                      className={CONFIRM_CLASS}
                    >
                      {t.settings.confirmClearRecentsYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className={CANCEL_CLASS}
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming("recents")}
                  disabled={recents.length === 0}
                  className={DANGER_BUTTON_CLASS}
                >
                  {t.settings.clearRecents}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  reset();
                  setMessage(t.settings.settingsReset);
                }}
                className="min-h-12 w-full rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:bg-surface-2 active:bg-surface-2"
              >
                {t.settings.resetDefaults}
              </button>
            </div>
          </section>
        </div>
      </div>

      <p aria-live="polite" className="min-h-6 text-sm text-muted">
        {message}
      </p>

      <p className="mt-6 text-sm">
        <Link
          href="/info"
          className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 transition-opacity hover:opacity-80 lg:min-h-0"
        >
          {t.settings.infoLink}
        </Link>
      </p>
    </div>
  );
}
