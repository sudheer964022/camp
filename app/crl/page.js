'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import TestDetailDrawer from '../../components/TestDetailDrawer';
import catalogData from '../../lib/catalog.json';

export default function CRLPage() {
  const [cart, setCart] = useState(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [customerView, setCustomerView] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('avm_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map = new Map();
          parsed.forEach((code) => {
            const test = catalogData.tests.find((t) => t.code === code);
            if (test) map.set(code, test);
          });
          setCart(map);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCart = (nextCart) => {
    setCart(nextCart);
    try {
      localStorage.setItem('avm_profile', JSON.stringify(Array.from(nextCart.keys())));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = (code) => {
    const next = new Map(cart);
    next.delete(code);
    saveCart(next);
  };

  const handleClearCart = () => {
    saveCart(new Map());
  };

  const cartItems = Array.from(cart.values());

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header cartCount={cart.size} onOpenCart={() => setCartOpen(true)} />

      <main className="flex-1">

        <section className="bg-gradient-to-br from-[#0E294B] via-[#163C66] to-[#1A4676] text-[#EFF3F6] py-16 md:py-20">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="max-w-[840px]">
              <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber mb-2">
                LIVE TEST MENU &amp; PROFILES
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight my-3">
                Central Reference Laboratory (CRL)
              </h1>
              <p className="text-base sm:text-lg text-[#F0F9FF] leading-relaxed max-w-2xl mt-3">
                A ~25,000 sq. ft. state-of-the-art Wellness Laboratory, with high end Clinical Chemistry
                Analysers to serve to entire India and for the countries of Western Asia via Dubai and
                South East Asia via Singapore.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-paper-2" id="about-crl">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="max-w-[640px] mb-8">
              <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">ABOUT</p>
              <h2 className="text-3xl font-extrabold text-navy tracking-tight">CENTRAL REFERENCE LABORATORY</h2>
            </div>
            <div className="max-w-[1100px] space-y-5 text-base text-ink-soft leading-relaxed">
              <p>
                The CRL will house the best of technologies and analysers that can offer a 1,500+ test menu,
                that have less volume but needs higher end technologies, including LC-MS, ICP-MS, GC-MS, NGS
                and NMR, in addition to all conventional laboratory technologies routine laboratories use.
              </p>
              <p>
                In simple words a 100+ Low End, High Volume and Low Value tests will be done Locally in Local
                Processing Laboratories (LPL). While a 1000+ High End, Low Volume and High Value tests will be
                done in Centralised Reference Laboratory (CRL) which will serve to many countries that cover
                3 Billion Population.
              </p>
              <p>
                By Centralising rare menu, localising routine menu, optimises menu, cost, speed and quality for
                entire range of tests in clinical chemistry.{' '}
                <strong className="text-navy font-bold">
                  Thus AVMLabs entire menu Affordable, Accessible, and Reliable for every Pincode in this country.
                </strong>
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold text-navy mb-1.5">Browse CRL Tests &amp; Speciality Profiles</h3>
                <p className="text-sm text-ink-soft">
                  Explore CRL&apos;s 147 tests and 55 specialised profiles — all integrated into the transparent Rate List and Profile Builder.
                </p>
              </div>
              <Link
                href="/#ratelist"
                className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-navy font-bold text-sm py-3 px-6 rounded-xl shadow-sm transition-all flex-none"
              >
                Explore on Rate List →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenCart={() => setCartOpen(true)} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        customerView={customerView}
        setCustomerView={setCustomerView}
        onOpenTestDetail={(code) => {
          const test = catalogData.tests.find((t) => t.code === code);
          if (test) setSelectedTestDetail(test);
        }}
      />

      <TestDetailDrawer
        test={selectedTestDetail}
        isOpen={!!selectedTestDetail}
        onClose={() => setSelectedTestDetail(null)}
        isAdded={selectedTestDetail ? cart.has(selectedTestDetail.code) : false}
        onToggleTest={(code) => {
          const next = new Map(cart);
          if (next.has(code)) next.delete(code);
          else {
            const test = catalogData.tests.find((t) => t.code === code);
            if (test) next.set(code, test);
          }
          saveCart(next);
        }}
        customerView={customerView}
      />
    </div>
  );
}
