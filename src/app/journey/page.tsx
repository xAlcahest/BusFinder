import type { Metadata } from "next";

import JourneyView from "@/components/journey/JourneyView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Percorso",
  description:
    "Calcola il percorso da un punto all'altro di Roma con bus, tram e metro, sugli orari ufficiali ATAC.",
};

const MAX_TEXT_LENGTH = 120;
/** Same bound the API applies, so a hand-edited link cannot start out invalid. */
const MAX_TIME_SKEW_SEC = 31 * 24 * 3600;

function readText(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, MAX_TEXT_LENGTH);
}

function readInstant(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.trim().length === 0) return null;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed)) return null;
  const seconds = Math.floor(parsed);
  if (Math.abs(seconds - Date.now() / 1000) > MAX_TIME_SKEW_SEC) return null;
  return seconds;
}

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <JourneyView
      initialFrom={readText(params.from)}
      initialTo={readText(params.to)}
      initialAt={readInstant(params.at)}
    />
  );
}
