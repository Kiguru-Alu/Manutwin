'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Station, MachineHalt, AccountAlert } from '../../../lib/types';
import { generateWeeklyPDFReport } from '../../../lib/pdf-generator';
import { ArrowLeft, FileText, Download, Calendar, MailWarning, Lock } from 'lucide-react';

/**
 * Handles FR-7: Supervisor Reports Center.
 * Styled using a clean white-card summary theme with primary industrial orange selectors.
 */
export default function SupervisorReportsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [halts, setHalts] = useState<MachineHalt[]>([]);
  const [alerts, setAlerts] = useState<AccountAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadReportData() {
      try {
        const reportRes = await fetch('/api/report');
        const alertRes = await fetch('/api/alerts');
        if (reportRes.ok && alertRes.ok) {
          const reportData = await reportRes.json();
          const alertData = await alertRes.json();
          setStations(reportData.stations || []);
          setHalts(reportData.halts || []);
          setAlerts(alertData || []);
        }
      } catch (error) {
        console.error('Failed to load reports page data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  const triggerPDFDownload = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    const stationName = station ? station.name : 'All Stations';
    const stationHalts = halts.filter(h => h.stationId === stationId);
    generateWeeklyPDFReport(stationHalts, stationName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center font-mono text-xs font-bold">
        Compiling reports payload...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-warm-cream text-charcoal flex flex-col justify-between">
      {/* Header */}
      <header className="bg-charcoal text-white p-4 md:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/supervisor" className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-black text-white text-base tracking-wide uppercase leading-none">Reports Center</h1>
            <span className="text-slate-400 text-xxs block mt-1 uppercase font-bold tracking-widest">
              Weekly PDF Compiler & Audit Logs
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Lock Portal button */}
          <button
            onClick={() => {
              sessionStorage.removeItem('manutwin_supervisor_user');
              window.location.reload();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
            title="Lock Portal"
          >
            <Lock size={14} />
            <span className="hidden sm:inline">Lock Portal</span>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* PDF Reports Section */}
        <section className="space-y-4">
          <div>
            <h2 className="font-black text-charcoal text-base uppercase tracking-wide">Weekly Downtime Reports Compiler</h2>
            <p className="text-slate-500 text-xs">Generate Friday 17:00 CAT reports grouped by downtime reason codes (FR-7)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.map((st) => {
              const stationHalts = halts.filter(h => h.stationId === st.id);
              const totalMins = stationHalts.reduce((sum, h) => {
                const end = h.endTime || Date.now();
                return sum + (end - h.startTime) / 60000;
              }, 0);

              return (
                <div key={st.id} className="p-6 bg-white border border-border-soft rounded-2xl flex flex-col justify-between h-[180px] shadow-sm">
                  <div className="space-y-2">
                    <span className="h-8 w-8 rounded-lg bg-industrial-orange/10 text-industrial-orange flex items-center justify-center">
                      <FileText size={16} />
                    </span>
                    <h3 className="font-bold text-charcoal text-sm">{st.name}</h3>
                    <span className="text-slate-500 text-xs block font-mono">
                      Accumulated: {totalMins.toFixed(0)} downtime minutes
                    </span>
                  </div>

                  <button
                    onClick={() => triggerPDFDownload(st.id)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-industrial-orange hover:bg-industrial-orange/95 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-industrial-orange"
                  >
                    <Download size={12} />
                    <span>Download PDF</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SMS Gateway Audits */}
        <section className="space-y-4">
          <div>
            <h2 className="font-black text-charcoal text-base uppercase tracking-wide">SMS Gateway Dispatch Audit</h2>
            <p className="text-slate-500 text-xs">Audit log record of 10-minute continuous machine halt alert triggers (FR-6)</p>
          </div>

          <div className="bg-white border border-border-soft rounded-2xl overflow-hidden shadow-sm">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs border-dashed border-border-soft bg-warm-cream/30">
                No SMS alerts triggered in this system cycle.
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {alerts.sort((a, b) => b.timestamp - a.timestamp).map((alert) => (
                  <div key={alert.id} className="p-4 flex items-start space-x-4 text-xs font-mono">
                    <span className="p-2 rounded-lg bg-industrial-orange/10 text-industrial-orange shrink-0">
                      <MailWarning size={16} />
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Recipient: {alert.recipientPhone}</span>
                        <span className="text-slate-400 flex items-center space-x-1">
                          <Calendar size={10} />
                          <span>{new Date(alert.timestamp).toLocaleString()} CAT</span>
                        </span>
                      </div>
                      <p className="text-slate-600 bg-warm-cream p-2.5 rounded-lg border border-border-soft mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      <footer className="bg-white py-4 px-6 border-t border-border-soft flex items-center justify-between text-xxs font-mono text-slate-500">
        <span>Factory: ALU Sweet Factory &bull; Kigali Campus</span>
        <span>Audited in CAT Time Zone</span>
      </footer>
    </main>
  );
}
