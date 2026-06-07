import type { Fixture, StandingRow } from "./types";

export function getMockFixtures(): Fixture[] {
  const now = new Date();
  const today = now.toISOString();

  return [
    createMockFixture(1001, "1H", 35, "Manchester City", "Arsenal", 2, 1, 39, "Premier League", today),
    createMockFixture(1002, "HT", null, "Real Madrid", "Barcelona", 1, 1, 140, "La Liga", today),
    createMockFixture(1003, "NS", null, "Bayern Munich", "Dortmund", null, null, 78, "Bundesliga", today),
    createMockFixture(1004, "FT", null, "Liverpool", "Chelsea", 3, 0, 39, "Premier League", today),
    createMockFixture(1005, "2H", 78, "Inter Milan", "AC Milan", 1, 2, 135, "Serie A", today),
    createMockFixture(1006, "NS", null, "PSG", "Marseille", null, null, 61, "Ligue 1", today),
  ];
}

export function getMockFixtureById(id: number): Fixture | null {
  return getMockFixtures().find((f) => f.fixture.id === id) ?? getMockFixtures()[0];
}

export function getMockStandings(): StandingRow[][] {
  const teams = [
    { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png", winner: null },
    { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png", winner: null },
    { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", winner: null },
    { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png", winner: null },
    { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png", winner: null },
  ];

  const rows: StandingRow[] = teams.map((team, i) => ({
    rank: i + 1,
    team,
    points: 70 - i * 5,
    goalsDiff: 30 - i * 8,
    group: "Premier League",
    form: "WWDLW",
    status: i < 4 ? "Champions League" : "",
    description: null,
    all: { played: 30, win: 20 - i, draw: 5, lose: 5 + i, goals: { for: 60 - i * 5, against: 30 + i * 3 } },
    home: { played: 15, win: 12 - i, draw: 2, lose: 1 + i, goals: { for: 35, against: 12 } },
    away: { played: 15, win: 8 - i, draw: 3, lose: 4 + i, goals: { for: 25, against: 18 } },
    update: new Date().toISOString(),
  }));

  return [rows];
}

function createMockFixture(
  id: number,
  status: string,
  elapsed: number | null,
  home: string,
  away: string,
  homeGoals: number | null,
  awayGoals: number | null,
  leagueId: number,
  leagueName: string,
  date: string
): Fixture {
  return {
    fixture: {
      id,
      referee: "Michael Oliver",
      timezone: "UTC",
      date,
      timestamp: Math.floor(new Date(date).getTime() / 1000),
      periods: { first: status !== "NS" ? 1700000000 : null, second: ["2H", "FT"].includes(status) ? 1700003600 : null },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: {
        long: status === "1H" ? "First Half" : status === "FT" ? "Match Finished" : "Not Started",
        short: status,
        elapsed,
        extra: null,
      },
    },
    league: {
      id: leagueId,
      name: leagueName,
      country: "England",
      logo: `https://media.api-sports.io/football/leagues/${leagueId}.png`,
      flag: null,
      season: 2024,
      round: "Regular Season - 30",
    },
    teams: {
      home: { id: id * 10, name: home, logo: `https://media.api-sports.io/football/teams/${id * 10}.png`, winner: homeGoals !== null && awayGoals !== null ? homeGoals > awayGoals : null },
      away: { id: id * 10 + 1, name: away, logo: `https://media.api-sports.io/football/teams/${id * 10 + 1}.png`, winner: homeGoals !== null && awayGoals !== null ? awayGoals > homeGoals : null },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: homeGoals !== null ? Math.min(homeGoals, 1) : null, away: awayGoals !== null ? Math.min(awayGoals, 1) : null },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}
