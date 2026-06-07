import teamsData from "@/data/translations/teams.json";
import autoTeamsData from "@/data/translations/auto-teams.json";
import leaguesData from "@/data/translations/leagues.json";
import autoLeaguesData from "@/data/translations/auto-leagues.json";
import countriesData from "@/data/translations/countries.json";
import { translateLeagueByPattern } from "./league-patterns";

type TranslationMap = Record<string, string>;

const manualTeams = teamsData as TranslationMap;
const autoTeams = autoTeamsData as TranslationMap;
const manualLeagues = leaguesData as TranslationMap;
const autoLeagues = autoLeaguesData as TranslationMap;
const countries = countriesData as TranslationMap;

function lookupIn(map: TranslationMap, id: number | undefined, fallback: string): string | null {
  if (id != null) {
    const byId = map[String(id)];
    if (byId) return byId;
  }
  const byName = map[fallback];
  if (byName) return byName;
  return null;
}

function normalizeName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

/** 球队名称：手动词典 → 自动词典 → 原名 */
export function translateTeamName(id: number | undefined, name: string): string {
  const key = normalizeName(name);
  const manual = lookupIn(manualTeams, id, key);
  if (manual) return manual;
  const auto = lookupIn(autoTeams, id, key);
  if (auto) return auto;
  const stripped = key.replace(/\s+FC$/i, "").replace(/\s+SC$/i, "");
  if (stripped !== key) {
    const alt = lookupIn(manualTeams, id, stripped) ?? lookupIn(autoTeams, id, stripped);
    if (alt) return alt;
  }
  return name;
}

/** 联赛名称：手动词典 → 规则匹配 → 自动词典 → 原名 */
export function translateLeagueName(id: number | undefined, name: string): string {
  const key = normalizeName(name);
  const manual = lookupIn(manualLeagues, id, key);
  if (manual) return manual;
  const pattern = translateLeagueByPattern(key);
  if (pattern) return pattern;
  const auto = lookupIn(autoLeagues, id, key);
  if (auto) return auto;
  return name;
}

/** 国家/地区名称：优先中文，无翻译则显示原始名称 */
export function translateCountryName(name: string): string {
  return countries[name] ?? name;
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
