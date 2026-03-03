import { ServiceStatusData, Incident } from '../types';
import { SERVICES, getServiceById } from './registry';
import { fetchStatuspageStatus } from './statuspageio';
import { fetchAwsStatus } from './aws';
import { fetchGcpStatus } from './gcp';
import { fetchHealthCheck } from './healthcheck';
import { StatuspageFetchConfig, HealthCheckFetchConfig } from '../types';

async function fetchSlackStatus(serviceId: string, apiUrl: string): Promise<ServiceStatusData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(apiUrl, { signal: controller.signal, next: { revalidate: 0 } });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeIncidents: Incident[] = (data.active_incidents ?? []).map((inc: any): Incident => ({
      id: String(inc.id),
      name: inc.title ?? 'Slack Incident',
      status: 'investigating',
      impact: 'minor',
      createdAt: inc.date_created ?? new Date().toISOString(),
      updatedAt: inc.date_updated ?? new Date().toISOString(),
      updates: [],
      shortlink: inc.url,
    }));
    const hasIssues = activeIncidents.length > 0;
    return {
      serviceId,
      status: hasIssues ? 'partial_outage' : 'operational',
      updatedAt: new Date().toISOString(),
      incidents: activeIncidents,
    };
  } catch {
    return { serviceId, status: 'unknown', updatedAt: new Date().toISOString(), incidents: [] };
  }
}

async function fetchSingleService(serviceId: string): Promise<ServiceStatusData> {
  const service = getServiceById(serviceId);
  if (!service) {
    return { serviceId, status: 'unknown', updatedAt: new Date().toISOString(), incidents: [] };
  }

  switch (service.fetchType) {
    case 'statuspage': {
      const config = service.fetchConfig as StatuspageFetchConfig;
      return fetchStatuspageStatus(serviceId, config.baseUrl);
    }
    case 'aws':
      return fetchAwsStatus(serviceId);
    case 'gcp':
      return fetchGcpStatus(serviceId);
    case 'healthcheck': {
      const config = service.fetchConfig as HealthCheckFetchConfig;
      return fetchHealthCheck(serviceId, config.url, config.expectedStatus);
    }
    case 'slack': {
      const config = service.fetchConfig as HealthCheckFetchConfig;
      return fetchSlackStatus(serviceId, config.url);
    }
    default:
      return { serviceId, status: 'unknown', updatedAt: new Date().toISOString(), incidents: [] };
  }
}

export async function fetchAllStatuses(): Promise<ServiceStatusData[]> {
  const results = await Promise.allSettled(
    SERVICES.map((service) => fetchSingleService(service.id))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      serviceId: SERVICES[index].id,
      status: 'unknown' as const,
      updatedAt: new Date().toISOString(),
      incidents: [],
    };
  });
}

export { fetchSingleService as fetchServiceStatus };
