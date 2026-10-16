'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Who can organise a health check-up camp?',
    a: "Any organisation, clinic, doctor, corporate, or NGO that has partnered with AVMLabs. If you don't have a partner client code yet, contact the AVMLabs partner team to get started."
  },
  {
    q: 'What is the camp rate?',
    a: 'The camp rate is the special discounted rate for each test or profile when conducted during a registered health camp. The catalogue rate is shown alongside for reference.'
  },
  {
    q: 'How do patients register for a camp?',
    a: 'After you register your camp with AVMLabs, a unique camp QR code is generated. Patients simply scan it on their smartphones to enter their demographic details. At the camp, the phlebotomist completes the entry and barcodes the sample.'
  },
  {
    q: 'Do patients need to fast before their tests?',
    a: 'Fasting is required only for specific tests marked “Fasting” (such as Fasting Blood Sugar or Lipid Profile). We advise holding the camp in the morning and notifying participants to fast overnight for 10-12 hours.'
  },
  {
    q: 'Where are camp samples processed?',
    a: 'All tests and profiles listed on the camp rate card are processed at the nearest AVMLabs Local Processing Laboratory (LPL) adhering to strict quality controls.'
  },
  {
    q: 'How and when do patients receive their reports?',
    a: 'Digital reports are delivered directly via SMS/WhatsApp to the mobile number provided by the patient during QR registration, typically within 24–48 hours.'
  }
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="max-w-[1180px] mx-auto px-4 sm:px-7 py-10 sm:py-14 scroll-mt-24 w-full">
      <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
        <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
        FREQUENTLY ASKED QUESTIONS
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#141B38] tracking-tight mb-6 sm:mb-8">
        Frequently asked questions
      </h2>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full text-left px-5 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#141B38] hover:text-[#241A7A] transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span
                  className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform flex-none ${
                    isOpen ? 'rotate-180 bg-[#EEF0FD] text-[#241A7A]' : ''
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
