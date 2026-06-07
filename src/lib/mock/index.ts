/**
 * 前端 Mock 数据层 — 暂不接入外部 API
 * 所有页面应通过 @/lib/data 获取数据
 */

export {
  POPULAR_LEAGUES,
  getLeagueById,
} from "./leagues";

export {
  ALL_FIXTURES,
  getAllFixtures,
  getLiveFixtures,
  getFixturesByDate,
  getFixtureById,
  getLeagueFixtures,
  getTeamFixtures,
  getStandings,
  getFixtureEvents,
  getFixtureStatistics,
  getHeadToHead,
  getTeamById,
  searchTeams,
} from "./fixtures";

export {
  getAllPlayers,
  getPlayerById,
  searchPlayers,
  type MockPlayer,
  type PlayerSeasonStats,
} from "./players";

export {
  getNews,
  getNewsBySlug,
  type NewsArticle,
} from "./news";

export {
  getPredictions,
  getPredictionBySlug,
  type PredictionArticle,
} from "./predictions";

export {
  getCommentaryByMatchId,
} from "./commentary";

export type {
  LiveCommentaryItem,
  LiveCommentaryResponse,
  CommentaryEventType,
} from "./commentary-types";

import { searchTeams } from "./fixtures";
import { searchPlayers } from "./players";

export function searchAll(query: string) {
  return {
    teams: searchTeams(query),
    players: searchPlayers(query),
  };
}
