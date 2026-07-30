'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { generateWeeklyPDFReport } from '../../lib/pdf-generator';
import { MachineHalt } from '../../lib/types';

interface PDFExportButtonProps {
  halts: MachineHalt[];
  stationName?: string;
}

/**
 * Handles FR-7: PDF Export button component.
 * Configured to use the primary industrial orange accent for reporting triggers.
 */
export default function PDFExportButton({ halts, stationName = 'All Stations' }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        generateWeeklyPDFReport(halts, stationName);
      } catch (error) {
        console.error('Failed to compile weekly PDF report:', error);
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between space-x-2 transition-all duration-200 border cursor-pointer ${
        isExporting
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait'
          : 'bg-industrial-orange hover:bg-industrial-orange/95 border-industrial-orange text-white shadow-sm shadow-industrial-orange/20 active:scale-95'
      }`}
    >
      <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
      <span>{isExporting ? 'Exporting PDF...' : 'Weekly PDF Report'}</span>
    </button>
  );
}
