import React from 'react';
import { AttendanceLevel } from '../../types';

interface AttendanceBadgeProps {
  status: AttendanceLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  const statusConfig = {
    Good: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      label: 'Good',
    },
    Warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
      label: 'Warning',
    },
    Low: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800/60',
      dot: 'bg-rose-500',
      label: 'Low',
    },
  };

  const config = statusConfig[status] || statusConfig.Good;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      )}
      {config.label}
    </span>
  );
};
