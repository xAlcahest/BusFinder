"use client";

import { IconStar } from "@/components/Icons";
import { offerUndo } from "@/components/FavoriteUndo";
import { useMounted } from "@/components/hooks";
import { useFavorites } from "@/components/state";
import { useT } from "@/lib/i18n";
import type { FavoriteKind } from "@/lib/types";

/**
 * `row` is the one-tap toggle that sits inside a row on a list; it stays 44px
 * on phones and shrinks only from `lg`, where there is a pointer.
 */
export type FavoriteButtonSize = "row" | "md" | "lg";

export interface FavoriteButtonProps {
  /** What is being starred: a stop or a whole line. */
  kind: FavoriteKind;
  /** stop_id for a stop, route_id for a line. */
  id: string;
  /** Shown in the label and stored, so the sidebar renders before any request. */
  name: string;
  /** Lines only: kept with the favourite so its badge is right offline. */
  routeType?: number | null;
  color?: string | null;
  size?: FavoriteButtonSize;
  /** Show the text label next to the star. */
  withLabel?: boolean;
  className?: string;
}

const BOX: Record<FavoriteButtonSize, string> = {
  row: "h-11 w-11 lg:h-10 lg:w-10",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const GLYPH: Record<FavoriteButtonSize, number> = { row: 21, md: 22, lg: 24 };

export default function FavoriteButton({
  kind,
  id,
  name,
  routeType = null,
  color = null,
  size = "md",
  withLabel = false,
  className = "",
}: FavoriteButtonProps) {
  const t = useT();
  const mounted = useMounted();
  const { isFavorite, add, remove } = useFavorites();
  const active = mounted && isFavorite(kind, id);
  // One word for one thing: the control is a star, so the wording is the star.
  const label =
    kind === "line"
      ? active
        ? t.favorites.removeStarLine(name)
        : t.favorites.addStarLine(name)
      : active
        ? t.favorites.removeStar(name)
        : t.favorites.addStar(name);

  return (
    <button
      type="button"
      // Writing before the store hydrates would clobber the saved list.
      disabled={!mounted}
      aria-pressed={active}
      aria-label={label}
      title={active ? t.favorites.starredTitle : t.favorites.starTitle}
      onClick={(event) => {
        // Rows put this button inside a link or a card: never navigate on save.
        event.preventDefault();
        event.stopPropagation();
        if (active) offerUndo(remove(kind, id));
        else add({ kind, id, name, routeType, color });
      }}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 transition-colors active:scale-95 disabled:opacity-50 ${
        withLabel ? "h-12 px-4 text-sm font-bold" : BOX[size]
      } ${
        active
          ? "border-late bg-late-soft text-late"
          : "border-line-strong bg-surface text-late hover:bg-late-soft"
      } ${className}`}
    >
      {/* Heavier stroke than the rest of the icon set: an outline star at 21px
          has to read as a star at a glance, that is the whole point here. */}
      <IconStar size={GLYPH[withLabel ? "md" : size]} filled={active} strokeWidth={2.2} />
      {withLabel ? <span>{active ? t.favorites.starredLabel : t.favorites.starLabel}</span> : null}
    </button>
  );
}
