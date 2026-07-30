// Handles FR-3: Discriminated union for standardized downtime reason codes
export type HaltReason = 'POWER' | 'MECHANICAL' | 'JAM' | 'MAINTENANCE';

// Handles FR-1, NFR-3: User definition with roles for Operator and Supervisor/Manager access controls
export interface User {
  id: string;
  username: string;
  role: 'operator' | 'supervisor' | 'manager';
  pin?: string; // 4-digit PIN for Operator login verification
}

// Represents a physical production line station on the shop floor
export interface Station {
  id: string;
  name: string;
  baselineSpeed: number; // Baseline target packages per minute (used for FR-5 velocity drop calculations)
}

// Handles FR-2, FR-3, FR-6, NFR-3, NFR-5: Machine stoppage downtime record
export interface MachineHalt {
  id: string;
  stationId: string;
  operatorId: string;
  startTime: number;      // Epoch timestamp when halt started (recorded via FR-2 button tap)
  endTime: number | null; // Epoch timestamp when halt resolved, null if currently ongoing
  reason: HaltReason | null; // Must select exactly one code to close the halt (FR-3)
  smsSent: boolean;       // Tracks if 10-minute continuous stoppage SMS alert has fired (FR-6)
  isOffline?: boolean;    // Indicates if the log was initially recorded while offline (NFR-5)
}

// Handles FR-4, NFR-3, NFR-5: 30-minute physical output log entry
export interface ProductionLog {
  id: string;
  stationId: string;
  operatorId: string;
  timestamp: number;      // Epoch timestamp of the log submission
  packageCount: number;   // Number of physical packages finished in this 30-minute interval (FR-4)
  isOffline?: boolean;    // Indicates if the log was initially recorded while offline (NFR-5)
}

// Handles FR-6: Simulated Alert payload for Plant Manager notifications
export interface AccountAlert {
  id: string;
  haltId: string;
  timestamp: number;
  message: string;
  recipientPhone: string;
}
