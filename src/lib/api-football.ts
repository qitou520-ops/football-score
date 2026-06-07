import "server-only";

import { cacheGet, cacheSet, CACHE_TTL } from "@/lib/cache/redis";
import { logApiRequest } from "@/lib/api-logs";
import type {
  ApiFootballResponse,
  Fixture,
  StandingRow,
  MatchEvent,
  MatchStatistic,
  Player,
  TeamDetail,
  H2HMatch,
  FixtureLineup,
} from "@/lib/api-football/types";

const BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

/** 合并并发请求，同一 cacheKey 只打一次 API */
const inflight = new Map<string, Promise<unknown>>();

export class ApiFootballError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

/** 统一 API 请求方法（内存/Redis 缓存 + Next.js fetch 缓存 + 并发去重） */
export async function apiFootballRequest<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  cacheKey?: string,
  ttl: number = CACHE_TTL.FIXTURE
): Promise<T> {
  if (cacheKey) {
    const cached = await cacheGet<T>(cacheKey);
    if (cached) {
      void logApiRequest({ endpoint, cached: true, statusCode: 200, durationMs: 0 });
      return cached;
    }

    const pending = inflight.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }

  const task = executeRequest<T>(endpoint, params, cacheKey, ttl);

  if (cacheKey) {
    inflight.set(cacheKey, task);
    try {
      return await task;
    } finally {
      inflight.delete(cacheKey);
    }
  }

  return task;
}

async function executeRequest<T>(
  endpoint: string,
  params: Record<string, string | number>,
  cacheKey: string | undefined,
  ttl: number
): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY?.replace(/^["']|["']$/g, "").trim();
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new ApiFootballError("API_FOOTBALL_KEY 未配置", 503);
  }

  const url = new URL(endpoint, BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: ttl },
    });
  } catch {
    void logApiRequest({
      endpoint,
      statusCode: 503,
      durationMs: Date.now() - started,
      error: "网络请求失败",
    });
    throw new ApiFootballError("网络请求失败，请检查网络连接", 503);
  }

  if (!res.ok) {
    void logApiRequest({
      endpoint,
      statusCode: res.status,
      durationMs: Date.now() - started,
      error: res.statusText,
    });
    throw new ApiFootballError(`API 请求失败: ${res.status} ${res.statusText}`, res.status);
  }

  const data = (await res.json()) as ApiFootballResponse<T>;

  if (data.errors && Object.keys(data.errors).length > 0) {
    const msg =
      typeof data.errors === "object"
        ? Object.values(data.errors).join("; ")
        : String(data.errors);
    void logApiRequest({
      endpoint,
      statusCode: 400,
      durationMs: Date.now() - started,
      error: msg,
    });
    throw new ApiFootballError(msg || "API 返回错误", 400);
  }

  void logApiRequest({
    endpoint,
    statusCode: 200,
    durationMs: Date.now() - started,
    cached: false,
  });

  if (cacheKey) {
    await cacheSet(cacheKey, data.response, ttl);
  }

  return data.response;
}

/** 手动刷新：清除指定缓存键 */
export async function clearApiCache(keys?: string[]) {
  const { cacheDel } = await import("@/lib/cache/redis");
  const defaults = ["fixtures:live", `fixtures:date:${formatDateYMD()}`];
  for (const key of keys ?? defaults) {
    await cacheDel(key);
  }
}

/** @deprecated 兼容旧代码，请使用 apiFootballRequest */
export const fetchApi = apiFootballRequest;

/** 格式化为 YYYY-MM-DD */
function formatDateYMD(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 今日比赛 */
export async function getTodayFixtures(): Promise<Fixture[]> {
  return getFixturesByDate(formatDateYMD());
}

/** 实时比赛 */
export async function getLiveFixtures(): Promise<Fixture[]> {
  return apiFootballRequest<Fixture[]>(
    "/fixtures",
    { live: "all" },
    "fixtures:live",
    CACHE_TTL.LIVE
  );
}

/** 按日期获取比赛 */
export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  return apiFootballRequest<Fixture[]>(
    "/fixtures",
    { date },
    `fixtures:date:${date}`,
    CACHE_TTL.FIXTURE
  );
}

/** 联赛积分榜 */
export async function getStandings(
  leagueId: number,
  season: number
): Promise<StandingRow[][]> {
  return apiFootballRequest<StandingRow[][]>(
    "/standings",
    { league: leagueId, season },
    `standings:${leagueId}:${season}`,
    CACHE_TTL.STANDINGS
  );
}

/** 球队信息 */
export async function getTeamById(teamId: number): Promise<TeamDetail | null> {
  const teams = await apiFootballRequest<TeamDetail[]>(
    "/teams",
    { id: teamId },
    `team:${teamId}`,
    CACHE_TTL.TEAM
  );
  return teams[0] ?? null;
}

export async function getFixtureById(id: number): Promise<Fixture | null> {
  const fixtures = await apiFootballRequest<Fixture[]>(
    "/fixtures",
    { id },
    `fixtures:id:${id}`,
    CACHE_TTL.FIXTURE
  );
  return fixtures[0] ?? null;
}

export async function getLeagueFixtures(
  leagueId: number,
  season: number
): Promise<Fixture[]> {
  return apiFootballRequest<Fixture[]>(
    "/fixtures",
    { league: leagueId, season },
    `fixtures:league:${leagueId}:${season}`,
    CACHE_TTL.FIXTURE
  );
}

export async function getFixtureEvents(fixtureId: number): Promise<MatchEvent[]> {
  return apiFootballRequest<MatchEvent[]>(
    "/fixtures/events",
    { fixture: fixtureId },
    `events:${fixtureId}`,
    CACHE_TTL.LIVE
  );
}

export async function getFixtureStatistics(
  fixtureId: number
): Promise<MatchStatistic[]> {
  return apiFootballRequest<MatchStatistic[]>(
    "/fixtures/statistics",
    { fixture: fixtureId },
    `stats:${fixtureId}`,
    CACHE_TTL.FIXTURE
  );
}

export async function getFixtureLineups(fixtureId: number): Promise<FixtureLineup[]> {
  return apiFootballRequest<FixtureLineup[]>(
    "/fixtures/lineups",
    { fixture: fixtureId },
    `lineups:${fixtureId}`,
    CACHE_TTL.FIXTURE
  );
}

export async function getTeamFixtures(
  teamId: number,
  season: number
): Promise<Fixture[]> {
  return apiFootballRequest<Fixture[]>(
    "/fixtures",
    { team: teamId, season },
    `team:fixtures:${teamId}:${season}`,
    CACHE_TTL.FIXTURE
  );
}

/** @deprecated 免费套餐不支持 next 参数，请使用 getTeamFixtures */
export async function getTeamUpcomingFixtures(
  teamId: number,
  season: number
): Promise<Fixture[]> {
  const all = await getTeamFixtures(teamId, season);
  return all.filter((f) => f.fixture.status.short === "NS");
}

export async function getPlayerById(
  playerId: number,
  season: number
): Promise<{ player: Player; statistics: unknown[] } | null> {
  const data = await apiFootballRequest<{ player: Player; statistics: unknown[] }[]>(
    "/players",
    { id: playerId, season },
    `player:${playerId}:${season}`,
    CACHE_TTL.PLAYER
  );
  return data[0] ?? null;
}

export async function getHeadToHead(
  team1: number,
  team2: number
): Promise<H2HMatch[]> {
  return apiFootballRequest<H2HMatch[]>(
    "/fixtures/headtohead",
    { h2h: `${team1}-${team2}` },
    `h2h:${team1}:${team2}`,
    CACHE_TTL.H2H
  );
}

export async function searchTeams(query: string): Promise<TeamDetail[]> {
  return apiFootballRequest<TeamDetail[]>(
    "/teams",
    { search: query },
    `search:teams:${query}`,
    CACHE_TTL.TEAM
  );
}

export async function searchPlayers(
  query: string,
  season: number
): Promise<{ player: Player }[]> {
  return apiFootballRequest<{ player: Player }[]>(
    "/players",
    { search: query, season },
    `search:players:${query}:${season}`,
    CACHE_TTL.PLAYER
  );
}
