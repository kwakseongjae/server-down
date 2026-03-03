import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStatuses } from '@/lib/services/fetcher';
import { setCachedStatuses, appendServiceHistory } from '@/lib/cache';
import { AllStatusData } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const services = await fetchAllStatuses();
    const now = new Date();
    const data: AllStatusData = {
      services,
      lastUpdatedAt: now.toISOString(),
      nextUpdateAt: new Date(now.getTime() + 60_000).toISOString(),
    };

    await setCachedStatuses(data);

    // Append history for each service (fire and forget)
    await Promise.allSettled(
      services.map((s) => appendServiceHistory(s.serviceId, s))
    );

    return NextResponse.json({
      success: true,
      updatedAt: data.lastUpdatedAt,
      servicesCount: services.length,
    });
  } catch (error) {
    console.error('[cron/update] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
