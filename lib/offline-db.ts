import { get, set } from 'idb-keyval';
import { MachineHalt, ProductionLog, Station, User } from './types';

/**
 * Handles NFR-5: Wrapper for IndexedDB offline caching using `idb-keyval`.
 * Ensures shop-floor data is preserved up to 7 days in case of factory internet drop.
 */

const OFFLINE_HALTS_KEY = 'manutwin_offline_halts';
const OFFLINE_LOGS_KEY = 'manutwin_offline_logs';
const CURRENT_STATION_KEY = 'manutwin_current_station';
const CURRENT_USER_KEY = 'manutwin_current_user';
const LANGUAGE_KEY = 'manutwin_language';

/**
 * Fetches the offline halts queue.
 * @returns Promise resolving to an array of cached MachineHalt objects.
 */
export async function getOfflineHalts(): Promise<MachineHalt[]> {
  try {
    const halts = await get<MachineHalt[]>(OFFLINE_HALTS_KEY);
    return halts || [];
  } catch (error) {
    console.error('Error accessing IndexedDB for halts:', error);
    return [];
  }
}

/**
 * Appends a new machine halt to the offline IndexedDB queue.
 * @param halt - The MachineHalt record to save.
 */
export async function saveOfflineHalt(halt: MachineHalt): Promise<void> {
  // Handles NFR-5: Store logs locally during internet outages
  try {
    const current = await getOfflineHalts();
    const updated = [...current.filter(h => h.id !== halt.id), { ...halt, isOffline: true }];
    await set(OFFLINE_HALTS_KEY, updated);
  } catch (error) {
    console.error('Failed to write offline halt to IndexedDB:', error);
  }
}

/**
 * Deletes a specific machine halt from the offline queue.
 * @param id - The unique ID of the halt to remove.
 */
export async function removeOfflineHalt(id: string): Promise<void> {
  try {
    const current = await getOfflineHalts();
    const updated = current.filter(h => h.id !== id);
    await set(OFFLINE_HALTS_KEY, updated);
  } catch (error) {
    console.error('Failed to remove offline halt from IndexedDB:', error);
  }
}

/**
 * Clears all cached machine halts.
 */
export async function clearOfflineHalts(): Promise<void> {
  try {
    await set(OFFLINE_HALTS_KEY, []);
  } catch (error) {
    console.error('Failed to clear offline halts:', error);
  }
}

/**
 * Fetches the offline production logs queue.
 * @returns Promise resolving to an array of cached ProductionLog objects.
 */
export async function getOfflineLogs(): Promise<ProductionLog[]> {
  try {
    const logs = await get<ProductionLog[]>(OFFLINE_LOGS_KEY);
    return logs || [];
  } catch (error) {
    console.error('Error accessing IndexedDB for logs:', error);
    return [];
  }
}

/**
 * Appends a production count record to the offline IndexedDB queue.
 * @param log - The ProductionLog record to save.
 */
export async function saveOfflineLog(log: ProductionLog): Promise<void> {
  // Handles NFR-5: Queue package counts locally when backend is unreachable
  try {
    const current = await getOfflineLogs();
    const updated = [...current.filter(l => l.id !== log.id), { ...log, isOffline: true }];
    await set(OFFLINE_LOGS_KEY, updated);
  } catch (error) {
    console.error('Failed to write offline log to IndexedDB:', error);
  }
}

/**
 * Deletes a specific production log from the offline queue.
 * @param id - The unique ID of the log to remove.
 */
export async function removeOfflineLog(id: string): Promise<void> {
  try {
    const current = await getOfflineLogs();
    const updated = current.filter(l => l.id !== id);
    await set(OFFLINE_LOGS_KEY, updated);
  } catch (error) {
    console.error('Failed to remove offline log from IndexedDB:', error);
  }
}

/**
 * Clears all cached production logs.
 */
export async function clearOfflineLogs(): Promise<void> {
  try {
    await set(OFFLINE_LOGS_KEY, []);
  } catch (error) {
    console.error('Failed to clear offline logs:', error);
  }
}

/**
 * Persists selected station in local index DB to recover context on reload.
 */
export async function getSelectedStation(): Promise<Station | null> {
  return (await get<Station>(CURRENT_STATION_KEY)) || null;
}

export async function setSelectedStation(station: Station | null): Promise<void> {
  await set(CURRENT_STATION_KEY, station);
}

/**
 * Persists logged-in user in IndexedDB to support offline session persistence.
 */
export async function getCurrentUser(): Promise<User | null> {
  return (await get<User>(CURRENT_USER_KEY)) || null;
}

export async function setCurrentUser(user: User | null): Promise<void> {
  await set(CURRENT_USER_KEY, user);
}

/**
 * Handles NFR-4: Get language preference
 */
export async function getLanguage(): Promise<'en' | 'sw' | 'rw'> {
  return (await get<'en' | 'sw' | 'rw'>(LANGUAGE_KEY)) || 'en';
}

/**
 * Handles NFR-4: Save language preference
 */
export async function setLanguage(lang: 'en' | 'sw' | 'rw'): Promise<void> {
  await set(LANGUAGE_KEY, lang);
}
