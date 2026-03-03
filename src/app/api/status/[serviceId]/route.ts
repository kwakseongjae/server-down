import { NextRequest, NextResponse } from 'next/server';
import { getCachedStatuses } from '@/lib/cache';
import { fetchServiceStatus } from '@/lib/services/fetcher';
import { getServiceById } from '@/lib/services/registry';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const service = getServiceById(serviceId);

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  try {
    // Try cache first
    const cached = await getCachedStatuses();
    const cachedService = cached?.services.find((s) => s.serviceId === serviceId);

    if (cachedService) {
      return NextResponse.json(
        { service, statusData: cachedService },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
          },
        }
      );
    }

    // Fetch fresh if not in cache
    const statusData = await fetchServiceStatus(serviceId);
    return NextResponse.json(
      { service, statusData },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error(`[api/status/${serviceId}] Error:`, error);
    return NextResponse.json(
      {
        service,
        statusData: {
          serviceId,
          status: 'unknown',
          updatedAt: new Date().toISOString(),
          incidents: [],
        },
      },
      { status: 200 }
    );
  }
}
