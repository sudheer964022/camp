import Link from 'next/link';

export default function Hero({ onOpenCart, testCount = 78, profileCount = 13, minRate = 50 }) {
  return (
    <section className="relative overflow-hidden bg-[#F4F5EF] pt-4 sm:pt-6 pb-6 sm:pb-8" id="top">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
        {/* Main Camp Banner Image */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 bg-[#241A7A]">
          <img
            src="/assets/images/camp-banner.svg"
            alt="AVMLabs Health Check-up Camp"
            className="w-full h-auto block select-none"
            priority="true"
          />
        </div>

        {/* 3 Floating Stat Cards below Banner (Centered) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-5">
          {/* Card 1: 78 LPL tests */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-3 sm:p-4 flex items-center gap-3 transition-all">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-none">
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31L4.62 17.5A2 2 0 0 0 6.34 21h11.32a2 2 0 0 0 1.72-3.5L14 9.31V2" />
                <path d="M8.5 2h7" />
                <path d="M7 16h10" />
              </svg>
            </div>
            <div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-none">{testCount}</div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Tests</div>
            </div>
          </div>

          {/* Card 2: 13 profiles */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-3 sm:p-4 flex items-center gap-3 transition-all">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-none">
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="14" y2="13" />
              </svg>
            </div>
            <div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-none">{profileCount}</div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Profiles</div>
            </div>
          </div>

          {/* Card 3: ₹50 Catalogue rates from */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-3 sm:p-4 flex items-center gap-3 transition-all">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-none">
              <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-none">₹{minRate}</div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Camp rates from</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
