'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isWarning = type === 'warning' || message.includes('already') || message.includes('overlaps') || message.includes('replaced');

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-[92%] sm:w-auto px-4 py-3 rounded-xl bg-[#0E294B]/95 text-white shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <span
        className={`w-2.5 h-2.5 rounded-full flex-none animate-pulse ${
          isWarning ? 'bg-amber' : 'bg-cyan'
        }`}
      />
      <p className="text-xs sm:text-sm font-medium leading-snug flex-1 m-0 text-white/95">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white transition-colors text-sm px-1 py-0.5 cursor-pointer flex-none leading-none"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
