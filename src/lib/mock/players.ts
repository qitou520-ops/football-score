import type { Player } from "@/lib/api-football/types";

export interface PlayerSeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  rating: number;
  league: string;
  team: string;
}

export interface MockPlayer {
  player: Player;
  statistics: PlayerSeasonStats[];
}

const PLAYERS: MockPlayer[] = [
  {
    player: {
      id: 1100,
      name: "埃尔林·哈兰德",
      firstname: "Erling",
      lastname: "Haaland",
      age: 25,
      birth: { date: "2000-07-21", place: "利兹", country: "挪威" },
      nationality: "挪威",
      height: "195 cm",
      weight: "88 kg",
      injured: false,
      photo: "https://media.api-sports.io/football/players/1100.png",
    },
    statistics: [{
      appearances: 28, goals: 25, assists: 5, yellowCards: 2, redCards: 0,
      minutes: 2340, rating: 7.8, league: "英超", team: "曼城",
    }],
  },
  {
    player: {
      id: 278,
      name: "基利安·姆巴佩",
      firstname: "Kylian",
      lastname: "Mbappé",
      age: 27,
      birth: { date: "1998-12-20", place: "巴黎", country: "法国" },
      nationality: "法国",
      height: "178 cm",
      weight: "73 kg",
      injured: false,
      photo: "https://media.api-sports.io/football/players/278.png",
    },
    statistics: [{
      appearances: 30, goals: 22, assists: 8, yellowCards: 3, redCards: 0,
      minutes: 2580, rating: 7.6, league: "西甲", team: "皇家马德里",
    }],
  },
  {
    player: {
      id: 154,
      name: "凯文·德布劳内",
      firstname: "Kevin",
      lastname: "De Bruyne",
      age: 34,
      birth: { date: "1991-06-28", place: "根特", country: "比利时" },
      nationality: "比利时",
      height: "181 cm",
      weight: "76 kg",
      injured: false,
      photo: "https://media.api-sports.io/football/players/154.png",
    },
    statistics: [{
      appearances: 22, goals: 6, assists: 14, yellowCards: 1, redCards: 0,
      minutes: 1890, rating: 7.9, league: "英超", team: "曼城",
    }],
  },
  {
    player: {
      id: 2935,
      name: "布卡约·萨卡",
      firstname: "Bukayo",
      lastname: "Saka",
      age: 24,
      birth: { date: "2001-09-05", place: "伦敦", country: "英格兰" },
      nationality: "英格兰",
      height: "178 cm",
      weight: "72 kg",
      injured: false,
      photo: "https://media.api-sports.io/football/players/2935.png",
    },
    statistics: [{
      appearances: 29, goals: 12, assists: 10, yellowCards: 4, redCards: 0,
      minutes: 2450, rating: 7.5, league: "英超", team: "阿森纳",
    }],
  },
  {
    player: {
      id: 37127,
      name: "裘德·贝林厄姆",
      firstname: "Jude",
      lastname: "Bellingham",
      age: 22,
      birth: { date: "2003-06-29", place: "伯明翰", country: "英格兰" },
      nationality: "英格兰",
      height: "186 cm",
      weight: "75 kg",
      injured: false,
      photo: "https://media.api-sports.io/football/players/37127.png",
    },
    statistics: [{
      appearances: 27, goals: 15, assists: 7, yellowCards: 5, redCards: 0,
      minutes: 2280, rating: 7.7, league: "西甲", team: "皇家马德里",
    }],
  },
];

export function getAllPlayers() {
  return PLAYERS;
}

export function getPlayerById(id: number) {
  return PLAYERS.find((p) => p.player.id === id) ?? null;
}

export function searchPlayers(query: string) {
  const q = query.toLowerCase();
  return PLAYERS.filter((p) => p.player.name.toLowerCase().includes(q));
}
