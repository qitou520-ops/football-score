import "server-only";

import { cacheGet, cacheSet } from "@/lib/cache/redis";

const RATE_LIMIT_MS = 5000;
const KEY_PREFIX = "chat:ratelimit:";

const memoryLastSent = new Map<string, number>();

/** 同一 IP 5 秒内仅允许 1 条消息；优先 Redis，回退内存 */
export async function checkChatRateLimit(ipHash: string): Promise<boolean> {
  const now = Date.now();
  const key = `${KEY_PREFIX}${ipHash}`;

  try {
    const last = await cacheGet<number>(key);
    if (last != null && now - last < RATE_LIMIT_MS) {
      return false;
    }
    await cacheSet(key, now, Math.ceil(RATE_LIMIT_MS / 1000) + 1);
    return true;
  } catch {
    const memLast = memoryLastSent.get(ipHash);
    if (memLast != null && now - memLast < RATE_LIMIT_MS) {
      return false;
    }
    memoryLastSent.set(ipHash, now);
    return true;
  }
}
