import Link from 'next/link';
import { ServiceDefinition, ServiceStatusData, ServiceStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import ServiceLogo from './ServiceLogo';

const STATUS_LEFT_BORDER: Record<ServiceStatus, string> = {
  operational:    'border-l-green-400',
  degraded:       'border-l-yellow-400',
  partial_outage: 'border-l-orange-400',
  major_outage:   'border-l-red-500',
  maintenance:    'border-l-blue-400',
  unknown:        'border-l-gray-300 dark:border-l-gray-600',
};

interface Props {
  service: ServiceDefinition;
  statusData: ServiceStatusData;
  locale: string;
  statusLabel: string;
  compact?: boolean;
}

export default function ServiceCard({ service, statusData, locale, statusLabel, compact = false }: Props) {
  const name = locale === 'ko' ? service.nameKo : service.name;
  const activeIncident = statusData.incidents.find((i) => i.status !== 'resolved');
  const isIssue = statusData.status !== 'operational' && statusData.status !== 'unknown';
  const borderColor = STATUS_LEFT_BORDER[statusData.status] ?? STATUS_LEFT_BORDER.unknown;

  return (
    <Link
      href={`/${locale}/service/${service.id}`}
      className={`flex items-center gap-3 px-4 py-3 border-l-[3px] rounded-r-lg border border-l-0 transition-all hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 group ${borderColor} ${
        isIssue
          ? 'bg-orange-50/40 dark:bg-orange-950/10 border-orange-200/60 dark:border-orange-900/40'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      }`}
    >
      <ServiceLogo
        iconSlug={service.iconSlug}
        fallbackEmoji={service.logo}
        name={service.name}
        size={compact ? 28 : 32}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {name}
        </p>
        {activeIncident && (
          <p className="text-xs text-orange-600 dark:text-orange-400 truncate mt-0.5 leading-none">
            {activeIncident.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={statusData.status} label={statusLabel} size="sm" />
        <svg
          className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
