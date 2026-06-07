import { getFootballProvider } from "@/lib/football/provider";
import { getFootballProviderId } from "@/lib/config";
import { isLiveStatus, formatMatchStatusLong } from "@/lib/utils";
import type { Fixture, MatchEvent, TeamInfo } from "@/lib/football/types";
import type { LiveCommentaryItem, LiveCommentaryResponse } from "@/lib/mock/commentary-types";

function teamSide(eventTeam: TeamInfo, fixture: Fixture): "home" | "away" | null {
  if (eventTeam.id === fixture.teams.home.id) return "home";
  if (eventTeam.id === fixture.teams.away.id) return "away";
  return null;
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

  if (event.type === "Goal") {
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "goal",
      team: side,
      player: event.player.name,
      assist: event.assist?.name ?? undefined,
      text: `进球！${event.player.name}`,
      detail: event.detail,
    };
  }

  if (event.type === "Card") {
    const isRed = event.detail.includes("Red");
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: isRed ? "red_card" : "yellow_card",
      team: side,
      player: event.player.name,
      text: isRed ? "红牌" : "黄牌",
      detail: event.detail,
    };
  }

  if (event.type === "subst") {
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "substitution",
      team: side,
      player: event.player.name,
      text: "换人",
      detail: event.detail,
    };
  }

  if (event.type === "Var") {
    return {
      id,
      matchId: fixture.fixture.id,
      minute,
      extraMinute: extra,
      type: "var",
      team: side,
      text: "VAR 介入",
      detail: event.detail,
    };
  }

  return {
    id,
    matchId: fixture.fixture.id,
    minute,
    extraMinute: extra,
    type: "status",
    team: side,
    player: event.player?.name,
    text: event.detail || event.type,
    detail: event.comments ?? undefined,
  };
}

async function buildCommentaryFromProvider(matchId: number): Promise<LiveCommentaryResponse | null> {
  const provider = getFootballProvider();
  const fixture = await provider.getFixtureById(matchId);
  if (!fixture) return null;

  const events = await provider.getFixtureEvents(matchId);
  const isLive = isLiveStatus(fixture.fixture.status.short);
  const elapsed = fixture.fixture.status.elapsed;

  const items: LiveCommentaryItem[] = events
    .slice()
    .reverse()
    .map((ev, i) => mapEventToCommentary(ev, fixture, i));

  if (items.length === 0) return null;

  return {
    matchId,
    isLive,
    elapsed,
    status: formatMatchStatusLong(fixture.fixture.status),
    items,
    updatedAt: new Date().toISOString(),
  };
}

export async function getCommentaryByMatchId(matchId: number): Promise<LiveCommentaryResponse> {
  if (getFootballProviderId() !== "mock") {
    const fromProvider = await buildCommentaryFromProvider(matchId);
    if (fromProvider && fromProvider.items.length > 0) return fromProvider;
  }

  const mock = await import("@/lib/mock/commentary");
  return mock.getCommentaryByMatchId(matchId);
}
