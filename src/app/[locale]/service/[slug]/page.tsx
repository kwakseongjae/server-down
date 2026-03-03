import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServiceById, SERVICES } from '@/lib/services/registry';
import { ServiceStatusData } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import IncidentTimeline from '@/components/IncidentTimeline';
import type { Metadata } from 'next';

export const revalidate = 60;

async function getServiceStatus(serviceId: string): Promise<ServiceStatusData> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/status?service=${serviceId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.services?.[0] ?? { serviceId, status: 'unknown', updatedAt: new Date().toISOString(), incidents: [] };
  } catch {
    return { serviceId, status: 'unknown', updatedAt: new Date().toISOString(), incidents: [] };
  }
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getServiceById(slug);
  if (!service) return {};
  const name = locale === 'ko' ? service.nameKo : service.name;
  return {
    title: `${name} 상태 | Server Down?`,
    description: `${name} 실시간 서비스 상태 및 장애 이력 확인`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getServiceById(slug);
  if (!service) notFound();

  const t = await getTranslations();
  const statusData = await getServiceStatus(slug);
  const name = locale === 'ko' ? service.nameKo : service.name;

  const statusLabels: Record<string, string> = {
    operational: t('status.operational'),
    degraded: t('status.degraded'),
    partial_outage: t('status.partial_outage'),
    major_outage: t('status.major_outage'),
    maintenance: t('status.maintenance'),
    unknown: t('status.unknown'),
  };

  const incidentStatusLabels: Record<string, string> = {
    investigating: t('detail.incidentStatus.investigating'),
    identified: t('detail.incidentStatus.identified'),
    monitoring: t('detail.incidentStatus.monitoring'),
    resolved: t('detail.incidentStatus.resolved'),
  };

  const impactLabels: Record<string, string> = {
    none: t('detail.impact.none'),
    minor: t('detail.impact.minor'),
    major: t('detail.impact.major'),
    critical: t('detail.impact.critical'),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        &larr; {locale === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label={service.name}>
              {service.logo}
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === 'ko' ? '마지막 확인' : 'Last checked'}:{' '}
                {new Date(statusData.updatedAt).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
              </p>
            </div>
          </div>
          <StatusBadge
            status={statusData.status}
            label={statusLabels[statusData.status] ?? statusData.status}
            size="lg"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={service.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {locale === 'ko' ? '공식 사이트' : 'Official Website'} &nearr;
          </a>
          {service.statusPage && (
            <a
              href={service.statusPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {locale === 'ko' ? '공식 상태 페이지' : 'Official Status Page'} &nearr;
            </a>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('detail.recentIncidents')}
        </h2>
        <IncidentTimeline
          incidents={statusData.incidents}
          locale={locale}
          incidentStatusLabels={incidentStatusLabels}
          impactLabels={impactLabels}
          noIncidentsText={t('detail.noIncidents')}
        />
      </div>
    </div>
  );
}
