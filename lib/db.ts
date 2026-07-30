import fs from 'fs';
import path from 'path';
import { MachineHalt, ProductionLog, Station, User, AccountAlert } from './types';

/**
 * Server-side database wrapper for the Manutwin prototype.
 * Provides file-system persistence locally with a graceful in-memory
 * fallback for serverless environments (e.g., Vercel read-only filesystem).
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

// In-memory cache fallback for serverless runtimes (Vercel)
let memoryDb: DatabaseSchema | null = null;

/**
 * Reads the database state, falling back gracefully if running in serverless environments.
 */
export function getDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      memoryDb = DEFAULT_DB;
      return DEFAULT_DB;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    memoryDb = JSON.parse(data);
    return memoryDb!;
  } catch (error) {
    // Falls back gracefully on Vercel read-only environments
    memoryDb = memoryDb || JSON.parse(JSON.stringify(DEFAULT_DB));
    return memoryDb!;
  }
}

/**
 * Saves database state to disk locally, and updates in-memory cache for serverless runtimes.
 */
export function saveDb(db: DatabaseSchema): void {
  memoryDb = db;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    // Disk write skipped on Vercel read-only filesystem; memoryDb holds the state
  }
}