import { addDays, format } from "date-fns";
import { getFootballProvider } from "@/lib/football/provider";
import { CURRENT_SEASON, getLeagueSeason } from "@/lib/config";
import { cacheGet, cacheSet, CACHE_TTL } from "@/lib/cache/redis";
import { WORLD_CUP_LEAGUE_ID } from "@/lib/mock/leagues";
import type {
  Fixture,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  TeamDetail,
  H2HMatch,
} from "@/lib/football/types";

export type {
  Fixture,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  TeamDetail,
  H2HMatch,
};

/** 积分榜可回退的历史赛季；赛程页不使用 2022，避免展示整届旧世界杯 */
const WORLD_CUP_STANDINGS_SEASONS = [2026, 2022];

function sortByKickoff(fixtures: Fixture[]): Fixture[] {
  return [...fixtures].sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
}

const WC_FIXTURES_CACHE_KEY = "fixtures:wc:window";

/** 世界杯：按日期范围拉取（API 的 league+season=2026 常为空） */
async function getWorldCupFixturesByDateRange(): Promise<Fixture[]> {
  const cached = await cacheGet<Fixture[]>(WC_FIXTURES_CACHE_KEY);
  if (cached) return cached;

  const provider = getFootballProvider();
  const byId = new Map<number, Fixture>();
  const today = new Date();

  // 免费套餐通常仅开放前后各 1 天，减少无效请求
  const dates: string[] = [];
  for (let offset = -1; offset <= 1; offset++) {
    dates.push(format(addDays(today, offset), "yyyy-MM-dd"));
  }

  const batchSize = 7;
  for (let i = 0; i < dates.length; i += batchSize) {
    const chunk = dates.slice(i, i + batchSize);
    const results = await Promise.all(
      chunk.map((date) => provider.getFixturesByDate(date).catch(() => [] as Fixture[]))
    );
    for (const day of results) {
      for (const f of day) {
        if (f.league.id === WORLD_CUP_LEAGUE_ID) {
          byId.set(f.fixture.id, f);
        }
      }
    }
  }

  const result = sortByKickoff([...byId.values()]);
  await cacheSet(WC_FIXTURES_CACHE_KEY, result, CACHE_TTL.FIXTURE);
  return result;
}

export async function getLiveFixtures(): Promise<Fixture[]> {
  return getFootballProvider().getLiveFixtures();
}

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  return getFootballProvider().getFixturesByDate(date);
}

export async function getTodayFixtures(): Promise<Fixture[]> {
  return getFootballProvider().getTodayFixtures();
}

export async function getFixtureById(id: number): Promise<Fixture | null> {
  return getFootballProvider().getFixtureById(id);
}

export async function getStandings(leagueId: number): Promise<StandingRow[][]> {
  const provider = getFootballProvider();
  const seasons =
    leagueId === WORLD_CUP_LEAGUE_ID
      ? WORLD_CUP_STANDINGS_SEASONS
      : [getLeagueSeason(leagueId)];

  for (const season of seasons) {
    try {
      const standings = await provider.getStandings(leagueId, season);
      if (standings.some((group) => group.length > 0)) {
        return standings;
      }
    } catch {
      /* 尝试下一赛季 */
    }
  }
  return [];
}

export async function getLeagueFixtures(leagueId: number): Promise<Fixture[]> {
  const provider = getFootballProvider();

  if (leagueId === WORLD_CUP_LEAGUE_ID) {
    // 1. 优先按日期拉取当前届（真实已踢 / 即将进行的比赛）
    const current = await getWorldCupFixturesByDateRange();
    if (current.length > 0) return current;

    // 2. 尝试 2026 赛季接口（付费套餐可能有完整赛程）
    try {
      const list = await provider.getLeagueFixtures(leagueId, 2026);
      if (list.length > 0) return sortByKickoff(list);
    } catch {
      /* continue */
    }

    // 不再回退 2022 全部 64 场，避免与当前赛事混淆
    return [];
  }

  const fixtures = await provider.getLeagueFixtures(leagueId, getLeagueSeason(leagueId));
  return sortByKickoff(fixtures);
}

export async function getFixtureEvents(fixtureId: number): Promise<MatchEvent[]> {
  return getFootballProvider().getFixtureEvents(fixtureId);
}

export async function getFixtureStatistics(fixtureId: number): Promise<MatchStatistic[]> {
  return getFootballProvider().getFixtureStatistics(fixtureId);
}

export async function getHeadToHead(team1: number, team2: number): Promise<H2HMatch[]> {
  return getFootballProvider().getHeadToHead(team1, team2);
}

export async function getTeamById(id: number): Promise<TeamDetail | null> {
  return getFootballProvider().getTeamById(id);
}

export async function getTeamFixtures(teamId: number): Promise<Fixture[]> {
  return getFootballProvider().getTeamFixtures(teamId, CURRENT_SEASON);
}

export async function searchTeams(query: string): Promise<TeamDetail[]> {
  return getFootballProvider().searchTeams(query);
}
