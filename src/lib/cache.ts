import { AllStatusData, ServiceStatusData } from './types';

// In-memory fallback when Redis is not configured
const memoryCache = new Map<string, unknown>();

const CACHE_KEY = 'all_statuses';
const HISTORY_KEY_PREFIX = 'history:';
const CACHE_TTL = 120;
const MAX_HISTORY = 100;

function getRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  // Dynamically import to avoid issues when env vars are missing
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function getCachedStatuses(): Promise<AllStatusData | null> {
  try {
    const redis = getRedis();
    if (redis) {
      const data = await redis.get(CACHE_KEY);
      return data as AllStatusData | null;
    }
    return (memoryCache.get(CACHE_KEY) as AllStatusData) ?? null;
  } catch {
    return (memoryCache.get(CACHE_KEY) as AllStatusData) ?? null;
  }
}

export async function setCachedStatuses(data: AllStatusData): Promise<void> {
  try {
    const redis = getRedis();
    if (redis) {
      await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
    } else {
      memoryCache.set(CACHE_KEY, data);
    }
  } catch {
    memoryCache.set(CACHE_KEY, data);
  }
}

export async function getServiceHistory(
  serviceId: string,
  limit = 50
): Promise<ServiceStatusData[]> {
  try {
    const redis = getRedis();
    const key = `${HISTORY_KEY_PREFIX}${serviceId}`;
    if (redis) {
      const items = await redis.lrange(key, 0, limit - 1);
      return items.map((item: unknown) =>
        typeof item === 'string' ? JSON.parse(item) : item
      ) as ServiceStatusData[];
    }
    const history = (memoryCache.get(key) as ServiceStatusData[]) ?? [];
    return history.slice(0, limit);
  } catch {
    return [];
  }
}

export async function appendServiceHistory(
  serviceId: string,
  data: ServiceStatusData
): Promise<void> {
  try {
    const redis = getRedis();
    const key = `${HISTORY_KEY_PREFIX}${serviceId}`;
    if (redis) {
      await redis.lpush(key, JSON.stringify(data));
      await redis.ltrim(key, 0, MAX_HISTORY - 1);
    } else {
      const history = (memoryCache.get(key) as ServiceStatusData[]) ?? [];
      history.unshift(data);
      if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
      memoryCache.set(key, history);
    }
  } catch {
    // silently fail
  }
}
