import fs from 'fs';
import path from 'path';
import { MachineHalt, ProductionLog, Station, User, AccountAlert } from './types';

/**
 * Server-side local JSON file database for the Manutwin prototype.
 * Provides persistence for halts, logs, alerts, stations, and users.
 */

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  stations: Station[];
  halts: MachineHalt[];
  logs: ProductionLog[];
  alerts: AccountAlert[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    { id: 'u1', username: 'Brian Mahui', role: 'operator', pin: '1234' },
    { id: 'u2', username: 'Kamanzi Jean', role: 'operator', pin: '4321' },
    { id: 'u3', username: 'Kamau Njoroge', role: 'operator', pin: '5678' },
    { id: 'u4', username: 'Alice Umutoni', role: 'supervisor', pin: '0000' }
  ],
  stations: [
    { id: 's1', name: 'Mixing Station 01', baselineSpeed: 10 },
    { id: 's2', name: 'Packing Line 02', baselineSpeed: 15 },
    { id: 's3', name: 'Bottling Unit 03', baselineSpeed: 8 }
  ],
  halts: [],
  logs: [],
  alerts: []
};

/**
 * Initializes and reads the JSON file database.
 */
export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read local DB:', error);
    return DEFAULT_DB;
  }
}

/**
 * Saves database state back to the local JSON file.
 * @param db - The database state to write.
 */
export function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save local DB:', error);
  }
}
