import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

/**
 * Handles NFR-3: Secure supervisor authentication endpoint.
 * Validates a 4-digit PIN against users with 'supervisor' or 'manager' roles in the database.
 */
export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, error: 'PIN must be a string' }, { status: 400 });
    }

    const db = getDb();
    
    // Search database for supervisor/manager with matching PIN
    const match = db.users.find(
      u => (u.role === 'supervisor' || u.role === 'manager') && u.pin === pin
    );

    if (match) {
      return NextResponse.json({
        success: true,
        user: {
          id: match.id,
          username: match.username,
          role: match.role
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid supervisor PIN.' }, { status: 401 });
  } catch (error) {
    console.error('Supervisor PIN authentication failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
