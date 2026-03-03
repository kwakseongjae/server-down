import { ServiceStatusData, Incident } from '../types';

export async function fetchAwsStatus(serviceId: string): Promise<ServiceStatusData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://health.aws.amazon.com/health/status', {
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // AWS Health returns an object with service statuses
    // Check if there are any current events
    const summary = data.summary ?? [];
    const hasIssues = summary.some((item: any) =>
      item.status && item.status !== 'SERVICE_IS_OPERATING_NORMALLY'
    );

    const incidents: Incident[] = summary
      .filter((item: any) => item.status && item.status !== 'SERVICE_IS_OPERATING_NORMALLY')
      .slice(0, 5)
      .map((item: any, idx: number): Incident => ({
        id: `aws-${idx}`,
        name: item.service ?? 'AWS Service Issue',
        status: 'investigating',
        impact: 'major',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updates: [],
      }));

    return {
      serviceId,
      status: hasIssues ? 'partial_outage' : 'operational',
      updatedAt: new Date().toISOString(),
      incidents,
    };
  } catch {
    // Fallback: try a simple health check on aws.amazon.com
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('https://aws.amazon.com', {
        signal: controller.signal,
        method: 'HEAD',
        next: { revalidate: 0 },
      });
      clearTimeout(timeoutId);
      return {
        serviceId,
        status: res.ok ? 'operational' : 'major_outage',
        updatedAt: new Date().toISOString(),
        incidents: [],
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
}
