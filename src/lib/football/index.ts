/**
 * 足球数据层 — 企业级供应商架构入口
 *
 * @example
 * import { getFootballProvider } from '@/lib/football';
 * const fixtures = await getFootballProvider().getLiveFixtures();
 */
export { getFootballProvider, resetFootballProvider, listRegisteredProviders } from "./provider";
export type { FootballDataProvider } from "./provider/interface";
export type * from "./types";
export {
  FootballProviderError,
  ProviderNotConfiguredError,
  ProviderNotImplementedError,
} from "./provider/errors";
