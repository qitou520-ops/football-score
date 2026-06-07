import type { FootballProviderId } from "@/lib/football/types";

const VALID_PROVIDERS: FootballProviderId[] = [
  "api-football",
  "goalserve",
  "sportsdataio",
  "sportradar",
  "mock",
];

/** 当前足球赛季 */
export const CURRENT_SEASON =
  Number(process.env.API_FOOTBALL_SEASON) || 2024;

function isApiKeyConfigured(): boolean {
  const key = process.env.API_FOOTBALL_KEY?.replace(/^["']|["']$/g, "").trim();
  return Boolean(key && key !== "your-api-key-here");
}

/**
 * 解析当前数据供应商
 *
 * 优先级：
 * 1. FOOTBALL_DATA_PROVIDER 环境变量
 * 2. DATA_SOURCE=mock → mock
 * 3. 有 API_FOOTBALL_KEY → api-football
 * 4. 默认 mock
 */
export function getFootballProviderId(): FootballProviderId {
  const explicit = process.env.FOOTBALL_DATA_PROVIDER as FootballProviderId | undefined;

  if (explicit && VALID_PROVIDERS.includes(explicit)) {
    return explicit;
  }

  if (process.env.DATA_SOURCE === "mock") {
    return "mock";
  }

  if (process.env.DATA_SOURCE === "api" && isApiKeyConfigured()) {
    return "api-football";
  }

  if (isApiKeyConfigured()) {
    return "api-football";
  }

  return "mock";
}

/** @deprecated 使用 getFootballProviderId() !== 'mock' */
export function isApiEnabled(): boolean {
  return getFootballProviderId() !== "mock";
}
