'use client';

import Link from 'next/link';

export default function AdminTestsPage() {
  return (
    <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
      <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
        ADMIN · MANAGE TESTS
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
        This page is a placeholder.
      </h2>
      <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
        Adding, editing or deactivating a test needs to persist somewhere durable and be reflected back to every visitor
        of the public rate list — that requires a database and an API, not a static JSON file bundled into the page.
      </p>
      <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Create / edit / deactivate a test record
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Server-side validation (duplicate codes, invalid prices)
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Immediate reflection on the public Rate List
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
