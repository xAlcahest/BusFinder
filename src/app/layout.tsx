import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import BottomNav from "@/components/BottomNav";
import DocumentTitle from "@/components/DocumentTitle";
import Sidebar from "@/components/Sidebar";
import SidebarToggle from "@/components/SidebarToggle";
import SiteFooter from "@/components/SiteFooter";
import SkipLink from "@/components/SkipLink";
import TopBar from "@/components/TopBar";
import { LocaleProvider } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_ALIASES, LOCALES, RTL_LOCALES } from "@/lib/i18n/locale";
import { STORAGE_KEYS } from "@/lib/types";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BusFinder — partenze in tempo reale",
    template: "%s · BusFinder",
  },
  description:
    "Orari e passaggi in tempo reale di bus, tram e metro a Roma. Preferiti, fermate vicine e avvisi di servizio, senza account e senza pubblicità.",
  applicationName: "BusFinder",
  keywords: ["ATAC", "Roma", "autobus", "tram", "metro", "orari", "tempo reale", "GTFS"],
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "BusFinder",
    statusBarStyle: "black-translucent",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0f" },
  ],
};

/**
 * Applies the saved theme, language and text direction before first paint. The
 * theme is a class, so there is no flash; `lang` and `dir` are attributes, so
 * the markup is correct from the first byte even though the words swap at
 * hydration. Getting `dir` right here matters: an Arabic reader would otherwise
 * see the whole layout jump sides once React mounts.
 */
const BOOTSTRAP = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  STORAGE_KEYS.settings,
)});var root=document.documentElement;var parsed=raw?JSON.parse(raw):null;var s=parsed&&typeof parsed==="object"?parsed:{};var theme=s.theme;if(theme==="dark"||theme==="light"){root.setAttribute("data-theme",theme);}else{root.removeAttribute("data-theme");}var known=${JSON.stringify(
  LOCALES,
)};var alias=${JSON.stringify(
  LOCALE_ALIASES,
)};var lang=s.language;if(known.indexOf(lang)<0){lang=null;var tags=(navigator.languages||[navigator.language||""]);for(var i=0;i<tags.length&&!lang;i++){var base=String(tags[i]).toLowerCase().split(/[-_]/)[0];if(known.indexOf(base)>=0)lang=base;else if(Object.prototype.hasOwnProperty.call(alias,base))lang=alias[base];}}lang=lang||${JSON.stringify(
  DEFAULT_LOCALE,
)};root.lang=lang;root.dir=${JSON.stringify(
  RTL_LOCALES,
)}.indexOf(lang)>=0?"rtl":"ltr";}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} dir="ltr" suppressHydrationWarning>
      {/* The left padding is the sidebar's lane; the token is 0 below lg, where
          the sidebar is a drawer over the page. */}
      <body className="min-h-dvh antialiased ps-[var(--shell-sidebar-w)]">
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />

        <LocaleProvider>
          <DocumentTitle />
          <SkipLink />

          <Sidebar />

          <TopBar />
          <SidebarToggle />

          {/* pb-shell takes no variants, so the bottom-nav gap is spelled out here. */}
          <div className="pb-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px)+1.5rem)] lg:pb-12">
            {/* No width cap: each page picks its own measure or grid. */}
            <main
              id="contenuto"
              className="w-full min-w-0 px-gutter py-[var(--shell-pad-y)]"
            >
              {children}
            </main>
            <SiteFooter />
          </div>

          <BottomNav />
        </LocaleProvider>
      </body>
    </html>
  );
}
