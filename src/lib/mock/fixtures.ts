import type { Fixture, MatchEvent, MatchStatistic, StandingRow, TeamDetail, H2HMatch } from "@/lib/api-football/types";

const TEAM = {
  city: { id: 50, name: "曼城", logo: "https://media.api-sports.io/football/teams/50.png", winner: null as boolean | null },
  arsenal: { id: 42, name: "阿森纳", logo: "https://media.api-sports.io/football/teams/42.png", winner: null as boolean | null },
  liverpool: { id: 40, name: "利物浦", logo: "https://media.api-sports.io/football/teams/40.png", winner: null as boolean | null },
  chelsea: { id: 49, name: "切尔西", logo: "https://media.api-sports.io/football/teams/49.png", winner: null as boolean | null },
  united: { id: 33, name: "曼联", logo: "https://media.api-sports.io/football/teams/33.png", winner: null as boolean | null },
  real: { id: 541, name: "皇家马德里", logo: "https://media.api-sports.io/football/teams/541.png", winner: null as boolean | null },
  barca: { id: 529, name: "巴塞罗那", logo: "https://media.api-sports.io/football/teams/529.png", winner: null as boolean | null },
  bayern: { id: 157, name: "拜仁慕尼黑", logo: "https://media.api-sports.io/football/teams/157.png", winner: null as boolean | null },
  dortmund: { id: 165, name: "多特蒙德", logo: "https://media.api-sports.io/football/teams/165.png", winner: null as boolean | null },
  inter: { id: 505, name: "国际米兰", logo: "https://media.api-sports.io/football/teams/505.png", winner: null as boolean | null },
  milan: { id: 489, name: "AC米兰", logo: "https://media.api-sports.io/football/teams/489.png", winner: null as boolean | null },
  psg: { id: 85, name: "巴黎圣日耳曼", logo: "https://media.api-sports.io/football/teams/85.png", winner: null as boolean | null },
  marseille: { id: 81, name: "马赛", logo: "https://media.api-sports.io/football/teams/81.png", winner: null as boolean | null },
};

function mkFixture(
  id: number,
  status: string,
  elapsed: number | null,
  home: typeof TEAM.city,
  away: typeof TEAM.city,
  homeGoals: number | null,
  awayGoals: number | null,
  leagueId: number,
  leagueName: string,
  country: string,
  date: string
): Fixture {
  return {
    fixture: {
      id,
      referee: "迈克尔·奥利弗",
      timezone: "Asia/Shanghai",
      date,
      timestamp: Math.floor(new Date(date).getTime() / 1000),
      periods: {
        first: status !== "NS" ? 1700000000 : null,
        second: ["2H", "FT"].includes(status) ? 1700003600 : null,
      },
      venue: { id: 1, name: "主场球场", city: "伦敦" },
      status: {
        long: status === "1H" ? "上半场" : status === "FT" ? "已结束" : status === "NS" ? "未开始" : status === "HT" ? "中场休息" : status === "2H" ? "下半场" : status || "未开始",
        short: status || "NS",
        elapsed,
        extra: null,
      },
    },
    league: {
      id: leagueId,
      name: leagueName,
      country,
      logo: `https://media.api-sports.io/football/leagues/${leagueId}.png`,
      flag: null,
      season: 2025,
      round: "第 30 轮",
    },
    teams: {
      home: {
        ...home,
        winner: homeGoals != null && awayGoals != null ? homeGoals > awayGoals : null,
      },
      away: {
        ...away,
        winner: homeGoals != null && awayGoals != null ? awayGoals > homeGoals : null,
      },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: {
        home: homeGoals != null ? Math.min(homeGoals, 1) : null,
        away: awayGoals != null ? Math.min(awayGoals, 1) : null,
      },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

const today = new Date().toISOString();

export const ALL_FIXTURES: Fixture[] = [
  mkFixture(1001, "1H", 35, TEAM.city, TEAM.arsenal, 2, 1, 39, "英超", "英格兰", today),
  mkFixture(1002, "HT", null, TEAM.real, TEAM.barca, 1, 1, 140, "西甲", "西班牙", today),
  mkFixture(1003, "NS", null, TEAM.bayern, TEAM.dortmund, null, null, 78, "德甲", "德国", today),
  mkFixture(1004, "FT", null, TEAM.liverpool, TEAM.chelsea, 3, 0, 39, "英超", "英格兰", today),
  mkFixture(1005, "2H", 78, TEAM.inter, TEAM.milan, 1, 2, 135, "意甲", "意大利", today),
  mkFixture(1006, "NS", null, TEAM.psg, TEAM.marseille, null, null, 61, "法甲", "法国", today),
  mkFixture(1007, "FT", null, TEAM.united, TEAM.city, 0, 2, 39, "英超", "英格兰", today),
  mkFixture(1008, "NS", null, TEAM.arsenal, TEAM.liverpool, null, null, 39, "英超", "英格兰", today),
];

export function getAllFixtures() {
  return ALL_FIXTURES;
}

export function getLiveFixtures() {
  return ALL_FIXTURES.filter((f) => ["1H", "2H", "HT", "LIVE"].includes(f.fixture.status.short));
}

export function getFixturesByDate(date: string) {
  void date;
  return ALL_FIXTURES;
}

export function getFixtureById(id: number) {
  return ALL_FIXTURES.find((f) => f.fixture.id === id) ?? null;
}

export function getLeagueFixtures(leagueId: number) {
  return ALL_FIXTURES.filter((f) => f.league.id === leagueId);
}

export function getTeamFixtures(teamId: number) {
  return ALL_FIXTURES.filter(
    (f) => f.teams.home.id === teamId || f.teams.away.id === teamId
  );
}

export function getStandings(leagueId: number): StandingRow[][] {
  const teams = [
    TEAM.city,
    TEAM.arsenal,
    TEAM.liverpool,
    TEAM.chelsea,
    TEAM.united,
  ];

  const rows: StandingRow[] = teams.map((team, i) => ({
    rank: i + 1,
    team: { ...team, winner: null },
    points: 70 - i * 5,
    goalsDiff: 30 - i * 8,
    group: "英超",
    form: "胜胜平负胜",
    status: i < 4 ? "欧冠" : "",
    description: null,
    all: {
      played: 30,
      win: 20 - i,
      draw: 5,
      lose: 5 + i,
      goals: { for: 60 - i * 5, against: 30 + i * 3 },
    },
    home: { played: 15, win: 12 - i, draw: 2, lose: 1 + i, goals: { for: 35, against: 12 } },
    away: { played: 15, win: 8 - i, draw: 3, lose: 4 + i, goals: { for: 25, against: 18 } },
    update: new Date().toISOString(),
  }));

  void leagueId;
  return [rows];
}

export function getFixtureEvents(fixtureId: number): MatchEvent[] {
  void fixtureId;
  return [
    {
      time: { elapsed: 12, extra: null },
      team: TEAM.city,
      player: { id: 1, name: "哈兰德" },
      assist: { id: 2, name: "德布劳内" },
      type: "Goal",
      detail: "Normal Goal",
      comments: null,
    },
    {
      time: { elapsed: 28, extra: null },
      team: TEAM.arsenal,
      player: { id: 3, name: "萨卡" },
      assist: { id: null, name: null },
      type: "Goal",
      detail: "Normal Goal",
      comments: null,
    },
    {
      time: { elapsed: 35, extra: null },
      team: TEAM.city,
      player: { id: 1, name: "哈兰德" },
      assist: { id: 4, name: "福登" },
      type: "Goal",
      detail: "Normal Goal",
      comments: null,
    },
  ];
}

export function getFixtureStatistics(fixtureId: number): MatchStatistic[] {
  void fixtureId;
  return [
    {
      team: TEAM.city,
      statistics: [
        { type: "Ball Possession", value: "58%" },
        { type: "Total Shots", value: 14 },
        { type: "Shots on Goal", value: 7 },
        { type: "Corner Kicks", value: 6 },
        { type: "Fouls", value: 11 },
      ],
    },
    {
      team: TEAM.arsenal,
      statistics: [
        { type: "Ball Possession", value: "42%" },
        { type: "Total Shots", value: 10 },
        { type: "Shots on Goal", value: 4 },
        { type: "Corner Kicks", value: 3 },
        { type: "Fouls", value: 14 },
      ],
    },
  ];
}

export function getHeadToHead(team1: number, team2: number): H2HMatch[] {
  void team1;
  void team2;
  return ALL_FIXTURES.filter((f) => f.fixture.status.short === "FT").slice(0, 5);
}

export const MOCK_TEAMS: TeamDetail[] = [
  {
    team: { ...TEAM.city, code: "MCI", country: "英格兰", founded: 1880, national: false },
    venue: { id: 1, name: "伊蒂哈德球场", address: "Etihad Campus", city: "曼彻斯特", capacity: 55097, surface: "grass", image: "" },
  },
  {
    team: { ...TEAM.arsenal, code: "ARS", country: "英格兰", founded: 1886, national: false },
    venue: { id: 2, name: "酋长球场", address: "Hornsey Road", city: "伦敦", capacity: 60704, surface: "grass", image: "" },
  },
  {
    team: { ...TEAM.liverpool, code: "LIV", country: "英格兰", founded: 1892, national: false },
    venue: { id: 3, name: "安菲尔德", address: "Anfield Road", city: "利物浦", capacity: 61276, surface: "grass", image: "" },
  },
  {
    team: { ...TEAM.real, code: "RMA", country: "西班牙", founded: 1902, national: false },
    venue: { id: 4, name: "伯纳乌球场", address: "Av. de Concha Espina", city: "马德里", capacity: 81044, surface: "grass", image: "" },
  },
  {
    team: { ...TEAM.barca, code: "BAR", country: "西班牙", founded: 1899, national: false },
    venue: { id: 5, name: "诺坎普球场", address: "C. d'Aristides Maillol", city: "巴塞罗那", capacity: 99354, surface: "grass", image: "" },
  },
];

export function getTeamById(id: number) {
  return MOCK_TEAMS.find((t) => t.team.id === id) ?? null;
}

export function searchTeams(query: string) {
  const q = query.toLowerCase();
  return MOCK_TEAMS.filter((t) => t.team.name.toLowerCase().includes(q));
}
