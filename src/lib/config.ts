import type { FootballProviderId } from "@/lib/football/types";

const VALID_PROVIDERS: FootballProviderId[] = [
  "api-football",
  "goalserve",
  "sportsdataio",
  "sportradar",
  "mock",
];

/** 按自然年推断俱乐部赛季（8 月起算新赛季） */
function inferFootballSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 8 ? year : year - 1;
}

/** 当前足球赛季（可用 API_FOOTBALL_SEASON 覆盖） */
export const CURRENT_SEASON =
  Number(process.env.API_FOOTBALL_SEASON) || inferFootballSeason();

/** 世界杯 API 赛季（2026 美加墨世界杯；赛程按日期拉取，积分榜可回退 2022） */
const WORLD_CUP_SEASON =
  Number(process.env.API_FOOTBALL_WORLD_CUP_SEASON) || 2026;

/** 按联赛解析 API 赛季参数 */
export function getLeagueSeason(leagueId: number): number {
  if (leagueId === 1) return WORLD_CUP_SEASON;
  return CURRENT_SEASON;
}

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
