/**
 * 从 API-Football 拉取当日比赛，自动翻译缺失的球队/联赛名称并写入 auto-*.json
 * 运行: npx tsx scripts/sync-translations.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");
const TEAMS_PATH = resolve(ROOT, "src/data/translations/teams.json");
const LEAGUES_PATH = resolve(ROOT, "src/data/translations/leagues.json");
const AUTO_TEAMS_PATH = resolve(ROOT, "src/data/translations/auto-teams.json");
const AUTO_LEAGUES_PATH = resolve(ROOT, "src/data/translations/auto-leagues.json");

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

async function translateEnToZh(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
  const res = await fetch(url);
  const json = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (json.responseStatus !== 200 || !json.responseData?.translatedText) {
    return text;
  }
  const out = json.responseData.translatedText.trim();
  // MyMemory 有时返回大写或带多余说明
  if (!out || out.toLowerCase() === text.toLowerCase()) return text;
  return out;
}

function hasTranslation(map: Map, id: number, name: string): boolean {
  return Boolean(map[String(id)] || map[name]);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadEnv();
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    console.error("缺少 API_FOOTBALL_KEY");
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const dates = [today];
  // 多拉几天以覆盖更多球队
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const teams = { ...loadJson(TEAMS_PATH), ...loadJson(AUTO_TEAMS_PATH) };
  const leagues = { ...loadJson(LEAGUES_PATH), ...loadJson(AUTO_LEAGUES_PATH) };
  const newTeams: Map = loadJson(AUTO_TEAMS_PATH);
  const newLeagues: Map = loadJson(AUTO_LEAGUES_PATH);

  const teamSet = new Map<number, string>();
  const leagueSet = new Map<number, string>();

  for (const date of dates) {
    const url = `https://v3.football.api-sports.io/fixtures?date=${date}`;
    const res = await fetch(url, { headers: { "x-apisports-key": key } });
    const json = (await res.json()) as {
      response?: Array<{
        league: { id: number; name: string };
        teams: { home: { id: number; name: string }; away: { id: number; name: string } };
      }>;
    };
    for (const item of json.response ?? []) {
      leagueSet.set(item.league.id, item.league.name);
      teamSet.set(item.teams.home.id, item.teams.home.name);
      teamSet.set(item.teams.away.id, item.teams.away.name);
    }
    console.log(`日期 ${date}: ${json.response?.length ?? 0} 场比赛`);
    await sleep(400);
  }

  console.log(`共 ${leagueSet.size} 个联赛, ${teamSet.size} 支球队`);

  let leagueAdded = 0;
  for (const [id, name] of leagueSet) {
    if (hasTranslation(leagues, id, name)) continue;
    const zh = await translateEnToZh(name);
    newLeagues[String(id)] = zh;
    newLeagues[name] = zh;
    leagues[String(id)] = zh;
    leagues[name] = zh;
    leagueAdded++;
    console.log(`联赛 + ${name} => ${zh}`);
    await sleep(350);
  }

  let teamAdded = 0;
  for (const [id, name] of teamSet) {
    if (hasTranslation(teams, id, name)) continue;
    const zh = await translateEnToZh(name);
    newTeams[String(id)] = zh;
    newTeams[name] = zh;
    teams[String(id)] = zh;
    teams[name] = zh;
    teamAdded++;
    if (teamAdded % 20 === 0) console.log(`球队进度 ${teamAdded}...`);
    await sleep(350);
  }

  saveJson(AUTO_LEAGUES_PATH, newLeagues);
  saveJson(AUTO_TEAMS_PATH, newTeams);
  console.log(`完成: 新增联赛 ${leagueAdded}, 新增球队 ${teamAdded}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
