import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldAlert, MonitorCheck, Settings } from 'lucide-react';

/**
 * Main application launcher portal.
 * Restyled with a soft cream canvas, white cards, and high-visibility industrial orange accents.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-warm-cream text-charcoal flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Warm Accent Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-industrial-orange/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl space-y-12 z-10 text-center">
        {/* Logo and Intro */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-industrial-orange/10 border border-industrial-orange/20 px-3.5 py-1.5 rounded-full text-industrial-orange font-black text-xs tracking-wider uppercase font-mono">
            <MonitorCheck size={14} />
            <span>MANUTWIN ENTERPRISE SYSTEM</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-charcoal uppercase leading-none">
            Manutwin
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto font-bold">
            Real-time shop-floor downtime monitoring and production line velocity tracking for East African food manufacturing.
          </p>
        </div>

        {/* Launcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Card A: Operator Screen */}
          <Link href="/operator" className="group block">
            <div className="h-full bg-white border border-border-soft hover:border-industrial-orange/40 p-8 rounded-2xl space-y-6 text-left transition-all duration-300 hover:shadow-md relative">
              <div className="h-12 w-12 rounded-xl bg-industrial-orange/10 text-industrial-orange flex items-center justify-center transition-transform group-hover:scale-105">
                <Terminal size={22} />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-charcoal group-hover:text-industrial-orange transition-colors uppercase tracking-wide">
                  Operator Terminal &rarr;
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  Log machine halt timers, select standardized fault reason codes, and report physical package counts. Designed for mounted floor smartphones.
                </p>
              </div>
              <div className="border-t border-border-soft pt-4 flex items-center justify-between text-xxs font-mono text-slate-400">
                <span>STATION TERMINAL ACCESS</span>
                <span className="bg-industrial-orange/10 text-industrial-orange px-2 py-0.5 rounded-lg font-bold">TOUCH SCREEN</span>
              </div>
            </div>
          </Link>

          {/* Card B: Supervisor Screen */}
          <Link href="/supervisor" className="group block">
            <div className="h-full bg-white border border-border-soft hover:border-industrial-orange/40 p-8 rounded-2xl space-y-6 text-left transition-all duration-300 hover:shadow-md relative">
              <div className="h-12 w-12 rounded-xl bg-industrial-orange/10 text-industrial-orange flex items-center justify-center transition-transform group-hover:scale-105">
                <ShieldAlert size={22} />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-charcoal group-hover:text-industrial-orange transition-colors uppercase tracking-wide">
                  Supervisor Dashboard &rarr;
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  Monitor live production velocity, track speed drop alerts, oversee ongoing line stoppages, and download weekly downtime summaries.
                </p>
              </div>
              <div className="border-t border-border-soft pt-4 flex items-center justify-between text-xxs font-mono text-slate-400">
                <span>SUPERVISOR ANALYTICS HUB</span>
                <span className="bg-industrial-orange/10 text-industrial-orange px-2 py-0.5 rounded-lg font-bold">DESKTOP READY</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <div className="text-slate-400 font-mono text-xxs flex items-center justify-center space-x-2 pt-6">
          <Settings size={12} />
          <span>MANUTWIN SYSTEM LAUNCHER | SECURE FACTORY NETWORK | INTERNAL USE ONLY</span>
        </div>
      </div>
    </main>
  );
}
