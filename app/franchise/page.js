'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import TestDetailDrawer from '../../components/TestDetailDrawer';
import catalogData from '../../lib/catalog.json';

export default function FranchisePage() {
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

        <section className="relative overflow-hidden bg-gradient-to-br from-[#0E294B] via-[#163C66] to-[#1A4676] text-[#EFF3F6] py-16 md:py-20">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7 relative z-10">
            <div className="max-w-[760px]">
              <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber mb-2">
                AVMLABS FRANCHISEE
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight my-3">
                From B2B Partner to AVMLabs Franchisee
              </h1>
              <p className="text-base sm:text-lg text-[#F0F9FF] font-semibold tracking-wide drop-shadow-sm mb-3">
                At AVMLabs, Franchise is built on Trust, Truth &amp; Transparency.
              </p>
              <div className="w-20 h-1 bg-amber rounded-full mb-4"></div>
              <p className="text-sm sm:text-base text-[#CFE2F2] leading-relaxed mb-3">
                Honest and loyal B2B partners who consistently demonstrate trust, transparency and commitment may earn the opportunity to become an AVMLabs Franchisee and display the AVMLabs Name Board at their centre.
              </p>
              <p className="text-sm sm:text-base text-white font-bold leading-relaxed mb-6">
                Start as a B2B Partner. Build Trust. Earn the AVMLabs Franchise.
              </p>

              <div className="flex gap-3 flex-wrap">
                <a
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm py-3 px-5 rounded-xl shadow-sm transition-all"
                  href="https://wa.me/919600661732?text=Interested%20in%20Franchise%20Collaboration"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.003 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.484 1.345 4.997L2 22l5.132-1.334a9.96 9.96 0 0 0 4.87 1.24h.001c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.935 9.935 0 0 0-7.068-2.929zm0 18.174h-.001a8.2 8.2 0 0 1-4.173-1.142l-.299-.177-3.104.808.828-3.027-.194-.31a8.163 8.163 0 0 1-1.253-4.349c0-4.516 3.674-8.19 8.2-8.19 2.19 0 4.247.853 5.795 2.401a8.144 8.144 0 0 1 2.399 5.796c-.003 4.516-3.677 8.19-8.198 8.19z" />
                  </svg>
                  Enquire Now
                </a>
                <a
                  href="#compare"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-3 px-5 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
                >
                  See What You Get ↓
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-paper-2" id="compare">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="max-w-[640px] mb-8">
              <p className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-amber-dark mb-2">FRANCHISEE VS B2B</p>
              <h2 className="text-3xl font-extrabold text-navy tracking-tight my-2">Benefits of Becoming an AVMLabs Franchisee</h2>
              <p className="text-sm text-ink-soft">Everything a franchisee partner gets that a regular B2B client doesn&apos;t — side by side.</p>
            </div>

            <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
                <div>
                  <div className="p-4 bg-emerald-bg/50 border-b border-line">
                    <span className="font-display font-bold text-base text-emerald-dark">AVMLabs Franchisee Partner</span>
                  </div>
                  <div className="divide-y divide-line/60">
                    <div className="p-4 flex items-start gap-3 text-sm text-navy">
                      <span className="text-emerald font-bold flex-none text-base">✓</span>
                      <span>Can display <b>AVMLabs</b> name board</span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-navy">
                      <span className="text-emerald font-bold flex-none text-base">✓</span>
                      <span>Get <b>company-generated leads</b></span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-navy">
                      <span className="text-emerald font-bold flex-none text-base">✓</span>
                      <span>Get listed on <b>Google &amp; Meta</b></span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-navy">
                      <span className="text-emerald font-bold flex-none text-base">✓</span>
                      <span>Become part of <b>AVMLabs&apos; progress &amp; growth</b></span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="p-4 bg-paper border-b border-line">
                    <span className="font-display font-bold text-base text-ink-faint">Regular B2B Client</span>
                  </div>
                  <div className="divide-y divide-line/60">
                    <div className="p-4 flex items-start gap-3 text-sm text-ink-soft">
                      <span className="text-red-400 font-bold flex-none text-base">✕</span>
                      <span>Cannot display <b>AVMLabs</b> name board</span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-ink-soft">
                      <span className="text-red-400 font-bold flex-none text-base">✕</span>
                      <span>Don&apos;t get company-generated leads</span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-ink-soft">
                      <span className="text-red-400 font-bold flex-none text-base">✕</span>
                      <span>Not listed on Google &amp; Meta</span>
                    </div>
                    <div className="p-4 flex items-start gap-3 text-sm text-ink-soft">
                      <span className="text-red-400 font-bold flex-none text-base">✕</span>
                      <span>Not part of AVMLabs&apos; company progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold text-navy mb-1.5">Your Growth. Our Support.</h3>
                <p className="text-sm text-ink-soft">
                  Partner with AVMLabs and get more than a franchise — get a growth ecosystem built around your business.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-sm transition-all flex-none"
                href="https://wa.me/919600661732?text=Interested%20in%20Franchise%20Collaboration"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.003 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.484 1.345 4.997L2 22l5.132-1.334a9.96 9.96 0 0 0 4.87 1.24h.001c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.935 9.935 0 0 0-7.068-2.929zm0 18.174h-.001a8.2 8.2 0 0 1-4.173-1.142l-.299-.177-3.104.808.828-3.027-.194-.31a8.163 8.163 0 0 1-1.253-4.349c0-4.516 3.674-8.19 8.2-8.19 2.19 0 4.247.853 5.795 2.401a8.144 8.144 0 0 1 2.399 5.796c-.003 4.516-3.677 8.19-8.198 8.19z" />
                </svg>
                Become an AVMLabs Franchisee Partner
              </a>
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
