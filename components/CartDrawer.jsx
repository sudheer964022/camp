'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { money } from '../lib/formatters';
import { cartTotals, patientPrice } from '../lib/calculations';
import { cleanProfileName, getProfileTestCount } from '../lib/profileGroups';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  bundlePkgs = [],
  onRemoveItem,
  onRemovePackage,
  onClearCart,
  customerView,
  setCustomerView,
  onOpenTestDetail
}) {
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const calc = cartTotals(cartItems, bundlePkgs);
  const mpbDiff = calc.netB2b - calc.b2b;

  // BBC-style pricing: system discount always applies, manual only takes effect below system price.
  const manualVal = discountedPrice !== '' ? Number(discountedPrice) : null;
  const pp = patientPrice(calc.b2c, manualVal);
  const finalMargin = pp.price - calc.netB2b;

  const totalBundleTests = bundlePkgs.reduce((acc, p) => acc + getProfileTestCount(p), 0);
  const totalItemCount = cartItems.length + totalBundleTests;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyList = () => {
    if (!cartItems.length && !bundlePkgs.length) return;
    const lines = [
      `AVMLabs Profile Summary`,
      `Total Tests & Profiles: ${bundlePkgs.length + cartItems.length}`,
      ...bundlePkgs.map(p => `- [Profile] ${cleanProfileName(p.name)} (${getProfileTestCount(p)} tests) | Price: ₹${p.pricing?.b2c}`),
      ...cartItems.map(t => `- ${t.name} (${t.code}) | Price: ₹${t.b2c}`),
      customerView ? '' : `Processing Cost: ₹${calc.netB2b}`,
      `Profile Price: ₹${calc.b2c}`,
      pp.isDiscounted ? `Discounted Price: ₹${pp.price}` : '',
      customerView ? '' : `PCCLM: ₹${finalMargin}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    showToast('Profile list copied to clipboard!');
  };

  const handleExportExcel = () => {
    if (!cartItems.length && !bundlePkgs.length) return;
    const bundleRows = bundlePkgs.map((p, idx) => ({
      'S.No': idx + 1,
      'Test Code': p.code || 'PROFILE',
      'Test Name': cleanProfileName(p.name),
      'Technology': 'Bundle Profile',
      'Sample': 'Serum / Mixed',
      'Processed At': p.processedAt || 'LPL',
      ...(customerView ? {} : { 'Processing Cost (₹)': p.pricing?.b2b || 0 }),
      'Test Price (₹)': p.pricing?.b2c || 0,
      ...(customerView ? {} : { 'PCCLM (₹)': (p.pricing?.b2c || 0) - (p.pricing?.b2b || 0) })
    }));

    const itemRows = cartItems.map((t, idx) => ({
      'S.No': bundleRows.length + idx + 1,
      'Test Code': t.code,
      'Test Name': t.name,
      'Technology': t.tech,
      'Sample': t.sample,
      'Processed At': t.processedAt,
      ...(customerView ? {} : { 'Processing Cost (₹)': t.b2b }),
      'Test Price (₹)': t.b2c,
      ...(customerView ? {} : { 'PCCLM (₹)': t.b2c - t.b2b })
    }));

    const data = [...bundleRows, ...itemRows];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'My Profile');
    XLSX.writeFile(wb, 'AVMLabs_My_Profile.xlsx');
    showToast('Excel exported successfully!');
  };

  const handlePrint = () => {
    if (!cartItems.length && !bundlePkgs.length) {
      showToast('Your profile is empty');
      return;
    }
    const payload = {
      codes: cartItems.map((t) => t.code),
      packages: bundlePkgs.map((p) => p.id),
      discountedPrice: pp.isDiscounted ? pp.price : null,
    };
    try {
      sessionStorage.setItem('avm_print_payload_v1', JSON.stringify(payload));
      localStorage.setItem('avm_print_payload_v1', JSON.stringify(payload));
      if (pp.isDiscounted) {
        localStorage.setItem('avm_discounted_price', pp.price.toString());
      } else {
        localStorage.removeItem('avm_discounted_price');
      }
    } catch (e) {
      console.error(e);
    }
    const win = window.open('/print-profile', '_blank');
    if (!win) {
      showToast('Pop-up blocked — allow pop-ups to open the print view');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="My Profile"
      >

        <div className="flex items-center justify-between p-5 border-b border-line bg-paper/80 backdrop-blur-md flex-none">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h3 className="font-display text-lg font-bold text-navy">My Profile</h3>
              <p className="text-xs text-ink-faint font-mono mt-0.5">
                {totalItemCount} tests selected
              </p>
            </div>
            <label
              className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-soft select-none"
              title="Hide Processing Cost & PCCLM everywhere below"
            >
              <input
                type="checkbox"
                checked={customerView}
                onChange={(e) => setCustomerView(e.target.checked)}
                className="w-4 h-4 rounded text-teal focus:ring-teal cursor-pointer"
              />
              <span>Customer copy</span>
            </label>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-faint hover:text-navy hover:bg-black/5 transition-all cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cartItems.length === 0 && bundlePkgs.length === 0 ? (
            <p className="text-sm text-ink-faint text-center py-10">
              Your profile is empty. Add tests from the rate list or start from a profile.
            </p>
          ) : (
            <div className="space-y-4">
              {bundlePkgs.length > 0 && (
                <div>
                  <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-ink-faint mb-2">
                    BUNDLED PROFILES ({bundlePkgs.length})
                  </span>
                  <ul className="space-y-2">
                    {bundlePkgs.map((pkg) => {
                      const pkgTestCount = getProfileTestCount(pkg);
                      const b2b = pkg.pricing?.b2b || 0;
                      const b2c = pkg.pricing?.b2c || 0;
                      return (
                        <li key={pkg.id} className="p-3 bg-sky-50/30 rounded-xl border border-[#93C5FD]/40 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-navy">{cleanProfileName(pkg.name)}</div>
                            <div className="text-xs text-[#1E63B4] font-semibold mt-0.5">
                              {pkgTestCount} tests included
                            </div>
                          </div>
                          <div className="text-right flex-none">
                            <div className="text-sm font-bold text-navy">{money(b2c)}</div>
                            {!customerView && (
                              <div className="text-xs text-profit font-semibold">+{money(b2c - b2b)}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemovePackage && onRemovePackage(pkg.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-ink-faint hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer flex-none"
                            aria-label={`Remove ${pkg.name}`}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {cartItems.length > 0 && (
                <div>
                  {bundlePkgs.length > 0 && (
                    <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-ink-faint mb-2">
                      INDIVIDUAL TESTS ({cartItems.length})
                    </span>
                  )}
                  <ul className="divide-y divide-line/60">
                    {cartItems.map((item) => (
                      <li key={item.code} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onOpenTestDetail(item.code)}
                            className="text-left font-medium text-sm text-navy hover:underline block truncate cursor-pointer"
                          >
                            {item.name}
                          </button>
                          <div className="text-xs text-ink-faint flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{item.code}</span>
                            <span>•</span>
                            <span>{item.tech}</span>
                            {item.sample && (
                              <>
                                <span>•</span>
                                <span>{item.sample}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-none">
                          <div className="text-sm font-bold text-navy">{money(item.b2c)}</div>
                          {!customerView && (
                            <div className="text-xs text-profit font-semibold">+{money(item.b2c - item.b2b)}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.code)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-faint hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer flex-none"
                          aria-label={`Remove ${item.name}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-line p-5 bg-card space-y-4 flex-none">

          {/* ── BBC-style pricing breakdown ── */}
          <div className="space-y-1.5 text-sm">

            {/* Processing Cost (internal only) */}
            {!customerView && (
              <>
                <div className="flex justify-between text-ink-soft font-medium">
                  <span>Processing Cost</span>
                  <span className="font-bold text-navy">{money(calc.netB2b)}</span>
                </div>
                {mpbDiff > 0 && (
                  <p className="text-[11px] text-amber-dark/90 leading-snug">
                    ⚠ Includes ₹{mpbDiff} Min. Patient Billing floor (Serum sample).
                  </p>
                )}
              </>
            )}

            {/* Profile Price — struck once discounted */}
            <div className="flex justify-between text-ink-soft font-medium">
              <span>Profile Price</span>
              <span className={`font-bold ${
                pp.isDiscounted ? 'line-through text-ink-faint font-normal' : 'text-navy'
              }`}>
                {money(calc.b2c)}
              </span>
            </div>

            {/* System Discount (10% / 20%) — auto applied */}
            {pp.systemPct > 0 && (
              <div className="flex justify-between font-semibold" style={{ color: '#1E63B4' }}>
                <span>System Discount ({pp.systemPct}%)</span>
                <span>−{money(pp.systemDiscount)}</span>
              </div>
            )}

            {/* Price after System Discount */}
            {pp.isDiscounted && (
              <div className="flex justify-between text-ink-soft font-medium">
                <span>{pp.hasManual ? 'Discounted Price' : 'Price after Discount'}</span>
                <span className="font-bold text-navy">{money(pp.price)}</span>
              </div>
            )}
          </div>

          {/* ── DISCOUNTED PRICE input + YOUR PCCLM side-by-side (internal only) ── */}
          {!customerView && calc.b2c > 0 && (
            <div className="flex gap-3 items-stretch">

              {/* Left: editable discounted price input */}
              <div className="flex-1 rounded-xl border border-line bg-paper/60 px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-ink-faint">
                    Discounted Price
                  </span>
                  {discountedPrice !== '' && (
                    <button
                      type="button"
                      onClick={() => setDiscountedPrice('')}
                      className="text-[10px] text-ink-faint hover:text-red-600 font-medium transition-colors cursor-pointer"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-sm font-bold text-ink-soft pointer-events-none">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={pp.systemPrice}
                    value={discountedPrice !== '' ? discountedPrice : pp.systemPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const v = e.target.value;
                      // Snap down to systemPrice ceiling if user types above it
                      if (v !== '' && Number(v) > pp.systemPrice) {
                        setDiscountedPrice(String(pp.systemPrice));
                      } else {
                        setDiscountedPrice(v);
                      }
                    }}
                    className="w-full pl-6 pr-2 py-1.5 text-sm font-bold border border-line rounded-lg focus:outline-none focus:border-teal bg-white transition-colors"
                  />
                </div>
                {discountedPrice !== '' && Number(discountedPrice) >= pp.systemPrice && (
                  <p className="text-[10px] text-amber-dark font-medium">
                    ⚠ Must be less than {money(pp.systemPrice)}
                  </p>
                )}
              </div>

              {/* Right: YOUR PCCLM highlighted box */}
              <div className="flex-1 rounded-xl border-2 border-[#1E63B4]/40 bg-[#EFF6FF] px-3 py-2.5 flex flex-col justify-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#1E63B4] flex-none"/>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#1E63B4] leading-tight">
                    Your PCCLM{pp.isDiscounted ? ' (After Discount)' : ''}
                  </span>
                </div>
                <span className={`text-xl font-extrabold ${
                  finalMargin < 0 ? 'text-red-600' : 'text-[#1E63B4]'
                }`}>
                  {money(finalMargin)}
                </span>
              </div>
            </div>
          )}

          {/* Customer view: just show the final patient price prominently */}
          {customerView && pp.isDiscounted && (
            <div className="rounded-xl border border-emerald/40 bg-emerald/5 px-4 py-3 text-center">
              <p className="text-[11px] text-ink-faint font-medium mb-0.5">Your Price</p>
              <p className="text-2xl font-extrabold text-emerald">{money(pp.price)}</p>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopyList}
                disabled={!cartItems.length && !bundlePkgs.length}
                className="py-2 px-2 border border-line hover:border-navy rounded-xl text-xs font-semibold text-navy bg-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📋</span>
                <span>Copy List</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={!cartItems.length && !bundlePkgs.length}
                className="py-2 px-2 border border-line hover:border-navy rounded-xl text-xs font-semibold text-navy bg-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📥</span>
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!cartItems.length && !bundlePkgs.length}
                className="py-2 px-2 bg-navy hover:bg-navy/90 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🖨</span>
                <span>Print/Share</span>
              </button>
            </div>

            {(cartItems.length > 0 || bundlePkgs.length > 0) && (
              <button
                type="button"
                onClick={onClearCart}
                className="w-full text-center text-xs text-ink-faint hover:text-red-600 pt-1 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </aside>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-60 bg-navy text-white text-xs px-4 py-2.5 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
