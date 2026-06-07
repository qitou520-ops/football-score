import { CACHE_TTL } from "./constants";

/** 生成 HTTP Cache-Control 头，供 API Route / CDN 使用 */
export function cacheControlHeader(
  maxAge: number,
  staleWhileRevalidate?: number
): string {
  const swr = staleWhileRevalidate ?? Math.max(10, Math.floor(maxAge / 4));
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`;
}

/** 与 CACHE_TTL 对应的 HTTP 缓存策略 */
export const CACHE_HEADERS = {
  LIVE: cacheControlHeader(CACHE_TTL.LIVE, 15),
  STANDINGS: cacheControlHeader(CACHE_TTL.STANDINGS, 300),
  TEAM: cacheControlHeader(CACHE_TTL.TEAM, 3600),
  FIXTURE: cacheControlHeader(CACHE_TTL.FIXTURE, 60),
} as const;
