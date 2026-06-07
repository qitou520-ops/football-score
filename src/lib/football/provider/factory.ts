import "server-only";

import type { FootballDataProvider } from "./interface";
import type { FootballProviderId } from "@/lib/football/types";
import { getFootballProviderId } from "@/lib/config";
import { ApiFootballProvider } from "@/lib/football/providers/api-football/provider";
import { MockFootballProvider } from "@/lib/football/providers/mock/provider";
import {
  GoalserveProvider,
  SportsDataIOProvider,
  SportradarProvider,
} from "@/lib/football/providers/stubs";

type ProviderFactory = () => FootballDataProvider;

const REGISTRY: Record<FootballProviderId, ProviderFactory> = {
  "api-football": () => new ApiFootballProvider(),
  mock: () => new MockFootballProvider(),
  goalserve: () => new GoalserveProvider(),
  sportsdataio: () => new SportsDataIOProvider(),
  sportradar: () => new SportradarProvider(),
};

let cachedProvider: FootballDataProvider | null = null;
let cachedProviderId: FootballProviderId | null = null;

/**
 * 获取当前激活的足球数据供应商（单例）
 *
 * 通过环境变量 FOOTBALL_DATA_PROVIDER 切换：
 *   api-football | goalserve | sportsdataio | sportradar | mock
 */
export function getFootballProvider(): FootballDataProvider {
  const id = getFootballProviderId();

  if (cachedProvider && cachedProviderId === id) {
    return cachedProvider;
  }

  const factory = REGISTRY[id];
  if (!factory) {
    throw new Error(`未知的数据供应商: ${id}`);
  }

  cachedProvider = factory();
  cachedProviderId = id;
  return cachedProvider;
}

/** 重置单例（测试 / 热切换环境变量时使用） */
export function resetFootballProvider(): void {
  cachedProvider = null;
  cachedProviderId = null;
}

/** 列出所有已注册的供应商 */
export function listRegisteredProviders(): FootballProviderId[] {
  return Object.keys(REGISTRY) as FootballProviderId[];
}
