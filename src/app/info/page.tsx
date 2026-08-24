import type { Metadata } from "next";
import InfoContent from "./InfoContent";

// Metadata is built on the server, which does not know the reader's language:
// it stays Italian. The page body follows the setting.
export const metadata: Metadata = {
  title: "Informazioni",
  description:
    "Cos'è questa app, da dove arrivano i dati e perché non è affiliata ad ATAC o a Roma Servizi per la Mobilità.",
};

export default function InfoPage() {
  return <InfoContent />;
}
