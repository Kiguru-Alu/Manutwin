'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Station, User } from '../../../lib/types';
import { getSelectedStation, setSelectedStation, setCurrentUser, getCurrentUser } from '../../../lib/offline-db';
import { ArrowLeft, Monitor, KeyRound } from 'lucide-react';
import Link from 'next/link';

/**
 * Handles FR-1: Operator Station PIN Login Page.
 * Styled using high-contrast numeric keys on a warm cream canvas background.
 */
export default function OperatorLoginPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      try {
        const cachedUser = await getCurrentUser();
        const cachedStation = await getSelectedStation();
        
        if (cachedUser && cachedStation) {
          router.push('/operator');
          return;
        }

        const res = await fetch('/api/report');
        if (res.ok) {
          const data = await res.json();
          setStations(data.stations || []);
          
          const mockUsers: User[] = [
            { id: 'u1', username: 'Brian Mahui', role: 'operator', pin: '1234' },
            { id: 'u2', username: 'Kamanzi Jean', role: 'operator', pin: '4321' },
            { id: 'u3', username: 'Kamau Njoroge', role: 'operator', pin: '5678' }
          ];
          setUsers(mockUsers);
        }
      } catch (err) {
        console.error('Failed to load login meta:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

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
    if (!selectedStationId) {
      setErrorMsg('Please select a production station.');
      return;
    }

    if (pin.length !== 4) {
      setErrorMsg('PIN must be exactly 4 digits.');
      return;
    }

    const authenticatedUser = users.find(u => u.pin === pin);

    if (authenticatedUser) {
      const station = stations.find(s => s.id === selectedStationId);
      if (station) {
        await setSelectedStation(station);
        await setCurrentUser({
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          role: authenticatedUser.role,
        });

        router.push('/operator');
      }
    } else {
      setErrorMsg('Invalid operator PIN. Access denied.');
      setPin('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center font-mono text-xs font-bold">
        Initializing operator terminal portal...
      </div>
    );
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <main className="min-h-screen bg-warm-cream text-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border-soft p-6 rounded-2xl space-y-6 shadow-md relative">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-charcoal transition-colors">
          <ArrowLeft size={12} />
          <span>Back to Launcher</span>
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-lg font-black uppercase text-charcoal tracking-wider">Operator Login</h1>
          <p className="text-xs text-slate-500 font-medium">Select station and verify credentials (FR-1)</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-center animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Station Selection */}
          <div className="space-y-2">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wider block">
              Production Station
            </label>
            <div className="relative">
              <select
                value={selectedStationId}
                onChange={(e) => {
                  setSelectedStationId(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-white border border-border-soft rounded-xl px-4 py-3.5 text-sm font-semibold text-charcoal outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-industrial-orange/20"
              >
                <option value="">-- Choose Assigned Line --</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <Monitor size={16} />
              </div>
            </div>
          </div>

          {/* PIN Input Display */}
          <div className="space-y-2">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wider block">
              Enter 4-Digit Security PIN
            </label>
            <div className="relative flex items-center justify-center bg-warm-cream border border-border-soft py-3.5 rounded-xl text-3xl tracking-widest font-mono font-black text-charcoal h-[60px]">
              {pin ? '• '.repeat(pin.length).trim() : <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Keypad Entry</span>}
              <div className="absolute right-4 text-slate-400">
                <KeyRound size={16} />
              </div>
            </div>
          </div>

          {/* Touch Pad Grid (NFR-6) */}
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

          {/* Confirm Button */}
          <button
            onClick={handleLogin}
            disabled={pin.length !== 4 || !selectedStationId}
            className={`w-full py-4 rounded-xl text-white font-black text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none focus:ring-4 focus:ring-industrial-orange/20 ${
              pin.length === 4 && selectedStationId
                ? 'bg-industrial-orange hover:bg-industrial-orange/95 shadow-md shadow-industrial-orange/10 active:scale-98'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            Access Station Terminal
          </button>
        </div>
      </div>
    </main>
  );
}
