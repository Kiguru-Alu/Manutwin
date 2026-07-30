'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Handles NFR-3: Supervisor Route Guard layout.
 * Intercepts routing to any /supervisor route and checks for authenticated supervisor session.
 * Renders a keypad terminal if unauthenticated, matching the high-contrast industrial theme.
 */
export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Check session storage on component mount
    const savedUser = sessionStorage.getItem('manutwin_supervisor_user');
    if (savedUser) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleKeyPress = (digit: string) => {
    setErrorMsg('');
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setErrorMsg('PIN must be exactly 4 digits.');
      return;
    }

    try {
      const res = await fetch('/api/auth/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('manutwin_supervisor_user', JSON.stringify(data.user));
          setIsAuthenticated(true);
          setPin('');
        } else {
          setErrorMsg('Invalid supervisor PIN. Access denied.');
          setPin('');
        }
      } else {
        setErrorMsg('Invalid supervisor PIN. Access denied.');
        setPin('');
      }
    } catch (err) {
      setErrorMsg('Authentication service unavailable. Please retry.');
      setPin('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center font-mono text-xs font-bold">
        Validating secure credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];
    return (
      <main className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-border-soft p-6 rounded-2xl space-y-6 shadow-md relative">
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-charcoal transition-colors">
            <ArrowLeft size={12} />
            <span>Back to Launcher</span>
          </Link>

          <div className="text-center space-y-1">
            <div className="mx-auto h-12 w-12 rounded-xl bg-industrial-orange/10 text-industrial-orange flex items-center justify-center mb-2">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-lg font-black uppercase text-charcoal tracking-wider">Supervisor Portal</h1>
            <p className="text-xs text-slate-500 font-medium">Restricted Access — Verify Security PIN</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* PIN Entry Display */}
            <div className="relative flex items-center justify-center bg-warm-cream border border-border-soft py-3.5 rounded-xl text-3xl tracking-widest font-mono font-black text-charcoal h-[60px]">
              {pin ? '• '.repeat(pin.length).trim() : <span className="text-slate-400 text-xs font-black uppercase tracking-widest text-[10px]">Supervisor PIN</span>}
              <div className="absolute right-4 text-slate-400">
                <KeyRound size={16} />
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {keys.map((key) => {
                let onClick = () => handleKeyPress(key);
                let btnClass = 'bg-warm-cream hover:bg-slate-200/60 text-charcoal border-border-soft active:bg-industrial-orange/10';

                if (key === 'C') {
                  onClick = handleClear;
                  btnClass = 'bg-white text-rose-500 hover:bg-rose-50 border-rose-200';
                } else if (key === 'DEL') {
                  onClick = handleDelete;
                  btnClass = 'bg-white text-amber-600 hover:bg-amber-50 border-amber-200';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={onClick}
                    className={`py-4 rounded-xl font-mono text-lg font-bold border transform active:scale-95 transition-all duration-150 cursor-pointer outline-none ${btnClass}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Submit Control */}
            <button
              onClick={handleLogin}
              disabled={pin.length !== 4}
              className={`w-full py-4 rounded-xl text-white font-black text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none focus:ring-4 focus:ring-industrial-orange/20 ${
                pin.length === 4
                  ? 'bg-industrial-orange hover:bg-industrial-orange/95 shadow-md shadow-industrial-orange/10 active:scale-98'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              Verify PIN & Access Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
