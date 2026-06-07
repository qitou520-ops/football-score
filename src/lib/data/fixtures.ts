import { getFootballProvider } from "@/lib/football/provider";
import { CURRENT_SEASON } from "@/lib/config";
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
  return getFootballProvider().getStandings(leagueId, CURRENT_SEASON);
}

export async function getLeagueFixtures(leagueId: number): Promise<Fixture[]> {
  return getFootballProvider().getLeagueFixtures(leagueId, CURRENT_SEASON);
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
