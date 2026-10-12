'use client';

import Link from 'next/link';

export default function AdminPricingPage() {
  return (
    <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
      <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
        ADMIN · PRICING &amp; PRICE HISTORY
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
        This page is a placeholder.
      </h2>
      <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
        data/price-history.json is a reserved, currently-empty schema for exactly this. Recording every price change
        with an effective date range, and showing "what changed and when," needs a backend to append to that history — a
        static file can't safely be written to by users.
      </p>
      <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Change a test's B2B / B2C price with an effective date
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          View the full price-change timeline per test
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Prevent silent overwrites — every change is a new history row, never an edit
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
