'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MachineHalt, ProductionLog, Station, User, HaltReason } from '../../lib/types';
import {
  getCurrentUser,
  getSelectedStation,
  setCurrentUser,
  setSelectedStation,
  getLanguage,
  setLanguage,
  saveOfflineHalt,
  saveOfflineLog
} from '../../lib/offline-db';
import { translate, LanguageCode } from '../../lib/i18n';
import StationHeader from '../../components/operator/StationHeader';
import HaltButton from '../../components/operator/HaltButton';
import ReasonModal from '../../components/operator/ReasonModal';
import OutputCounter from '../../components/operator/OutputCounter';

/**
 * Handles FR-1, FR-2, FR-3, FR-4, NFR-3, NFR-4, NFR-5: Station Operator Terminal.
 * Revamped using white-card container styles and high-contrast diagnostic indicators.
 */
export default function OperatorPage() {
  const router = useRouter();
  const [station, setStation] = useState<Station | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState<boolean>(true);

  const [activeHalt, setActiveHalt] = useState<MachineHalt | null>(null);
  const [recentLogs, setRecentLogs] = useState<ProductionLog[]>([]);
  const [recentHalts, setRecentHalts] = useState<MachineHalt[]>([]);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadSession() {
      const activeUser = await getCurrentUser();
      const activeStation = await getSelectedStation();
      const savedLang = await getLanguage();

      if (!activeUser || !activeStation) {
        router.push('/operator/login');
        return;
      }

      setUser(activeUser);
      setStation(activeStation);
      setLang(savedLang);

      try {
        const reportRes = await fetch('/api/report');
        if (reportRes.ok) {
          const reportData = await reportRes.json();
          
          const stationLogs: ProductionLog[] = (reportData.logs || []).filter(
            (l: ProductionLog) => l.stationId === activeStation.id
          );
          const stationHalts: MachineHalt[] = (reportData.halts || []).filter(
            (h: MachineHalt) => h.stationId === activeStation.id
          );

          setRecentLogs(stationLogs.sort((a, b) => b.timestamp - a.timestamp));
          setRecentHalts(stationHalts.filter(h => h.endTime !== null).sort((a, b) => b.startTime - a.startTime));

          const ongoing = stationHalts.find(h => h.endTime === null);
          if (ongoing) {
            setActiveHalt(ongoing);
          }
        }
      } catch (err) {
        console.warn('Failed to load online data, checking offline IndexedDB queues:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleChangeLanguage = async (newLang: LanguageCode) => {
    setLang(newLang);
    await setLanguage(newLang);
  };

  const handleLogout = async () => {
    await setCurrentUser(null);
    await setSelectedStation(null);
    router.push('/operator/login');
  };

  const handleTriggerHalt = async () => {
    if (!station || !user) return;

    const haltRecord: MachineHalt = {
      id: `halt-${Date.now()}`,
      stationId: station.id,
      operatorId: user.id,
      startTime: Date.now(),
      endTime: null,
      reason: null,
      smsSent: false,
    };

    setActiveHalt(haltRecord);
    await saveOfflineHalt(haltRecord);

    try {
      const response = await fetch('/api/halts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(haltRecord),
      });

      if (!response.ok) {
        console.warn('Server failed to record halt, preserved in IndexedDB queue.');
      }
    } catch (error) {
      console.warn('Network failure during halt logging, cached locally.');
    }
  };

  const handleResolveHaltRequest = () => {
    setIsReasonModalOpen(true);
  };

  const handleSelectReason = async (selectedReason: HaltReason) => {
    if (!activeHalt || !station) return;

    const resolvedRecord: MachineHalt = {
      ...activeHalt,
      endTime: Date.now(),
      reason: selectedReason,
    };

    setIsReasonModalOpen(false);
    setActiveHalt(null);
    setRecentHalts(prev => [resolvedRecord, ...prev]);

    await saveOfflineHalt(resolvedRecord);

    try {
      const response = await fetch('/api/halts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolvedRecord),
      });

      if (!response.ok) {
        console.warn('Server failed to resolve halt, preserved in IndexedDB queue.');
      }
    } catch (error) {
      console.warn('Network failure during halt resolution, cached locally.');
    }
  };

  const handleSubmitOutput = async (count: number) => {
    if (!station || !user) return;

    const outputLog: ProductionLog = {
      id: `log-${Date.now()}`,
      stationId: station.id,
      operatorId: user.id,
      timestamp: Date.now(),
      packageCount: count,
    };

    setRecentLogs(prev => [outputLog, ...prev]);
    await saveOfflineLog(outputLog);

    try {
      const response = await fetch('/api/output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outputLog),
      });

      if (!response.ok) {
        console.warn('Server failed to log output, preserved in IndexedDB queue.');
      }
    } catch (error) {
      console.warn('Network failure during output logging, cached locally.');
    }
  };

  if (loading || !station || !user) {
    return (
      <div className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center font-mono text-xs font-bold">
        Booting operator terminal workstation...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-warm-cream text-charcoal flex flex-col justify-between">
      <StationHeader
        operatorName={user.username}
        stationName={station.name}
        currentLang={lang}
        onChangeLanguage={handleChangeLanguage}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Hand: operator panel */}
        <div className="space-y-6">
          <HaltButton
            isHalted={!!activeHalt}
            activeHaltStartTime={activeHalt ? activeHalt.startTime : null}
            onTriggerHalt={handleTriggerHalt}
            onResolveHalt={handleResolveHaltRequest}
            lang={lang}
          />

          <OutputCounter
            onSubmitOutput={handleSubmitOutput}
            lang={lang}
          />
        </div>

        {/* Right Hand: Shift review list */}
        <div className="bg-white border border-border-soft p-6 rounded-2xl space-y-6 h-full md:max-h-[640px] overflow-y-auto shadow-sm">
          <div>
            <h3 className="font-black text-charcoal text-sm uppercase tracking-wide">
              {translate(lang, 'shift_summary')}
            </h3>
            <p className="text-slate-500 text-xs font-semibold">
              Review current logged items. Historic logs are append-only.
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Production logs */}
            <div className="space-y-2">
              <span className="text-slate-400 text-xxs font-black tracking-widest uppercase block">
                {translate(lang, 'packages_logged')}
              </span>
              {recentLogs.length === 0 ? (
                <div className="text-slate-400 text-xs font-mono py-2 italic">
                  No packages logged.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.slice(0, 5).map((l) => (
                    <div key={l.id} className="p-3 bg-warm-cream rounded-xl border border-border-soft flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-charcoal">+{l.packageCount} units</span>
                      <span className="text-slate-400">
                        {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Downtime halts */}
            <div className="space-y-2">
              <span className="text-slate-400 text-xxs font-black tracking-widest uppercase block">
                {translate(lang, 'downtime_minutes')}
              </span>
              {recentHalts.length === 0 ? (
                <div className="text-slate-400 text-xs font-mono py-2 italic">
                  No downtime halts recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentHalts.slice(0, 5).map((h) => {
                    const elapsedMin = h.endTime ? ((h.endTime - h.startTime) / 60000).toFixed(1) : '0.0';
                    return (
                      <div key={h.id} className="p-3 bg-warm-cream rounded-xl border border-border-soft flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-industrial-orange font-black uppercase">{h.reason}</span>
                        <span className="text-charcoal">{elapsedMin} Mins</span>
                        <span className="text-slate-400">
                          {new Date(h.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <ReasonModal
        isOpen={isReasonModalOpen}
        onSelectReason={handleSelectReason}
        onClose={() => setIsReasonModalOpen(false)}
        lang={lang}
      />
    </main>
  );
}
