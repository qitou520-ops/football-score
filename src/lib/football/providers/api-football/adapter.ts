/**
 * API-Football → 统一领域模型 适配器
 * 当 API-Football 响应结构与领域模型不一致时，在此层做转换
 */
import type * as Domain from "@/lib/football/types";
import type * as Vendor from "@/lib/api-football/types";

export function adaptFixture(raw: Vendor.Fixture): Domain.Fixture {
  return raw;
}

export function adaptFixtures(raw: Vendor.Fixture[]): Domain.Fixture[] {
  return raw.map(adaptFixture);
}

export function adaptStandingRows(raw: Vendor.StandingRow[][]): Domain.StandingRow[][] {
  return raw;
}

export function adaptMatchEvents(raw: Vendor.MatchEvent[]): Domain.MatchEvent[] {
  return raw;
}

export function adaptMatchStatistics(raw: Vendor.MatchStatistic[]): Domain.MatchStatistic[] {
  return raw;
}

export function adaptTeamDetail(raw: Vendor.TeamDetail): Domain.TeamDetail {
  return raw;
}

export function adaptTeamDetails(raw: Vendor.TeamDetail[]): Domain.TeamDetail[] {
  return raw.map(adaptTeamDetail);
}

export function adaptH2H(raw: Vendor.H2HMatch[]): Domain.H2HMatch[] {
  return adaptFixtures(raw);
}

export function adaptLineups(raw: Vendor.FixtureLineup[]): Domain.FixtureLineup[] {
  return raw;
}

export function adaptPlayer(raw: Vendor.Player): Domain.Player {
  return raw;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptPlayerSeasonStats(raw: any): Domain.PlayerSeasonStats | null {
  if (!raw) return null;
  const games = raw.games ?? {};
  const goals = raw.goals ?? {};
  const cards = raw.cards ?? {};
  return {
    appearances: games.appearences ?? games.appearances ?? 0,
    goals: goals.total ?? 0,
    assists: goals.assists ?? 0,
    yellowCards: cards.yellow ?? 0,
    redCards: cards.red ?? 0,
    minutes: games.minutes ?? 0,
    rating: parseFloat(games.rating ?? "0") || 0,
    league: raw.league?.name ?? "-",
    team: raw.team?.name ?? "-",
  };
}

export function adaptPlayerProfile(
  player: Vendor.Player,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statistics: any[]
): Domain.PlayerProfile {
  return {
    player: adaptPlayer(player),
    statistics: statistics
      .map(adaptPlayerSeasonStats)
      .filter((s): s is Domain.PlayerSeasonStats => s !== null),
  };
}

export function adaptPlayerSearchResults(
  raw: { player: Vendor.Player }[]
): Domain.PlayerSearchResult[] {
  return raw.map((r) => ({ player: adaptPlayer(r.player) }));
}
