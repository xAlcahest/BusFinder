import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StopScreen from "@/components/StopScreen";

interface StopPageProps {
  params: Promise<{ stopId: string }>;
}

/** GTFS stop ids in this feed are short alphanumerics; anything else is a bad link. */
const STOP_ID_PATTERN = /^[A-Za-z0-9._:-]{1,40}$/;

export async function generateMetadata({ params }: StopPageProps): Promise<Metadata> {
  const { stopId } = await params;
  const valid = STOP_ID_PATTERN.test(stopId);
  return {
    title: valid ? `Fermata ${stopId}` : "Fermata",
    description: "Prossimi passaggi in tempo reale e orario programmato della fermata.",
    robots: { index: false, follow: true },
  };
}

export default async function StopPage({ params }: StopPageProps) {
  const { stopId } = await params;
  if (!STOP_ID_PATTERN.test(stopId)) notFound();
  return <StopScreen stopId={stopId} />;
}
