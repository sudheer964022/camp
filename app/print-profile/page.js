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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

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

  const loadHtml2Pdf = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Window not available'));
      if (window.html2pdf) return resolve(window.html2pdf);

      const existing = document.getElementById('html2pdf-script');
      if (existing) {
        if (window.html2pdf) return resolve(window.html2pdf);
        existing.addEventListener('load', () => resolve(window.html2pdf));
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = '/assets/js/html2pdf.bundle.min.js';
      script.onload = () => resolve(window.html2pdf);
      script.onerror = () => {
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        cdnScript.onload = () => resolve(window.html2pdf);
        cdnScript.onerror = reject;
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(script);
    });
  };

  const generatePdfBlob = async () => {
    const html2pdf = await loadHtml2Pdf();
    const element = document.getElementById('sheet');
    if (!element) throw new Error('Sheet element not found');

    const brandName = (branding?.name || 'AVMLabs').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeDate = dateStr ? dateStr.replace(/[^a-zA-Z0-9]/g, '_') : 'Profile';
    const filename = `${brandName}_Health_Profile_${safeDate}.pdf`;

    const opt = {
      margin: [6, 8, 8, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
    return { blob: pdfBlob, filename };
  };

  const handleDownloadPdf = async () => {
    if (isEmpty) {
      showFeedback('No tests in profile to generate PDF');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const { blob, filename } = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('PDF downloaded successfully!');
      setShareModalOpen(false);
    } catch (err) {
      console.error('PDF error:', err);
      showFeedback('Direct PDF export error, opening Print to Save as PDF...');
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdfFile = async () => {
    if (isEmpty) {
      showFeedback('No tests in profile to share');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const { blob, filename } = await generatePdfBlob();
      const file = new File([blob], filename, { type: 'application/pdf' });
      const brandTitle = branding?.name || 'AVMLabs';
      const effectiveTotal = discountedPrice != null && discountedPrice > 0 ? discountedPrice : totalB2C;

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${brandTitle} — Health Profile PDF`,
          text: `${brandTitle} Health Profile with ${items.length + bundlePkgs.length} items. Total: ₹${effectiveTotal}`,
          files: [file],
        });
        showFeedback('PDF shared successfully!');
        setShareModalOpen(false);
        return;
      }

      // If browser doesn't support sharing raw files via navigator.share, download PDF and open WhatsApp
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('PDF downloaded! Sharing summary on WhatsApp...');
      handleWhatsAppShare();
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.error('Share PDF error:', err);
        handleWhatsAppShare();
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    const brandTitle = branding?.name || 'AVMLabs';
    const effectiveTotal = discountedPrice != null && discountedPrice > 0 ? discountedPrice : totalB2C;

    let msg = `*${brandTitle.toUpperCase()} - HEALTH PROFILE*\n`;
    msg += `📅 Date: ${dateStr}\n\n`;

    if (bundlePkgs.length > 0) {
      msg += `*Included Packages:*\n`;
      bundlePkgs.forEach((p) => {
        msg += `• ${p.name} (₹${p.pricing?.b2c || 0})\n`;
      });
      msg += `\n`;
    }

    if (items.length > 0) {
      msg += `*Included Tests:*\n`;
      items.forEach((t) => {
        msg += `• ${t.name} (₹${t.b2c || 0})\n`;
      });
      msg += `\n`;
    }

    msg += `*Total Amount:* ₹${effectiveTotal}\n`;
    if (discountedPrice != null && discountedPrice > 0 && discountedPrice !== totalB2C) {
      msg += `_(Standard MRP: ₹${totalB2C})_\n`;
    }

    if (fastingItems.length > 0) {
      msg += `\n⚠️ *Fasting Required:* 8–10 hours overnight fasting recommended.\n`;
    }

    const shareUrl = getShareUrl();
    if (shareUrl) {
      msg += `\n📄 *View & Print Full Profile Online:* \n${shareUrl}\n`;
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    setShareModalOpen(false);
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback('Shareable link copied to clipboard!');
    } catch (err) {
      showFeedback('Link generated: ' + shareUrl);
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
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
                                  {cleanProfileName(pkg.name)}
                                </span>
                                <span className="text-[11px] sm:text-xs text-ink-soft font-medium">
                                  ({testCount} tests included)
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

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="print:hidden fixed top-5 left-1/2 -translate-x-1/2 bg-navy text-white px-4 py-2 rounded-[7px] shadow-2xl text-xs sm:text-sm font-semibold z-50 flex items-center gap-2 border border-white/20 animate-fade-in">
          <span>✨</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

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
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="px-2.5 sm:px-3 py-1.5 rounded-[7px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          title="Directly download PDF file"
        >
          {isGeneratingPdf ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>Saving PDF...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Download PDF</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-[7px] bg-white/15 hover:bg-white/25 text-white font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1"
          title="Share on WhatsApp, copy link, or send PDF"
        >
          <span>📤</span>
          <span>Share</span>
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

      {/* Share & Export Modal */}
      {shareModalOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[10px] border border-line p-5 sm:p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-navy flex items-center gap-2">
                  <span>📤</span>
                  <span>Share Health Profile</span>
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Export as PDF or send directly to customer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-ink-soft hover:text-navy text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {/* Option 1: Direct Download PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-between p-3 rounded-[8px] border border-line hover:border-emerald-600 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                    📄
                  </div>
                  <div>
                    <strong className="block text-navy font-semibold text-sm group-hover:text-emerald-700">
                      Download PDF File
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Save clean A4 PDF document to device
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </button>

              {/* Option 2: Share via WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-between p-3 rounded-[8px] border border-line hover:border-[#25D366] hover:bg-green-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center text-lg font-bold">
                    💬
                  </div>
                  <div>
                    <strong className="block text-navy font-semibold text-sm group-hover:text-green-700">
                      Share via WhatsApp
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Send quotation card with tests, prices &amp; direct link
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </button>

              {/* Option 3: Send PDF via Apps */}
              <button
                type="button"
                onClick={handleSharePdfFile}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-between p-3 rounded-[8px] border border-line hover:border-navy hover:bg-navy/5 transition-all text-left cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center text-lg font-bold">
                    📱
                  </div>
                  <div>
                    <strong className="block text-navy font-semibold text-sm">
                      Send PDF via Apps
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Native share sheet with PDF attached (Mobile)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-navy group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </button>

              {/* Option 4: Copy Shareable Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 rounded-[8px] border border-line hover:border-teal hover:bg-teal-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-lg font-bold">
                    🔗
                  </div>
                  <div>
                    <strong className="block text-navy font-semibold text-sm group-hover:text-teal-800">
                      Copy Profile Link
                    </strong>
                    <span className="text-ink-soft text-xs">
                      Copies URL that opens these tests on any browser
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-800 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-ink-soft">
                Tip: You can also choose <b>"Save as PDF"</b> in Print dialog.
              </span>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[5px] bg-gray-100 hover:bg-gray-200 font-medium text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
