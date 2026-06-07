import "server-only";

import Redis from "ioredis";

let redis: Redis | null = null;
let connectFailed = false;

function getRedis(): Redis | null {
  if (connectFailed || !process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      retryStrategy: () => null,
    });
    redis.on("error", () => {
      connectFailed = true;
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    if (client.status !== "ready") await client.connect();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    connectFailed = true;
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    if (client.status !== "ready") await client.connect();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    connectFailed = true;
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    if (client.status !== "ready") await client.connect();
    await client.del(key);
  } catch {
    connectFailed = true;
  }
}
