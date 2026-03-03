'use client';
import { ServiceStatusData } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface Props {
  statuses: ServiceStatusData[];
  locale: string;
}

function formatTimeAgo(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === 'ko' ? '방금 전' : 'just now';
  if (mins < 60) return locale === 'ko' ? `${mins}분 전` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return locale === 'ko' ? `${hours}시간 전` : `${hours}h ago`;
}

export default function OverallBanner({ statuses, locale }: Props) {
  const t = useTranslations('banner');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.location.reload();
          return 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const issueServices = statuses.filter(
    (s) => s.status !== 'operational' && s.status !== 'unknown' && s.status !== 'maintenance'
  );
  const hasIssues = issueServices.length > 0;
  const lastUpdated = statuses[0]?.updatedAt ?? new Date().toISOString();

  return (
    <div
      className={`rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        hasIssues
          ? 'bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
          : 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{hasIssues ? '⚠️' : '✅'}</span>
        <div>
          <p className={`font-semibold text-base ${hasIssues ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200'}`}>
            {hasIssues
              ? t('issuesFound', { count: issueServices.length })
              : t('allOperational')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('lastChecked', { time: formatTimeAgo(lastUpdated, locale) })}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        {t('nextCheck', { seconds: countdown })}
      </div>
    </div>
  );
}
