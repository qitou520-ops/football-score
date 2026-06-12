import type { Fixture } from "@/lib/football/types";
import {
  translateCountryName,
  translateLeagueName,
  translateTeamName,
} from "./entity-names";

export function localizeFixture(fixture: Fixture, locale: string): Fixture {
  if (locale !== "zh") return fixture;

  return {
    ...fixture,
    league: {
      ...fixture.league,
      name: translateLeagueName(
        fixture.league.id,
        fixture.league.name,
        fixture.league.country
      ),
      country: translateCountryName(fixture.league.country),
    },
    teams: {
      home: {
        ...fixture.teams.home,
        name: translateTeamName(fixture.teams.home.id, fixture.teams.home.name),
      },
      away: {
        ...fixture.teams.away,
        name: translateTeamName(fixture.teams.away.id, fixture.teams.away.name),
      },
    },
  };
}

export function localizeFixtures(fixtures: Fixture[], locale: string): Fixture[] {
  if (locale !== "zh") return fixtures;
  return fixtures.map((f) => localizeFixture(f, locale));
}
