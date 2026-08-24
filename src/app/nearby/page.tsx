import type { Metadata } from "next";

import NearbyView from "@/components/map/NearbyView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fermate vicine",
  description: "Le fermate ATAC più vicine a te, con mappa e linee che ci passano.",
};

const ID_PATTERN = /^[A-Za-z0-9._#-]{1,64}$/;

function readStopId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return ID_PATTERN.test(trimmed) ? trimmed : null;
}

export default async function NearbyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <NearbyView focusStopId={readStopId(params.focus)} />;
}
