import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component and cannot carry metadata.
export const metadata: Metadata = {
  title: "Avvisi di servizio",
  description: "Deviazioni, sospensioni e modifiche al servizio pubblicate sul feed ufficiale.",
};

export default function AlertsLayout({ children }: { children: ReactNode }) {
  return children;
}
