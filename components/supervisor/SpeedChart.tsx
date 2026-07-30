'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getSpeedTrendData } from '../../lib/speed-calculator';
import { ProductionLog } from '../../lib/types';
import { TrendingDown, Zap } from 'lucide-react';

interface SpeedChartProps {
  logs: ProductionLog[];
  baselineSpeed: number;
  currentSpeed: number;
  isDropAlert: boolean;
  dropPercentage: number;
}

/**
 * Handles FR-5: SpeedChart component for rendering production velocity trends.
 * Styled using high-visibility industrial orange line colors on a white card.
 */
export default function SpeedChart({
  logs,
  baselineSpeed,
  currentSpeed,
  isDropAlert,
  dropPercentage,
}: SpeedChartProps) {
  const chartData = getSpeedTrendData(logs);

  return (
    <div className="w-full bg-white border border-border-soft p-6 rounded-2xl space-y-6 shadow-sm">
      {/* Speed Header & Analytics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-soft pb-4">
        <div>
          <h3 className="font-black text-charcoal text-base uppercase tracking-wide">Production Speed Velocity</h3>
          <span className="text-slate-500 text-xs mt-1 block">
            Real-time output rate measured in packages per minute (PPM)
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Live rate */}
          <div className="text-left">
            <span className="text-slate-400 text-xxs font-bold tracking-widest uppercase block">Live Rate</span>
            <span className="text-2xl font-black text-industrial-orange font-mono mt-0.5 block">
              {currentSpeed.toFixed(2)} <span className="text-xs font-bold text-slate-500">PPM</span>
            </span>
          </div>

          {/* Baseline */}
          <div className="text-left">
            <span className="text-slate-400 text-xxs font-bold tracking-widest uppercase block">Baseline Target</span>
            <span className="text-xl font-black text-charcoal font-mono mt-0.5 block">
              {baselineSpeed.toFixed(1)} <span className="text-xs font-bold text-slate-500">PPM</span>
            </span>
          </div>

          {/* Alert Status */}
          {isDropAlert ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-industrial-orange/10 text-industrial-orange border border-industrial-orange/20 text-xs font-black animate-pulse uppercase tracking-wide">
              <TrendingDown size={14} />
              <span>-{dropPercentage}% Drop</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black uppercase tracking-wide">
              <Zap size={14} />
              <span>Normal</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full font-mono text-xs">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center border border-dashed border-border-soft rounded-xl text-slate-400">
            No package logs logged for this station yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(baselineSpeed * 1.3, dataMax + 2)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  borderRadius: '12px',
                  color: '#121212',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* Line styled in accent orange color */}
              <Line
                name="Calculated Line Speed"
                type="monotone"
                dataKey="speed"
                stroke="#FF5722"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#FF5722', strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 6 }}
              />
              
              {/* Baseline target Reference line */}
              <ReferenceLine
                y={baselineSpeed}
                stroke="#121212"
                strokeDasharray="4 4"
                label={{
                  value: 'Baseline',
                  position: 'top',
                  fill: '#121212',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
