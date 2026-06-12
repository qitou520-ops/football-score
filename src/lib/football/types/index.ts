/**
 * 统一领域模型 — 所有数据供应商必须适配为此格式
 * 前端与业务层只依赖此模块，不依赖任何第三方 API 结构
 */

export interface TeamInfo {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: { first: number | null; second: number | null };
    venue: { id: number | null; name: string | null; city: string | null };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface StandingRow {
  rank: number;
  team: TeamInfo;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  update: string;
}

export interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: TeamInfo;
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface MatchStatistic {
  team: TeamInfo;
  statistics: { type: string; value: number | string | null }[];
}

export interface Player {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: { date: string; place: string | null; country: string | null };
  nationality: string;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string;
}

export interface TeamDetail {
  team: TeamInfo & { code: string | null; country: string; founded: number | null; national: boolean };
  venue: { id: number; name: string; address: string; city: string; capacity: number; surface: string; image: string };
}

export type H2HMatch = Fixture;

export interface FixtureLineup {
  team: TeamInfo;
  formation: string;
  startXI: { player: { id: number; name: string; number: number; pos: string; grid: string | null } }[];
  substitutes: { player: { id: number; name: string; number: number; pos: string; grid: string | null } }[];
}

export interface LeagueTeamItem {
  id: number;
  name: string;
  logo: string;
  country: string;
}

export interface LeagueTopScorer {
  player: Player;
  team: TeamInfo;
  goals: number;
  assists: number;
  appearances: number;
  penalties: number;
}

export interface PlayerSeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  rating: number;
  league: string;
  team: string;
}

export interface PlayerProfile {
  player: Player;
  statistics: PlayerSeasonStats[];
}

export interface PlayerSearchResult {
  player: Player;
}

export interface LeagueInfo {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
}

export interface ProviderHealth {
  configured: boolean;
  providerId: FootballProviderId;
  providerName: string;
  message?: string;
}

/** 供应商标识 — 与 FOOTBALL_DATA_PROVIDER 环境变量对应 */
export type FootballProviderId =
  | "api-football"
  | "goalserve"
  | "sportsdataio"
  | "sportradar"
  | "mock";
