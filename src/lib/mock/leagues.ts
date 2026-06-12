/** API-Football 世界杯联赛 ID */
export const WORLD_CUP_LEAGUE_ID = 1;

export const POPULAR_LEAGUES = [
  { id: 1, name: "世界杯", country: "国际", logo: "https://media.api-sports.io/football/leagues/1.png" },
  { id: 39, name: "英超", country: "英格兰", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: 140, name: "西甲", country: "西班牙", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: 135, name: "意甲", country: "意大利", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: 78, name: "德甲", country: "德国", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: 61, name: "法甲", country: "法国", logo: "https://media.api-sports.io/football/leagues/61.png" },
  { id: 2, name: "欧冠", country: "欧洲", logo: "https://media.api-sports.io/football/leagues/2.png" },
  { id: 3, name: "欧联杯", country: "欧洲", logo: "https://media.api-sports.io/football/leagues/3.png" },
] as const;

/** 首页联赛展示优先级（与 POPULAR_LEAGUES 顺序一致） */
export const LEAGUE_PRIORITY_IDS = POPULAR_LEAGUES.map((l) => l.id);

export function getLeagueById(id: number) {
  return POPULAR_LEAGUES.find((l) => l.id === id);
}
