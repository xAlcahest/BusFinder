import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BusFinder — partenze in tempo reale",
    short_name: "BusFinder",
    description:
      "Orari e passaggi in tempo reale di bus, tram e metro a Roma. Preferiti, fermate vicine e avvisi di servizio, senza account e senza pubblicità.",
    lang: "it",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f1ea",
    theme_color: "#c1301a",
    categories: ["travel", "navigation", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Fermate vicine", short_name: "Vicino", url: "/nearby" },
      { name: "Avvisi di servizio", short_name: "Avvisi", url: "/alerts" },
    ],
  };
}
