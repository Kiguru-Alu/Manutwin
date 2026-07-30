'use client';

import React from 'react';
import { HaltReason } from '../../lib/types';
import { translate, LanguageCode } from '../../lib/i18n';
import { Zap, Settings, RefreshCw, Activity } from 'lucide-react';

interface ReasonModalProps {
  isOpen: boolean;
  onSelectReason: (reason: HaltReason) => void;
  onClose: () => void;
  lang: LanguageCode;
}

/**
 * Handles FR-3: Standardized Downtime Reason modal.
 * Redesigned with a clean white card container and high-contrast touch boundaries.
 */
export default function ReasonModal({ isOpen, onSelectReason, onClose, lang }: ReasonModalProps) {
  if (!isOpen) return null;

  const reasons: { code: HaltReason; translationKey: 'reason_power' | 'reason_mechanical' | 'reason_jam' | 'reason_maintenance'; icon: React.ReactNode; color: string }[] = [
    {
      code: 'POWER',
      translationKey: 'reason_power',
      icon: <Zap size={22} />,
      color: 'bg-warm-cream hover:bg-orange-50/50 text-amber-700 border-border-soft hover:border-amber-500/40',
    },
    {
      code: 'MECHANICAL',
      translationKey: 'reason_mechanical',
      icon: <Settings size={22} />,
      color: 'bg-warm-cream hover:bg-orange-50/50 text-indigo-700 border-border-soft hover:border-indigo-500/40',
    },
    {
      code: 'JAM',
      translationKey: 'reason_jam',
      icon: <RefreshCw size={22} />,
      color: 'bg-warm-cream hover:bg-orange-50/50 text-rose-700 border-border-soft hover:border-rose-500/40',
    },
    {
      code: 'MAINTENANCE',
      translationKey: 'reason_maintenance',
      icon: <Activity size={22} />,
      color: 'bg-warm-cream hover:bg-orange-50/50 text-sky-700 border-border-soft hover:border-sky-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-border-soft rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95">
        <div className="text-center">
          <h2 className="text-lg font-black text-charcoal tracking-wide uppercase">
            {translate(lang, 'select_reason')}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Standard operating procedure requires selecting a reason code .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {reasons.map(({ code, translationKey, icon, color }) => (
            <button
              key={code}
              onClick={() => onSelectReason(code)}
              className={`w-full p-4 rounded-xl border text-left flex items-center space-x-4 transition-all duration-200 transform active:scale-98 cursor-pointer outline-none focus:ring-2 focus:ring-industrial-orange/20 ${color}`}
            >
              <span className="p-2 rounded-lg bg-white shadow-sm shrink-0">
                {icon}
              </span>
              <div>
                <span className="font-black text-xs tracking-wider uppercase text-charcoal">{code}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">{translate(lang, translationKey)}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl border border-border-soft hover:border-slate-300 text-slate-600 hover:text-charcoal text-xs font-bold transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
