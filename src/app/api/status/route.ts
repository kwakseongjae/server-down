import { NextRequest, NextResponse } from 'next/server';
import { getCachedStatuses, setCachedStatuses } from '@/lib/cache';
import { fetchAllStatuses } from '@/lib/services/fetcher';
import { AllStatusData } from '@/lib/types';
import { SERVICES } from '@/lib/services/registry';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('service');

  try {
    let data = await getCachedStatuses();

    // If no cache, fetch fresh data
    if (!data) {
      const services = await fetchAllStatuses();
      const now = new Date();
      data = {
        services,
        lastUpdatedAt: now.toISOString(),
        nextUpdateAt: new Date(now.getTime() + 60_000).toISOString(),
      };
      await setCachedStatuses(data);
    }

    // Filter by service if requested
    if (serviceId) {
      const filtered = data.services.filter((s) => s.serviceId === serviceId);
      const response: AllStatusData = { ...data, services: filtered };
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        },
      });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[api/status] Error:', error);
    // Return empty data rather than 500
    const now = new Date().toISOString();
    const empty: AllStatusData = {
      services: SERVICES.map((s) => ({
        serviceId: s.id,
        status: 'unknown' as const,
        updatedAt: now,
        incidents: [],
      })),
      lastUpdatedAt: now,
      nextUpdateAt: new Date(Date.now() + 60_000).toISOString(),
    };
    return NextResponse.json(empty, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
