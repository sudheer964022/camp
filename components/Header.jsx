'use client';

import Link from 'next/link';

export default function Header({ cartCount = 0, onOpenCart }) {
  const handleScrollToRegister = (e) => {
    const el = document.getElementById('register-camp');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#register-camp');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <nav className="max-w-[1180px] mx-auto py-2 sm:py-2.5 px-3 sm:px-7 flex items-center justify-between gap-2.5 sm:gap-4 relative">
        <Link href="/" className="flex items-center flex-none group">
          <img
            className="block h-[42px] sm:h-[56px] md:h-[66px] w-auto max-h-[70px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            src="/assets/images/avm-logo.png"
            alt="AVMLabs"
            height={66}
          />
        </Link>

        {/* Right Actions: Simple, Classic & Mobile Compatible */}
        <div className="flex items-center gap-2 sm:gap-3 flex-none ml-auto">
          <a
            href="/#register-camp"
            onClick={handleScrollToRegister}
            className="inline-flex items-center justify-center bg-[#E02029] hover:bg-[#c91821] text-white text-xs sm:text-sm font-semibold sm:font-bold py-1.5 sm:py-2 px-3 sm:px-5 rounded-full shadow-xs hover:shadow transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <span className="hidden sm:inline">Register a Camp</span>
            <span className="sm:hidden">Register</span>
          </a>

          <button
            onClick={onOpenCart}
            type="button"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#241A7A] hover:bg-[#1B154F] text-white text-xs sm:text-sm font-semibold sm:font-bold py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full shadow-xs hover:shadow transition-all cursor-pointer flex-none active:scale-95"
            aria-label={`My Profile (${cartCount} items)`}
            title={cartCount > 0 ? `View ${cartCount} selected items` : 'Your profile is empty — select tests from the list below'}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span className="hidden sm:inline">My Profile</span>
            <span className="sm:hidden">Profile</span>
            <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 sm:px-1.5 rounded-full bg-[#E02029] text-white font-black text-[10px] sm:text-[11px] leading-none">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
