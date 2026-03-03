import { ServiceStatusData } from '../types';

export async function fetchHealthCheck(
  serviceId: string,
  url: string,
  expectedStatus = 200
): Promise<ServiceStatusData> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    let status: ServiceStatusData['status'];
    if (res.status >= 500) {
      status = 'major_outage';
    } else if (res.status === expectedStatus || (res.status >= 200 && res.status < 400)) {
      status = responseTime > 3000 ? 'degraded' : 'operational';
    } else {
      status = 'degraded';
    }

    return {
      serviceId,
      status,
      description: `Response time: ${responseTime}ms`,
      updatedAt: new Date().toISOString(),
      incidents: [],
    };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      serviceId,
      status: isTimeout ? 'major_outage' : 'unknown',
      updatedAt: new Date().toISOString(),
      incidents: [],
    };
  }
}
