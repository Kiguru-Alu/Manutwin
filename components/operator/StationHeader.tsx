'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import LanguageToggle from '../shared/LanguageToggle';
import SyncStatusBadge from '../shared/SyncStatusBadge';
import { translate, LanguageCode } from '../../lib/i18n';

interface StationHeaderProps {
  operatorName: string;
  stationName: string;
  currentLang: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onLogout: () => void;
}

/**
 * Handles FR-1, NFR-4, NFR-5: Station header workspace.
 * Revamped using a high-contrast charcoal banner to anchor operator panels.
 */
export default function StationHeader({
  operatorName,
  stationName,
  currentLang,
  onChangeLanguage,
  onLogout,
}: StationHeaderProps) {
  return (
    <header className="w-full bg-charcoal text-white p-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
      {/* Session Details */}
      <div className="flex items-center space-x-3">
        {/* Active state orange indicator (Industrial Orange) */}
        <div className="h-10 w-10 rounded-xl bg-industrial-orange text-white flex items-center justify-center font-black text-sm shadow-md">
          {stationName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-black text-white text-base tracking-wide uppercase leading-none">{stationName}</h1>
          <span className="text-slate-400 text-xs mt-1 block">
            {translate(currentLang, 'operator_role')}: <strong className="text-slate-200">{operatorName}</strong>
          </span>
        </div>
      </div>

      {/* Control Widgets */}
      <div className="flex items-center flex-wrap gap-3">
        <SyncStatusBadge />
        
        <LanguageToggle
          currentLang={currentLang}
          onChangeLanguage={onChangeLanguage}
        />

        <button
          onClick={onLogout}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer outline-none"
          title={translate(currentLang, 'logout')}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{translate(currentLang, 'logout')}</span>
        </button>
      </div>
    </header>
  );
}
