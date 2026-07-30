import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';
import { ProductionLog } from '../../../lib/types';

/**
 * Handles FR-4: API endpoints for output counts logging.
 */

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.logs);
}

export async function POST(request: Request) {
  try {
    const payload: ProductionLog = await request.json();
    const db = getDb();

    // Check if this log has already been synced to avoid duplicates
    const exists = db.logs.some(l => l.id === payload.id);
    if (!exists) {
      db.logs.push(payload);
      saveDb(db);
    }

    return NextResponse.json({ success: true, log: payload });
  } catch (error) {
    console.error('API output POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
