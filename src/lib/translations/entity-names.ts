import teamsData from "@/data/translations/teams.json";
import autoTeamsData from "@/data/translations/auto-teams.json";
import leaguesData from "@/data/translations/leagues.json";
import autoLeaguesData from "@/data/translations/auto-leagues.json";
import countriesData from "@/data/translations/countries.json";
import autoCountriesData from "@/data/translations/auto-countries.json";
import playersData from "@/data/translations/players.json";
import autoPlayersData from "@/data/translations/auto-players.json";
import {
  type TranslationMaps,
  translateTeamNameWithMaps,
  translateLeagueNameWithMaps,
  translatePlayerNameWithMaps,
  translateCountryNameWithMaps,
} from "./lookup";

const maps: TranslationMaps = {
  teams: { ...(autoTeamsData as TranslationMaps["teams"]), ...(teamsData as TranslationMaps["teams"]) },
  leagues: { ...(autoLeaguesData as TranslationMaps["leagues"]), ...(leaguesData as TranslationMaps["leagues"]) },
  countries: { ...(autoCountriesData as TranslationMaps["countries"]), ...(countriesData as TranslationMaps["countries"]) },
  players: { ...(autoPlayersData as TranslationMaps["players"]), ...(playersData as TranslationMaps["players"]) },
};

export function translateTeamName(id: number | undefined, name: string): string {
  return translateTeamNameWithMaps(maps, id, name);
}

export function translateLeagueName(
  id: number | undefined,
  name: string,
  country?: string
): string {
  return translateLeagueNameWithMaps(maps, id, name, country);
}

export function translatePlayerName(id: number | undefined, name: string): string {
  return translatePlayerNameWithMaps(maps, id, name);
}

export function translateCountryName(name: string): string {
  return translateCountryNameWithMaps(maps, name);
}

/** 批量翻译积分榜/列表中的球队名（仅用于显示，不修改原数据） */
export function translateStandingTeamNames<T extends { team: { id: number; name: string } }>(
  rows: T[]
): T[] {
  return rows.map((row) => ({
    ...row,
    team: {
      ...row.team,
      name: translateTeamName(row.team.id, row.team.name),
    },
  }));
}
