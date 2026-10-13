'use client';

import { useState, useEffect, useMemo } from 'react';
import catalogData from '../../lib/catalog.json';
import { formatRupees } from '../../lib/formatters';
import {
  cleanProfileName,
  getProfileGroups,
  getProfileTestCount,
  getProfileAllCodes
} from '../../lib/profileGroups';

export default function PrintProfilePage() {
  const [items, setItems] = useState([]);
  const [bundlePkgs, setBundlePkgs] = useState([]);
  const [dateStr, setDateStr] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [branding, setBranding] = useState(null);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [brandingForm, setBrandingForm] = useState({ name: '', phone: '', address: '', logo: null });
  const [isSharing, setIsSharing] = useState(false);

  const packageById = useMemo(() => {
    return Object.fromEntries((catalogData.packages || []).map((p) => [p.id, p]));
  }, []);

  const catalogTestsByCode = useMemo(() => {
    return Object.fromEntries((catalogData.tests || []).map((t) => [t.code, t]));
  }, []);

  useEffect(() => {
    const now = new Date();
    setDateStr(
      now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );

    try {
      let codes = [];
      let packageIds = [];
      let disc = null;

      // 1. Check URL parameters first (enables direct sharing via link)
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const qCodes = searchParams.get('codes');
        const qPackages = searchParams.get('packages') || searchParams.get('pkgs');
        const qDisc = searchParams.get('discount') || searchParams.get('disc');
        const qBName = searchParams.get('bname');
        const qBPhone = searchParams.get('bphone');
        const qBAddr = searchParams.get('baddr');

        if (qCodes) codes = qCodes.split(',').map((s) => s.trim()).filter(Boolean);
        if (qPackages) packageIds = qPackages.split(',').map((s) => s.trim()).filter(Boolean);
        if (qDisc) disc = parseFloat(qDisc);

        if (qBName || qBPhone || qBAddr) {
          const brandFromUrl = {
            name: qBName || '',
            phone: qBPhone || '',
            address: qBAddr || '',
            logo: null,
          };
          setBranding(brandFromUrl);
          setBrandingForm(brandFromUrl);
        }
      }

      // 2. Fallback to session / local storage payload
      if (codes.length === 0 && packageIds.length === 0) {
        const payloadStr =
          (typeof window !== 'undefined' && sessionStorage.getItem('avm_print_payload_v1')) ||
          (typeof window !== 'undefined' && localStorage.getItem('avm_print_payload_v1'));

        if (payloadStr) {
          const payload = JSON.parse(payloadStr);
          if (Array.isArray(payload)) {
            codes = payload;
          } else if (payload && typeof payload === 'object') {
            if (Array.isArray(payload.codes)) codes = payload.codes;
            if (Array.isArray(payload.packages)) packageIds = payload.packages;
            disc = payload.discountedPrice;
          }
        }
      }

      if (codes.length === 0 && packageIds.length === 0) {
        const saved = localStorage.getItem('avm_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) codes = parsed;
        }
        const savedPkgs = localStorage.getItem('avm_packages');
        if (savedPkgs) {
          const parsedPkgs = JSON.parse(savedPkgs);
          if (Array.isArray(parsedPkgs)) packageIds = parsedPkgs;
        }
      }

      if (disc == null) {
        const discSaved = localStorage.getItem('avm_discounted_price');
        if (discSaved) disc = parseFloat(discSaved);
      }

      if (disc != null) setDiscountedPrice(disc);

      if (codes.length > 0) {
        const loaded = codes
          .map((c) => catalogTestsByCode[c])
          .filter(Boolean);
        setItems(loaded);
      } else {
        setItems([]);
      }

      if (packageIds.length > 0) {
        const loadedPkgs = packageIds
          .map((id) => packageById[id])
          .filter(Boolean);
        setBundlePkgs(loadedPkgs);
      } else {
        setBundlePkgs([]);
      }

      const savedBrand =
        localStorage.getItem('avm_partner_branding') || localStorage.getItem('avm_branding');
      if (savedBrand) {
        const b = JSON.parse(savedBrand);
        setBranding(b);
        setBrandingForm(b);
      }
    } catch (e) {
      console.error(e);
    }
  }, [packageById, catalogTestsByCode]);

  useEffect(() => {
    if (items.length > 0 || bundlePkgs.length > 0) {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      if (searchParams && searchParams.get('noprint') === '1') {
        return;
      }
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => window.print()).catch(() => window.print());
          } else {
            window.print();
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [items, bundlePkgs]);

  const totalB2C =
    items.reduce((sum, item) => sum + (item.b2c || 0), 0) +
    bundlePkgs.reduce((sum, pkg) => sum + (pkg.pricing?.b2c || 0), 0);

  const allResolvedTests = [
    ...items,
    ...bundlePkgs.flatMap((pkg) => {
      const codes = getProfileAllCodes(pkg, catalogTestsByCode);
      return codes.map((c) => catalogTestsByCode[c]).filter(Boolean);
    }),
  ];

  const fastingItems = allResolvedTests.filter(
    (t) => (t.fasting && !/no\s*fasting|not\s*required/i.test(t.fasting)) || t.fastingRequired
  );

  const isEmpty = items.length === 0 && bundlePkgs.length === 0;

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') window.close();
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    if (items.length > 0) {
      url.searchParams.set('codes', items.map((t) => t.code).join(','));
    }
    if (bundlePkgs.length > 0) {
      url.searchParams.set('packages', bundlePkgs.map((p) => p.id).join(','));
    }
    if (discountedPrice != null && discountedPrice > 0) {
      url.searchParams.set('disc', discountedPrice.toString());
    }
    if (branding?.name) url.searchParams.set('bname', branding.name);
    if (branding?.phone) url.searchParams.set('bphone', branding.phone);
    if (branding?.address) url.searchParams.set('baddr', branding.address);
    url.searchParams.set('noprint', '1');
    return url.toString();
  };

  const handleShare = async () => {
    const totalCount = items.length + bundlePkgs.length;
    const shareUrl = getShareUrl() || (typeof window !== 'undefined' ? window.location.href : '');
    const effectiveTotal = discountedPrice != null && discountedPrice > 0 ? discountedPrice : totalB2C;
    const brandName = branding?.name || 'AVMLabs';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${brandName} — Health Profile`,
          text: `${brandName} Health Profile with ${totalCount} items. Total: ₹${effectiveTotal}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err && err.name !== 'AbortError') {
          handlePrint();
        }
      }
    } else {
      handlePrint();
    }
  };

  const handleSaveBranding = () => {
    if (!brandingForm.logo && !brandingForm.name && !brandingForm.phone && !brandingForm.address) {
      localStorage.removeItem('avm_partner_branding');
      localStorage.removeItem('avm_branding');
      setBranding(null);
    } else {
      localStorage.setItem('avm_partner_branding', JSON.stringify(brandingForm));
      localStorage.setItem('avm_branding', JSON.stringify(brandingForm));
      setBranding(brandingForm);
    }
    setBrandingOpen(false);
  };

  const handleRemoveBranding = () => {
    localStorage.removeItem('avm_partner_branding');
    localStorage.removeItem('avm_branding');
    setBranding(null);
    setBrandingForm({ name: '', phone: '', address: '', logo: null });
    setBrandingOpen(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBrandingForm((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    if (!name) return '—';
    return name
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-ink p-2 sm:p-4 md:p-8 pb-28 sm:pb-36 print:p-0 print:pb-0 flex flex-col items-center justify-start font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 14mm 12mm !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          table, tbody {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          .package-row {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />
      <div
        id="sheet"
        className="w-full max-w-[210mm] bg-white rounded-none print:rounded-none shadow-md print:shadow-none border border-line/60 print:border-none p-4 sm:p-7 md:p-10 text-ink print:p-0 print:max-w-none mb-6 print:mb-0 transition-all"
      >
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-navy pb-4 sm:pb-5 mb-5 sm:mb-6 gap-3 sm:gap-4">
          {branding && (branding.name || branding.logo) ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-none" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-navy text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                  {getInitials(branding.name)}
                </div>
              )}
              <div>
                <p className="text-lg sm:text-xl font-bold text-navy leading-tight">{branding.name}</p>
                <div className="text-xs text-ink-soft space-y-0.5 mt-1">
                  {branding.phone && <p>📞 {branding.phone}</p>}
                  {branding.address && <p>📍 {branding.address}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src="/assets/images/avm-logo.png" alt="AVMLabs" className="h-9 sm:h-10 object-contain rounded-none" />
              <div>
                <p className="text-base sm:text-lg font-bold text-navy">AVMLabs</p>
                <p className="text-[11px] sm:text-xs text-ink-soft">Automated Diagnostics</p>
              </div>
            </div>
          )}

          <div className="text-left sm:text-right sm:self-center">
            <h1 className="text-lg sm:text-xl font-extrabold text-navy uppercase tracking-wide">Health Profile</h1>
            <p className="text-xs text-ink-soft mt-0.5 sm:mt-1">Generated <b>{dateStr}</b></p>
          </div>
        </header>

        {isEmpty ? (
          <div className="py-12 sm:py-16 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-navy">No tests in this profile</h2>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Add tests from the rate list or build a profile, then print again.
            </p>
          </div>
        ) : (
          <div>
            <div className="w-full overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse mb-5 sm:mb-6 text-xs sm:text-sm">
                <thead>
                  <tr className="hidden print:table-row print:h-[14mm]">
                    <th colSpan={2} className="p-0 border-0 bg-transparent print:h-[14mm]">
                      <div className="print:h-[14mm] w-full" />
                    </th>
                  </tr>
                  <tr className="border-b border-navy bg-navy text-white text-[11px] sm:text-xs uppercase font-bold break-inside-avoid">
                    <th className="py-2.5 px-3 sm:px-4 font-bold rounded-none">Test / Profile</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right w-24 sm:w-28 font-bold rounded-none">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {bundlePkgs.map((pkg, bIdx) => {
                    const groups = getProfileGroups(pkg, catalogTestsByCode);
                    const testCount = getProfileTestCount(pkg, catalogTestsByCode);
                    const pkgPrice = pkg.pricing?.b2c || 0;

                    return (
                      <tr key={pkg.id || bIdx} className="border-b border-line package-row break-inside-auto">
                        <td colSpan={2} className="p-1 sm:p-2.5">
                          <div className="border border-line rounded-none overflow-hidden print:overflow-visible bg-white shadow-none">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 bg-emerald-bg/70 px-3 sm:px-4 py-2 sm:py-3 border-b border-line/60 rounded-none">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-xs sm:text-base text-navy">
                                  {cleanProfileName(pkg.name)} {testCount > 0 ? `(${testCount})` : ''}
                                </span>
                                <span className="text-[11px] sm:text-xs text-ink-soft font-medium">
                                  (Tests included)
                                </span>
                              </div>
                              <span className="font-bold text-xs sm:text-base text-emerald font-mono">
                                {formatRupees(pkgPrice)}
                              </span>
                            </div>

                            <div className="p-2.5 sm:p-4 bg-white space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs">
                              {groups.map((g, gIdx) => {
                                const paramList =
                                  g.parameters && g.parameters.length > 0
                                    ? g.parameters
                                    : (g.codes || []).map((c) => catalogTestsByCode[c]?.name || c);

                                const isSingleSame =
                                  paramList.length === 1 &&
                                  paramList[0]?.trim().toLowerCase() === g.label?.trim().toLowerCase();
                                const showParams = paramList.length > 0 && !isSingleSame;

                                return (
                                  <div key={gIdx} className="pl-2.5 sm:pl-3 border-l-2 border-[#60A5FA] break-inside-avoid">
                                    <span className="font-bold text-navy block text-[11px] sm:text-xs">
                                      {g.label}
                                    </span>
                                    {showParams && (
                                      <p className="text-ink-soft text-[10.5px] sm:text-[11.5px] mt-0.5 leading-relaxed">
                                        {paramList.join(' · ')}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {items.map((t, idx) => (
                    <tr key={t.code || idx} className="break-inside-avoid">
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="font-medium text-ink">{t.name}</div>
                        {t.sample && (
                          <div className="text-[10.5px] sm:text-[11px] text-ink-soft">{t.sample}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-navy">
                        {formatRupees(t.b2c || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="hidden print:table-footer-group">
                  <tr className="print:table-row print:h-[12mm]">
                    <td colSpan={2} className="p-0 border-0 bg-transparent print:h-[12mm]">
                      <div className="print:h-[12mm] w-full" />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-paper rounded-none p-3.5 sm:p-5 border border-line/60 flex flex-col gap-2 max-w-xs ml-auto text-xs sm:text-sm print:border-line break-inside-avoid">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Total</span>
                <b className={`text-sm sm:text-base text-navy font-bold ${discountedPrice && discountedPrice !== totalB2C ? 'line-through text-ink-faint font-normal' : ''}`}>
                  {formatRupees(totalB2C)}
                </b>
              </div>
              {discountedPrice != null && discountedPrice > 0 && discountedPrice !== totalB2C && (
                <div className="flex items-center justify-between pt-2 border-t border-line/50 text-emerald">
                  <span className="font-medium">Discounted Price</span>
                  <b className="text-base sm:text-lg font-extrabold">{formatRupees(discountedPrice)}</b>
                </div>
              )}
            </div>

            {fastingItems.length > 0 && (
              <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-none bg-amber/10 border border-amber/30 text-ink text-xs flex items-start gap-2.5 sm:gap-3 break-inside-avoid">
                <span className="text-base leading-none">⏱</span>
                <div>
                  <strong className="text-amber-dark font-bold block mb-0.5">Fasting Requirements:</strong>
                  <span>{fastingItems.map((t) => `${t.name}${t.fasting ? ` (${t.fasting})` : ' (8–10 Hours Fasting Required)'}`).join('; ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-6 sm:mt-8 pt-4 border-t border-line/60 text-[10.5px] sm:text-[11px] text-ink-soft leading-relaxed flex flex-col gap-1 break-inside-avoid">
          <p>
            <span className="font-bold text-navy">ℹ</span> Rates in INR (₹). Indicative rate card, not a medical prescription — please confirm fasting and sample requirements at the time of collection.
          </p>
          {branding && (branding.name || branding.phone || branding.address) && (
            <p className="font-medium text-ink pt-1">
              {[branding.name, branding.phone, branding.address].filter(Boolean).join(' · ')}
            </p>
          )}
        </footer>
      </div>

      <div className="print:hidden fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-[7px] shadow-2xl flex items-center justify-center flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2.5 z-50 text-xs sm:text-sm max-w-[calc(100vw-1rem)]">
        <span className="hidden md:inline text-white/70 mr-1">Customer copy — test name &amp; price only</span>
        <button
          type="button"
          onClick={() => setBrandingOpen(true)}
          className="px-2 sm:px-3 py-1.5 rounded-[7px] bg-white/10 hover:bg-white/20 text-white font-medium shrink-0 transition-all cursor-pointer"
        >
          🏷 Branding
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="px-2 sm:px-3 py-1.5 rounded-[7px] bg-white/10 hover:bg-white/20 text-white font-medium shrink-0 transition-all cursor-pointer"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-[7px] bg-amber hover:bg-amber-dark text-navy font-bold shrink-0 shadow transition-all cursor-pointer"
        >
          🖨 Print
        </button>
      </div>

      {brandingOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[5px] border border-line p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold text-navy">Your branding</h3>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Shown on this printed profile instead of AVMLabs — saved on this device so it's ready every time you print one for a customer.
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[5px] border border-dashed border-line flex items-center justify-center overflow-hidden bg-gray-100 text-[10px] text-ink-soft">
                    {brandingForm.logo ? (
                      <img src={brandingForm.logo} alt="Preview" className="w-full h-full object-contain rounded-[5px]" />
                    ) : (
                      'No logo'
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center px-3 py-1.5 rounded-[5px] bg-gray-100 hover:bg-gray-200 border border-line text-xs font-medium text-ink cursor-pointer transition-colors shadow-xs">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="sr-only"
                        />
                      </label>
                      <span className="text-xs text-ink-faint">
                        {brandingForm.logo ? 'Image selected' : 'No file chosen'}
                      </span>
                    </div>
                    {brandingForm.logo && (
                      <button
                        type="button"
                        onClick={() => setBrandingForm((prev) => ({ ...prev, logo: null }))}
                        className="text-xs text-rose-600 underline text-left cursor-pointer"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Clinic / Business Name</label>
                <input
                  type="text"
                  value={brandingForm.name || ''}
                  onChange={(e) => setBrandingForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sunrise Diagnostics"
                  className="w-full px-3 py-2 border border-line rounded-[5px] text-sm focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Phone Number</label>
                <input
                  type="text"
                  value={brandingForm.phone || ''}
                  onChange={(e) => setBrandingForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 border border-line rounded-[5px] text-sm focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Address</label>
                <textarea
                  rows={2}
                  value={brandingForm.address || ''}
                  onChange={(e) => setBrandingForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 12 MG Road, Bengaluru"
                  className="w-full px-3 py-2 border border-line rounded-[5px] text-sm focus:outline-none focus:border-navy"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-line text-xs">
              <button
                type="button"
                onClick={handleRemoveBranding}
                className="text-rose-600 hover:underline font-medium cursor-pointer"
              >
                Remove branding
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBrandingOpen(false)}
                  className="px-3 py-1.5 rounded-[5px] border border-line hover:bg-gray-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBranding}
                  className="px-4 py-1.5 rounded-[5px] bg-navy hover:bg-navy-2 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save branding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
