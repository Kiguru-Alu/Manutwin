import { ProductionLog } from './types';

/**
 * Handles FR-5: Mathematical operations for line speed velocity calculation and drop anomaly alerts.
 */

/**
 * Calculates the current line speed (packages per minute) based on the latest logs and detects drops.
 * 
 * @param logs - Array of ProductionLog entries recorded for the station.
 * @param baselineSpeed - Benchmark speed target (packages per minute) for the station.
 * @returns An object containing the current speed, drop percentage, and warning flag.
 */
export function calculateLineSpeed(
  logs: ProductionLog[],
  baselineSpeed: number
): {
  currentSpeed: number;
  dropPercentage: number;
  isDropAlert: boolean;
} {
  // Handles FR-5: If no production output logs exist, line speed is effectively 0
  if (logs.length === 0 || baselineSpeed <= 0) {
    return {
      currentSpeed: 0,
      dropPercentage: 100,
      isDropAlert: true,
    };
  }

  // Sort logs by descending timestamp to evaluate the most recent production interval
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const latestLog = sortedLogs[0];

  // In Manutwin, operators log output counts every 30 minutes (1800 seconds).
  // If we calculate packages per minute for the latest log interval:
  const intervalMinutes = 30;
  const currentSpeed = latestLog.packageCount / intervalMinutes; // packages per minute

  // Calculate drop percentage relative to the station's baseline benchmark
  const speedDifference = baselineSpeed - currentSpeed;
  const dropPercentage = speedDifference > 0 ? (speedDifference / baselineSpeed) * 100 : 0;

  // Handles FR-5/Hypothesis: Flag line speed drop of more than 10%
  const isDropAlert = dropPercentage > 10;

  return {
    currentSpeed: Math.max(0, parseFloat(currentSpeed.toFixed(2))),
    dropPercentage: Math.max(0, parseFloat(dropPercentage.toFixed(1))),
    isDropAlert,
  };
}

/**
 * Calculates hourly or historical speed trends for chart rendering.
 * Groups outputs in chronological order.
 * 
 * @param logs - Chronological production logs.
 * @returns Array of data points suited for Recharts line chart visualization.
 */
export function getSpeedTrendData(logs: ProductionLog[]): { time: string; speed: number; count: number }[] {
  // Sort logs oldest to newest for Recharts chronological sequence
  const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  
  return sorted.map((log) => {
    const timeLabel = new Date(log.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Output is recorded in 30-minute intervals
    const speed = parseFloat((log.packageCount / 30).toFixed(2));
    
    return {
      time: timeLabel,
      speed,
      count: log.packageCount
    };
  });
}
