'use client';

import React, { useEffect, useState } from 'react';
import { MachineHalt, HaltReason, Station } from '../../lib/types';
import { AlertTriangle, Clock } from 'lucide-react';

interface DowntimeSummaryProps {
  halts: MachineHalt[];
  stations: Station[];
}

/**
 * Handles FR-3, FR-6: Aggregate downtime metrics and render active factory floor machine halts.
 * Restyled with a white-card profile and high-contrast diagnostic badges.
 */
export default function DowntimeSummary({ halts, stations }: DowntimeSummaryProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getStationName = (id: string) => {
    return stations.find(s => s.id === id)?.name || 'Unknown Station';
  };

  const reasonStats: Record<HaltReason, { durationMin: number; count: number }> = {
    POWER: { durationMin: 0, count: 0 },
    MECHANICAL: { durationMin: 0, count: 0 },
    JAM: { durationMin: 0, count: 0 },
    MAINTENANCE: { durationMin: 0, count: 0 },
  };

  halts.forEach((halt) => {
    if (halt.reason && reasonStats[halt.reason]) {
      const end = halt.endTime || now;
      const durationMs = end - halt.startTime;
      const durationMins = durationMs / (1000 * 60);

      reasonStats[halt.reason].count += 1;
      reasonStats[halt.reason].durationMin += durationMins;
    }
  });

  const activeHalts = halts.filter(h => h.endTime === null);

  const getReasonBadgeStyle = (reason: HaltReason) => {
    switch (reason) {
      case 'POWER': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MECHANICAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'JAM': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MAINTENANCE': return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Reason breakdown card */}
      <div className="lg:col-span-2 bg-white border border-border-soft p-6 rounded-2xl space-y-4 shadow-sm text-charcoal">
        <div>
          <h3 className="font-black text-charcoal text-base uppercase tracking-wide">Downtime Grouped by Reason</h3>
          <p className="text-slate-500 text-xs mt-0.5">Total cumulative minutes and count since startup (FR-3)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(reasonStats) as HaltReason[]).map((reason) => {
            const stats = reasonStats[reason];
            return (
              <div key={reason} className="p-4 rounded-xl bg-warm-cream border border-border-soft flex items-center justify-between shadow-sm">
                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-xxs font-black tracking-wider uppercase border ${getReasonBadgeStyle(reason)}`}>
                    {reason}
                  </span>
                  <span className="text-slate-500 text-xs block mt-3 font-semibold">
                    {stats.count} occurrences
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-charcoal font-mono block">
                    {stats.durationMin.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-xxs block font-black uppercase tracking-widest mt-0.5">
                    Minutes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active stoppages card */}
      <div className="bg-white border border-border-soft p-6 rounded-2xl space-y-4 shadow-sm text-charcoal flex flex-col justify-between">
        <div>
          <h3 className="font-black text-charcoal text-base uppercase tracking-wide flex items-center space-x-2">
            <span className="h-2.5 w-2.5 bg-industrial-orange rounded-full animate-ping"></span>
            <span>Active Stoppages</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Current lines experiencing halt conditions (FR-2, FR-6)</p>
        </div>

        <div className="space-y-3 max-h-[220px] overflow-y-auto mt-4 pr-1 flex-1">
          {activeHalts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-border-soft rounded-xl bg-warm-cream/50">
              All production lines operating normally.
            </div>
          ) : (
            activeHalts.map((halt) => {
              const elapsedSecs = Math.floor((now - halt.startTime) / 1000);
              const isOverLimit = elapsedSecs >= 600; // 10 minutes

              return (
                <div
                  key={halt.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                    isOverLimit
                      ? 'bg-orange-50 border-industrial-orange/40 text-industrial-orange animate-pulse'
                      : 'bg-warm-cream border-border-soft text-charcoal'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-black text-xs block uppercase">{getStationName(halt.stationId)}</span>
                    <span className="text-xxs text-slate-500 font-mono block font-medium">
                      Started: {new Date(halt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black block">
                      {Math.floor(elapsedSecs / 60)}m {elapsedSecs % 60}s
                    </span>
                    {isOverLimit && (
                      <span className="text-industrial-orange text-xxs font-black flex items-center space-x-0.5 uppercase tracking-wider mt-0.5">
                        <AlertTriangle size={10} />
                        <span>SMS ALARMED</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
