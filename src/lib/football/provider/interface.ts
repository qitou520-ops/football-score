import type {
  Fixture,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  TeamDetail,
  H2HMatch,
  FixtureLineup,
  PlayerProfile,
  PlayerSearchResult,
  LeagueTeamItem,
  LeagueTopScorer,
  ProviderHealth,
  FootballProviderId,
} from "@/lib/football/types";

/**
 * 足球数据供应商统一接口
 *
 * 所有页面 / API Route 通过 lib/data 调用，底层由此接口驱动。
 * 切换供应商只需修改 FOOTBALL_DATA_PROVIDER 环境变量。
 */
export interface FootballDataProvider {
  /** 供应商标识 */
  readonly id: FootballProviderId;

  /** 供应商显示名称 */
  readonly name: string;

  // ── 比赛列表 ──────────────────────────────────────────

  getLiveFixtures(): Promise<Fixture[]>;
  getFixturesByDate(date: string): Promise<Fixture[]>;
  getTodayFixtures(): Promise<Fixture[]>;
  getFixtureById(id: number): Promise<Fixture | null>;
  getLeagueFixtures(leagueId: number, season?: number): Promise<Fixture[]>;
  getTeamFixtures(teamId: number, season?: number): Promise<Fixture[]>;

  // ── 比赛详情 ──────────────────────────────────────────

  getFixtureEvents(fixtureId: number): Promise<MatchEvent[]>;
  getFixtureStatistics(fixtureId: number): Promise<MatchStatistic[]>;
  getFixtureLineups(fixtureId: number): Promise<FixtureLineup[]>;
  getHeadToHead(team1: number, team2: number): Promise<H2HMatch[]>;

  // ── 球队 / 球员 ──────────────────────────────────────

  getTeamById(id: number): Promise<TeamDetail | null>;
  searchTeams(query: string): Promise<TeamDetail[]>;
  getPlayerById(id: number, season?: number): Promise<PlayerProfile | null>;
  searchPlayers(query: string, season?: number): Promise<PlayerSearchResult[]>;

  // ── 积分榜 ────────────────────────────────────────────

  getStandings(leagueId: number, season?: number): Promise<StandingRow[][]>;
  getLeagueTeams(leagueId: number, season?: number): Promise<LeagueTeamItem[]>;
  getLeagueTopScorers(leagueId: number, season?: number): Promise<LeagueTopScorer[]>;

  // ── 运维 ──────────────────────────────────────────────

  /** 供应商是否已正确配置（API Key 等） */
  isConfigured(): boolean;

  /** 健康检查 */
  getHealth(): ProviderHealth;

  /** 清除缓存（可选，仅支持缓存的供应商实现） */
  clearCache?(keys?: string[]): Promise<void>;
}
