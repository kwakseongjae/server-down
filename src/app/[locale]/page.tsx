import { getTranslations } from 'next-intl/server';
import { SERVICES, CATEGORY_ORDER, getServicesByCategory, STATUS_PRIORITY } from '@/lib/services/registry';
import { AllStatusData, ServiceStatusData } from '@/lib/types';
import CategorySection from '@/components/CategorySection';
import OverallBanner from '@/components/OverallBanner';
import ServiceLogo from '@/components/ServiceLogo';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

async function getStatuses(): Promise<AllStatusData> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/status`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch {
    const now = new Date().toISOString();
    return {
      services: SERVICES.map((s) => ({
        serviceId: s.id,
        status: 'unknown' as const,
        updatedAt: now,
        incidents: [],
      })),
      lastUpdatedAt: now,
      nextUpdateAt: new Date(Date.now() + 60000).toISOString(),
    };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ko' ? '서버 다운? - 실시간 서비스 상태 확인' : 'Server Down? - Real-time Service Status',
    description: locale === 'ko'
      ? 'AWS, Cloudflare, Claude, GitHub 등 주요 서비스 실시간 상태. 나만 안 되는 건가요?'
      : 'Real-time status for AWS, Cloudflare, Claude, GitHub and more. Is it down for everyone?',
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const data = await getStatuses();

  const statusMap: Record<string, ServiceStatusData> = {};
  for (const s of data.services) {
    statusMap[s.serviceId] = s;
  }

  const statusLabels: Record<string, string> = {
    operational:    t('status.operational'),
    degraded:       t('status.degraded'),
    partial_outage: t('status.partial_outage'),
    major_outage:   t('status.major_outage'),
    maintenance:    t('status.maintenance'),
    unknown:        t('status.unknown'),
  };

  // Services with active issues, sorted by severity
  const issueServices = SERVICES
    .filter((s) => {
      const st = statusMap[s.id]?.status;
      return st && st !== 'operational' && st !== 'unknown' && st !== 'maintenance';
    })
    .sort((a, b) => {
      const sa = statusMap[a.id]?.status ?? 'unknown';
      const sb = statusMap[b.id]?.status ?? 'unknown';
      return (STATUS_PRIORITY[sa] ?? 4) - (STATUS_PRIORITY[sb] ?? 4);
    });

  return (
    <div>
      {/* Hero */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1 tracking-tight">
          {locale === 'ko' ? '지금 서버 내려갔나요?' : 'Is the server down right now?'}
        </h1>
        <p className="text-gray-400 text-sm">
          {locale === 'ko'
            ? `${SERVICES.length}개 서비스 실시간 모니터링 · 매 1분 자동 갱신`
            : `Monitoring ${SERVICES.length} services · Auto-refreshes every minute`}
        </p>
      </div>

      {/* Overall status banner */}
      <OverallBanner statuses={data.services} locale={locale} />

      {/* Active Issues Section */}
      {issueServices.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {locale === 'ko' ? '현재 이슈 발생 중' : 'Active Issues'}
            </h2>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-900/60 overflow-hidden divide-y divide-red-100 dark:divide-red-900/40 bg-red-50/30 dark:bg-red-950/10">
            {issueServices.map((service) => {
              const sd = statusMap[service.id];
              const name = locale === 'ko' ? service.nameKo : service.name;
              const activeIncident = sd?.incidents.find((i) => i.status !== 'resolved');
              return (
                <Link
                  key={service.id}
                  href={`/${locale}/service/${service.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                >
                  <ServiceLogo
                    iconSlug={service.iconSlug}
                    fallbackEmoji={service.logo}
                    name={service.name}
                    size={28}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                    {activeIncident && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {activeIncident.name}
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    status={sd.status}
                    label={statusLabels[sd.status] ?? sd.status}
                    size="sm"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Category Sections */}
      {CATEGORY_ORDER.map((category) => {
        const services = getServicesByCategory(category);
        return (
          <CategorySection
            key={category}
            category={category}
            categoryLabel={t(`category.${category}`)}
            services={services}
            statusMap={statusMap}
            locale={locale}
            statusLabels={statusLabels}
          />
        );
      })}
    </div>
  );
}
