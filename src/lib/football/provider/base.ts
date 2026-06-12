import type { FootballDataProvider } from "./interface";
import type { FootballProviderId, ProviderHealth } from "@/lib/football/types";
import { ProviderNotImplementedError } from "./errors";

/**
 * 占位供应商基类 — 仅用于尚未实现的第三方数据源
 */
export abstract class StubFootballProvider implements FootballDataProvider {
  abstract readonly id: FootballProviderId;
  abstract readonly name: string;

  abstract isConfigured(): boolean;

  getHealth(): ProviderHealth {
    return {
      configured: this.isConfigured(),
      providerId: this.id,
      providerName: this.name,
      message: this.isConfigured() ? `${this.name} 已配置，适配器待实现` : "未配置 API Key",
    };
  }

  protected notImplemented(method: string): never {
    throw new ProviderNotImplementedError(this.id, method);
  }

  async getLiveFixtures() { return this.notImplemented("getLiveFixtures"); }
  async getFixturesByDate(_date: string) { return this.notImplemented("getFixturesByDate"); }
  async getTodayFixtures() { return this.notImplemented("getTodayFixtures"); }
  async getFixtureById(_id: number) { return this.notImplemented("getFixtureById"); }
  async getLeagueFixtures(_leagueId: number, _season?: number) { return this.notImplemented("getLeagueFixtures"); }
  async getTeamFixtures(_teamId: number, _season?: number) { return this.notImplemented("getTeamFixtures"); }
  async getFixtureEvents(_fixtureId: number) { return this.notImplemented("getFixtureEvents"); }
  async getFixtureStatistics(_fixtureId: number) { return this.notImplemented("getFixtureStatistics"); }
  async getFixtureLineups(_fixtureId: number) { return this.notImplemented("getFixtureLineups"); }
  async getHeadToHead(_team1: number, _team2: number) { return this.notImplemented("getHeadToHead"); }
  async getTeamById(_id: number) { return this.notImplemented("getTeamById"); }
  async searchTeams(_query: string) { return this.notImplemented("searchTeams"); }
  async getPlayerById(_id: number, _season?: number) { return this.notImplemented("getPlayerById"); }
  async searchPlayers(_query: string, _season?: number) { return this.notImplemented("searchPlayers"); }
  async getStandings(_leagueId: number, _season?: number) { return this.notImplemented("getStandings"); }
  async getLeagueTeams(_leagueId: number, _season?: number) { return this.notImplemented("getLeagueTeams"); }
  async getLeagueTopScorers(_leagueId: number, _season?: number) { return this.notImplemented("getLeagueTopScorers"); }
}
