import { getFootballProvider } from "@/lib/football/provider";
import { getLeagueSeason } from "@/lib/config";
import { WORLD_CUP_LEAGUE_ID } from "@/lib/mock/leagues";
import type { Fixture, LeagueTeamItem, LeagueTopScorer } from "@/lib/football/types";
import { getLeagueFixtures } from "./fixtures";

const WORLD_CUP_META_SEASONS = [2026, 2022];

function teamsFromFixtures(fixtures: Fixture[]): LeagueTeamItem[] {
  const byId = new Map<number, LeagueTeamItem>();
  for (const f of fixtures) {
    for (const t of [f.teams.home, f.teams.away]) {
      if (!byId.has(t.id)) {
        byId.set(t.id, {
          id: t.id,
          name: t.name,
          logo: t.logo,
          country: f.league.country || "",
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "zh"));
}

const MAX_SCORER_FIXTURE_LOOKUPS = 5;

async function scorersFromFixtures(fixtures: Fixture[]): Promise<LeagueTopScorer[]> {
  const provider = getFootballProvider();
  const finished = fixtures
    .filter((f) => ["FT", "AET", "PEN"].includes(f.fixture.status.short))
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .slice(0, MAX_SCORER_FIXTURE_LOOKUPS);
  const byPlayer = new Map<
    number,
    LeagueTopScorer & { penaltyGoals: number }
  >();

  for (const fixture of finished) {
    const events = await provider.getFixtureEvents(fixture.fixture.id).catch(() => []);
    for (const event of events) {
      if (event.type !== "Goal") continue;
      const isPenalty = event.detail?.toLowerCase().includes("penalty");
      const isOwnGoal = event.detail?.toLowerCase().includes("own");
      if (isOwnGoal) continue;

      const playerId = event.player.id;
      const existing = byPlayer.get(playerId);
      const team = event.team;

      if (existing) {
        existing.goals += 1;
        if (isPenalty) existing.penaltyGoals += 1;
        if (event.assist?.id && event.assist.name) {
          /* assists tracked on scorer row only via API topscorers */
        }
      } else {
        byPlayer.set(playerId, {
          player: {
            id: playerId,
            name: event.player.name,
            firstname: "",
            lastname: "",
            age: 0,
            birth: { date: "", place: null, country: null },
            nationality: "",
            height: null,
            weight: null,
            injured: false,
            photo: `https://media.api-sports.io/football/players/${playerId}.png`,
          },
          team: {
            id: team.id,
            name: team.name,
            logo: team.logo,
            winner: null,
          },
          goals: 1,
          assists: 0,
          appearances: 1,
          penalties: isPenalty ? 1 : 0,
          penaltyGoals: isPenalty ? 1 : 0,
        });
      }
    }
  }

  return [...byPlayer.values()]
    .map(({ penaltyGoals, ...row }) => ({
      ...row,
      penalties: penaltyGoals,
    }))
    .sort((a, b) => b.goals - a.goals);
}

export async function getLeagueTeamsList(leagueId: number): Promise<LeagueTeamItem[]> {
  const provider = getFootballProvider();
  const seasons =
    leagueId === WORLD_CUP_LEAGUE_ID
      ? WORLD_CUP_META_SEASONS
      : [getLeagueSeason(leagueId)];

  for (const season of seasons) {
    try {
      const teams = await provider.getLeagueTeams(leagueId, season);
      if (teams.length > 0) return teams;
    } catch {
      /* try next season */
    }
  }

  if (leagueId === WORLD_CUP_LEAGUE_ID) {
    const fixtures = await getLeagueFixtures(leagueId);
    const fromFixtures = teamsFromFixtures(fixtures);
    if (fromFixtures.length > 0) return fromFixtures;
  }

  return [];
}

export async function getLeagueTopScorersList(leagueId: number): Promise<LeagueTopScorer[]> {
  const provider = getFootballProvider();
  const seasons =
    leagueId === WORLD_CUP_LEAGUE_ID
      ? [2026]
      : [getLeagueSeason(leagueId)];

  for (const season of seasons) {
    try {
      const scorers = await provider.getLeagueTopScorers(leagueId, season);
      if (scorers.length > 0) return scorers;
    } catch {
      /* continue */
    }
  }

  if (leagueId === WORLD_CUP_LEAGUE_ID) {
    const fixtures = await getLeagueFixtures(leagueId);
    return scorersFromFixtures(fixtures);
  }

  return [];
}
