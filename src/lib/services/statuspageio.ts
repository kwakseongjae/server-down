import { ServiceStatus, ServiceStatusData, Incident, IncidentUpdate, ComponentStatus } from '../types';

const STATUS_MAP: Record<string, ServiceStatus> = {
  operational: 'operational',
  degraded_performance: 'degraded',
  partial_outage: 'partial_outage',
  major_outage: 'major_outage',
  under_maintenance: 'maintenance',
};

const IMPACT_MAP: Record<string, Incident['impact']> = {
  none: 'none',
  minor: 'minor',
  major: 'major',
  critical: 'critical',
};

function mapStatus(raw: string): ServiceStatus {
  return STATUS_MAP[raw] ?? 'unknown';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseIncident(raw: any): Incident {
  return {
    id: raw.id ?? '',
    name: raw.name ?? 'Unknown Incident',
    status: raw.status ?? 'investigating',
    impact: IMPACT_MAP[raw.impact] ?? 'minor',
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? new Date().toISOString(),
    resolvedAt: raw.resolved_at ?? undefined,
    shortlink: raw.shortlink ?? undefined,
    updates: (raw.incident_updates ?? []).map((u: any): IncidentUpdate => ({
      id: u.id ?? '',
      status: u.status ?? '',
      body: u.body ?? '',
      createdAt: u.created_at ?? '',
    })),
  };
}

export async function fetchStatuspageStatus(
  serviceId: string,
  baseUrl: string
): Promise<ServiceStatusData> {
  const url = `${baseUrl}/api/v2/summary.json`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const page = data.status ?? {};
    const components: ComponentStatus[] = (data.components ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      status: mapStatus(c.status),
    }));

    // Determine overall status from page.indicator
    let overallStatus: ServiceStatus = 'operational';
    const indicator = page.indicator ?? 'none';
    if (indicator === 'none') overallStatus = 'operational';
    else if (indicator === 'minor') overallStatus = 'degraded';
    else if (indicator === 'major') overallStatus = 'partial_outage';
    else if (indicator === 'critical') overallStatus = 'major_outage';
    else if (indicator === 'maintenance') overallStatus = 'maintenance';

    // Active incidents
    const activeIncidents: Incident[] = (data.incidents ?? []).map(parseIncident);
    // Scheduled maintenances
    const maintenances: Incident[] = (data.scheduled_maintenances ?? []).map(parseIncident);

    return {
      serviceId,
      status: overallStatus,
      description: page.description ?? undefined,
      updatedAt: new Date().toISOString(),
      incidents: [...activeIncidents, ...maintenances],
      components,
    };
  } catch {
    return {
      serviceId,
      status: 'unknown',
      updatedAt: new Date().toISOString(),
      incidents: [],
    };
  }
}
