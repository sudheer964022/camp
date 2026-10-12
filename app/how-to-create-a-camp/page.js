'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import TestDetailDrawer from '../../components/TestDetailDrawer';
import catalogData from '../../lib/catalog.json';
import {
  packageOwning,
  sanitizeStoredPackages
} from '../../lib/profileGroups';

const CHECKLIST_KEY = 'avm_camp_checklist';

const INITIAL_CHECKLIST = {
  // Before the camp (5)
  'b1': false, // Joined AVMLabs as a partner
  'b2': false, // Client code received
  'b3': false, // Venue, date and time fixed
  'b4': false, // Tests / profiles and camp discount decided
  'b5': false, // Camp registered with the AVMLabs camp team

  // Patient registration (5)
  'r1': false, // Camp QR code received from AVMLabs
  'r2': false, // QR shared on WhatsApp and posters
  'r3': false, // Fasting instructions sent to patients
  'r4': false, // Reminder sent one day before
  'r5': false, // QR standee ready for walk-ins

  // Camp day (6)
  'd1': false, // Venue set up an hour before start
  'd2': false, // Phlebotomist and kits arrived
  'd3': false, // Each patient matched to QR registration
  'd4': false, // Entry completed and every tube barcoded
  'd5': false, // Tube count reconciled with registrations
  'd6': false, // Samples dispatched to LPL in cool boxes

  // After the camp (4)
  'a1': false, // Reports shared with patients
  'a2': false, // Abnormal results flagged for follow-up
  'a3': false, // Camp summary shared with partner
  'a4': false, // Feedback collected
};

const CHECKLIST_GROUPS = [
  {
    id: 'before',
    title: 'Before the camp',
    items: [
      { id: 'b1', text: 'Joined AVMLabs as a partner' },
      { id: 'b2', text: 'Client code received' },
      { id: 'b3', text: 'Venue, date and time fixed' },
      { id: 'b4', text: 'Tests / profiles and camp discount decided' },
      { id: 'b5', text: 'Camp registered with the AVMLabs camp team' }
    ]
  },
  {
    id: 'registration',
    title: 'Patient registration',
    items: [
      { id: 'r1', text: 'Camp QR code received from AVMLabs' },
      { id: 'r2', text: 'QR shared on WhatsApp and posters' },
      { id: 'r3', text: 'Fasting instructions sent to patients' },
      { id: 'r4', text: 'Reminder sent one day before' },
      { id: 'r5', text: 'QR standee ready for walk-ins' }
    ]
  },
  {
    id: 'day',
    title: 'Camp day',
    items: [
      { id: 'd1', text: 'Venue set up an hour before start' },
      { id: 'd2', text: 'Phlebotomist and kits arrived' },
      { id: 'd3', text: 'Each patient matched to QR registration' },
      { id: 'd4', text: 'Entry completed and every tube barcoded' },
      { id: 'd5', text: 'Tube count reconciled with registrations' },
      { id: 'd6', text: 'Samples dispatched to LPL in cool boxes' }
    ]
  },
  {
    id: 'after',
    title: 'After the camp',
    items: [
      { id: 'a1', text: 'Reports shared with patients' },
      { id: 'a2', text: 'Abnormal results flagged for follow-up' },
      { id: 'a3', text: 'Camp summary shared with partner' },
      { id: 'a4', text: 'Feedback collected' }
    ]
  }
];

export default function HowToCreateACamp() {
  const [cart, setCart] = useState(new Map());
  const [cartPackages, setCartPackages] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [customerView, setCustomerView] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);

  const packageById = useMemo(() => {
    return Object.fromEntries((catalogData.packages || []).map((p) => [p.id, p]));
  }, []);

  const catalogTestsByCode = useMemo(() => {
    return Object.fromEntries((catalogData.tests || []).map((t) => [t.code, t]));
  }, []);

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
        } else if (parsed && typeof parsed === 'object') {
          const rawPackages = parsed.packages || [];
          const sanitizedPkgs = sanitizeStoredPackages(rawPackages, catalogData.packages);

          const map = new Map();
          (parsed.codes || []).forEach((code) => {
            const test = catalogData.tests.find((t) => t.code === code);
            const isOwned = packageOwning(code, sanitizedPkgs, packageById, catalogTestsByCode);
            if (test && !isOwned) map.set(code, test);
          });

          setCart(map);
          setCartPackages(sanitizedPkgs);
        }
      }
    } catch (e) {
      console.error('Failed to restore cart:', e);
    }
  }, [packageById, catalogTestsByCode]);

  const saveState = (nextCart, nextPackages) => {
    setCart(nextCart);
    setCartPackages(nextPackages);
    try {
      localStorage.setItem('avm_profile', JSON.stringify({
        codes: Array.from(nextCart.keys()),
        packages: Array.from(nextPackages)
      }));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  };

  const handleRemoveItem = (code) => {
    const next = new Map(cart);
    next.delete(code);
    saveState(next, cartPackages);
  };

  const handleRemovePackage = (pkgId) => {
    const nextPkgs = new Set(cartPackages);
    nextPkgs.delete(pkgId);
    saveState(cart, nextPkgs);
  };

  const handleClearCart = () => {
    saveState(new Map(), new Set());
  };

  const cartItems = Array.from(cart.values());
  const bundlePkgs = Array.from(cartPackages).map((id) => packageById[id]).filter(Boolean);
  const totalCartCount = cart.size + cartPackages.size;

  const steps = [
    {
      num: '01',
      color: 'navy',
      title: 'Join as an AVMLabs partner',
      tags: [{ label: 'Partner', type: 'partner' }, { label: 'AVMLabs', type: 'avm' }],
      desc: 'Camps are run by registered AVMLabs partners. Complete partner onboarding with the AVMLabs team before planning your first camp.',
      bullets: [
        'Contact the AVMLabs partner team',
        'Share your organisation and contact details',
        'Complete the partner agreement',
        'Get access to the LPL camp rate list'
      ]
    },
    {
      num: '02',
      color: 'red',
      title: 'Get your client code',
      tags: [{ label: 'AVMLabs', type: 'avm' }],
      desc: 'Once onboarded, AVMLabs issues your unique client code. It links every camp, patient and invoice to your account.',
      bullets: [
        'Client code shared by AVMLabs after onboarding',
        'Quote it on every camp registration',
        'One code is used for all your camps',
        'Keep it handy for billing and report queries'
      ]
    },
    {
      num: '03',
      color: 'navy',
      title: 'Plan the camp & choose tests',
      tags: [{ label: 'Partner', type: 'partner' }],
      desc: 'Fix the venue, date and target group, then pick one to three simple profiles or tests from the camp rate list.',
      bullets: [
        'Covered, well-lit venue with tables and power',
        'Date, start time and expected participants',
        'Profiles / tests from the LPL camp rate list',
        "Discount on MRP you'll offer patients"
      ],
      linkText: 'Open the camp rate list →',
      linkHref: '/#ratelist'
    },
    {
      num: '04',
      color: 'red',
      title: 'Register the camp with the AVMLabs camp team',
      tags: [{ label: 'Partner', type: 'partner' }, { label: 'AVMLabs', type: 'avm' }],
      desc: 'Share the camp details with the AVMLabs camp team. They confirm the date and schedule phlebotomists and kits.',
      bullets: [
        'Client code, camp name and contact person',
        'Venue address with pincode',
        'Date, time and expected participants',
        'Selected tests / profiles and camp discount on MRP'
      ],
      linkText: 'Register with the AVMLabs camp team →',
      linkHref: 'https://wa.me/918113000571?text=Hello%20AVMLabs,%20I%20would%20like%20to%20register%20a%20Health%20Camp'
    },
    {
      num: '05',
      color: 'navy',
      title: 'Receive the camp QR code & share it with patients',
      tags: [{ label: 'AVMLabs', type: 'avm' }, { label: 'Partner', type: 'partner' }],
      desc: 'After registration, AVMLabs sends a QR code for your camp. Patients scan it and enter their own demographic details before camp day.',
      bullets: [
        'Share the QR on WhatsApp, posters and standees',
        'Patients enter name, age, gender and phone',
        'Remind patients about fasting the evening before',
        'Display the QR at the camp for walk-ins'
      ]
    },
    {
      num: '06',
      color: 'red',
      title: 'Camp day: sample collection',
      tags: [{ label: 'AVMLabs', type: 'avm' }, { label: 'Partner', type: 'partner' }],
      desc: "Registered patients visit the camp location to give their sample. The phlebotomist completes the entry against the patient's QR registration and barcodes every tube.",
      bullets: [
        'Patients arrive at the camp location',
        "Phlebotomist finds the patient's registration",
        'Sample collected and entry completed with barcode',
        'Samples packed in cool boxes for dispatch to LPL'
      ]
    },
    {
      num: '07',
      color: 'navy',
      title: 'Reports & follow-up',
      tags: [{ label: 'AVMLabs', type: 'avm' }, { label: 'Partner', type: 'partner' }],
      desc: 'Samples are processed at the LPL and reports are shared digitally to the phone number each patient registered with.',
      bullets: [
        'Digital reports to registered phone numbers',
        'Abnormal results flagged for doctor consultation',
        'Camp summary shared with the partner',
        'Feedback collected and next camp planned'
      ]
    }
  ];

  // Checklist State
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY);
      if (saved) {
        setChecklist({ ...INITIAL_CHECKLIST, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load checklist', e);
    }
  }, []);

  const toggleChecklistItem = (id) => {
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save checklist', e);
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setChecklist(INITIAL_CHECKLIST);
    try {
      localStorage.removeItem(CHECKLIST_KEY);
    } catch (e) {
      console.error('Failed to clear checklist', e);
    }
  };

  const totalDone = useMemo(() => {
    return Object.values(checklist).filter(Boolean).length;
  }, [checklist]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Who can organise a camp?',
      a: "Any organisation that has joined AVMLabs as a partner and received a client code. If you don't have a client code yet, contact the AVMLabs partner team first."
    },
    {
      q: 'What is the camp rate?',
      a: 'The camp rate is the fixed rate for each test or profile when it is done at a registered camp, as listed on the camp rate list. The MRP is shown alongside for reference.'
    },
    {
      q: 'How do patients register?',
      a: 'After you register the camp, AVMLabs sends a QR code. Patients scan it and enter their demographic details. At the camp, the phlebotomist completes the entry against that registration and barcodes the sample.'
    },
    {
      q: 'Do patients need to fast?',
      a: 'Only for tests marked “Fasting”, such as fasting blood sugar. Ask patients to fast overnight and hold the camp in the early morning.'
    },
    {
      q: 'Where are samples processed?',
      a: 'All tests and profiles on the camp rate list are processed at the AVMLabs Local Processing Laboratory (LPL).'
    },
    {
      q: 'How do patients get their reports?',
      a: 'Reports are shared digitally to the phone number the patient entered while registering through the QR code.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#141B38] flex flex-col">
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <div className="flex-1 max-w-[1180px] w-full mx-auto px-4 sm:px-7 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2.5">
            <span className="w-5 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
            CAMP GUIDE
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#141B38] tracking-tight leading-tight mb-4">
            How to create a <span className="text-[#E02029]">health camp</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mb-6 sm:mb-8 font-normal">
            Join AVMLabs as a partner, get your client code and register your camp with the AVMLabs camp team. You&apos;ll receive a QR code for patients to register themselves, and our phlebotomist does the sample entry and barcoding at the camp.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#steps"
              className="inline-flex items-center justify-center bg-[#241A7A] hover:bg-[#1B154F] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm hover:shadow transition-all"
            >
              See the 7 steps
            </a>
            <Link
              href="/#ratelist"
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-[#141B38] font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xs hover:shadow-xs transition-all"
            >
              View camp rate list
            </Link>
          </div>
        </section>

        {/* 4 OVERVIEW CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14 sm:mb-20">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#241A7A] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#141B38] mb-1.5">Partners only</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Camps are run by AVMLabs partners. Join once and use your client code for every camp.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0F0] text-[#E02029] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#141B38] mb-1.5">QR self–registration</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Patients scan the camp QR code and enter their own details before they arrive.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#241A7A] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31L4.62 17.5A2 2 0 0 0 6.34 21h11.32a2 2 0 0 0 1.72-3.5L14 9.31V2" />
                <path d="M8.5 2h7" />
                <path d="M7 16h10" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#141B38] mb-1.5">What AVMLabs provides</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Camp QR code, phlebotomists, collection kits, barcodes, sample transport, LPL processing and reports.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0F0] text-[#E02029] flex items-center justify-center mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#141B38] mb-1.5">What the partner provides</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The camp venue, tables and chairs, power, drinking water and getting patients to the camp.
            </p>
          </div>
        </section>

        {/* SEVEN STEPS SECTION */}
        <section id="steps" className="mb-14 sm:mb-20 scroll-mt-20">
          <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
            <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
            STEP BY STEP
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#141B38] tracking-tight mb-8 sm:mb-10">
            Seven steps to a successful camp
          </h2>

          <div className="relative space-y-5 sm:space-y-6 before:content-[''] before:absolute before:top-6 before:bottom-6 before:left-5 sm:before:left-6 before:w-[2px] before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
            {steps.map((step) => {
              const isRed = step.color === 'red';
              return (
                <div key={step.num} className="relative flex items-start gap-4 sm:gap-6">
                  <div
                    className={`relative z-10 flex-none w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm ${
                      isRed ? 'bg-[#E02029]' : 'bg-[#241A7A]'
                    }`}
                  >
                    {step.num}
                  </div>

                  <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#141B38]">{step.title}</h3>
                      <div className="flex items-center gap-1.5 flex-none">
                        {step.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              t.type === 'partner'
                                ? 'bg-[#FDF0F0] text-[#E02029]'
                                : 'bg-[#EEF0FD] text-[#241A7A]'
                            }`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                      {step.desc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                      {step.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                          <svg className="w-4 h-4 text-emerald flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    {step.linkText && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {step.linkHref.startsWith('http') ? (
                          <a
                            href={step.linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-bold text-[#241A7A] hover:text-[#E02029] transition-colors inline-flex items-center gap-1"
                          >
                            {step.linkText}
                          </a>
                        ) : step.linkHref.startsWith('#') ? (
                          <a
                            href={step.linkHref}
                            className="text-xs sm:text-sm font-bold text-[#241A7A] hover:text-[#E02029] transition-colors inline-flex items-center gap-1"
                          >
                            {step.linkText}
                          </a>
                        ) : (
                          <Link
                            href={step.linkHref}
                            className="text-xs sm:text-sm font-bold text-[#241A7A] hover:text-[#E02029] transition-colors inline-flex items-center gap-1"
                          >
                            {step.linkText}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PLANNING TIMELINE SECTION */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
            <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
            PLANNING TIMELINE
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#141B38] tracking-tight mb-6 sm:mb-8">
            What happens when
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#241A7A] bg-white flex items-center justify-center font-bold text-xs sm:text-sm text-[#241A7A] shadow-xs mb-3">
                  Once
                </div>
                <h4 className="text-sm font-bold text-[#141B38] mb-1">Become a partner</h4>
                <p className="text-xs text-slate-500 leading-snug">Partner onboarding and client code</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#241A7A] bg-white flex items-center justify-center font-bold text-xs sm:text-sm text-[#241A7A] shadow-xs mb-3">
                  T-14
                </div>
                <h4 className="text-sm font-bold text-[#141B38] mb-1">Plan &amp; register</h4>
                <p className="text-xs text-slate-500 leading-snug">Venue, tests and camp registration</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#241A7A] bg-white flex items-center justify-center font-bold text-xs sm:text-sm text-[#241A7A] shadow-xs mb-3">
                  T-7
                </div>
                <h4 className="text-sm font-bold text-[#141B38] mb-1">Share QR code</h4>
                <p className="text-xs text-slate-500 leading-snug">Patients self-register via QR</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#E02029] text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-md mb-3 ring-4 ring-[#E02029]/20">
                  DAY
                </div>
                <h4 className="text-sm font-bold text-[#141B38] mb-1">Camp day</h4>
                <p className="text-xs text-slate-500 leading-snug">Sample, entry, barcode, dispatch</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#241A7A] bg-white flex items-center justify-center font-bold text-xs sm:text-sm text-[#241A7A] shadow-xs mb-3">
                  T+2
                </div>
                <h4 className="text-sm font-bold text-[#141B38] mb-1">Reports</h4>
                <p className="text-xs text-slate-500 leading-snug">Digital reports and follow-up</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: PATIENT JOURNEY */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
            <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
            PATIENT JOURNEY
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#141B38] tracking-tight mb-8 sm:mb-10">
            From QR code to report
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative items-stretch">
            {/* Step 1: Scan QR */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] text-[#241A7A] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" strokeWidth="3" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Scan QR</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Patient scans the camp QR code</p>
              <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#E02029] font-bold text-base z-10 select-none">
                ›
              </span>
            </div>

            {/* Step 2: Enter details */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FDF0F0] text-[#E02029] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Enter details</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Name, age, gender and phone</p>
              <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#E02029] font-bold text-base z-10 select-none">
                ›
              </span>
            </div>

            {/* Step 3: Visit camp */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] text-[#241A7A] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Visit camp</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Patient comes to the camp location</p>
              <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#E02029] font-bold text-base z-10 select-none">
                ›
              </span>
            </div>

            {/* Step 4: Give sample */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FDF0F0] text-[#E02029] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Give sample</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Collected by the phlebotomist</p>
              <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#E02029] font-bold text-base z-10 select-none">
                ›
              </span>
            </div>

            {/* Step 5: Entry & barcode */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] text-[#241A7A] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M18 5v14M21 5v14" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Entry &amp; barcode</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Phlebo completes entry and barcodes tubes</p>
              <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#E02029] font-bold text-base z-10 select-none">
                ›
              </span>
            </div>

            {/* Step 6: Report */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FDF0F0] text-[#E02029] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#141B38] mb-1">Report</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Processed at LPL, shared digitally</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: CAMP CHECKLIST */}
        <section className="mb-14 sm:mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-1">
                <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
                CAMP CHECKLIST
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#141B38] tracking-tight">
                Tick off as you go
              </h2>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={resetChecklist}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-[#241A7A] hover:text-[#E02029] text-xs font-bold px-4 py-2 rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                Reset checklist
              </button>
              <div className="text-xs sm:text-sm font-bold text-[#141B38]">
                {totalDone} of 20 done
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 font-normal">
            Your ticks are saved in this browser, so you can come back to them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CHECKLIST_GROUPS.map((grp) => {
              const grpDone = grp.items.filter(item => checklist[item.id]).length;
              return (
                <div
                  key={grp.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-sm sm:text-base text-[#141B38]">{grp.title}</h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {grpDone}/{grp.items.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {grp.items.map((item) => {
                        const isChecked = !!checklist[item.id];
                        return (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 cursor-pointer select-none group"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#E02029] focus:ring-[#E02029] focus:ring-offset-0 cursor-pointer accent-[#E02029]"
                            />
                            <span
                              className={`text-xs sm:text-sm leading-snug transition-colors ${
                                isChecked
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-700 group-hover:text-[#141B38]'
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>



        {/* SECTION 4: FAQ */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
            <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
            FAQ
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#141B38] tracking-tight mb-8 sm:mb-10">
            Common questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#141B38] hover:text-[#241A7A] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform flex-none ${
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
      </div>

      <Footer onOpenCart={() => setCartOpen(true)} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        bundlePkgs={bundlePkgs}
        onRemoveItem={handleRemoveItem}
        onRemovePackage={handleRemovePackage}
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
          if (cart.has(code)) {
            handleRemoveItem(code);
          } else {
            const t = catalogData.tests.find((item) => item.code === code);
            if (t) {
              const next = new Map(cart);
              next.set(code, t);
              saveState(next, cartPackages);
            }
          }
        }}
        customerView={customerView}
      />
    </main>
  );
}
