'use client';

import { useState, useEffect } from 'react';
import { money } from '../lib/formatters';
import { getCampRate, getCatalogueRate } from '../lib/calculations';
import { cleanProfileName } from '../lib/profileGroups';
import parametersData from '../data/parameters.json';
import testParametersData from '../data/test-parameters.json';

export default function TestDetailDrawer({
  test,
  isOpen,
  onClose,
  isAdded,
  owner,
  onToggleTest,
  customerView
}) {
  const [paramsExpanded, setParamsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!test) return null;

  const paramIds = testParametersData.testParameters?.[test.code] || [];
  const paramList = paramIds
    .map(id => parametersData.parameters?.find(p => p.id === id))
    .filter(Boolean);

  const hasParameters = paramList.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Test details"
      >
        <div className="flex items-center justify-between p-5 border-b border-line bg-paper/80 backdrop-blur-md flex-none">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">Test Details</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-faint hover:text-navy hover:bg-black/5 transition-all cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono font-bold text-xs bg-paper px-2 py-0.5 rounded text-navy border border-line">
                {test.displayCode || test.code}
              </span>
              {test.processedAt && test.processedAt !== 'LPL' && (
                <span className={`text-xs font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded ${test.processedAt === 'CRL' ? 'bg-[#F0EBFB] text-[#7C4FE0]' : 'bg-teal-bg text-teal'}`}>
                  {test.processedAt}
                </span>
              )}
              {test.tech && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {test.tech}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-navy tracking-tight">{test.name}</h2>
            {test.aliases && test.aliases.length > 0 && (
              <p className="text-xs text-ink-faint mt-1 italic">
                (also known as {test.aliases.join(', ')})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-paper/60 border border-line rounded-xl text-xs">
            <div>
              <span className="text-ink-faint block">Sample</span>
              <span className="font-semibold text-navy mt-0.5 block">{test.sample || 'Serum'}</span>
            </div>
            {test.processedAt && test.processedAt !== 'LPL' && (
              <div>
                <span className="text-ink-faint block">Processed At</span>
                <span className="font-semibold text-navy mt-0.5 block">{test.processedAt}</span>
              </div>
            )}
            {test.analyzer && (
              <div>
                <span className="text-ink-faint block">Analyzer</span>
                <span className="font-semibold text-navy mt-0.5 block">{test.analyzer}</span>
              </div>
            )}
            {test.fasting && (
              <div>
                <span className="text-ink-faint block">Fasting</span>
                <span className="font-semibold text-navy mt-0.5 block">{test.fasting}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-line rounded-xl space-y-2.5 shadow-xs">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Camp Rate</span>
              <span className="font-bold text-navy">{money(getCampRate(test))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Catalogue Rate</span>
              <span className="font-bold text-navy text-base">{money(getCatalogueRate(test))}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-line">
              <span className="text-profit font-semibold" title="Includes Promotion, Collection, Consumables, Logistics & Margin">
                PCCLM Margin
              </span>
              <span className="text-profit font-bold">+{money(getCatalogueRate(test) - getCampRate(test))}</span>
            </div>
          </div>

          {hasParameters && (
            <div className="border border-line rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setParamsExpanded(!paramsExpanded)}
                className="w-full flex items-center justify-between p-3.5 bg-paper/60 hover:bg-paper text-xs font-semibold text-navy transition-colors text-left cursor-pointer"
                aria-expanded={paramsExpanded}
              >
                <span>
                  {paramsExpanded ? '▴' : '▾'} {paramList.length} parameters reported
                </span>
                <span className="text-[11px] text-ink-faint font-mono">
                  {paramsExpanded ? 'Collapse' : 'Expand'}
                </span>
              </button>

              {paramsExpanded && (
                <ul className="divide-y divide-line/40 max-h-64 overflow-y-auto p-2 text-xs text-ink">
                  {paramList.map((p, idx) => (
                    <li key={p.id || idx} className="py-2 px-2.5 flex items-center justify-between">
                      <span className="font-medium text-ink">{p.name}</span>
                      {p.unit && (
                        <span className="text-[11px] font-mono text-ink-faint bg-paper px-1.5 py-0.5 rounded">
                          {p.unit}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {owner ? (
            <button
              onClick={() => onToggleTest(test.code)}
              type="button"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer border border-slate-300 text-slate-500 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.7" y1="5.7" x2="18.3" y2="18.3" />
              </svg>
              <span>Included in {cleanProfileName(owner.name)}</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleTest(test.code)}
              type="button"
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${isAdded
                ? 'bg-emerald-bg border border-emerald text-emerald-dark hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                : 'bg-navy hover:bg-navy-soft text-white'
                }`}
            >
              {isAdded ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Added to Profile (Click to remove)</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add to Profile</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
