'use client';

import React, { useEffect, useState } from 'react';
import { PowerOff, Play } from 'lucide-react';
import { translate, LanguageCode } from '../../lib/i18n';

interface HaltButtonProps {
  isHalted: boolean;
  activeHaltStartTime: number | null;
  onTriggerHalt: () => void;
  onResolveHalt: () => void;
  lang: LanguageCode;
}

/**
 * Handles FR-2, NFR-1: Machine Halt button component.
 * Revamped to use high-contrast industrial orange accent and clean white card wrapper.
 */
export default function HaltButton({
  isHalted,
  activeHaltStartTime,
  onTriggerHalt,
  onResolveHalt,
  lang,
}: HaltButtonProps) {
  const [downtimeSecs, setDowntimeSecs] = useState<number>(0);

  useEffect(() => {
    if (!isHalted || !activeHaltStartTime) {
      setDowntimeSecs(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeHaltStartTime) / 1000);
      setDowntimeSecs(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHalted, activeHaltStartTime]);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-border-soft shadow-sm">
      {isHalted ? (
        // Halted / Stopped State
        <div className="w-full text-center space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-industrial-orange font-black tracking-wider uppercase text-sm animate-pulse">
              ⚠️ {translate(lang, 'active_halt_msg')}
            </span>
            <div className="mt-4 font-mono text-5xl md:text-6xl font-extrabold text-charcoal tracking-widest bg-warm-cream px-6 py-4 rounded-2xl border border-industrial-orange/30 shadow-inner halt-active-indicator">
              {formatTimer(downtimeSecs)}
            </div>
            {downtimeSecs >= 600 && (
              <span className="text-industrial-orange text-xs font-black mt-3 block bg-industrial-orange/10 px-3.5 py-1 rounded-full border border-industrial-orange/20 uppercase tracking-wider">
                SMS Alert Broadcasted
              </span>
            )}
          </div>

          <button
            onClick={onResolveHalt}
            className="w-full py-6 rounded-2xl font-black text-lg md:text-xl tracking-wider uppercase transition-all duration-300 transform active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center space-x-3 cursor-pointer outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            <Play size={22} fill="currentColor" />
            <span>{translate(lang, 'resolve_halt')}</span>
          </button>
        </div>
      ) : (
        // Running / Active State
        <div className="w-full space-y-4">
          <div className="text-center">
            <span className="text-emerald-600 text-xs font-black tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{translate(lang, 'no_active_halt')}</span>
            </span>
          </div>

          <button
            onClick={onTriggerHalt}
            className="w-full py-10 rounded-2xl font-black text-xl md:text-2xl tracking-wider uppercase transition-all duration-300 transform active:scale-95 bg-industrial-orange hover:bg-industrial-orange/90 text-white shadow-lg shadow-industrial-orange/20 border-2 border-industrial-orange/10 flex flex-col items-center justify-center space-y-3 cursor-pointer outline-none focus:ring-4 focus:ring-industrial-orange/20"
          >
            <PowerOff size={32} />
            <span>{translate(lang, 'machine_halt')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
