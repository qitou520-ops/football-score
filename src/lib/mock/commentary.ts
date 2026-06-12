import { getFixtureById } from "./fixtures";
import { isLiveStatus, formatMatchStatusLong } from "@/lib/utils";
import type { LiveCommentaryItem, LiveCommentaryResponse } from "./commentary-types";

const COMMENTARY: Record<number, LiveCommentaryItem[]> = {
  1001: [
    { id: "1001-ko", matchId: 1001, minute: null, type: "status", team: null, statusKind: "kickoff", text: "比赛开始", detail: "曼城 vs 阿森纳，伊蒂哈德球场" },
    { id: "1001-12", matchId: 1001, minute: 12, type: "goal", team: "home", player: "哈兰德", assist: "德布劳内", score: { home: 1, away: 0 }, text: "进球！哈兰德头球破门" },
    { id: "1001-18", matchId: 1001, minute: 18, type: "yellow_card", team: "away", player: "赖斯", text: "黄牌", detail: "对德布劳内的犯规动作" },
    { id: "1001-28", matchId: 1001, minute: 28, type: "goal", team: "away", player: "萨卡", score: { home: 1, away: 1 }, text: "进球！萨卡低射扳平比分" },
    { id: "1001-32", matchId: 1001, minute: 32, type: "var", team: "away", text: "VAR 介入", detail: "检查萨卡进球是否越位——进球有效" },
    { id: "1001-35", matchId: 1001, minute: 35, type: "goal", team: "home", player: "哈兰德", assist: "福登", score: { home: 2, away: 1 }, text: "进球！哈兰德梅开二度" },
    { id: "1001-38", matchId: 1001, minute: 38, type: "yellow_card", team: "away", player: "加布里埃尔", text: "黄牌", detail: "拉拽哈兰德犯规" },
    { id: "1001-41", matchId: 1001, minute: 41, type: "substitution", team: "away", playerOut: "恩凯蒂亚", playerIn: "热苏斯", text: "换人", detail: "阿森纳加强进攻" },
    { id: "1001-ht", matchId: 1001, minute: 45, extraMinute: 2, type: "status", team: null, statusKind: "ht", text: "半场结束", detail: "曼城 2 - 1 阿森纳" },
    { id: "1001-46", matchId: 1001, minute: null, type: "status", team: null, statusKind: "second_half", text: "下半场开始", detail: "" },
    { id: "1001-58", matchId: 1001, minute: 58, type: "substitution", team: "home", playerOut: "福登", playerIn: "阿尔瓦雷斯", text: "换人" },
    { id: "1001-67", matchId: 1001, minute: 67, type: "var", team: "home", text: "VAR 介入", detail: "点球判罚——维持原判，点球！" },
    { id: "1001-68", matchId: 1001, minute: 68, type: "goal", team: "home", player: "哈兰德", score: { home: 3, away: 1 }, text: "进球！哈兰德点球命中，完成帽子戏法" },
    { id: "1001-72", matchId: 1001, minute: 72, type: "red_card", team: "away", player: "若日尼奥", text: "红牌", detail: "严重犯规，两黄变一红" },
    { id: "1001-85", matchId: 1001, minute: 85, type: "substitution", team: "home", playerOut: "德布劳内", playerIn: "科瓦契奇", text: "换人" },
  ],

  1002: [
    { id: "1002-ko", matchId: 1002, minute: null, type: "status", team: null, statusKind: "kickoff", text: "比赛开始", detail: "皇家马德里 vs 巴塞罗那" },
    { id: "1002-23", matchId: 1002, minute: 23, type: "goal", team: "home", player: "维尼修斯", assist: "贝林厄姆", score: { home: 1, away: 0 }, text: "进球！维尼修斯内切射门得分" },
    { id: "1002-31", matchId: 1002, minute: 31, type: "yellow_card", team: "away", player: "加维", text: "黄牌", detail: "对贝林厄姆的犯规" },
    { id: "1002-44", matchId: 1002, minute: 44, type: "goal", team: "away", player: "莱万", assist: "亚马尔", score: { home: 1, away: 1 }, text: "进球！莱万门前补射扳平" },
    { id: "1002-ht", matchId: 1002, minute: 45, extraMinute: 1, type: "status", team: null, statusKind: "ht", text: "半场结束", detail: "皇家马德里 1 - 1 巴塞罗那" },
  ],

  1004: [
    { id: "1004-ko", matchId: 1004, minute: null, type: "status", team: null, statusKind: "kickoff", text: "比赛开始", detail: "利物浦 vs 切尔西" },
    { id: "1004-15", matchId: 1004, minute: 15, type: "goal", team: "home", player: "萨拉赫", assist: "索博斯洛伊", score: { home: 1, away: 0 }, text: "进球！萨拉赫远射破门" },
    { id: "1004-33", matchId: 1004, minute: 33, type: "yellow_card", team: "away", player: "恩佐", text: "黄牌" },
    { id: "1004-52", matchId: 1004, minute: 52, type: "goal", team: "home", player: "努涅斯", score: { home: 2, away: 0 }, text: "进球！努涅斯头球扩大优势" },
    { id: "1004-61", matchId: 1004, minute: 61, type: "substitution", team: "away", playerOut: "杰克逊", playerIn: "恩昆库", text: "换人" },
    { id: "1004-78", matchId: 1004, minute: 78, type: "var", team: "home", text: "VAR 介入", detail: "检查点球——判罚点球" },
    { id: "1004-79", matchId: 1004, minute: 79, type: "goal", team: "home", player: "萨拉赫", score: { home: 3, away: 0 }, text: "进球！萨拉赫点球梅开二度" },
    { id: "1004-88", matchId: 1004, minute: 88, type: "red_card", team: "away", player: "迪萨西", text: "红牌", detail: "最后阶段恶意犯规" },
    { id: "1004-ft", matchId: 1004, minute: 90, extraMinute: 3, type: "status", team: null, statusKind: "ft", text: "全场结束", detail: "利物浦 3 - 0 切尔西" },
  ],

  1005: [
    { id: "1005-ko", matchId: 1005, minute: null, type: "status", team: null, statusKind: "kickoff", text: "比赛开始", detail: "国际米兰 vs AC米兰" },
    { id: "1005-20", matchId: 1005, minute: 20, type: "goal", team: "home", player: "劳塔罗", score: { home: 1, away: 0 }, text: "进球！劳塔罗凌空抽射" },
    { id: "1005-55", matchId: 1005, minute: 55, type: "goal", team: "away", player: "莱奥", assist: "普利西奇", score: { home: 1, away: 1 }, text: "进球！莱奥单刀扳平" },
    { id: "1005-70", matchId: 1005, minute: 70, type: "goal", team: "away", player: "吉鲁", score: { home: 1, away: 2 }, text: "进球！吉鲁头球反超" },
    { id: "1005-82", matchId: 1005, minute: 82, type: "yellow_card", team: "home", player: "巴雷拉", text: "黄牌" },
    { id: "1005-88", matchId: 1005, minute: 88, type: "substitution", team: "home", playerOut: "图拉姆", playerIn: "阿瑙托维奇", text: "换人" },
  ],
};

function getSimulatedElapsed(matchId: number, baseElapsed: number | null, isLive: boolean): number | null {
  if (!isLive || baseElapsed == null) return baseElapsed;
  const cycle = Math.floor(Date.now() / 20000);
  const bump = cycle % 6;
  return Math.min(90, baseElapsed + bump);
}

function filterVisibleItems(items: LiveCommentaryItem[], elapsed: number | null, isLive: boolean): LiveCommentaryItem[] {
  if (!isLive || elapsed == null) return items;

  return items.filter((item) => {
    if (item.type === "status" && item.statusKind === "kickoff") return true;
    if (item.minute == null) {
      if (item.statusKind === "ht") return elapsed >= 45;
      if (item.statusKind === "second_half") return elapsed >= 46;
      if (item.statusKind === "ft") return elapsed >= 90;
      return true;
    }
    return item.minute <= elapsed;
  });
}

export function getCommentaryByMatchId(matchId: number): LiveCommentaryResponse {
  const fixture = getFixtureById(matchId);
  const items = COMMENTARY[matchId] ?? [];
  const isLive = fixture ? isLiveStatus(fixture.fixture.status.short) : false;
  const baseElapsed = fixture?.fixture.status.elapsed ?? null;
  const elapsed = getSimulatedElapsed(matchId, baseElapsed, isLive);
  const visible = filterVisibleItems(items, elapsed, isLive);

  return {
    matchId,
    isLive,
    elapsed,
    status: fixture ? formatMatchStatusLong(fixture.fixture.status, "zh") : "未开始",
    items: [...visible].sort((a, b) => {
      const ma = a.minute ?? (a.statusKind === "kickoff" ? -1 : a.statusKind === "ht" ? 45 : a.statusKind === "ft" ? 90 : 46);
      const mb = b.minute ?? (b.statusKind === "kickoff" ? -1 : b.statusKind === "ht" ? 45 : b.statusKind === "ft" ? 90 : 46);
      return mb - ma;
    }),
    updatedAt: new Date().toISOString(),
  };
}
