import { translateLeagueByPattern } from "./league-patterns";

export type TranslationMap = Record<string, string>;

export function normalizeName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

export function lookupIn(
  map: TranslationMap,
  id: number | undefined,
  fallback: string
): string | null {
  if (id != null) {
    const byId = map[String(id)];
    if (byId) return byId;
  }
  const byName = map[fallback];
  if (byName) return byName;
  return null;
}

export function hasCjk(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

export function pickTranslation(original: string, translated: string | null): string | null {
  if (!translated) return null;
  const o = original.toLowerCase();
  const t = translated.toLowerCase();
  if (t === o) return null;
  if (hasCjk(translated)) return translated;
  if (t !== o) return translated;
  return null;
}

export const TEAM_COUNTRY_ALIASES: Record<string, string> = {
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Korea Republic": "South Korea",
  "Republic of Korea": "South Korea",
  "Korea DPR": "North Korea",
  "Democratic People's Republic of Korea": "North Korea",
  USA: "United States",
  US: "United States",
  Czechia: "Czech Republic",
  "Ivory Coast": "Côte d'Ivoire",
  "Cape Verde": "Cabo Verde",
};

export interface TranslationMaps {
  teams: TranslationMap;
  leagues: TranslationMap;
  countries: TranslationMap;
  players: TranslationMap;
}

export function translateTeamNameWithMaps(
  maps: TranslationMaps,
  id: number | undefined,
  name: string
): string {
  if (!name?.trim()) return name;
  const key = normalizeName(name);

  const manual = pickTranslation(key, lookupIn(maps.teams, id, key));
  if (manual) return manual;

  const stripped = key.replace(/\s+FC$/i, "").replace(/\s+SC$/i, "");
  if (stripped !== key) {
    const alt = pickTranslation(stripped, lookupIn(maps.teams, id, stripped));
    if (alt) return alt;
  }

  const asCountry = translateAsCountryWithMaps(maps.countries, key);
  if (asCountry) return asCountry;

  return name;
}

export function translateLeagueNameWithMaps(
  maps: TranslationMaps,
  id: number | undefined,
  name: string,
  country?: string
): string {
  const key = normalizeName(name);
  const countryZh = country
    ? translateCountryNameWithMaps(maps, country)
    : undefined;
  const localizedCountry = countryZh && countryZh !== country ? countryZh : undefined;

  const pattern = translateLeagueByPattern(key, localizedCountry);
  if (pattern) return pattern;

  const manual = pickTranslation(key, lookupIn(maps.leagues, id, key));
  if (manual) return manual;

  return name;
}

export function translatePlayerNameWithMaps(
  maps: TranslationMaps,
  id: number | undefined,
  name: string
): string {
  if (!name?.trim()) return name;
  const key = normalizeName(name);
  const hit = pickTranslation(key, lookupIn(maps.players, id, key));
  return hit ?? name;
}

export function translateCountryNameWithMaps(maps: TranslationMaps, name: string): string {
  if (!name?.trim()) return name;
  const key = normalizeName(name);
  const direct = maps.countries[key];
  if (direct) return direct;
  const title = key
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return maps.countries[title] ?? name;
}

function translateAsCountryWithMaps(countries: TranslationMap, name: string): string | null {
  const key = normalizeName(name);
  const alias = TEAM_COUNTRY_ALIASES[key] ?? key;
  const zh = translateCountryNameWithMaps({ teams: {}, leagues: {}, countries, players: {} }, alias);
  if (zh !== alias) return zh;

  const youth = key.match(/^(.+?)\s+U(\d{1,2})$/i);
  if (youth) {
    const baseZh = translateCountryNameWithMaps(
      { teams: {}, leagues: {}, countries, players: {} },
      TEAM_COUNTRY_ALIASES[youth[1]] ?? youth[1]
    );
    if (baseZh !== youth[1]) return `${baseZh}U${youth[2]}`;
  }
  return null;
}
