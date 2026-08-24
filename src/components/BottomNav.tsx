"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { IconAlert, IconHome, IconMap, IconPin, IconSettings } from "@/components/Icons";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

interface NavItem {
  href: string;
  label: (t: Dictionary) => string;
  icon: (props: { size?: number }) => ReactElement;
  /** Extra path prefixes that keep this tab lit. */
  owns: string[];
}

const ITEMS: NavItem[] = [
  { href: "/", label: (t) => t.nav.home, icon: IconHome, owns: ["/stop"] },
  { href: "/nearby", label: (t) => t.nav.nearbyShort, icon: IconPin, owns: ["/line"] },
  { href: "/journey", label: (t) => t.nav.journey, icon: IconMap, owns: [] },
  { href: "/alerts", label: (t) => t.nav.alerts, icon: IconAlert, owns: [] },
  { href: "/settings", label: (t) => t.nav.settings, icon: IconSettings, owns: ["/info"] },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/" || item.owns.some((p) => pathname.startsWith(p));
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return item.owns.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  // Hidden at lg: the persistent sidebar carries the same links there.
  return (
    <nav
      aria-label={t.nav.primary}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 backdrop-blur-md pb-safe lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-[4.25rem] flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-5 top-0 h-[3px] rounded-b-full transition-opacity ${
                    active ? "bg-accent opacity-100" : "opacity-0"
                  }`}
                />
                <Icon size={22} />
                {item.label(t)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
