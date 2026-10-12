'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Tests', href: '/admin/tests' },
    { label: 'Parameters', href: '/admin/parameters' },
    { label: 'Profiles', href: '/admin/profiles' },
    { label: 'Packages', href: '/admin/packages' },
    { label: 'Pricing', href: '/admin/pricing' },
    { label: 'Import Excel', href: '/admin/import' },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-navy text-white border-b border-navy-soft shadow-sm">
        <nav className="max-w-[1280px] mx-auto px-4 sm:px-7 h-16 flex items-center justify-between gap-4">
          <Link href="/#top" className="flex items-center gap-2">
            <img className="h-10 object-contain" src="/assets/images/avm-logo.png" alt="AVMLabs" />
          </Link>

          <button
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={navOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div
            className={`${
              navOpen ? 'flex' : 'hidden'
            } md:flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-3 absolute md:static top-16 left-0 right-0 bg-navy md:bg-transparent p-4 md:p-0 border-b md:border-b-0 border-navy-soft shadow-xl md:shadow-none z-50`}
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center">
            <Link
              href="/#ratelist"
              className="px-3.5 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              View Public Site
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-7">
        {children}
      </main>

      <footer className="bg-white border-t border-line py-6 text-center text-xs text-ink-faint">
        <div className="max-w-[1280px] mx-auto px-4">
          <span>© 2026 AVMLabs. Admin area — requires backend integration to function.</span>
        </div>
      </footer>
    </div>
  );
}
