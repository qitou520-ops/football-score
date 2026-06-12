/**
 * 客户端翻译 — 联赛/球队含 auto-*.json，保证即时比分列表中文显示
 */
import teamsData from "@/data/translations/teams.json";
import autoTeamsData from "@/data/translations/auto-teams.json";
import leaguesData from "@/data/translations/leagues.json";
import autoLeaguesData from "@/data/translations/auto-leagues.json";
import countriesData from "@/data/translations/countries.json";
import autoCountriesData from "@/data/translations/auto-countries.json";
import playersData from "@/data/translations/players.json";
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
  countries: {
    ...(autoCountriesData as TranslationMaps["countries"]),
    ...(countriesData as TranslationMaps["countries"]),
  },
  players: playersData as TranslationMaps["players"],
};

export const translateTeamName = (id: number | undefined, name: string) =>
  translateTeamNameWithMaps(maps, id, name);

export const translateLeagueName = (id: number | undefined, name: string, country?: string) =>
  translateLeagueNameWithMaps(maps, id, name, country);

export const translatePlayerName = (id: number | undefined, name: string) =>
  translatePlayerNameWithMaps(maps, id, name);

export const translateCountryName = (name: string) =>
  translateCountryNameWithMaps(maps, name);
