'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-7">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-line/70 p-8 sm:p-10 shadow-sm text-left">
          <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">
            PARTNER LOGIN
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4">
            This page is a placeholder.
          </h2>
          <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
            Partner accounts, authentication, and B2B-only pricing visibility all require a real backend — none of that
            exists in this static, frontend-only build. No credentials are collected here.
          </p>
          <ul className="space-y-2 mb-8 text-sm sm:text-base text-ink-soft">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
              Partner accounts &amp; session management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
              Confidential B2B pricing gated behind login
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-navy"></span>
              Role-based access (partner vs. admin)
            </li>
          </ul>
          <Link
            href="/#ratelist"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-navy hover:bg-navy-2 text-white font-semibold text-sm shadow-sm transition-all"
          >
            Continue to Rate List
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
