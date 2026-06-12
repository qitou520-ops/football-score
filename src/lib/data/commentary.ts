import { getFootballProvider } from "@/lib/football/provider";
import { getFootballProviderId } from "@/lib/config";
import { isLiveStatus, formatMatchStatusLong } from "@/lib/utils";
import {
  translateCommentaryDetail,
  translateCommentaryEventType,
} from "@/lib/commentary/zh-text";
import type { Fixture, MatchEvent, TeamInfo } from "@/lib/football/types";
import type { LiveCommentaryItem, LiveCommentaryResponse } from "@/lib/mock/commentary-types";
import { translatePlayerName } from "@/lib/translations";

function teamSide(eventTeam: TeamInfo, fixture: Fixture): "home" | "away" | null {
  if (eventTeam.id === fixture.teams.home.id) return "home";
  if (eventTeam.id === fixture.teams.away.id) return "away";
  return null;
}

function safeText(value: string | null | undefined, fallback = ""): string {
  if (value == null || value === "null" || value === "undefined") return fallback;
  const trimmed = String(value).trim();
  return trimmed || fallback;
}

function zhDetail(value: string | null | undefined): string | undefined {
  const zh = translateCommentaryDetail(value);
  return zh || undefined;
}

function sortKey(item: LiveCommentaryItem): number {
  if (item.minute != null) {
    return item.minute + (item.extraMinute ?? 0) * 0.01;
  }
  if (item.statusKind === "kickoff") return -1;
  if (item.statusKind === "ht") return 45;
  if (item.statusKind === "second_half") return 46;
  if (item.statusKind === "injury_time") return 89;
  if (item.statusKind === "ft") return 90;
  return 0;
}

function buildStatusItems(fixture: Fixture): LiveCommentaryItem[] {
  const { status, id } = fixture.fixture;
  const short = status.short;
  const home = fixture.goals.home ?? 0;
  const away = fixture.goals.away ?? 0;
  const scoreText = `${home} - ${away}`;
  const items: LiveCommentaryItem[] = [];

  if (["1H", "HT", "2H", "ET", "P", "FT", "AET", "PEN", "LIVE"].includes(short)) {
    items.push({
      id: `${id}-status-ko`,
      matchId: id,
      minute: null,
      type: "status",
      team: null,
      statusKind: "kickoff",
      text: "比赛开始",
    });
  }

  if (["HT", "2H", "ET", "P", "FT", "AET", "PEN"].includes(short)) {
    items.push({
      id: `${id}-status-ht`,
      matchId: id,
      minute: 45,
      extraMinute: status.elapsed != null && status.elapsed > 45 ? undefined : 0,
      type: "status",
      team: null,
      statusKind: "ht",
      text: "半场结束",
      detail: scoreText,
    });
  }

  if (["2H", "ET", "P", "FT", "AET", "PEN"].includes(short)) {
    items.push({
      id: `${id}-status-2h`,
      matchId: id,
      minute: null,
      type: "status",
      team: null,
      statusKind: "second_half",
      text: "下半场开始",
    });
  }

  if (["FT", "AET", "PEN"].includes(short)) {
    items.push({
      id: `${id}-status-ft`,
      matchId: id,
      minute: 90,
      type: "status",
      team: null,
      statusKind: "ft",
      text: "全场结束",
      detail: scoreText,
    });
  }

  return items;
}

function mapEventToCommentary(
  event: MatchEvent,
  fixture: Fixture,
  index: number
): LiveCommentaryItem {
  const side = teamSide(event.team, fixture);
  const minute = event.time.elapsed;
  const extra = event.time.extra ?? undefined;
  const id = `${fixture.fixture.id}-ev-${index}`;
  const playerName = translatePlayerName(event.player.id, event.player.name);
  const assistName = event.assist?.name
    ? translatePlayerName(event.assist.id ?? undefined, event.assist.name)
    : undefined;
  const detailZh = zhDetail(event.detail);
  const commentZh = zhDetail(event.comments);

  if (event.type === "Goal") {
    const isOwnGoal =
      event.detail?.toLowerCase().includes("own") || detailZh === "乌龙球";
    const isPenalty = event.detail?.toLowerCase().includes("penalty");
    let text = `进球！${playerName}`;
    if (isOwnGoal) text = `乌龙球！${playerName}`;
    else if (isPenalty) text = `点球命中！${playerName}`;

    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "goal",
      team: side,
      player: playerName,
      assist: isOwnGoal ? undefined : assistName,
      score: {
        home: fixture.goals.home ?? 0,
        away: fixture.goals.away ?? 0,
      },
      text,
      detail: detailZh,
    };
  }

  if (event.type === "Card") {
    const detail = safeText(event.detail);
    const isRed =
      detail.toLowerCase().includes("red") || detailZh === "红牌" || detailZh === "两黄变一红";
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: isRed ? "red_card" : "yellow_card",
      team: side,
      player: playerName,
      text: isRed ? `红牌！${playerName}` : `黄牌！${playerName}`,
      detail: detailZh,
    };
  }

  if (event.type === "subst") {
    const playerIn = assistName || "球员";
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "substitution",
      team: side,
      playerOut: playerName,
      playerIn,
      text: `换人：${playerIn} 换上，${playerName} 换下`,
      detail: detailZh,
    };
  }

  if (event.type === "Var") {
    const varDetail = detailZh || commentZh;
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "var",
      team: side,
      text: varDetail ? `VAR 介入：${varDetail}` : "VAR 介入",
      detail: commentZh && commentZh !== varDetail ? commentZh : undefined,
    };
  }

  const typeZh = translateCommentaryEventType(event.type);
  const fallbackText =
    detailZh || commentZh || typeZh || translateCommentaryDetail(event.type) || "比赛事件";

  return {
    id,
    matchId: fixture.fixture.id,
    minute,
    extraMinute: extra,
    type: "status",
    team: side,
    player: playerName || undefined,
    text: fallbackText,
    detail: commentZh && commentZh !== fallbackText ? commentZh : undefined,
  };
}

function dedupeItems(items: LiveCommentaryItem[]): LiveCommentaryItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}-${item.minute}-${item.text}-${item.player ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(item.text);
  });
}

async function buildCommentaryFromProvider(matchId: number): Promise<LiveCommentaryResponse | null> {
  const provider = getFootballProvider();
  const fixture = await provider.getFixtureById(matchId);
  if (!fixture) return null;

  const events = await provider.getFixtureEvents(matchId).catch(() => []);
  const isLive = isLiveStatus(fixture.fixture.status.short);
  const elapsed = fixture.fixture.status.elapsed;

  const eventItems = events.map((ev, i) => mapEventToCommentary(ev, fixture, i));
  const statusItems = buildStatusItems(fixture);

  const injuryItems: LiveCommentaryItem[] = [];
  for (const ev of events) {
    if (ev.time.extra != null && ev.time.extra > 0) {
      const period =
        ev.time.elapsed >= 90 ? "下半场" : ev.time.elapsed >= 45 ? "上半场" : "本场";
      injuryItems.push({
        id: `${matchId}-inj-${ev.time.elapsed}-${ev.time.extra}`,
        matchId,
        minute: ev.time.elapsed,
        extraMinute: ev.time.extra,
        type: "status",
        team: null,
        statusKind: "injury_time",
        text: `${period}伤停补时 +${ev.time.extra} 分钟`,
      });
      break;
    }
  }

  const items = dedupeItems([...statusItems, ...injuryItems, ...eventItems]).sort(
    (a, b) => sortKey(b) - sortKey(a)
  );

  return {
    matchId,
    isLive,
    elapsed,
    status: formatMatchStatusLong(fixture.fixture.status, "zh"),
    items,
    updatedAt: new Date().toISOString(),
  };
}

function emptyCommentary(matchId: number): LiveCommentaryResponse {
  return {
    matchId,
    isLive: false,
    elapsed: null,
    status: "未开始",
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getCommentaryByMatchId(matchId: number): Promise<LiveCommentaryResponse> {
  if (getFootballProviderId() !== "mock") {
    const fromProvider = await buildCommentaryFromProvider(matchId);
    return fromProvider ?? emptyCommentary(matchId);
  }

  const mock = await import("@/lib/mock/commentary");
  return mock.getCommentaryByMatchId(matchId);
}
