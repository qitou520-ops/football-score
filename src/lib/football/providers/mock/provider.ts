import "server-only";

import type { FootballDataProvider } from "@/lib/football/provider/interface";
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
} from "@/lib/football/types";
import { adaptMockPlayer } from "./adapter";

/**
 * 本地 Mock 数据供应商
 */
export class MockFootballProvider implements FootballDataProvider {
  readonly id = "mock" as const;
  readonly name = "Mock Data";

  isConfigured(): boolean {
    return true;
  }

  getHealth() {
    return {
      configured: true,
      providerId: this.id,
      providerName: this.name,
      message: "本地 Mock 数据",
    };
  }

  private async fixtures() {
    return import("@/lib/mock/fixtures");
  }

  private async players() {
    return import("@/lib/mock/players");
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    return (await this.fixtures()).getLiveFixtures();
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    return (await this.fixtures()).getFixturesByDate(date);
  }

  async getTodayFixtures(): Promise<Fixture[]> {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return this.getFixturesByDate(date);
  }

  async getFixtureById(id: number): Promise<Fixture | null> {
    return (await this.fixtures()).getFixtureById(id);
  }

  async getLeagueFixtures(leagueId: number): Promise<Fixture[]> {
    return (await this.fixtures()).getLeagueFixtures(leagueId);
  }

  async getTeamFixtures(teamId: number): Promise<Fixture[]> {
    return (await this.fixtures()).getTeamFixtures(teamId);
  }

  async getFixtureEvents(fixtureId: number): Promise<MatchEvent[]> {
    return (await this.fixtures()).getFixtureEvents(fixtureId);
  }

  async getFixtureStatistics(fixtureId: number): Promise<MatchStatistic[]> {
    return (await this.fixtures()).getFixtureStatistics(fixtureId);
  }

  async getFixtureLineups(): Promise<FixtureLineup[]> {
    return [];
  }

  async getHeadToHead(team1: number, team2: number): Promise<H2HMatch[]> {
    return (await this.fixtures()).getHeadToHead(team1, team2);
  }

  async getTeamById(id: number): Promise<TeamDetail | null> {
    return (await this.fixtures()).getTeamById(id);
  }

  async searchTeams(query: string): Promise<TeamDetail[]> {
    return (await this.fixtures()).searchTeams(query);
  }

  async getPlayerById(id: number): Promise<PlayerProfile | null> {
    const raw = await (await this.players()).getPlayerById(id);
    return raw ? adaptMockPlayer(raw) : null;
  }

  async searchPlayers(query: string): Promise<PlayerSearchResult[]> {
    const results = await (await this.players()).searchPlayers(query);
    return results.map((r) => ({ player: r.player }));
  }

  async getStandings(leagueId: number): Promise<StandingRow[][]> {
    return (await this.fixtures()).getStandings(leagueId);
  }
}
