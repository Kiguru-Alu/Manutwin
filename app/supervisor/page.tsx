'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Station, MachineHalt, ProductionLog } from '../../lib/types';
import { calculateLineSpeed } from '../../lib/speed-calculator';
import { evaluateHaltAlerts } from '../../lib/alert-service';
import SpeedChart from '../../components/supervisor/SpeedChart';
import DowntimeSummary from '../../components/supervisor/DowntimeSummary';
import PDFExportButton from '../../components/supervisor/PDFExportButton';
import AlertBanner from '../../components/shared/AlertBanner';
import { ArrowLeft, RefreshCw, AlertCircle, FileText } from 'lucide-react';

/**
 * Handles FR-5, FR-6, FR-7: Supervisor Dashboard.
 * Revamped using a warm cream canvas background and pure white metric cards.
 */
export default function SupervisorDashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [halts, setHalts] = useState<MachineHalt[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('s1');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [banners, setBanners] = useState<{ id: string; message: string; type: 'warning' | 'critical' }[]>([]);

  const fetchTelemetry = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/report');
      if (res.ok) {
        const data = await res.json();
        setStations(data.stations || []);
        setHalts(data.halts || []);
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to poll dashboard telemetry:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => fetchTelemetry(true), 4000);
    return () => clearInterval(interval);
  }, []);

  // 10-Minute halt checker (FR-6)
  useEffect(() => {
    if (halts.length === 0 || stations.length === 0) return;

    const alertCallback = async (halt: MachineHalt): Promise<boolean> => {
      const station = stations.find(s => s.id === halt.stationId);
      const stationName = station ? station.name : 'Unknown Line';
      const durationMin = (Date.now() - halt.startTime) / 60000;

      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            haltId: halt.id,
            stationName,
            durationMinutes: durationMin,
          }),
        });

        if (response.ok) {
          setBanners(prev => [
            ...prev,
            {
              id: `banner-${halt.id}`,
              message: `[SMS DISPATCHED] Plant Manager alerted. ${stationName} is halted for ${durationMin.toFixed(0)} continuous minutes.`,
              type: 'critical',
            },
          ]);

          await fetch('/api/halts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...halt,
              smsSent: true,
            }),
          });

          return true;
        }
      } catch (err) {
        console.error('Failed to trigger SMS alerts pipeline:', err);
      }
      return false;
    };

    evaluateHaltAlerts(halts, alertCallback);
  }, [halts, stations]);

  // Speed drop warning checker (FR-5)
  useEffect(() => {
    if (!selectedStationId || stations.length === 0) return;

    const station = stations.find(s => s.id === selectedStationId);
    if (!station) return;

    const stationLogs = logs.filter(l => l.stationId === selectedStationId);
    const speedMetrics = calculateLineSpeed(stationLogs, station.baselineSpeed);

    const bannerId = `drop-${selectedStationId}`;
    const hasBanner = banners.some(b => b.id === bannerId);

    if (speedMetrics.isDropAlert && !hasBanner) {
      setBanners(prev => [
        ...prev,
        {
          id: bannerId,
          message: `${station.name} velocity dropped to ${speedMetrics.currentSpeed} PPM (-${speedMetrics.dropPercentage}% below baseline). Response required.`,
          type: 'warning',
        },
      ]);
    } else if (!speedMetrics.isDropAlert && hasBanner) {
      setBanners(prev => prev.filter(b => b.id !== bannerId));
    }
  }, [selectedStationId, logs, stations, banners]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center font-mono text-xs font-bold">
        Polling central database nodes...
      </div>
    );
  }

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const stationLogs = logs.filter(l => l.stationId === activeStation.id);
  const stationHalts = halts.filter(h => h.stationId === activeStation.id);
  const speedMetrics = calculateLineSpeed(stationLogs, activeStation.baselineSpeed);

  return (
    <main className="min-h-screen bg-warm-cream text-charcoal flex flex-col justify-between">
      {/* Deep Charcoal Header */}
      <header className="bg-charcoal text-white p-4 md:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/" className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-black text-white text-base tracking-wide uppercase leading-none">Supervisor Hub</h1>
            <span className="text-slate-400 text-xxs block mt-1 uppercase font-bold tracking-widest">
              Live Factory Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Reports Navigation Shortcut */}
          <Link href="/supervisor/reports" className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-slate-200">
            <FileText size={14} />
            <span className="hidden sm:inline">Reports Center</span>
          </Link>

          <button
            onClick={() => fetchTelemetry()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Force refresh logs"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <PDFExportButton
            halts={stationHalts}
            stationName={activeStation.name}
          />
        </div>
      </header>

      {/* Main Grid Panels */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Dynamic Alerts Banner */}
        {banners.length > 0 && (
          <div className="space-y-3">
            {banners.map((banner) => (
              <AlertBanner
                key={banner.id}
                message={banner.message}
                type={banner.type}
                onClose={() => setBanners(prev => prev.filter(b => b.id !== banner.id))}
              />
            ))}
          </div>
        )}

        {/* Pill-Style Filter Toggles */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-border-soft max-w-md shadow-sm">
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStationId(st.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                selectedStationId === st.id
                  ? 'bg-industrial-orange text-white shadow-sm'
                  : 'text-slate-500 hover:text-charcoal hover:bg-warm-cream/80'
              }`}
            >
              {st.name.replace('Station', '').replace('Line', '').trim()}
            </button>
          ))}
        </div>

        {/* Charts & Metric Panels */}
        <div className="grid grid-cols-1 gap-6">
          <SpeedChart
            logs={stationLogs}
            baselineSpeed={activeStation.baselineSpeed}
            currentSpeed={speedMetrics.currentSpeed}
            isDropAlert={speedMetrics.isDropAlert}
            dropPercentage={speedMetrics.dropPercentage}
          />

          <DowntimeSummary
            halts={halts}
            stations={stations}
          />
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white py-4 px-6 border-t border-border-soft flex items-center justify-between text-xxs font-mono text-slate-500">
        <span>Factory: ALU Sweet Factory &bull; Kigali Campus</span>
        <span className="flex items-center space-x-1 font-bold">
          <AlertCircle size={10} className="text-industrial-orange" />
          <span>Polling Live telemetry feeds</span>
        </span>
      </footer>
    </main>
  );
}
