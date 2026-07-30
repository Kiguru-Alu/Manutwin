import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

/**
 * Handles FR-7: API route for aggregating reporting telemetry.
 * Serves active database snapshots for dashboard visualizations and PDF compiling.
 */

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    stations: db.stations,
    halts: db.halts,
    logs: db.logs,
    users: db.users.map(u => ({ id: u.id, username: u.username, role: u.role })), // Omit PIN hashes for basic security
  });
}
