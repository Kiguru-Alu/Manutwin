import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';
import { AccountAlert } from '../../../lib/types';
import { formatSMSAlertMessage } from '../../../lib/alert-service';

/**
 * Handles FR-6: SMS Alert Dispatch API route.
 * Logs the generated alert to console (simulating SMS delivery) and stores it in db.json.
 */

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.alerts);
}

export async function POST(request: Request) {
  try {
    const { haltId, stationName, durationMinutes } = await request.json();
    const db = getDb();

    // Default target: Plant Manager phone number (ALU manufacturing protocol)
    const plantManagerPhone = '+250788123456';
    const message = formatSMSAlertMessage(stationName || 'Mixing Line 01', durationMinutes || 10);

    const alertRecord: AccountAlert = {
      id: `alert-${Date.now()}`,
      haltId,
      timestamp: Date.now(),
      message,
      recipientPhone: plantManagerPhone,
    };

    // Store in DB for reporting audit
    db.alerts.push(alertRecord);
    saveDb(db);

    // handles FR-6: SMS trigger simulation print logging
    console.log('====================================================');
    console.log(`[SMS DISPATCH SIMULATION] Sent to: ${plantManagerPhone}`);
    console.log(`Message: "${message}"`);
    console.log(`Time: ${new Date().toLocaleString()} (CAT)`);
    console.log('====================================================');

    return NextResponse.json({ success: true, alert: alertRecord });
  } catch (error) {
    console.error('API alerts POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
