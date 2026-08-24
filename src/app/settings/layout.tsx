import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component and cannot carry metadata.
export const metadata: Metadata = {
  title: "Impostazioni",
  description: "Aggiornamento arrivi, raggio di ricerca, tema e gestione dei preferiti.",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
