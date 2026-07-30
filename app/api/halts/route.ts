import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';
import { MachineHalt } from '../../../lib/types';

/**
 * Handles FR-2, FR-3: API endpoints for retrieving and recording machine halts.
 */

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.halts);
}

export async function POST(request: Request) {
  try {
    const payload: MachineHalt = await request.json();
    const db = getDb();

    // Check if this is an update to an existing halt (e.g., operator resolving it)
    const existingIndex = db.halts.findIndex(h => h.id === payload.id);

    if (existingIndex > -1) {
      // Handles FR-3: Update reason code and endTime upon resolution
      db.halts[existingIndex] = {
        ...db.halts[existingIndex],
        endTime: payload.endTime,
        reason: payload.reason,
        smsSent: payload.smsSent ?? db.halts[existingIndex].smsSent,
      };
    } else {
      // Handles FR-2: Capture new machine halt event
      db.halts.push(payload);
    }

    saveDb(db);
    return NextResponse.json({ success: true, halt: payload });
  } catch (error) {
    console.error('API halts POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
