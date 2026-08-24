import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LineDetailView from "@/components/map/LineDetailView";

export const dynamic = "force-dynamic";

const ROUTE_ID_PATTERN = /^[A-Za-z0-9._#-]{1,64}$/;

interface LinePageProps {
  params: Promise<{ routeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readDirection(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "0") return 0;
  if (raw === "1") return 1;
  return null;
}

export async function generateMetadata({ params }: LinePageProps): Promise<Metadata> {
  const { routeId } = await params;
  const safe = ROUTE_ID_PATTERN.test(routeId) ? routeId : "";
  return {
    title: safe.length > 0 ? `Linea ${safe}` : "Linea",
    description: "Percorso, fermate e mezzi in tempo reale della linea.",
  };
}

export default async function LinePage({ params, searchParams }: LinePageProps) {
  const { routeId } = await params;
  if (!ROUTE_ID_PATTERN.test(routeId)) notFound();
  const query = await searchParams;
  return <LineDetailView routeId={routeId} initialDirection={readDirection(query.direction)} />;
}
