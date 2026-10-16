'use client';

import { useState, useMemo } from 'react';

export default function CampRegistrationSection() {
  // Today + 14 days default
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    campName: '',
    campType: 'Corporate',
    partnerOrg: '',
    contactPerson: '',
    phone: '',
    pincode: '',
    venueAddress: '',
    campDate: defaultDate,
    startTime: '07:30',
    expectedParticipants: '100',
    notes: ''
  });

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate days to prepare
  const daysToPrepare = useMemo(() => {
    if (!formData.campDate) return null;
    const target = new Date(formData.campDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [formData.campDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      campName: '',
      campType: 'Corporate',
      partnerOrg: '',
      contactPerson: '',
      phone: '',
      pincode: '',
      venueAddress: '',
      campDate: defaultDate,
      startTime: '07:30',
      expectedParticipants: '100',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSummaryModalOpen(true);
  };

  // Format summary text for WhatsApp and Clipboard
  const generateSummaryText = () => {
    return [
      `*AVMLabs Health Camp Registration Summary*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `*Camp Name:* ${formData.campName || 'Not provided'}`,
      `*Camp Type:* ${formData.campType}`,
      `*Host Organisation:* ${formData.partnerOrg || 'Not provided'}`,
      `*Contact Person:* ${formData.contactPerson || 'Not provided'}`,
      `*Phone:* ${formData.phone || 'Not provided'}`,
      `*Date & Time:* ${formData.campDate} at ${formData.startTime}`,
      `*Expected Participants:* ${formData.expectedParticipants}`,
      `*Venue Address:* ${formData.venueAddress || 'Not provided'}`,
      `*Pincode:* ${formData.pincode || 'Not provided'}`,
      formData.notes ? `*Notes:* ${formData.notes}` : ''
    ].filter(Boolean).join('\n');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://wa.me/919600661732?text=${encodeURIComponent(generateSummaryText())}`;

  return (
    <section id="register-camp" className="max-w-[1180px] mx-auto px-4 sm:px-7 py-10 sm:py-16 scroll-mt-24 w-full">
      <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
        <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
        CAMP REGISTRATION
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#141B38] tracking-tight mb-3">
        Register your health camp
      </h2>
      <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl mb-8">
        Enter your camp details below to schedule phlebotomists, collection kits, and generate your dedicated QR code for patient registration.
      </p>

      {/* Main Form Card */}
      <div className="bg-white rounded-[8px] sm:rounded-2xl border border-slate-200/90 p-5 sm:p-8 md:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          {/* Row 1: Camp name & Camp type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Camp name <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Valley Society Health Camp"
                value={formData.campName}
                onChange={(e) => handleInputChange('campName', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Camp type
              </label>
              <div className="relative">
                <select
                  value={formData.campType}
                  onChange={(e) => handleInputChange('campType', e.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all cursor-pointer appearance-none"
                >
                  <option value="Corporate">Corporate</option>
                  <option value="Residential society">Residential society</option>
                  <option value="School / college">School / college</option>
                  <option value="NGO / community">NGO / community</option>
                  <option value="Clinic / referral partner">Clinic / referral partner</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Partner / host organisation & Contact person */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Partner / host organisation <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Company / society / clinic"
                value={formData.partnerOrg}
                onChange={(e) => handleInputChange('partnerOrg', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Contact person
              </label>
              <input
                type="text"
                placeholder="Full name"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Phone & Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Phone <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Pincode <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>
          </div>

          {/* Row 4: Venue address */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
              Venue address <span className="text-[#E02029]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Building, street, area, city"
              value={formData.venueAddress}
              onChange={(e) => handleInputChange('venueAddress', e.target.value)}
              className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
            />
          </div>

          {/* Row 5: Camp date & Start time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Camp date <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.campDate}
                onChange={(e) => handleInputChange('campDate', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all cursor-pointer"
              />
              {daysToPrepare !== null && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {daysToPrepare} days to prepare.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Start time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Row 6: Expected participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
                Expected participants <span className="text-[#E02029]">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="100"
                value={formData.expectedParticipants}
                onChange={(e) => handleInputChange('expectedParticipants', e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all"
              />
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#141B38] mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Anything the camp team should know — parking, floor, language, special groups..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full rounded-[8px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#E02029] hover:bg-[#c91821] text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 rounded-[8px] sm:rounded-full shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Register Camp
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-[#141B38] font-bold text-xs sm:text-sm px-6 py-3 rounded-[8px] sm:rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              Clear form
            </button>
          </div>

        </form>
      </div>

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="bg-white rounded-[8px] sm:rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSummaryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-3.5 h-[2.5px] bg-[#E02029] rounded-full inline-block"></span>
              REGISTRATION SUMMARY
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#141B38] mb-4">
              Camp Registration Summary
            </h3>

            <div className="bg-[#F8F9FA] rounded-[8px] p-4 border border-slate-200/80 space-y-2 text-xs sm:text-sm text-slate-700 font-medium mb-6">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Camp Name:</span>
                <span className="font-bold text-[#141B38]">{formData.campName || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Camp Type:</span>
                <span className="font-bold text-[#141B38]">{formData.campType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Host Organisation:</span>
                <span className="font-bold text-[#141B38]">{formData.partnerOrg || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold">{formData.campDate} at {formData.startTime}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Contact Person:</span>
                <span>{formData.contactPerson || '—'} ({formData.phone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Expected Participants:</span>
                <span>{formData.expectedParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Venue Address:</span>
                <span className="text-right max-w-[200px] truncate">{formData.venueAddress || '—'} ({formData.pincode})</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#00BC7D] hover:bg-[#009e69] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-[8px] sm:rounded-full shadow-xs transition-all text-center cursor-pointer"
              >
                <span>Send to AVMLabs WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#141B38] font-bold text-xs sm:text-sm py-3 px-5 rounded-[8px] sm:rounded-full shadow-2xs transition-all cursor-pointer"
              >
                <span>{copied ? '✓ Copied' : 'Copy Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
