import {
  getOfflineHalts,
  getOfflineLogs,
  removeOfflineHalt,
  removeOfflineLog
} from './offline-db';

/**
 * Handles NFR-5: Synchronization Engine.
 * Automatically synchronizes cached offline operations to the central cloud database when connectivity is restored.
 */

let isSyncing = false;

/**
 * Iterates through cached offline halts and production logs, attempting to post them to the database.
 * Deletes items from the offline cache only after a successful server response.
 */
export async function syncOfflineData(onSyncStatusChange?: (status: 'idle' | 'syncing' | 'completed' | 'failed') => void): Promise<void> {
  if (isSyncing) return;
  
  // Skip if we are running server-side or if the client is offline
  if (typeof window === 'undefined' || !window.navigator.onLine) {
    if (onSyncStatusChange) onSyncStatusChange('failed');
    return;
  }

  const offlineHalts = await getOfflineHalts();
  const offlineLogs = await getOfflineLogs();

  if (offlineHalts.length === 0 && offlineLogs.length === 0) {
    if (onSyncStatusChange) onSyncStatusChange('idle');
    return;
  }

  isSyncing = true;
  if (onSyncStatusChange) onSyncStatusChange('syncing');
  let hasFailed = false;

  console.log(`Starting sync engine: processing ${offlineHalts.length} halts and ${offlineLogs.length} logs.`);

  // 1. Synchronize Offline Machine Halts
  for (const halt of offlineHalts) {
    try {
      const response = await fetch('/api/halts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(halt),
      });

      if (response.ok) {
        // Remove item from cache only on successful sync
        await removeOfflineHalt(halt.id);
      } else {
        hasFailed = true;
        console.error(`Failed to sync halt ${halt.id}: Server returned status ${response.status}`);
      }
    } catch (error) {
      hasFailed = true;
      console.error(`Failed to sync halt ${halt.id}: Network connection failure`, error);
    }
  }

  // 2. Synchronize Offline Production Logs
  for (const log of offlineLogs) {
    try {
      const response = await fetch('/api/output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });

      if (response.ok) {
        await removeOfflineLog(log.id);
      } else {
        hasFailed = true;
        console.error(`Failed to sync log ${log.id}: Server returned status ${response.status}`);
      }
    } catch (error) {
      hasFailed = true;
      console.error(`Failed to sync log ${log.id}: Network connection failure`, error);
    }
  }

  isSyncing = false;
  
  if (onSyncStatusChange) {
    onSyncStatusChange(hasFailed ? 'failed' : 'completed');
    // Set status back to idle after a brief delay if successful
    if (!hasFailed) {
      setTimeout(() => onSyncStatusChange('idle'), 2000);
    }
  }
}

/**
 * Initializes listeners for online state detection.
 * @param callback - Event handler triggered when offline queues are synced.
 */
export function registerSyncListeners(callback: (status: 'idle' | 'syncing' | 'completed' | 'failed') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    syncOfflineData(callback);
  };

  window.addEventListener('online', handleOnline);
  
  // Perform immediate initial check if online
  if (window.navigator.onLine) {
    syncOfflineData(callback);
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
