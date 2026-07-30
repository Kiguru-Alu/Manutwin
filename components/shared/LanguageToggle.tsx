'use client';

import React from 'react';
import { LanguageCode } from '../../lib/i18n';

interface LanguageToggleProps {
  currentLang: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
}

/**
 * Handles NFR-4: Multilingual language selector component.
 * Stylized using industrial orange accents and warm cream-compatible cards.
 */
export default function LanguageToggle({ currentLang, onChangeLanguage }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-border-soft shadow-sm">
      <button
        onClick={() => onChangeLanguage('en')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          currentLang === 'en'
            ? 'bg-industrial-orange text-white shadow-sm'
            : 'text-slate-600 hover:text-charcoal hover:bg-warm-cream/80'
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => onChangeLanguage('sw')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          currentLang === 'sw'
            ? 'bg-industrial-orange text-white shadow-sm'
            : 'text-slate-600 hover:text-charcoal hover:bg-warm-cream/80'
        }`}
        title="Badilisha hadi Kiswahili"
      >
        SW
      </button>
      <button
        onClick={() => onChangeLanguage('rw')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          currentLang === 'rw'
            ? 'bg-industrial-orange text-white shadow-sm'
            : 'text-slate-600 hover:text-charcoal hover:bg-warm-cream/80'
        }`}
        title="Hindura mu Kinyarwanda"
      >
        RW
      </button>
    </div>
  );
}
