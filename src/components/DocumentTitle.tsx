"use client";

/**
 * Keeps the tab title in the reader's language. The server renders the Italian
 * metadata, which is what crawlers and link previews get; this rewrites it once
 * the language is known, and again on every navigation.
 */

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useT, type Dictionary } from "@/lib/i18n";

/** Same bound the stop and line pages validate, so no junk id reaches the tab. */
const ID_PATTERN = /^[A-Za-z0-9._#:-]{1,64}$/;

function readId(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  try {
    const value = decodeURIComponent(raw);
    return ID_PATTERN.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** null means the app title, for the home page and anything unmapped. */
function sectionTitle(pathname: string, t: Dictionary): string | null {
  const parts = pathname.split("/").filter((part) => part.length > 0);
  const [head, second] = parts;
  switch (head) {
    case "nearby":
      return t.nearby.title;
    case "journey":
      return t.journey.title;
    case "alerts":
      return t.alerts.title;
    case "settings":
      return t.settings.title;
    case "info":
      return t.info.title;
    case "stop": {
      const id = readId(second);
      return id === null ? t.stops.codeOnly : t.stops.code(id);
    }
    case "line": {
      const id = readId(second);
      return id === null ? null : t.lines.named(id);
    }
    default:
      return null;
  }
}

export default function DocumentTitle() {
  const pathname = usePathname();
  const t = useT();

  useEffect(() => {
    const section = sectionTitle(pathname, t);
    const wanted = section === null ? t.meta.appTitle : t.meta.titleTemplate(section);

    // Next writes its own <title> from the route metadata, and commits it after
    // this effect on some routes and before it on others. Re-assert instead of
    // racing: the write is skipped when the value already matches, so there is
    // no loop with our own mutation.
    const apply = (): void => {
      if (document.title !== wanted) document.title = wanted;
    };
    apply();

    const head = document.head;
    const observer = new MutationObserver(apply);
    observer.observe(head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
    };
  }, [pathname, t]);

  return null;
}
