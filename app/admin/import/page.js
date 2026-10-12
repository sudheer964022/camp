'use client';

import Link from 'next/link';

export default function AdminImportPage() {
  return (
    <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
      <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
        ADMIN · IMPORT FROM EXCEL
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
        This page is a placeholder.
      </h2>
      <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
        Bulk-updating the rate list from a spreadsheet needs real parsing, validation (missing codes, bad prices,
        duplicates, unknown categories), a preview/confirm step, and a database to commit into. None of that can happen
        safely in a static, no-backend page.
      </p>
      <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Upload &amp; parse an .xlsx rate list
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Validate rows and show errors before import
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Preview → confirm → commit workflow, never a silent overwrite
        </li>
      </ul>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-navy hover:bg-navy-2 text-white font-semibold text-sm shadow-sm transition-all"
      >
        Back to Admin Dashboard
      </Link>
    </div>
  );
}
