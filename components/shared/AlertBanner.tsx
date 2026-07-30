'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  type: 'warning' | 'critical';
  onClose?: () => void;
}

/**
 * Handles FR-5, FR-6: Warning notification banner.
 * Styled using high-contrast industrial warning theme (orange/charcoal accent).
 */
export default function AlertBanner({ message, type, onClose }: AlertBannerProps) {
  const borderClass = type === 'critical' 
    ? 'border-industrial-orange' 
    : 'border-amber-500';

  const iconClass = type === 'critical' ? 'text-industrial-orange' : 'text-amber-500';

  return (
    <div className={`flex items-start justify-between p-4 rounded-xl border bg-white shadow-md text-charcoal border-l-4 ${borderClass} transition-all duration-300 animate-in slide-in-from-top-4`}>
      <div className="flex items-center space-x-3">
        <AlertTriangle className={`${iconClass} shrink-0 animate-bounce`} size={20} />
        <div>
          <span className="font-black block text-xs tracking-wider uppercase text-slate-800">
            {type === 'critical' ? 'Critical Halt Warning' : 'Performance Alert'}
          </span>
          <p className="text-xs text-slate-600 mt-1 font-mono">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-charcoal transition-colors p-1 cursor-pointer"
          aria-label="Close Alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
