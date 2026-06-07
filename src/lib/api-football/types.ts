/**
 * @deprecated 请使用 @/lib/football/types
 * 此文件保留向后兼容，并包含 API-Football 专有响应结构
 */
export type {
  Fixture,
  TeamInfo,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  Player,
  TeamDetail,
  H2HMatch,
  FixtureLineup,
  PlayerSeasonStats,
  PlayerProfile,
  PlayerSearchResult,
  LeagueInfo,
  FootballProviderId,
} from "@/lib/football/types";

/** API-Football 专有 HTTP 响应包装（不进入领域层） */
export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T;
}
