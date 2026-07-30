import { jsPDF } from 'jspdf';
import { MachineHalt, HaltReason } from './types';

/**
 * Handles FR-7: Client-side generation of the weekly downtime summary PDF report.
 * Groups downtime events by reason codes (POWER, MECHANICAL, JAM, MAINTENANCE)
 * and formats the metrics in a clean, executive-ready document layout.
 */

interface DowntimeMetric {
  reason: HaltReason;
  occurrences: number;
  totalDurationMinutes: number;
}

/**
 * Compiles machine halt data and triggers a PDF file download in the browser.
 * 
 * @param halts - List of MachineHalt logs to analyze.
 * @param stationName - Optional station name to filter or display in header.
 */
export function generateWeeklyPDFReport(halts: MachineHalt[], stationName: string = 'All Stations'): void {
  // Enforce client-side check to prevent SSR compilation crashes
  if (typeof window === 'undefined') return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Group and aggregate downtime durations by reason code
  const reasonMetrics: Record<HaltReason, DowntimeMetric> = {
    POWER: { reason: 'POWER', occurrences: 0, totalDurationMinutes: 0 },
    MECHANICAL: { reason: 'MECHANICAL', occurrences: 0, totalDurationMinutes: 0 },
    JAM: { reason: 'JAM', occurrences: 0, totalDurationMinutes: 0 },
    MAINTENANCE: { reason: 'MAINTENANCE', occurrences: 0, totalDurationMinutes: 0 },
  };

  halts.forEach((halt) => {
    // Only aggregate resolved stoppages or use active duration if it's ongoing
    if (halt.reason && reasonMetrics[halt.reason]) {
      const end = halt.endTime || Date.now();
      const durationMs = end - halt.startTime;
      const durationMins = durationMs / (1000 * 60);

      reasonMetrics[halt.reason].occurrences += 1;
      reasonMetrics[halt.reason].totalDurationMinutes += parseFloat(durationMins.toFixed(1));
    }
  });

  const metricsArray = Object.values(reasonMetrics);
  const totalDowntimeMinutes = metricsArray.reduce((acc, curr) => acc + curr.totalDurationMinutes, 0);

  // 2. Formatting aesthetics: Title, banner, and corporate layout
  // Header Accent Bar (Corporate Teal/Indigo style)
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MANUTWIN DIGITAL TWIN', 15, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Weekly Downtime and Stoppage Report', 15, 26);

  // Report details box
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('REPORT DETAILS', 15, 48);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(15, 51, 195, 51);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Station Name:  ${stationName}`, 15, 59);
  doc.text(`Export Time:   ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Harare' })} CAT`, 15, 66);
  doc.text(`Total Downtime: ${totalDowntimeMinutes.toFixed(1)} Minutes`, 15, 73);

  // 3. Grid Table of downtime grouped by reason code
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DOWNTIME METRICS BY REASON CODE', 15, 88);
  doc.line(15, 91, 195, 91);

  // Table Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(15, 96, 180, 8, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('REASON CODE', 20, 101.5);
  doc.text('OCCURRENCES', 90, 101.5);
  doc.text('TOTAL DOWNTIME (MINS)', 145, 101.5);

  let currentY = 104;

  // Render metrics rows
  metricsArray.forEach((metric) => {
    currentY += 8;
    
    // Draw row divider line
    doc.line(15, currentY, 195, currentY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(metric.reason, 20, currentY + 5.5);
    doc.text(metric.occurrences.toString(), 90, currentY + 5.5);
    doc.text(metric.totalDurationMinutes.toFixed(1), 145, currentY + 5.5);
  });

  // Draw table bottom border
  doc.line(15, currentY + 8, 195, currentY + 8);

  // Footer note
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text('Manutwin manufacturing intelligence report. This document is strictly for internal supervisor and management review.', 15, 275);
  doc.text('Generated in conformance with ALU sweet factory standards (FR-7).', 15, 280);

  // Save / Trigger browser download dialog
  doc.save(`manutwin_weekly_report_${stationName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}
