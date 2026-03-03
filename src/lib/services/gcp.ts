import { ServiceStatusData, Incident } from '../types';

export async function fetchGcpStatus(serviceId: string): Promise<ServiceStatusData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://status.cloud.google.com/incidents.json', {
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const incidents = await res.json() as any[];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Find ongoing incidents (no end time) or recent ones
    const activeIncidents = incidents.filter((inc: any) => {
      if (!inc.end) return true; // ongoing
      const endTime = new Date(inc.end).getTime();
      return endTime > sevenDaysAgo;
    });

    const hasOngoing = incidents.some((inc: any) => !inc.end);

    const mappedIncidents: Incident[] = activeIncidents.slice(0, 5).map((inc: any): Incident => ({
      id: inc.id ?? String(Math.random()),
      name: inc.external_desc ?? 'GCP Service Issue',
      status: inc.end ? 'resolved' : 'investigating',
      impact: 'major',
      createdAt: inc.begin ?? new Date().toISOString(),
      updatedAt: inc.modified ?? new Date().toISOString(),
      resolvedAt: inc.end ?? undefined,
      updates: (inc.updates ?? []).map((u: any, i: number): import('../types').IncidentUpdate => ({
        id: String(i),
        status: 'update',
        body: u.text ?? '',
        createdAt: u.modified ?? '',
      })),
    }));

    return {
      serviceId,
      status: hasOngoing ? 'partial_outage' : 'operational',
      updatedAt: new Date().toISOString(),
      incidents: mappedIncidents,
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
