"use client";

import type { CSSProperties } from "react";
import { useT } from "@/lib/i18n";

export interface LineBadgeProps {
  shortName: string;
  /** GTFS route_type: 0 tram, 1 metro, 2 rail, 3 bus. */
  routeType: number;
  /** GTFS route_color, six hex digits, with or without a leading '#'. */
  color?: string | null;
  textColor?: string | null;
  size?: "sm" | "md" | "lg";
  /** Hide from assistive tech when the surrounding row already says the line. */
  decorative?: boolean;
  className?: string;
}

const HEX = /^#?[0-9a-fA-F]{6}$/;

function normalizeHex(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`;
}

/**
 * Picks ink or white for a GTFS colour. 0.18 is where the two contrast ratios
 * cross, so both branches clear 4.5:1 (checked against the Rome metro palette).
 */
function readableTextOn(hex: string): string {
  const channel = (raw: number): number => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = channel(Number.parseInt(hex.slice(1, 3), 16));
  const g = channel(Number.parseInt(hex.slice(3, 5), 16));
  const b = channel(Number.parseInt(hex.slice(5, 7), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.18 ? "#12161c" : "#ffffff";
}

function fallbackVars(routeType: number): { bg: string; fg: string } {
  switch (routeType) {
    case 0:
      return { bg: "var(--p-tram-bg)", fg: "var(--p-tram-fg)" };
    case 1:
      return { bg: "var(--p-metro-bg)", fg: "var(--p-metro-fg)" };
    case 2:
      return { bg: "var(--p-rail-bg)", fg: "var(--p-rail-fg)" };
    default:
      return { bg: "var(--p-bus-bg)", fg: "var(--p-bus-fg)" };
  }
}

/** Rome publishes metro lines as MEA / MEB / MEB1 / MEC; riders read them as MA / MB / MC. */
export function displayLineName(shortName: string, routeType: number): string {
  if (routeType !== 1) return shortName;
  const match = /^ME([ABC]1?)$/i.exec(shortName.trim());
  return match ? `M${match[1].toUpperCase()}` : shortName;
}

const SIZES: Record<NonNullable<LineBadgeProps["size"]>, string> = {
  sm: "min-w-[2.25rem] h-6 px-1.5 text-[0.75rem]",
  md: "min-w-[2.75rem] h-8 px-2 text-[0.9375rem]",
  lg: "min-w-[3.25rem] h-10 px-2.5 text-lg",
};

/**
 * The line number, coloured by the operator's own palette when it publishes
 * one and by route type otherwise.
 */
export default function LineBadge({
  shortName,
  routeType,
  color,
  textColor,
  size = "md",
  decorative = false,
  className = "",
}: LineBadgeProps) {
  const t = useT();
  const hex = normalizeHex(color);
  const fallback = fallbackVars(routeType);
  const style: CSSProperties =
    hex === null
      ? { backgroundColor: fallback.bg, color: fallback.fg }
      : { backgroundColor: hex, color: normalizeHex(textColor) ?? readableTextOn(hex) };

  const label = displayLineName(shortName, routeType);
  const rounded = routeType === 1 ? "rounded-full" : "rounded-lg";

  return (
    <span
      aria-hidden={decorative ? true : undefined}
      className={`inline-flex shrink-0 items-center justify-center font-bold tabular-nums tracking-tight ${rounded} ${SIZES[size]} ${className}`}
      style={style}
    >
      {decorative ? null : <span className="sr-only">{`${t.lines.typeLower(routeType)} `}</span>}
      {label.length > 0 ? label : t.common.dash}
    </span>
  );
}
