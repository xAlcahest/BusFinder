"use client";

import { useEffect, useRef } from "react";
import { SIDEBAR_ID, setSidebarOpen, useSidebarOpen } from "@/components/Sidebar";
import { useT } from "@/lib/i18n";

/**
 * Opens the sidebar drawer on small screens. It overlays the top bar rather
 * than living inside it, and mirrors that bar's grid so the two stay aligned.
 */
export default function SidebarToggle() {
  const t = useT();
  const open = useSidebarOpen();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[35] pt-safe lg:hidden">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-end gap-1 px-gutter">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setSidebarOpen(!open)}
          aria-expanded={open}
          aria-controls={SIDEBAR_ID}
          aria-label={t.nav.openMenu}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-surface-2"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {/* Reserves the slot the top bar's info link occupies underneath. */}
        <span aria-hidden="true" className="h-10 w-10" />
      </div>
    </div>
  );
}
