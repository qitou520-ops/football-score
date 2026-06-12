/**
 * 从 API-Football 拉取比赛数据，自动翻译球队/联赛/球员/国家名称
 * 运行: npm run translations:sync
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");
const TEAMS_PATH = resolve(ROOT, "src/data/translations/teams.json");
const LEAGUES_PATH = resolve(ROOT, "src/data/translations/leagues.json");
const PLAYERS_PATH = resolve(ROOT, "src/data/translations/players.json");
const COUNTRIES_PATH = resolve(ROOT, "src/data/translations/countries.json");
const AUTO_TEAMS_PATH = resolve(ROOT, "src/data/translations/auto-teams.json");
const AUTO_LEAGUES_PATH = resolve(ROOT, "src/data/translations/auto-leagues.json");
const AUTO_PLAYERS_PATH = resolve(ROOT, "src/data/translations/auto-players.json");
const AUTO_COUNTRIES_PATH = resolve(ROOT, "src/data/translations/auto-countries.json");

type Map = Record<string, string>;

function loadJson(path: string): Map {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf-8")) as Map;
}

function saveJson(path: string, data: Map) {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b, "en"))
  );
  writeFileSync(path, JSON.stringify(sorted, null, 2) + "\n", "utf-8");
}

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = resolve(ROOT, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

/** 国家队/常用名 — 固定大陆中文，避免机翻成「南韓」等 */
const TEAM_ZH_OVERRIDES: Record<string, string> = {
  "South Korea": "韩国",
  "Korea Republic": "韩国",
  "North Korea": "朝鲜",
  "Korea DPR": "朝鲜",
  USA: "美国",
  "United States": "美国",
  Czechia: "捷克",
  "Czech Republic": "捷克",
  "Bosnia & Herzegovina": "波黑",
  "Bosnia and Herzegovina": "波黑",
};

async function translateEnToZh(text: string): Promise<string> {
  if (TEAM_ZH_OVERRIDES[text]) return TEAM_ZH_OVERRIDES[text];
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
  const res = await fetch(url);
  const json = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (json.responseStatus !== 200 || !json.responseData?.translatedText) return text;
  const out = json.responseData.translatedText.trim();
  if (!out || out.toLowerCase() === text.toLowerCase()) return text;
  if (!/[\u3400-\u9fff]/.test(out)) return text;
  return out;
}

function hasTranslation(map: Map, id: number | string | undefined, name: string): boolean {
  if (id != null && map[String(id)]) return true;
  return Boolean(map[name]);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiGet<T>(key: string, path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`https://v3.football.api-sports.io${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers: { "x-apisports-key": key } });
  return res.json() as Promise<T>;
}

async function main() {
  loadEnv();
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    console.error("缺少 API_FOOTBALL_KEY");
    process.exit(1);
  }

  const dates: string[] = [];
  for (let i = 0; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const teams = { ...loadJson(TEAMS_PATH), ...loadJson(AUTO_TEAMS_PATH) };
  const leagues = { ...loadJson(LEAGUES_PATH), ...loadJson(AUTO_LEAGUES_PATH) };
  const players = { ...loadJson(PLAYERS_PATH), ...loadJson(AUTO_PLAYERS_PATH) };
  const countries = { ...loadJson(COUNTRIES_PATH), ...loadJson(AUTO_COUNTRIES_PATH) };

  const newTeams = loadJson(AUTO_TEAMS_PATH);
  const newLeagues = loadJson(AUTO_LEAGUES_PATH);
  const newPlayers = loadJson(AUTO_PLAYERS_PATH);
  const newCountries = loadJson(AUTO_COUNTRIES_PATH);

  const teamSet = new Map<number, string>();
  const leagueSet = new Map<number, string>();
  const countrySet = new Set<string>();
  const fixtureIds: number[] = [];

  for (const date of dates) {
    const json = await apiGet<{
      response?: Array<{
        fixture: { id: number };
        league: { id: number; name: string; country: string };
        teams: { home: { id: number; name: string }; away: { id: number; name: string } };
      }>;
    }>(key, "/fixtures", { date });
    for (const item of json.response ?? []) {
      leagueSet.set(item.league.id, item.league.name);
      teamSet.set(item.teams.home.id, item.teams.home.name);
      teamSet.set(item.teams.away.id, item.teams.away.name);
      if (item.league.country) countrySet.add(item.league.country);
      fixtureIds.push(item.fixture.id);
    }
    console.log(`日期 ${date}: ${json.response?.length ?? 0} 场比赛`);
    await sleep(300);
  }

  const playerSet = new Map<number, string>();
  const eventFixtures = fixtureIds.slice(0, 80);
  for (const fixtureId of eventFixtures) {
    const json = await apiGet<{
      response?: Array<{
        player: { id: number; name: string };
        assist: { id: number | null; name: string | null };
      }>;
    }>(key, "/fixtures/events", { fixture: fixtureId });
    for (const ev of json.response ?? []) {
      if (ev.player?.id && ev.player?.name) playerSet.set(ev.player.id, ev.player.name);
      if (ev.assist?.id && ev.assist?.name) playerSet.set(ev.assist.id, ev.assist.name);
    }
    await sleep(200);
  }

  console.log(
    `共 ${leagueSet.size} 联赛, ${teamSet.size} 球队, ${playerSet.size} 球员, ${countrySet.size} 国家`
  );

  let leagueAdded = 0;
  for (const [id, name] of leagueSet) {
    if (hasTranslation(leagues, id, name)) continue;
    const zh = await translateEnToZh(name);
    newLeagues[String(id)] = zh;
    newLeagues[name] = zh;
    leagueAdded++;
    await sleep(300);
  }

  let teamAdded = 0;
  for (const [id, name] of teamSet) {
    if (hasTranslation(teams, id, name)) continue;
    const zh = await translateEnToZh(name);
    newTeams[String(id)] = zh;
    newTeams[name] = zh;
    teamAdded++;
    if (teamAdded % 30 === 0) console.log(`球队 ${teamAdded}...`);
    await sleep(300);
  }

  let playerAdded = 0;
  for (const [id, name] of playerSet) {
    if (hasTranslation(players, id, name)) continue;
    const zh = await translateEnToZh(name);
    newPlayers[String(id)] = zh;
    newPlayers[name] = zh;
    playerAdded++;
    if (playerAdded % 20 === 0) console.log(`球员 ${playerAdded}...`);
    await sleep(300);
  }

  let countryAdded = 0;
  for (const name of countrySet) {
    if (hasTranslation(countries, undefined, name)) continue;
    const zh = await translateEnToZh(name);
    newCountries[name] = zh;
    countryAdded++;
    await sleep(250);
  }

  saveJson(AUTO_LEAGUES_PATH, newLeagues);
  saveJson(AUTO_TEAMS_PATH, newTeams);
  saveJson(AUTO_PLAYERS_PATH, newPlayers);
  saveJson(AUTO_COUNTRIES_PATH, newCountries);
  console.log(
    `完成: 联赛 +${leagueAdded}, 球队 +${teamAdded}, 球员 +${playerAdded}, 国家 +${countryAdded}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
