'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import TestDetailDrawer from '../../components/TestDetailDrawer';
import catalogData from '../../lib/catalog.json';

export default function SarcPage() {
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
                THE NUMBERS BEHIND SARC
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight my-3">
                Cost per test falls as volume rises
              </h1>
              <p className="text-base sm:text-lg text-[#F0F9FF] leading-relaxed max-w-2xl mt-3">
                The same pattern shows up whether the cost driver is quality control, reagent purchasing, or the full
                services-cost breakdown — more volume through the same fixed base, lower cost per test.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-paper-2" id="cost-tables">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7 space-y-12">

            <div id="chapter-01" className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 text-teal border border-teal/20 shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="3" width="4" height="15" rx="2" />
                    <rect x="14" y="6" width="4" height="12" rx="2" />
                    <line x1="4.5" y1="3" x2="11.5" y2="3" />
                    <line x1="12.5" y1="6" x2="19.5" y2="6" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy">Cost of CBC with 3-Level Controls</h2>
                  <p className="text-sm text-ink-soft mt-1">
                    See how scale gives advantage <span className="inline-block px-2 py-0.5 ml-1 text-xs font-semibold rounded-md bg-teal/10 text-teal">#ScaleHiKhelHai</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-line/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-paper border-b border-line/70 text-xs font-bold text-ink-soft uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-semibold">S.No</th>
                        <th className="py-3.5 px-4 font-semibold">Tests/Day</th>
                        <th className="py-3.5 px-4 font-semibold">Reagent Cost</th>
                        <th className="py-3.5 px-4 font-semibold">QC Cost</th>
                        <th className="py-3.5 px-4 font-semibold">Total Cost</th>
                        <th className="py-3.5 px-4 font-semibold">Cost / Test</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40 text-ink">
                      {[
                        [1, '2', '20', '1,000', '1,020', '510'],
                        [2, '4', '80', '1,000', '1,080', '270'],
                        [3, '8', '160', '1,000', '1,160', '145'],
                        [4, '16', '320', '1,000', '1,320', '83'],
                        [5, '32', '640', '1,000', '1,640', '51'],
                        [6, '64', '1,280', '1,000', '2,280', '36'],
                        [7, '128', '2,560', '1,000', '3,560', '28'],
                        [8, '256', '5,120', '1,000', '6,120', '24'],
                        [9, '512', '10,240', '1,000', '11,240', '22'],
                        [10, '1,024', '20,480', '1,000', '21,480', '21'],
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-paper/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-ink-faint">{row[0]}</td>
                          <td className="py-3 px-4 font-medium">{row[1]}</td>
                          <td className="py-3 px-4">{row[2]}</td>
                          <td className="py-3 px-4">{row[3]}</td>
                          <td className="py-3 px-4 font-medium">{row[4]}</td>
                          <td className="py-3 px-4 font-bold text-teal">{row[5]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-paper/50 px-4 py-3 border-t border-line/60 text-xs text-ink-soft flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal text-white font-bold text-[10px]">i</span>
                  <span><strong>QC cost is constant, Hence the scale gives the advantage</strong></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div id="chapter-cbc-purchase" className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 text-teal border border-teal/20 shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="3" width="4" height="15" rx="2" />
                      <rect x="14" y="6" width="4" height="12" rx="2" />
                      <line x1="4.5" y1="3" x2="11.5" y2="3" />
                      <line x1="12.5" y1="6" x2="19.5" y2="6" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-navy">CBC : Scale and Purchase Cost</h2>
                    <p className="text-sm text-ink-soft mt-1">
                      For every doubling of volumes a 10% additional discount in purchase cost.{' '}
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-teal/10 text-teal">#ScaleHiKhelHai</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-line/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-paper border-b border-line/70 text-xs font-bold text-ink-soft uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">#</th>
                          <th className="py-3 px-4 font-semibold">Tests/Month</th>
                          <th className="py-3 px-4 font-semibold">Purchase Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/40 text-ink">
                        {[
                          [1, '100', '50'],
                          [2, '200', '45'],
                          [3, '400', '41'],
                          [4, '800', '36'],
                          [5, '1,600', '33'],
                          [6, '3,200', '30'],
                          [7, '6,400', '27'],
                          [8, '12,800', '24'],
                          [9, '25,600', '22'],
                          [10, '51,200', '19'],
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-paper/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-ink-faint">{row[0]}</td>
                            <td className="py-3 px-4 font-medium">{row[1]}</td>
                            <td className="py-3 px-4 font-bold text-teal">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div id="chapter-02" className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald/10 text-emerald border border-emerald/20 shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="7" y="9" width="10" height="11" rx="2.5" />
                      <rect x="9.5" y="5" width="5" height="4" rx="1" />
                      <line x1="8.5" y1="3.5" x2="15.5" y2="3.5" />
                      <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Vitamin D : Scale and Purchase Cost</h2>
                    <p className="text-sm text-ink-soft mt-1">
                      Higher purchase volumes reduce the reagent cost per test.{' '}
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald/10 text-emerald">#ScaleHiKhelHai</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-line/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-paper border-b border-line/70 text-xs font-bold text-ink-soft uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">#</th>
                          <th className="py-3 px-4 font-semibold">Tests/Month</th>
                          <th className="py-3 px-4 font-semibold">Cost of Reagents</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/40 text-ink">
                        {[
                          [1, '100', '100'],
                          [2, '200', '90'],
                          [3, '400', '81'],
                          [4, '800', '73'],
                          [5, '1,600', '66'],
                          [6, '3,200', '59'],
                          [7, '6,400', '53'],
                          [8, '12,800', '48'],
                          [9, '25,600', '43'],
                          [10, '51,200', '39'],
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-paper/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-ink-faint">{row[0]}</td>
                            <td className="py-3 px-4 font-medium">{row[1]}</td>
                            <td className="py-3 px-4 font-bold text-emerald">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div id="chapter-03" className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber/10 text-amber-dark border border-amber/20 shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="20" x2="20" y2="20" />
                    <rect x="6" y="14" width="3" height="6" rx="1" fill="currentColor" stroke="none" />
                    <rect x="11" y="10" width="3" height="10" rx="1" fill="currentColor" stroke="none" />
                    <rect x="16" y="5" width="3" height="15" rx="1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy">Services At Reagent Cost (SARC) – Simplified</h2>
                  <p className="text-sm text-ink-soft mt-1">
                    See how higher analyzer utilization helps to reduce reagent cost &amp; Per Specimen Over head (PSO){' '}
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-amber/10 text-amber-dark">#ScaleHiKhelHai</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-line/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-paper border-b border-line/70 text-xs font-bold text-ink-soft uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-semibold">HPD</th>
                        <th className="py-3.5 px-4 font-semibold">Services Cost</th>
                        <th className="py-3.5 px-4 font-semibold">Reagent Cost</th>
                        <th className="py-3.5 px-4 font-semibold">PSO</th>
                        <th className="py-3.5 px-4 font-semibold">% Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40 text-ink">
                      {[
                        ['1', '100', '100', '50', '-50%', 'negative'],
                        ['2', '100', '94', '48', '-42%', 'negative'],
                        ['4', '100', '83', '43', '-26%', 'negative'],
                        ['6', '100', '73', '39', '-12%', 'negative'],
                        ['8', '100', '65', '35', '0%', 'neutral'],
                        ['10', '100', '57', '32', '11%', 'positive'],
                        ['12', '100', '51', '28', '21%', 'positive'],
                        ['14', '100', '45', '26', '30%', 'positive'],
                        ['16', '100', '40', '23', '37%', 'positive'],
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-paper/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-ink-faint">{row[0]}</td>
                          <td className="py-3 px-4 font-medium">{row[1]}</td>
                          <td className="py-3 px-4">{row[2]}</td>
                          <td className="py-3 px-4">{row[3]}</td>
                          <td className="py-3 px-4 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                row[5] === 'negative'
                                  ? 'bg-rose-100 text-rose-700'
                                  : row[5] === 'positive'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {row[4]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-paper/50 px-4 py-3 border-t border-line/60 text-xs text-ink-soft flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-dark text-white font-bold text-[10px]">i</span>
                  <span><strong>HPD – Hours per Day the Analyzer running.</strong></span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="py-12 bg-paper">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
            <div className="bg-gradient-to-r from-navy via-navy-2 to-teal-dark text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-white mb-2">See SARC Pricing on the Rate List</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  Every test on the rate list already reflects the SARC advantage — browse the full list or start building a profile.
                </p>
              </div>
              <Link
                href="/#ratelist"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber hover:bg-amber-dark text-navy font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap text-sm sm:text-base"
              >
                Browse the Rate List →
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
