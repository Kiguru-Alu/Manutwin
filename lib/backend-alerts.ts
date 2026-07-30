import { getDb, saveDb } from './db';
import { evaluateHaltAlerts, formatSMSAlertMessage } from './alert-service';
import { MachineHalt, AccountAlert } from './types';

/**
 * Handles FR-6: Server-side check and trigger for machine halts exceeding the downtime threshold.
 * Runs on backend API requests to ensure alert dispatching is independent of active dashboard browser tabs.
 */
export async function checkAndTriggerBackendAlerts(): Promise<void> {
  // Use a try-catch block to run safely without breaking database retrieval if file access errors occur
  try {
    const db = getDb();
    
    if (!db.halts || db.halts.length === 0) return;

    // Define the callback that gets executed if a halt exceeds the 25-second (demo) threshold
    const onTriggerAlert = async (halt: MachineHalt): Promise<boolean> => {
      const station = db.stations.find(s => s.id === halt.stationId);
      const stationName = station ? station.name : 'Unknown Production Line';
      
      // Calculate duration in minutes
      const activeDurationMin = (Date.now() - halt.startTime) / 60000;
      
      const plantManagerPhone = '+250788123456';
      const message = formatSMSAlertMessage(stationName, activeDurationMin);

      const alertRecord: AccountAlert = {
        id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        haltId: halt.id,
        timestamp: Date.now(),
        message,
        recipientPhone: plantManagerPhone
      };

      // Record alert in the database logs (for reporting auditing)
      db.alerts.push(alertRecord);

      // Log simulated SMS dispatch payload to console
      console.log('====================================================');
      console.log(`[SERVER SMS DISPATCH SIMULATION] Sent to: ${plantManagerPhone}`);
      console.log(`Message: "${message}"`);
      console.log(`Duration Checked: ${activeDurationMin.toFixed(2)} minutes`);
      console.log(`Time: ${new Date().toLocaleString()} (CAT)`);
      console.log('====================================================');

      return true;
    };

    // Run the evaluation logic. Returns halls that were updated (marked smsSent = true)
    const updatedHalts = await evaluateHaltAlerts(db.halts, onTriggerAlert);

    if (updatedHalts.length > 0) {
      // Merge updated halts back into db.halts
      db.halts = db.halts.map(h => {
        const updated = updatedHalts.find(uh => uh.id === h.id);
        return updated ? { ...h, smsSent: true } : h;
      });

      // Save database changes
      saveDb(db);
    }
  } catch (error) {
    console.error('Error running backend alerts evaluation engine:', error);
  }
}
