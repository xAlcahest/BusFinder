import LineBadge from "@/components/LineBadge";
import type { RouteSummary } from "@/lib/types";

const TYPE_FALLBACK: Record<number, string> = {
  0: "#c2410c", // tram
  1: "#b91c1c", // metro
  2: "#0369a1", // rail
  3: "#1e3a8a", // bus
};

/** GTFS colours ship without a leading '#'; accept both and validate. */
export function cssColor(raw: string | null, fallback: string): string {
  if (raw === null) return fallback;
  const value = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value}`;
  return fallback;
}

/** Map markers and the drawn path need a literal colour, never a CSS variable. */
export function routeColor(route: RouteSummary): string {
  return cssColor(route.color, TYPE_FALLBACK[route.routeType] ?? "#334155");
}

/**
 * Thin wrapper over the shared badge, so the map pages get the same computed
 * text contrast and the same "MEA reads as MA" naming as everywhere else.
 */
export default function RouteBadge({
  route,
  large = false,
}: {
  route: RouteSummary;
  large?: boolean;
}) {
  return (
    <LineBadge
      shortName={route.shortName}
      routeType={route.routeType}
      color={route.color}
      textColor={route.textColor}
      size={large ? "lg" : "sm"}
    />
  );
}
