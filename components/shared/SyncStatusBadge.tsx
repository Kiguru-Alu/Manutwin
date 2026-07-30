'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { registerSyncListeners } from '../../lib/sync-engine';
import { getOfflineHalts, getOfflineLogs } from '../../lib/offline-db';

/**
 * Handles NFR-5: Sync Status Badge.
 * Styled using high-contrast pills suitable for a cream background canvas.
 */
export default function SyncStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle');
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(window.navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cleanupSync = registerSyncListeners((status) => {
      setSyncStatus(status);
      updatePendingCount();
    });

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupSync();
      clearInterval(interval);
    };
  }, []);

  const updatePendingCount = async () => {
    const halts = await getOfflineHalts();
    const logs = await getOfflineLogs();
    setPendingCount(halts.length + logs.length);
  };

  if (!isOnline) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-industrial-orange/10 text-industrial-orange border border-industrial-orange/20 text-xs font-bold animate-pulse shadow-sm">
        <WifiOff size={14} />
        <span>OFFLINE {pendingCount > 0 && `(${pendingCount} pending)`}</span>
      </div>
    );
  }

  if (syncStatus === 'syncing' || pendingCount > 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold shadow-sm">
        <RefreshCw size={14} className="animate-spin" />
        <span>SYNCING ({pendingCount} items)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold shadow-sm">
      <Wifi size={14} />
      <span>ONLINE / SYNCED</span>
    </div>
  );
}
