'use client';

import React, { useState } from 'react';
import { translate, LanguageCode } from '../../lib/i18n';
import { CornerDownLeft, Delete } from 'lucide-react';

interface OutputCounterProps {
  onSubmitOutput: (count: number) => void;
  lang: LanguageCode;
}

/**
 * Handles FR-4: Package Output Entry.
 * Styled using high-contrast numeric layouts conforming to the cream/charcoal theme.
 */
export default function OutputCounter({ onSubmitOutput, lang }: OutputCounterProps) {
  const [valStr, setValStr] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (valStr === '' && num === '0') return;
    if (valStr.length >= 6) return;
    setValStr(prev => prev + num);
  };

  const handleDelete = () => {
    setValStr(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValStr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(valStr, 10);
    if (!isNaN(count) && count > 0) {
      onSubmitOutput(count);
      setValStr('');
    }
  };

  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <div className="w-full p-6 bg-white rounded-2xl border border-border-soft space-y-4 shadow-sm">
      <div className="text-center">
        <h3 className="font-black text-charcoal text-sm uppercase tracking-wide">
          {translate(lang, 'submit_output')}
        </h3>
        <p className="text-slate-500 text-xs">
          {translate(lang, 'package_count_label')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Field */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={valStr || '0'}
            placeholder="0"
            className="w-full py-4 px-5 text-center text-3xl font-black font-mono text-industrial-orange bg-warm-cream rounded-xl border border-border-soft outline-none select-none"
          />
        </div>

        {/* Keypad touch buttons */}
        <div className="grid grid-cols-3 gap-2">
          {keypadButtons.map((btn) => {
            let action = () => handleKeyPress(btn);
            let btnClass = 'bg-warm-cream hover:bg-slate-200/60 text-charcoal border-border-soft active:bg-industrial-orange/10';

            if (btn === 'C') {
              action = handleClear;
              btnClass = 'bg-white text-rose-500 hover:bg-rose-50 border-rose-200';
            } else if (btn === 'DEL') {
              action = handleDelete;
              btnClass = 'bg-white text-amber-600 hover:bg-amber-50 border-amber-200 flex items-center justify-center';
            }

            return (
              <button
                key={btn}
                type="button"
                onClick={action}
                className={`py-4 rounded-xl font-mono text-lg font-bold border transform active:scale-95 transition-all duration-150 cursor-pointer outline-none ${btnClass}`}
              >
                {btn === 'DEL' ? <Delete size={18} /> : btn}
              </button>
            );
          })}
        </div>

        {/* Submit Button (Accent Orange) */}
        <button
          type="submit"
          disabled={!valStr}
          className={`w-full py-4 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all duration-200 transform active:scale-98 cursor-pointer outline-none focus:ring-4 focus:ring-industrial-orange/20 ${
            valStr
              ? 'bg-industrial-orange hover:bg-industrial-orange/90 text-white shadow-md'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <CornerDownLeft size={14} />
          <span>{translate(lang, 'submit_btn')}</span>
        </button>
      </form>
    </div>
  );
}
