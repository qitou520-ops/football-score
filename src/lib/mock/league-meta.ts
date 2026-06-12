import type { LeagueTeamItem, LeagueTopScorer } from "@/lib/football/types";
import { getStandings } from "./fixtures";

const MOCK_SCORERS: LeagueTopScorer[] = [
  {
    player: {
      id: 1100,
      name: "E. Haaland",
      firstname: "Erling",
      lastname: "Haaland",
      age: 25,
      birth: { date: "2000-07-21", place: null, country: "Norway" },
      nationality: "Norway",
      height: "195",
      weight: "88",
      injured: false,
      photo: "https://media.api-sports.io/football/players/1100.png",
    },
    team: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png", winner: null },
    goals: 18,
    assists: 4,
    appearances: 20,
    penalties: 2,
  },
  {
    player: {
      id: 278,
      name: "M. Salah",
      firstname: "Mohamed",
      lastname: "Salah",
      age: 33,
      birth: { date: "1992-06-15", place: null, country: "Egypt" },
      nationality: "Egypt",
      height: "175",
      weight: "71",
      injured: false,
      photo: "https://media.api-sports.io/football/players/278.png",
    },
    team: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", winner: null },
    goals: 15,
    assists: 8,
    appearances: 21,
    penalties: 3,
  },
];

export function getLeagueTeams(leagueId: number): LeagueTeamItem[] {
  const standings = getStandings(leagueId);
  const teams: LeagueTeamItem[] = [];
  const seen = new Set<number>();
  for (const group of standings) {
    for (const row of group) {
      if (seen.has(row.team.id)) continue;
      seen.add(row.team.id);
      teams.push({
        id: row.team.id,
        name: row.team.name,
        logo: row.team.logo,
        country: "",
      });
    }
  }
  return teams;
}

export function getLeagueTopScorers(_leagueId: number): LeagueTopScorer[] {
  return MOCK_SCORERS;
}
