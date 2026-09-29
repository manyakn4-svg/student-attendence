import React from 'react';
import { AttendanceLevel } from '../../types';

interface AttendanceProgressProps {
  percentage: number;
  target?: number;
  status: AttendanceLevel;
  height?: string;
  showLabels?: boolean;
}

export const AttendanceProgress: React.FC<AttendanceProgressProps> = ({
  percentage,
  target,
  status,
  height = 'h-2.5',
  showLabels = false,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const barColor = {
    Good: 'bg-emerald-500 dark:bg-emerald-400',
    Warning: 'bg-amber-500 dark:bg-amber-400',
    Low: 'bg-rose-500 dark:bg-rose-400',
  }[status] || 'bg-emerald-500';

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1 font-medium text-slate-600 dark:text-slate-400">
          <span>{clampedPercentage}%</span>
          {target !== undefined && (
            <span className="text-slate-400 dark:text-slate-500">Target: {target}%</span>
          )}
        </div>
      )}
      <div className={`relative w-full ${height} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clampedPercentage}%` }}
        />
        {/* Target Indicator line if target is provided */}
        {target !== undefined && target > 0 && target <= 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 dark:bg-slate-300 z-10 opacity-70"
            style={{ left: `${target}%` }}
            title={`Target: ${target}%`}
          />
        )}
      </div>
    </div>
  );
};
