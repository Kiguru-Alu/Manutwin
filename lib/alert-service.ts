import { MachineHalt } from './types';

/**
 * Handles FR-6: Alerting engine checking for active stoppages exceeding the 10-minute threshold.
 */

// Threshold for alert: 10 continuous minutes (600,000 milliseconds)
// export const STOPPAGE_ALERT_THRESHOLD_MS = 10 * 60 * 1000;

//using 25s for the sake of demo 
export const STOPPAGE_ALERT_THRESHOLD_MS = 25 * 1000;

/**
 * Evaluates active machine halts to identify if any stoppage has run for more than 10 minutes.
 * Invokes the SMS alert service if the halt is active, exceeds the threshold, and hasn't been flagged.
 * 
 * @param halts - Array of active and historical MachineHalt objects.
 * @param onTriggerAlert - Callback handler that dispatches the SMS alert payload to the SMS gateway.
 * @returns Array of halts that were updated during evaluation (to save state back to database/IndexedDB).
 */
export async function evaluateHaltAlerts(
  halts: MachineHalt[],
  onTriggerAlert: (halt: MachineHalt) => Promise<boolean>
): Promise<MachineHalt[]> {
  const now = Date.now();
  const updatedHalts: MachineHalt[] = [];

  for (const halt of halts) {
    // We only alert on ongoing (active) halts where the SMS has not yet been dispatched
    if (halt.endTime === null && !halt.smsSent) {
      const activeDurationMs = now - halt.startTime;

      // Handles FR-6: Stoppage exceeds 10 continuous minutes (600,000 ms)
      if (activeDurationMs >= STOPPAGE_ALERT_THRESHOLD_MS) {
        console.warn(`Halt ${halt.id} has been active for ${activeDurationMs / 1000}s. Triggering SMS alert.`);
        
        // Dispatch the alert via HTTP or mock SMS Gateway API
        const success = await onTriggerAlert(halt);
        
        if (success) {
          // Set smsSent to true to guarantee only one SMS goes out per halt event
          updatedHalts.push({
            ...halt,
            smsSent: true,
          });
        }
      }
    }
  }

  return updatedHalts;
}

/**
 * Formats the standard SMS alert message dispatched to the plant manager.
 * 
 * @param stationName - Name of the production station (e.g. Packing Line 02)
 * @param durationMinutes - Stoppage duration in minutes
 * @returns Cleanly formatted text warning payload
 */
export function formatSMSAlertMessage(stationName: string, durationMinutes: number): string {
  return `[MANUTWIN ALERT] Machine Halt Active at ${stationName}. Duration: ${Math.floor(durationMinutes)} mins. Immediate supervisor response required.`;
}
