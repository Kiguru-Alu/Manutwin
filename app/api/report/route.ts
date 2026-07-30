import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { checkAndTriggerBackendAlerts } from '../../../lib/backend-alerts';

/**
 * Handles FR-7: API route for aggregating reporting telemetry.
 * Serves active database snapshots for dashboard visualizations and PDF compiling.
 */

export async function GET() {
  await checkAndTriggerBackendAlerts();
  const db = getDb();
  return NextResponse.json({
    stations: db.stations,
    halts: db.halts,
    logs: db.logs,
    alerts: db.alerts,
    users: db.users.map(u => ({ id: u.id, username: u.username, role: u.role })), // Omit PIN hashes for basic security
  });
}
