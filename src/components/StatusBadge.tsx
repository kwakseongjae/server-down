'use client';
import { ServiceStatus } from '@/lib/types';

const CONFIG: Record<ServiceStatus, { bg: string; text: string; border: string; dot: string; pulse: boolean }> = {
  operational:    { bg: 'bg-green-50 dark:bg-green-950/40',   text: 'text-green-700 dark:text-green-400',   border: 'border-green-200 dark:border-green-800/50',   dot: 'bg-green-500',  pulse: false },
  degraded:       { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/50', dot: 'bg-yellow-400', pulse: false },
  partial_outage: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', dot: 'bg-orange-500', pulse: true  },
  major_outage:   { bg: 'bg-red-50 dark:bg-red-950/40',       text: 'text-red-700 dark:text-red-400',       border: 'border-red-200 dark:border-red-800/50',       dot: 'bg-red-500',    pulse: true  },
  maintenance:    { bg: 'bg-blue-50 dark:bg-blue-950/40',     text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800/50',     dot: 'bg-blue-400',   pulse: false },
  unknown:        { bg: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-500 dark:text-gray-400',     border: 'border-gray-200 dark:border-gray-700',        dot: 'bg-gray-400',   pulse: false },
};

interface Props {
  status: ServiceStatus;
  label: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, label, showDot = true, size = 'md' }: Props) {
  const c = CONFIG[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1.5 font-semibold' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap ${c.bg} ${c.text} ${c.border} ${sizeClass}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  );
}
