'use client';

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
      <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
        ADMIN · ADMIN DASHBOARD
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
        This page is a placeholder.
      </h2>
      <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
        The real admin dashboard needs live figures (total tests, recent price changes, popular profiles) pulled from a
        database — there's no database here, only the static catalog the public site reads.
      </p>
      <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Aggregate stats from a real tests/profiles/packages table
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Recent price-change feed (see data/price-history.json — currently empty)
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Quick links to every admin section below
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
