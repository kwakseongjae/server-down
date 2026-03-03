'use client';
import { Incident } from '@/lib/types';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  investigating: 'bg-red-100 text-red-700',
  identified: 'bg-orange-100 text-orange-700',
  monitoring: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
};

interface Props {
  incidents: Incident[];
  locale: string;
  incidentStatusLabels: Record<string, string>;
  impactLabels: Record<string, string>;
  noIncidentsText: string;
}

export default function IncidentTimeline({
  incidents,
  locale,
  incidentStatusLabels,
  impactLabels,
  noIncidentsText,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <span className="text-2xl block mb-2">{'\u2705'}</span>
        {noIncidentsText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === incident.id ? null : incident.id)}
            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {incident.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(incident.createdAt).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[incident.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {incidentStatusLabels[incident.status] ?? incident.status}
                </span>
                <span className="text-gray-400">{expanded === incident.id ? '\u25B2' : '\u25BC'}</span>
              </div>
            </div>
          </button>
          {expanded === incident.id && incident.updates.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
              {incident.updates.map((update) => (
                <div key={update.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${STATUS_COLORS[update.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {incidentStatusLabels[update.status] ?? update.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(update.createdAt).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                    {update.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
