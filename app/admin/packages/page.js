'use client';

import Link from 'next/link';

export default function AdminPackagesPage() {
  return (
    <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
      <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
        ADMIN · MANAGE PACKAGES
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
        This page is a placeholder.
      </h2>
      <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
        Packages are defined in data/packages.json today. Editing them from an admin UI and having that change go live
        for every visitor needs a backend to write the change back and an API for the public site to read it from.
      </p>
      <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Create / edit / retire a package
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Reorder or re-price package contents
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
          Publish changes to the live rate list
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
