'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const SLIDES = [
  {
    src: '/Corporateoffice.png',
    alt: 'AVMLabs Health Check-up Camp - Corporate Office',
    title: 'Corporate Office',
  },
  {
    src: '/Hosuingsociety.png',
    alt: 'AVMLabs Health Check-up Camp - Housing Society',
    title: 'Housing Society',
  },
  {
    src: '/Exhibitionstall.png',
    alt: 'AVMLabs Health Check-up Camp - Exhibition Stall',
    title: 'Exhibition Stall',
  },
  {
    src: '/Villageschool.png',
    alt: 'AVMLabs Health Check-up Camp - Village School',
    title: 'Village School',
  },
];

const AUTO_PLAY_INTERVAL = 3000;

export default function Hero({ onOpenCart, testCount = 78, profileCount = 13, minRate = 50 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch / Swipe support
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section className="relative overflow-hidden bg-[#F4F5EF] pt-0 sm:pt-6 pb-6 sm:pb-8" id="top">
      <div className="max-w-[1180px] mx-auto px-0 sm:px-7">
        {/* Main Camp Banner Carousel - Full width on Mobile, Flush with Header */}
        <div
          className="group relative rounded-none sm:rounded-[15px] overflow-hidden shadow-sm sm:shadow-xl border-b sm:border border-slate-200/60 select-none aspect-[8/3]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label="AVMLabs Health Check-up Camp Banners"
        >
          {/* Slides Stack - Smooth Cross-Fade (No Scrolling) */}
          {SLIDES.map((slide, idx) => {
            const isActive = currentIndex === idx;
            return (
              <div
                key={slide.src}
                className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover block select-none pointer-events-none"
                  draggable="false"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}

          {/* Previous Arrow Button with Frosted Glass Transparency & Blur (Desktop Hover) */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-white/80 z-20 cursor-pointer"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(14px) saturate(180%)',
              WebkitBackdropFilter: 'blur(14px) saturate(180%)',
              border: 'none',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next Arrow Button with Frosted Glass Transparency & Blur (Desktop Hover) */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-white/80 z-20 cursor-pointer"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(14px) saturate(180%)',
              WebkitBackdropFilter: 'blur(14px) saturate(180%)',
              border: 'none',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots Indicator Pill with Frosted Glass Transparency & Blur */}
          <div
            className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: 'none',
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            {SLIDES.map((slide, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/80 ${
                    isActive
                      ? 'w-5 sm:w-8 h-1.5 sm:h-2.5 bg-white shadow-xs'
                      : 'w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* 3 Floating Stat Cards below Banner (Compact on mobile, rich & balanced on laptop) */}
        <div className="max-w-4xl mx-auto px-3 sm:px-0 grid grid-cols-3 gap-2 sm:gap-5 mt-2.5 sm:mt-6">
          {/* Card 1: Tests */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 shadow-xs sm:shadow-sm hover:shadow-md p-2 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-start text-center sm:text-left gap-1 sm:gap-4 transition-all">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-none">
              <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31L4.62 17.5A2 2 0 0 0 6.34 21h11.32a2 2 0 0 0 1.72-3.5L14 9.31V2" />
                <path d="M8.5 2h7" />
                <path d="M7 16h10" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-none">{testCount}</div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1.5 truncate">Tests Available</div>
            </div>
          </div>

          {/* Card 2: Profiles */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 shadow-xs sm:shadow-sm hover:shadow-md p-2 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-start text-center sm:text-left gap-1 sm:gap-4 transition-all">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-none">
              <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="14" y2="13" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-none">{profileCount}</div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1.5 truncate">Health Profiles</div>
            </div>
          </div>

          {/* Card 3: Rates */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 shadow-xs sm:shadow-sm hover:shadow-md p-2 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-start text-center sm:text-left gap-1 sm:gap-4 transition-all">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none">
              <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-none">₹{minRate}</div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1.5 truncate">Camp Rates From</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
