import "server-only";

import { cacheGet as memGet, cacheSet as memSet, cacheDel as memDel } from "./memory";

export { CACHE_TTL } from "./constants";

const useRedis =
  process.env.REDIS_URL &&
  process.env.REDIS_URL !== "redis://localhost:6379" &&
  process.env.REDIS_ENABLED !== "false";

let redisModule: typeof import("./redis-client") | null = null;

async function getRedisModule() {
  if (!useRedis) return null;
  if (!redisModule) {
    redisModule = await import("./redis-client");
  }
  return redisModule;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisModule();
    if (redis) return redis.cacheGet<T>(key);
  } catch {
    /* fallback to memory */
  }
  return memGet<T>(key);
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  try {
    const redis = await getRedisModule();
    if (redis) {
      await redis.cacheSet(key, value, ttlSeconds);
      return;
    }
  } catch {
    /* fallback */
  }
  await memSet(key, value, ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = await getRedisModule();
    if (redis) await redis.cacheDel(key);
  } catch {
    /* fallback */
  }
  await memDel(key);
}
