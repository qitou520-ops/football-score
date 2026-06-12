import "server-only";

import type { FootballDataProvider } from "@/lib/football/provider/interface";
import { CURRENT_SEASON } from "@/lib/config";
import * as adapter from "./adapter";

async function client() {
  return import("@/lib/api-football");
}

function isApiKeyConfigured(): boolean {
  const key = process.env.API_FOOTBALL_KEY?.replace(/^["']|["']$/g, "").trim();
  return Boolean(key && key !== "your-api-key-here");
}

/**
 * API-Football 数据供应商实现
 */
export class ApiFootballProvider implements FootballDataProvider {
  readonly id = "api-football" as const;
  readonly name = "API-Football";

  isConfigured(): boolean {
    return isApiKeyConfigured();
  }

  getHealth() {
    return {
      configured: this.isConfigured(),
      providerId: this.id,
      providerName: this.name,
      message: this.isConfigured() ? "已连接" : "请配置 API_FOOTBALL_KEY",
    };
  }

  async getLiveFixtures() {
    const api = await client();
    return adapter.adaptFixtures(await api.getLiveFixtures());
  }

  async getFixturesByDate(date: string) {
    const api = await client();
    return adapter.adaptFixtures(await api.getFixturesByDate(date));
  }

  async getTodayFixtures() {
    const api = await client();
    return adapter.adaptFixtures(await api.getTodayFixtures());
  }

  async getFixtureById(id: number) {
    const api = await client();
    const raw = await api.getFixtureById(id);
    return raw ? adapter.adaptFixture(raw) : null;
  }

  async getLeagueFixtures(leagueId: number, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptFixtures(await api.getLeagueFixtures(leagueId, season));
  }

  async getTeamFixtures(teamId: number, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptFixtures(await api.getTeamFixtures(teamId, season));
  }

  async getFixtureEvents(fixtureId: number) {
    const api = await client();
    return adapter.adaptMatchEvents(await api.getFixtureEvents(fixtureId));
  }

  async getFixtureStatistics(fixtureId: number) {
    const api = await client();
    return adapter.adaptMatchStatistics(await api.getFixtureStatistics(fixtureId));
  }

  async getFixtureLineups(fixtureId: number) {
    const api = await client();
    return adapter.adaptLineups(await api.getFixtureLineups(fixtureId));
  }

  async getHeadToHead(team1: number, team2: number) {
    try {
      const api = await client();
      return adapter.adaptH2H(await api.getHeadToHead(team1, team2));
    } catch {
      return [];
    }
  }

  async getTeamById(id: number) {
    const api = await client();
    const raw = await api.getTeamById(id);
    return raw ? adapter.adaptTeamDetail(raw) : null;
  }

  async searchTeams(query: string) {
    const api = await client();
    return adapter.adaptTeamDetails(await api.searchTeams(query));
  }

  async getPlayerById(id: number, season = CURRENT_SEASON) {
    const api = await client();
    const result = await api.getPlayerById(id, season);
    if (!result?.player) return null;
    return adapter.adaptPlayerProfile(result.player, result.statistics as unknown[]);
  }

  async searchPlayers(query: string, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptPlayerSearchResults(await api.searchPlayers(query, season));
  }

  async getStandings(leagueId: number, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptStandingRows(await api.getStandings(leagueId, season));
  }

  async getLeagueTeams(leagueId: number, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptLeagueTeams(await api.getLeagueTeams(leagueId, season));
  }

  async getLeagueTopScorers(leagueId: number, season = CURRENT_SEASON) {
    const api = await client();
    return adapter.adaptTopScorers(await api.getTopScorers(leagueId, season));
  }

  async clearCache(keys?: string[]) {
    const api = await client();
    await api.clearApiCache(keys);
  }
}
