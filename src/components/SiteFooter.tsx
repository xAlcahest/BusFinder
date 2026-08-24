"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();

  return (
    <footer className="mx-auto max-w-2xl px-gutter pt-8 text-xs leading-relaxed text-muted">
      <div className="border-t border-line pt-5">
        <p>
          {t.footer.dataPrefix}
          <a
            href="https://romamobilita.it/it/tecnologie/open-data"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-ink underline underline-offset-2"
          >
            {t.footer.dataProvider}
          </a>
          {t.footer.dataSuffix}
        </p>
        <p className="mt-1.5">
          {t.footer.independent}
          <Link href="/info" className="font-semibold text-ink underline underline-offset-2">
            {t.footer.infoLink}
          </Link>
        </p>
      </div>
    </footer>
  );
}
