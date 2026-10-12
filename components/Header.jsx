'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header({ cartCount = 0, onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHowToCamp = pathname === '/how-to-create-a-camp';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <nav className="max-w-[1180px] mx-auto py-2 sm:py-2.5 px-4 sm:px-7 flex items-center justify-between gap-4 relative">
        <Link href="/" className="flex items-center flex-none group">
          <img
            className="block h-[54px] sm:h-[66px] md:h-[74px] w-auto max-h-[76px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            src="/assets/images/avm-logo.png"
            alt="AVMLabs"
            height={74}
          />
        </Link>

        {/* Right Nav & Actions grouped together without extra spacing */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-none ml-auto">
          <div className={`nav__links md:flex items-center gap-3 sm:gap-4 ${mobileMenuOpen ? 'flex flex-col absolute top-full left-0 right-0 bg-white p-4 border-b border-slate-200 shadow-lg' : 'hidden md:flex'}`}>
            {isHowToCamp ? (
              <>
                <Link
                  href="/#ratelist"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#241A7A] transition-colors whitespace-nowrap"
                >
                  Camp Rate List
                </Link>
                <Link
                  href="/how-to-create-a-camp"
                  className="bg-[#241A7A] text-white text-xs sm:text-sm font-bold py-2 px-4 sm:px-5 rounded-full shadow-xs whitespace-nowrap"
                >
                  How to Create a Camp
                </Link>
              </>
            ) : (
              <Link
                href="/how-to-create-a-camp"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#241A7A] transition-colors whitespace-nowrap"
              >
                How to Create a Camp
              </Link>
            )}

            <a
              href="https://wa.me/918113000571?text=Hello%20AVMLabs,%20I%20would%20like%20to%20register/organize%20a%20Health%20Check-up%20Camp"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E02029] hover:bg-[#c91821] text-white text-xs sm:text-sm font-bold py-2 px-4 sm:px-5 rounded-full shadow-xs hover:shadow transition-all whitespace-nowrap"
            >
              Register a Camp
            </a>
          </div>

          <button
            onClick={onOpenCart}
            type="button"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#241A7A] hover:bg-[#1B154F] text-white text-xs sm:text-sm font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full shadow-xs transition-all cursor-pointer flex-none"
            aria-label="My Profile"
          >
            <span>My Profile</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#E02029] text-white font-black text-[11px]">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white text-navy cursor-pointer flex-none"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
