'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { money } from '../lib/formatters';
import { margin, getCampRate, getCatalogueRate } from '../lib/calculations';
import { cleanProfileName, getProfileTestCount, getProfileGroups, coveringPackage, blockingPackage, getOverlappingPackages, packageOwning, isBiggerThan } from '../lib/profileGroups';

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BlockedIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="5.7" y1="5.7" x2="18.3" y2="18.3" />
    </svg>
  );
}

export default function RateListSection({
  catalog,
  cartSet,
  cartPackages = new Set(),
  onToggleTest,
  onTogglePackage,
  onOpenTestDetail,
  customerView
}) {
  const [view, setView] = useState('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('b2b-asc');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedProfiles, setExpandedProfiles] = useState(new Set());

  const [selectedTechs, setSelectedTechs] = useState(new Set());
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [selectedPriceBands, setSelectedPriceBands] = useState(new Set());

  const techColorMap = useMemo(() => {
    return Object.fromEntries((catalog.technologies || []).map(t => [t.label, t]));
  }, [catalog.technologies]);

  const lplPriceBands = useMemo(() => [
    { id: 'under-50', label: 'Under ₹50', max: 49 },
    { id: '50-100', label: '₹50 – ₹100', min: 50, max: 100 },
    { id: '100-250', label: '₹100 – ₹250', min: 101, max: 250 },
    { id: 'above-250', label: 'Above ₹250', min: 251 },
  ], []);

  const lplTests = useMemo(() => (catalog.tests || []).filter(t => t.processedAt === 'LPL'), [catalog.tests]);
  const lplPackages = useMemo(() => (catalog.packages || []).filter(p => !p.processedAt || p.processedAt === 'LPL'), [catalog.packages]);
  const lplTestsCount = lplTests.length;
  const lplPackagesCount = lplPackages.length;

  const activeFiltersCount = selectedTechs.size + selectedSamples.size + selectedPriceBands.size + (searchTerm ? 1 : 0);

  const toggleSetItem = (setter, item) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
    setCurrentPage(1);
  };

  const toggleProfileExpanded = (pkgId) => {
    setExpandedProfiles(prev => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  const packageById = useMemo(() => {
    return Object.fromEntries((catalog.packages || []).map(p => [p.id, p]));
  }, [catalog.packages]);

  const catalogTestsByCode = useMemo(() => {
    return Object.fromEntries((catalog.tests || []).map(t => [t.code, t]));
  }, [catalog.tests]);

  const getBlockingPackage = (pkg) => {
    return blockingPackage(pkg, cartPackages, packageById, catalogTestsByCode);
  };

  const getUpgradePackages = (pkg) => {
    if (blockingPackage(pkg, cartPackages, packageById, catalogTestsByCode)) return [];
    return getOverlappingPackages(pkg, cartPackages, packageById, catalogTestsByCode);
  };

  const clearAllFilters = () => {
    setSelectedTechs(new Set());
    setSelectedSamples(new Set());
    setSelectedPriceBands(new Set());
    setSearchTerm('');
    setSortMode('b2b-asc');
    setCurrentPage(1);
  };

  const filteredTests = useMemo(() => {
    return catalog.tests.filter(t => {
      if (t.processedAt !== 'LPL') return false;
      if (selectedTechs.size && !selectedTechs.has(t.tech)) return false;
      if (selectedSamples.size && !selectedSamples.has(t.sampleId)) return false;
      if (selectedPriceBands.size) {
        const matchesBand = Array.from(selectedPriceBands).some(bandId => {
          const band = lplPriceBands.find(b => b.id === bandId) || (catalog.priceBands || []).find(b => b.id === bandId);
          if (!band) return false;
          const testRate = getCampRate(t);
          if (band.min != null && testRate < band.min) return false;
          if (band.max != null && testRate > band.max) return false;
          return true;
        });
        if (!matchesBand) return false;
      }
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const haystack = [t.name, t.code, t.displayCode, t.category, t.tech, t.department, t.processedAt, ...(t.aliases || [])].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    }).sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      const aCamp = getCampRate(a);
      const bCamp = getCampRate(b);
      const aCat = getCatalogueRate(a);
      const bCat = getCatalogueRate(b);
      const aMargin = aCat - aCamp;
      const bMargin = bCat - bCamp;
      if (sortMode === 'name') return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
      if (sortMode === 'name-desc') return bName.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
      if (sortMode === 'b2b-asc') return (aCamp - bCamp) || (aCat - bCat) || aName.localeCompare(bName);
      if (sortMode === 'b2b-desc') return (bCamp - aCamp) || (bCat - aCat) || aName.localeCompare(bName);
      if (sortMode === 'b2c-asc') return (aCat - bCat) || (aCamp - bCamp) || aName.localeCompare(bName);
      if (sortMode === 'b2c-desc') return (bCat - aCat) || (bCamp - aCamp) || aName.localeCompare(bName);
      if (sortMode === 'margin-desc') return (bMargin - aMargin) || aName.localeCompare(bName);
      if (sortMode === 'margin-asc') return (aMargin - bMargin) || aName.localeCompare(bName);
      return (aCamp - bCamp) || aName.localeCompare(bName);
    });
  }, [catalog.tests, catalog.priceBands, selectedTechs, selectedSamples, selectedPriceBands, searchTerm, sortMode, lplPriceBands]);

  const filteredPackages = useMemo(() => {
    return catalog.packages.filter(p => {
      if (p.processedAt && p.processedAt !== 'LPL') return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const haystack = [cleanProfileName(p.name), p.name, p.code, p.category, p.description, p.contentsText].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    }).sort((a, b) => {
      const aCamp = getCampRate(a);
      const bCamp = getCampRate(b);
      const aCat = getCatalogueRate(a);
      const bCat = getCatalogueRate(b);
      const aMargin = aCat - aCamp;
      const bMargin = bCat - bCamp;
      const aName = cleanProfileName(a.name);
      const bName = cleanProfileName(b.name);
      if (sortMode === 'name') return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
      if (sortMode === 'name-desc') return bName.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
      if (sortMode === 'b2b-asc') return (aCamp - bCamp) || (aCat - bCat) || aName.localeCompare(bName);
      if (sortMode === 'b2b-desc') return (bCamp - aCamp) || (bCat - aCat) || aName.localeCompare(bName);
      if (sortMode === 'b2c-asc') return (aCat - bCat) || (aCamp - bCamp) || aName.localeCompare(bName);
      if (sortMode === 'b2c-desc') return (bCat - aCat) || (bCamp - aCamp) || aName.localeCompare(bName);
      if (sortMode === 'margin-desc') return (bMargin - aMargin) || aName.localeCompare(bName);
      if (sortMode === 'margin-asc') return (aMargin - bMargin) || aName.localeCompare(bName);
      return (aCamp - bCamp) || aName.localeCompare(bName);
    });
  }, [catalog.packages, searchTerm, sortMode]);

  const activeList = view === 'tests' ? filteredTests : filteredPackages;
  const totalItems = activeList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSortHeader = (columnKey) => {
    setCurrentPage(1);
    if (columnKey === 'test' || columnKey === 'profile') {
      setSortMode(prev => (prev === 'name' ? 'name-desc' : 'name'));
    } else if (columnKey === 'camp-rate') {
      setSortMode(prev => (prev === 'b2b-asc' ? 'b2b-desc' : 'b2b-asc'));
    } else if (columnKey === 'catalogue-rate') {
      setSortMode(prev => (prev === 'b2c-asc' ? 'b2c-desc' : 'b2c-asc'));
    } else if (columnKey === 'pcclm') {
      setSortMode(prev => (prev === 'margin-desc' ? 'margin-asc' : 'margin-desc'));
    }
  };

  const renderSortIndicator = (columnKey) => {
    let isActive = false;
    let isAsc = false;
    if (columnKey === 'test' || columnKey === 'profile') {
      isActive = sortMode === 'name' || sortMode === 'name-desc';
      isAsc = sortMode === 'name';
    } else if (columnKey === 'camp-rate') {
      isActive = sortMode === 'b2b-asc' || sortMode === 'b2b-desc';
      isAsc = sortMode === 'b2b-asc';
    } else if (columnKey === 'catalogue-rate') {
      isActive = sortMode === 'b2c-asc' || sortMode === 'b2c-desc';
      isAsc = sortMode === 'b2c-asc';
    } else if (columnKey === 'pcclm') {
      isActive = sortMode === 'margin-asc' || sortMode === 'margin-desc';
      isAsc = sortMode === 'margin-asc';
    }

    if (isActive) {
      return (
        <span className="inline-flex items-center ml-1 text-[#241A7A] font-black text-xs">
          {isAsc ? '▲' : '▼'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center ml-1 opacity-0 group-hover:opacity-40 transition-opacity text-[11px] text-slate-400">
        ↕
      </span>
    );
  };

  const handleExportTable = () => {
    try {
      const testsData = lplTests.map((item, idx) => {
        const camp = getCampRate(item);
        const cat = getCatalogueRate(item);
        return {
          'S.No': idx + 1,
          'Test Code': item.code,
          'Test Name': item.name,
          'Technology': item.tech || '—',
          'Sample': item.sample || '—',
          'Processed At': item.processedAt || 'LPL',
          'Camp Rate (₹)': camp,
          'Catalogue Rate (₹)': cat,
          'PCCLM Margin (₹)': cat - camp
        };
      });

      const profilesData = lplPackages.map((item, idx) => {
        const groups = getProfileGroups(item, catalogTestsByCode);
        const testsIncluded = groups.map(g => g.label + (g.parameters?.length ? `: ${g.parameters.join(', ')}` : '')).join('; ') || item.contentsText || '';
        const camp = getCampRate(item);
        const cat = getCatalogueRate(item);
        const testCount = getProfileTestCount(item, catalogTestsByCode);
        return {
          'S.No': idx + 1,
          'Profile Name': `${cleanProfileName(item.name)}${testCount > 0 ? ` (${testCount})` : ''}`,
          'Tests Included': testsIncluded,
          'Processed At': item.processedAt || 'LPL',
          'Camp Rate (₹)': camp,
          'Catalogue Rate (₹)': cat,
          'PCCLM Margin (₹)': cat - camp
        };
      });

      const wb = XLSX.utils.book_new();

      if (view === 'profiles') {
        const wsProfiles = XLSX.utils.json_to_sheet(profilesData);
        XLSX.utils.book_append_sheet(wb, wsProfiles, 'Profiles');
        const wsTests = XLSX.utils.json_to_sheet(testsData);
        XLSX.utils.book_append_sheet(wb, wsTests, 'Tests');
      } else {
        const wsTests = XLSX.utils.json_to_sheet(testsData);
        XLSX.utils.book_append_sheet(wb, wsTests, 'Tests');
        const wsProfiles = XLSX.utils.json_to_sheet(profilesData);
        XLSX.utils.book_append_sheet(wb, wsProfiles, 'Profiles');
      }

      XLSX.writeFile(wb, `AVMLabs_Camp_Rate_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error('Error generating Excel file:', e);
    }
  };

  return (
    <section className="ratelist ratelist--page py-8 md:py-16 bg-[#F8F9FA] overflow-x-clip scroll-mt-16 sm:scroll-mt-20" id="ratelist">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-7">

        {/* Section Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[#E02029] font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-4 h-[3px] bg-[#E02029] rounded-full inline-block"></span>
              CAMP RATE LIST
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#141B38] tracking-tight">
              Camp rates for tests &amp; profiles
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed mt-2">
              Camp Rate is the special discounted rate, Catalogue Rate is the standard rate. PCCLM Margin = Catalogue Rate – Camp Rate. Add tests or profiles to make your own profile, then share it on WhatsApp or print it for the customer.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar: 2 clean compact rows on mobile, 1 unified row on laptop (md+) */}
        <div className="sticky top-[64px] sm:top-[74px] md:top-[84px] z-30 bg-[#F8F9FA]/95 backdrop-blur-md pt-0.5 pb-2 mb-2.5">
          <div className="bg-white border border-slate-200/90 rounded-xl p-2 sm:p-2.5 md:p-3 shadow-xs space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-2.5 w-full">

              {/* Row 1 on Mobile: Tabs + Export + Print */}
              <div className="flex items-center justify-between gap-1.5 w-full md:w-auto flex-none">
                {/* Segmented Tabs (Profiles / Tests) */}
                <div className="flex bg-slate-100/90 p-0.5 sm:p-1 rounded-lg md:rounded-xl flex-1 md:flex-none">
                  <button
                    type="button"
                    onClick={() => { setView('profiles'); setCurrentPage(1); }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 py-1 md:py-1.5 px-2.5 md:px-3 rounded-md md:rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${view === 'profiles'
                      ? 'bg-[#241A7A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#241A7A]'
                      }`}
                  >
                    <span>Profiles</span>
                    <span className={`inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 rounded-full text-[10px] md:text-xs font-black ${view === 'profiles' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                      {lplPackagesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setView('tests'); setCurrentPage(1); }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 py-1 md:py-1.5 px-2.5 md:px-3 rounded-md md:rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${view === 'tests'
                      ? 'bg-[#241A7A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#241A7A]'
                      }`}
                  >
                    <span>Tests</span>
                    <span className={`inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 rounded-full text-[10px] md:text-xs font-black ${view === 'tests' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                      {lplTestsCount}
                    </span>
                  </button>
                </div>

                {/* Export & Print (icon-only on mobile row 1, or right-aligned on laptop) */}
                <div className="flex md:hidden items-center gap-1.5 flex-none">
                  <button
                    type="button"
                    onClick={handleExportTable}
                    className="inline-flex items-center justify-center w-8 h-8 border rounded-lg text-slate-700 bg-white hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs transition-all"
                    title="Export complete rate list to Excel (.xlsx)"
                    aria-label="Export complete rate list to Excel"
                  >
                    <svg className="w-4 h-4 text-slate-600 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center w-8 h-8 border rounded-lg text-slate-700 bg-white hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs transition-all"
                    title="Print rate list"
                    aria-label="Print rate list"
                  >
                    <svg className="w-4 h-4 text-slate-600 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Row 2 on Mobile (or continued inline on Laptop): Search + Sort + Filters */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 w-full">
                {/* Search Bar */}
                <div className="flex items-center bg-slate-50 hover:bg-white border border-slate-200 focus-within:border-[#241A7A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#241A7A]/10 rounded-lg md:rounded-xl px-2.5 md:px-3 h-8.5 md:h-10 transition-all flex-1 min-w-0">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-none mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-transparent border-0 p-0 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    placeholder="Search test name or profile..."
                    aria-label="Search by test name, code or profile"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                      className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] md:text-xs font-bold cursor-pointer transition-colors flex-none"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative flex-none w-[95px] sm:w-[125px] md:w-[150px]">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="w-full h-8.5 md:h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl pl-2 pr-5 md:pr-6 text-xs md:text-sm font-semibold text-slate-700 appearance-none focus:outline-none focus:border-[#241A7A] focus:ring-1 focus:ring-[#241A7A]/15 transition-all cursor-pointer truncate"
                    aria-label="Sort results"
                  >
                    <option value="b2b-asc">Camp Rate: Low to High</option>
                    <option value="b2b-desc">Camp Rate: High to Low</option>
                    <option value="b2c-asc">Catalogue Rate: Low to High</option>
                    <option value="b2c-desc">Catalogue Rate: High to Low</option>
                    <option value="name">A-Z</option>
                    <option value="name-desc">Z-A</option>
                    <option value="margin-desc">PCCLM Margin: High to Low</option>
                    <option value="margin-asc">PCCLM Margin: Low to High</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Filters Button */}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`inline-flex items-center justify-center gap-1 md:gap-1.5 text-xs md:text-sm font-semibold border rounded-lg md:rounded-xl px-2 sm:px-2.5 md:px-3 h-8.5 md:h-10 transition-all flex-none cursor-pointer ${filtersOpen ? 'bg-[#241A7A] text-white border-[#241A7A]' : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  title="Toggle filters"
                  aria-label="Toggle filters"
                >
                  <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[16px] md:min-w-[18px] h-4 md:h-[18px] px-0.5 md:px-1 rounded-full font-bold text-[9px] md:text-[10px] leading-none ${filtersOpen ? 'bg-white text-[#241A7A]' : 'bg-[#E02029] text-white'}`}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Export & Print on Laptop/Desktop only */}
                <div className="hidden md:flex items-center gap-2 flex-none">
                  <button
                    type="button"
                    onClick={handleExportTable}
                    className="inline-flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold border rounded-lg md:rounded-xl px-3 h-10 transition-all text-slate-700 bg-white hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs"
                    title="Export complete rate list to Excel (.xlsx)"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-600 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Excel</span>
                  </button>
                </div>
              </div>

            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-line/60 text-xs">
                <span className="text-[11px] font-mono text-ink-faint font-semibold mr-1">Active filters:</span>
                {Array.from(selectedTechs).map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy text-white shadow-xs">
                    <span>{tech}</span>
                    <button type="button" onClick={() => toggleSetItem(setSelectedTechs, tech)} className="hover:text-amber text-xs cursor-pointer" aria-label={`Remove ${tech} filter`}>✕</button>
                  </span>
                ))}
                {Array.from(selectedPriceBands).map(bandId => {
                  const band = lplPriceBands.find(b => b.id === bandId) || (catalog.priceBands || []).find(b => b.id === bandId);
                  return (
                    <span key={bandId} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy text-white shadow-xs">
                      <span>{band?.label || bandId}</span>
                      <button type="button" onClick={() => toggleSetItem(setSelectedPriceBands, bandId)} className="hover:text-amber text-xs cursor-pointer" aria-label={`Remove ${band?.label || bandId} filter`}>✕</button>
                    </span>
                  );
                })}
                {Array.from(selectedSamples).map(sampleId => {
                  const sampleObj = (catalog.samples || []).find(s => s.id === sampleId);
                  return (
                    <span key={sampleId} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy text-white shadow-xs">
                      <span>{sampleObj?.label || sampleId}</span>
                      <button type="button" onClick={() => toggleSetItem(setSelectedSamples, sampleId)} className="hover:text-amber text-xs cursor-pointer" aria-label={`Remove ${sampleObj?.label || sampleId} filter`}>✕</button>
                    </span>
                  );
                })}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-navy shadow-xs">
                    <span>&quot;{searchTerm}&quot;</span>
                    <button type="button" onClick={() => setSearchTerm('')} className="hover:text-amber text-xs cursor-pointer" aria-label="Clear search">✕</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-amber-dark hover:underline ml-auto cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className="bg-white border border-line rounded-2xl p-4 md:p-6 mb-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy text-xs sm:text-sm uppercase tracking-wider font-mono">Filter Options</span>
                {activeFiltersCount > 0 && (
                  <span className="text-xs bg-amber/20 text-amber-dark font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-amber-dark hover:underline cursor-pointer"
                  >
                    Reset all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="text-xs text-ink-faint hover:text-navy cursor-pointer font-semibold"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-ink-faint mb-2">Technology</p>
              <div className="flex flex-wrap gap-2">
                {(catalog.technologies || []).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleSetItem(setSelectedTechs, t.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedTechs.has(t.label) ? 'bg-navy text-white border-navy' : 'bg-paper text-ink-soft border-line hover:border-navy'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-ink-faint mb-2">Camp Rate</p>
              <div className="flex flex-wrap gap-2">
                {lplPriceBands.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleSetItem(setSelectedPriceBands, b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedPriceBands.has(b.id) ? 'bg-navy text-white border-navy' : 'bg-paper text-ink-soft border-line hover:border-navy'
                      }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-ink-faint mb-2">Sample</p>
              <div className="flex flex-wrap gap-2">
                {(catalog.samples || []).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSetItem(setSelectedSamples, s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedSamples.has(s.id) ? 'bg-navy text-white border-navy' : 'bg-paper text-ink-soft border-line hover:border-navy'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 mb-4 shadow-xs" role="note">
          <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:inline-flex sm:mr-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EEF0FD] text-[#241A7A] font-black text-[11px] flex-none" aria-hidden="true">i</span>
            <span className="font-bold text-xs sm:text-sm text-[#141B38]">PCCLM Includes :</span>
          </div>
          <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-slate-600 sm:inline-flex">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald flex-none"></span>Promotion</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald flex-none"></span>Collection</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald flex-none"></span>Consumables</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald flex-none"></span>Logistics</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald flex-none"></span>Margin</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs font-mono text-ink-faint">
            {totalItems === 0
              ? 'No tests match that search.'
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} matching ${view === 'tests' ? 'tests' : 'profiles'}`}
          </p>
        </div>

        <div className="hidden lg:block bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          {view === 'tests' ? (
            <div>

              <div className="grid grid-cols-[70px_minmax(0,1.8fr)_140px_80px_110px_100px_104px_54px] gap-3 items-center px-5 py-3.5 bg-[#f8fafc] border-b border-line text-xs font-bold uppercase tracking-wider text-ink-faint select-none">
                <span>Code</span>
                <button
                  type="button"
                  onClick={() => handleSortHeader('test')}
                  className="group flex items-center text-left hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort Alphabetical (A–Z / Z–A)"
                >
                  <span>Test</span>
                  {renderSortIndicator('test')}
                </button>
                <span>Technology</span>
                <span>Sample</span>
                <button
                  type="button"
                  onClick={() => handleSortHeader('camp-rate')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by Camp Rate (Low to High / High to Low)"
                >
                  <span>Camp Rate</span>
                  {renderSortIndicator('camp-rate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortHeader('catalogue-rate')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by Catalogue Rate (Low to High / High to Low)"
                >
                  <span>Catalogue Rate</span>
                  {renderSortIndicator('catalogue-rate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortHeader('pcclm')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by PCCLM Margin (Low to High / High to Low)"
                >
                  <span title="Includes Promotion, Collection, Consumables, Logistics & Margin">PCCLM</span>
                  {renderSortIndicator('pcclm')}
                </button>
                <span></span>
              </div>

              <div className="divide-y divide-line/70">
                {paginatedItems.map(test => {
                  const owner = packageOwning(test.code, cartPackages, packageById, catalogTestsByCode);
                  const isAdded = !owner && cartSet.has(test.code);
                  const techCol = techColorMap[test.tech] || { fg: "#101C27", bd: "#D2D5D9", bg: "#EFF0F2" };

                  return (
                    <div
                      key={test.code}
                      className={`grid grid-cols-[70px_minmax(0,1.8fr)_140px_80px_110px_100px_104px_54px] gap-3 items-center px-5 py-3 text-sm transition-colors hover:bg-paper/50 ${isAdded ? 'bg-emerald-bg/30' : owner ? 'bg-slate-50/50 opacity-80' : ''
                        }`}
                    >
                      <div className="font-mono text-xs font-bold text-ink-faint">{test.displayCode || test.code}</div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onOpenTestDetail(test.code)}
                          className="font-medium text-navy hover:underline text-left block cursor-pointer"
                        >
                          {test.name}
                        </button>
                        {owner && (
                          <small className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            Included in {cleanProfileName(owner.name)}
                          </small>
                        )}
                      </div>
                      <div>
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium border"
                          style={{ color: techCol.fg, borderColor: techCol.bd, backgroundColor: techCol.bg }}
                        >
                          {test.tech}
                        </span>
                      </div>
                      <div className="text-xs text-ink-soft">{test.sample}</div>
                      <div className="text-right font-bold text-navy text-sm sm:text-base">
                        {money(getCampRate(test))}
                      </div>
                      <div className="text-right font-bold text-navy text-sm sm:text-base">
                        {money(getCatalogueRate(test))}
                      </div>
                      <div className="text-right font-bold text-[#059669] text-sm sm:text-base">
                        +{money(getCatalogueRate(test) - getCampRate(test))}
                      </div>
                      <div className="flex justify-center">
                        {owner ? (
                          <button
                            type="button"
                            onClick={() => onToggleTest(test.code)}
                            title={`${test.name} is already included in ${cleanProfileName(owner.name)} — remove that profile to change it`}
                            className="w-8 h-8 rounded-full border border-slate-300 text-slate-400 hover:border-slate-400 bg-white flex items-center justify-center cursor-pointer select-none transition-all shadow-2xs"
                            aria-label={`${test.name} is already included in ${cleanProfileName(owner.name)}`}
                          >
                            <BlockedIcon className="w-4 h-4 text-slate-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleTest(test.code)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${isAdded
                              ? 'bg-emerald text-white border border-emerald hover:bg-emerald-dark shadow-xs'
                              : 'bg-white hover:bg-[#1E63B4] hover:text-white text-slate-700 hover:border-[#1E63B4] border border-slate-300 shadow-2xs hover:shadow-xs'
                              }`}
                            aria-label={isAdded ? `Remove ${test.name}` : `Add ${test.name}`}
                          >
                            {isAdded ? (
                              <CheckIcon className="w-4 h-4 text-white" />
                            ) : (
                              <PlusIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>

              <div className="grid grid-cols-[minmax(0,2.8fr)_120px_120px_120px_54px] gap-3 items-center px-5 py-3.5 bg-[#f8fafc] border-b border-line text-xs font-bold uppercase tracking-wider text-ink-faint select-none">
                <button
                  type="button"
                  onClick={() => handleSortHeader('profile')}
                  className="group flex items-center text-left hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort Alphabetical (A–Z / Z–A)"
                >
                  <span>Profile</span>
                  {renderSortIndicator('profile')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortHeader('camp-rate')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by Camp Rate (Low to High / High to Low)"
                >
                  <span>Camp Rate</span>
                  {renderSortIndicator('camp-rate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortHeader('catalogue-rate')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by Catalogue Rate (Low to High / High to Low)"
                >
                  <span>Catalogue Rate</span>
                  {renderSortIndicator('catalogue-rate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortHeader('pcclm')}
                  className="group flex items-center justify-end text-right hover:text-[#241A7A] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  title="Sort by PCCLM Margin (Low to High / High to Low)"
                >
                  <span title="Includes Promotion, Collection, Consumables, Logistics & Margin">PCCLM</span>
                  {renderSortIndicator('pcclm')}
                </button>
                <div className="text-center"></div>
              </div>

              <div className="divide-y divide-line/70">
                {paginatedItems.map(pkg => {
                  const isAdded = cartPackages.has(pkg.id);
                  const blockingPkg = !isAdded ? getBlockingPackage(pkg) : null;
                  const upgradePkgs = !isAdded && !blockingPkg ? getUpgradePackages(pkg) : [];
                  const isUpgrade = upgradePkgs.length > 0;
                  const isExpanded = expandedProfiles.has(pkg.id);
                  const testCount = getProfileTestCount(pkg, catalogTestsByCode);
                  const groups = getProfileGroups(pkg, catalogTestsByCode);

                  return (
                    <div key={pkg.id} className="transition-colors">
                      <div
                        className={`grid grid-cols-[minmax(0,2.8fr)_120px_120px_120px_54px] gap-3 items-center px-5 py-3.5 text-sm transition-colors ${isAdded
                          ? 'bg-sky-50/40 hover:bg-sky-50/60'
                          : blockingPkg
                            ? 'opacity-60 hover:opacity-70'
                            : 'hover:bg-paper/40'
                          }`}
                      >

                        <div>
                          <button
                            type="button"
                            onClick={() => toggleProfileExpanded(pkg.id)}
                            className="font-bold text-navy hover:text-[#1E63B4] hover:underline text-sm sm:text-base leading-snug text-left inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            aria-expanded={isExpanded}
                            title={`${isExpanded ? 'Collapse' : 'Expand'} ${cleanProfileName(pkg.name)} included tests`}
                          >
                            <span>{cleanProfileName(pkg.name)} {testCount > 0 ? `(${testCount})` : ''}</span>
                            <span className="text-xs text-[#1E63B4] font-bold">{isExpanded ? '▴' : '▾'}</span>
                          </button>
                        </div>

                        <div className="text-right font-bold text-navy text-sm sm:text-base">
                          {money(getCampRate(pkg))}
                        </div>

                        <div className="text-right font-bold text-navy text-sm sm:text-base">
                          {money(getCatalogueRate(pkg))}
                        </div>

                        <div className="text-right font-bold text-[#059669] text-sm sm:text-base">
                          +{money(getCatalogueRate(pkg) - getCampRate(pkg))}
                        </div>

                        <div className="flex justify-center">
                          {blockingPkg ? (
                            // Blocked: overlapping profile in cart is bigger
                            <button
                              type="button"
                              onClick={() => onTogglePackage(pkg)}
                              title={`${cleanProfileName(pkg.name)} overlaps with ${cleanProfileName(blockingPkg.name)} already in your profile — remove that first`}
                              className="w-8 h-8 rounded-full border border-slate-300 text-slate-400 bg-white flex items-center justify-center cursor-default select-none shadow-2xs"
                              aria-label={`${cleanProfileName(pkg.name)} overlaps with ${cleanProfileName(blockingPkg.name)}`}
                            >
                              <BlockedIcon className="w-4 h-4 text-slate-400" />
                            </button>
                          ) : isAdded ? (
                            // Added: already in cart (filled blue, click to remove)
                            <button
                              type="button"
                              onClick={() => onTogglePackage(pkg)}
                              className="w-8 h-8 rounded-full bg-[#1E63B4] hover:bg-[#154b8a] text-white border border-[#1E63B4] flex items-center justify-center shadow-xs transition-all cursor-pointer select-none active:scale-95"
                              aria-label={`Remove ${pkg.name}`}
                              title="Remove from profile"
                            >
                              <CheckIcon className="w-4 h-4 text-white" />
                            </button>
                          ) : (
                            // Add (or upgrade-replace smaller profiles)
                            <button
                              type="button"
                              onClick={() => onTogglePackage(pkg)}
                              className="w-8 h-8 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-[#1E63B4] hover:bg-[#1E63B4] hover:text-white flex items-center justify-center transition-all cursor-pointer select-none shadow-2xs hover:shadow-xs active:scale-95"
                              aria-label={isUpgrade ? `Replace ${upgradePkgs.map(p => cleanProfileName(p.name)).join(', ')} with ${cleanProfileName(pkg.name)}` : `Add ${pkg.name}`}
                              title={isUpgrade ? `Replaces ${upgradePkgs.map(p => cleanProfileName(p.name)).join(', ')} (upgrade)` : 'Add to profile'}
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-[#fbfcfe] px-8 py-4 border-t border-b border-line/70 space-y-3.5">
                          <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-ink-faint">
                            TESTS INCLUDED
                          </span>
                          <div className="space-y-3">
                            {groups.map((group, gIdx) => (
                              <div key={gIdx} className="border-l-2 border-[#60A5FA] pl-3 py-0.5">
                                <span className="font-bold text-xs sm:text-sm text-navy block">
                                  {group.label}
                                </span>
                                {group.parameters && group.parameters.length > 0 && (
                                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                                    {group.parameters.join(' • ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="block lg:hidden space-y-3">
          {view === 'tests' ? (
            paginatedItems.map(test => {
              const owner = packageOwning(test.code, cartPackages, packageById, catalogTestsByCode);
              const isAdded = !owner && cartSet.has(test.code);
              const techCol = techColorMap[test.tech] || { fg: "#101C27", bd: "#D2D5D9", bg: "#EFF0F2" };

              return (
                <div
                  key={test.code}
                  className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${isAdded ? 'border-emerald/40 bg-emerald-bg/10 ring-1 ring-emerald/30' : owner ? 'border-line/60 bg-slate-50/50 opacity-80' : 'border-line/80'
                    }`}
                >

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy bg-paper px-2 py-0.5 rounded border border-line/60">
                      {test.displayCode || test.code}
                    </span>
                    {test.processedAt && test.processedAt !== 'LPL' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-teal-bg text-teal">
                        {test.processedAt}
                      </span>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenTestDetail(test.code)}
                      className="font-bold text-navy text-base leading-snug text-left hover:underline cursor-pointer block"
                    >
                      {test.name}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border"
                      style={{ color: techCol.fg, borderColor: techCol.bd, backgroundColor: techCol.bg }}
                    >
                      {test.tech}
                    </span>
                    <span className="text-xs text-ink-soft font-medium">
                      <span className="text-[10px] uppercase font-mono font-bold text-ink-faint mr-1">Sample:</span>
                      {test.sample || 'Serum'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-paper-2/70 border border-line/70 rounded-xl p-2.5 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        Camp Rate
                      </div>
                      <div className="font-extrabold text-navy text-xs sm:text-sm mt-0.5">
                        {money(getCampRate(test))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        Catalogue Rate
                      </div>
                      <div className="font-extrabold text-navy text-xs sm:text-sm mt-0.5">
                        {money(getCatalogueRate(test))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        PCCLM
                      </div>
                      <div className="font-extrabold text-[#059669] text-xs sm:text-sm mt-0.5">
                        +{money(getCatalogueRate(test) - getCampRate(test))}
                      </div>
                    </div>
                  </div>

                  {owner ? (
                    <button
                      type="button"
                      onClick={() => onToggleTest(test.code)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BlockedIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Included in {cleanProfileName(owner.name)}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleTest(test.code)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isAdded
                        ? 'bg-emerald text-white hover:bg-emerald-dark shadow-xs'
                        : 'bg-navy hover:bg-navy-soft text-white shadow-xs'
                        }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-white" />
                          <span>Added to Profile</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-3.5 h-3.5 text-white" />
                          <span>Add to Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            paginatedItems.map(pkg => {
              const isAdded = cartPackages.has(pkg.id);
              const blockingPkg = !isAdded ? getBlockingPackage(pkg) : null;
              const upgradePkgs = !isAdded && !blockingPkg ? getUpgradePackages(pkg) : [];
              const isUpgrade = upgradePkgs.length > 0;
              const isExpanded = expandedProfiles.has(pkg.id);
              const testCount = getProfileTestCount(pkg, catalogTestsByCode);
              const groups = getProfileGroups(pkg, catalogTestsByCode);

              return (
                <div
                  key={pkg.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3.5 transition-all ${isAdded ? 'border-[#1E63B4]/40 bg-sky-50/20 ring-1 ring-[#1E63B4]/20' : 'border-line/80'
                    }`}
                >

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleProfileExpanded(pkg.id)}
                        className="font-bold text-navy hover:text-[#1E63B4] hover:underline text-base leading-snug text-left inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        aria-expanded={isExpanded}
                        title={`${isExpanded ? 'Collapse' : 'Expand'} ${cleanProfileName(pkg.name)} included tests`}
                      >
                        <span>{cleanProfileName(pkg.name)} {testCount > 0 ? `(${testCount})` : ''}</span>
                        <span className="text-xs text-[#1E63B4] font-bold">{isExpanded ? '▴' : '▾'}</span>
                      </button>
                    </div>
                    {pkg.processedAt && pkg.processedAt !== 'LPL' && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase flex-none bg-[#E1EFFE] text-[#1E429F]">
                        {pkg.processedAt}
                      </span>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-line/70 space-y-3">
                      <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-ink-faint">
                        TESTS INCLUDED
                      </span>
                      <div className="space-y-2.5">
                        {groups.map((group, gIdx) => (
                          <div key={gIdx} className="border-l-2 border-[#60A5FA] pl-2.5 py-0.5">
                            <span className="font-bold text-xs text-navy block">
                              {group.label}
                            </span>
                            {group.parameters && group.parameters.length > 0 && (
                              <p className="text-[11px] text-ink-soft mt-0.5 leading-relaxed">
                                {group.parameters.join(' • ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-paper-2/70 border border-line/70 rounded-xl p-2.5 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        Camp Rate
                      </div>
                      <div className="font-extrabold text-navy text-xs sm:text-sm mt-0.5">
                        {money(getCampRate(pkg))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        Catalogue Rate
                      </div>
                      <div className="font-extrabold text-navy text-xs sm:text-sm mt-0.5">
                        {money(getCatalogueRate(pkg))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-ink-faint tracking-wider">
                        PCCLM
                      </div>
                      <div className="font-extrabold text-[#059669] text-xs sm:text-sm mt-0.5">
                        +{money(getCatalogueRate(pkg) - getCampRate(pkg))}
                      </div>
                    </div>
                  </div>

                  {blockingPkg ? (
                    <button
                      type="button"
                      onClick={() => onTogglePackage(pkg)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BlockedIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Overlaps with {cleanProfileName(blockingPkg.name)}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onTogglePackage(pkg)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isAdded
                        ? 'bg-[#1E63B4] hover:bg-[#154b8a] text-white shadow-xs'
                        : 'bg-navy hover:bg-navy-soft text-white shadow-xs'
                        }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-white" />
                          <span>Added to Profile</span>
                        </>
                      ) : isUpgrade ? (
                        <>
                          <PlusIcon className="w-3.5 h-3.5 text-white" />
                          <span>Upgrade to {cleanProfileName(pkg.name)}</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-3.5 h-3.5 text-white" />
                          <span>Add to Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 text-xs font-semibold border border-line bg-white hover:bg-paper disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              Previous
            </button>
            <span className="text-xs text-ink-soft font-mono px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 text-xs font-semibold border border-line bg-white hover:bg-paper disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
