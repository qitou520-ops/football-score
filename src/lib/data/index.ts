/**
 * 统一数据入口 — 所有页面 / API Route 通过此模块访问足球数据
 *
 * 底层由 FootballDataProvider 驱动，切换供应商无需修改调用方。
 */
export {
  getLiveFixtures,
  getFixturesByDate,
  getTodayFixtures,
  getFixtureById,
  getStandings,
  getLeagueFixtures,
  getFixtureEvents,
  getFixtureStatistics,
  getHeadToHead,
  getTeamById,
  getTeamFixtures,
  searchTeams,
} from "./fixtures";

export { getPlayerById, searchPlayers } from "./players";
export { getCommentaryByMatchId } from "./commentary";
export { getLeagueTeamsList, getLeagueTopScorersList } from "./league-meta";
export { getChatMessages, addChatMessage } from "@/lib/chat";
export type { ChatMessageItem, ChatMessagesResponse } from "@/lib/chat/types";

export {
  getNews,
  getNewsBySlug,
  getPredictions,
  getPredictionBySlug,
  getFeaturedMatchFixtures,
  type NewsArticle,
  type PredictionArticle,
} from "./cms-content";

export { POPULAR_LEAGUES, getLeagueById } from "@/lib/mock/leagues";

export type {
  LiveCommentaryItem,
  LiveCommentaryResponse,
  CommentaryEventType,
} from "@/lib/mock/commentary-types";

export type {
  Fixture,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  TeamDetail,
  H2HMatch,
  LeagueTeamItem,
  LeagueTopScorer,
  Player,
  PlayerProfile,
  PlayerSeasonStats,
  PlayerSearchResult,
} from "@/lib/football/types";

import { searchTeams } from "./fixtures";
import { searchPlayers } from "./players";

export async function searchAll(query: string) {
  const [teams, players] = await Promise.all([
    searchTeams(query),
    searchPlayers(query),
  ]);
  return { teams, players };
}

export {
  getFootballProviderId,
  CURRENT_SEASON,
  isApiEnabled,
} from "@/lib/config";

export { getFootballProvider } from "@/lib/football/provider";
