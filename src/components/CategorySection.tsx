import { ServiceCategory, ServiceDefinition, ServiceStatusData } from '@/lib/types';
import ServiceCard from './ServiceCard';
import { STATUS_PRIORITY } from '@/lib/services/registry';

const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  cloud:         '☁️',
  ai:            '🤖',
  payment:       '💳',
  devtools:      '🛠️',
  collaboration: '💬',
  korean:        '🇰🇷',
};

interface Props {
  category: ServiceCategory;
  categoryLabel: string;
  services: ServiceDefinition[];
  statusMap: Record<string, ServiceStatusData>;
  locale: string;
  statusLabels: Record<string, string>;
}

export default function CategorySection({
  category,
  categoryLabel,
  services,
  statusMap,
  locale,
  statusLabels,
}: Props) {
  const defaultStatus = (id: string): ServiceStatusData => ({
    serviceId: id,
    status: 'unknown',
    updatedAt: new Date().toISOString(),
    incidents: [],
  });

  // Sort: issue services first, then by status priority
  const sorted = [...services].sort((a, b) => {
    const sa = statusMap[a.id]?.status ?? 'unknown';
    const sb = statusMap[b.id]?.status ?? 'unknown';
    return (STATUS_PRIORITY[sa] ?? 4) - (STATUS_PRIORITY[sb] ?? 4);
  });

  const issueCount = services.filter((s) => {
    const st = statusMap[s.id]?.status;
    return st && st !== 'operational' && st !== 'unknown' && st !== 'maintenance';
  }).length;

  const allOk = services.every((s) => {
    const st = statusMap[s.id]?.status;
    return st === 'operational';
  });

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{CATEGORY_ICONS[category]}</span>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {categoryLabel}
        </h2>
        {issueCount > 0 ? (
          <span className="text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
            {issueCount} issue{issueCount > 1 ? 's' : ''}
          </span>
        ) : allOk ? (
          <span className="text-xs text-green-600 dark:text-green-500 font-medium">
            ✓ All operational
          </span>
        ) : null}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {sorted.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            statusData={statusMap[service.id] ?? defaultStatus(service.id)}
            locale={locale}
            statusLabel={statusLabels[statusMap[service.id]?.status ?? 'unknown'] ?? 'Unknown'}
          />
        ))}
      </div>
    </section>
  );
}
