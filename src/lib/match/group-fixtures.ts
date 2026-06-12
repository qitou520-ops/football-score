import type { Fixture } from "@/lib/api-football/types";

export interface LeagueGroup {
  league: Fixture["league"];
  fixtures: Fixture[];
}

export function groupFixturesByLeague(fixtures: Fixture[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();

  for (const fixture of fixtures) {
    const existing = map.get(fixture.league.id);
    if (existing) {
      existing.fixtures.push(fixture);
    } else {
      map.set(fixture.league.id, { league: fixture.league, fixtures: [fixture] });
    }
  }

  return Array.from(map.values()).map((group) => ({
    ...group,
    fixtures: group.fixtures.sort(
      (a, b) => a.fixture.timestamp - b.fixture.timestamp
    ),
  }));
}

/** 按顶级联赛列表顺序排序（世界杯优先） */
export function sortLeagueGroupsByPriority(
  groups: LeagueGroup[],
  priorityIds: readonly number[]
): LeagueGroup[] {
  const order = new Map(priorityIds.map((id, index) => [id, index]));
  return [...groups].sort((a, b) => {
    const ai = order.get(a.league.id) ?? 999;
    const bi = order.get(b.league.id) ?? 999;
    if (ai !== bi) return ai - bi;
    return a.league.name.localeCompare(b.league.name, "en");
  });
}

export function sortLiveFirst(fixtures: Fixture[]): Fixture[] {
  return [...fixtures].sort((a, b) => {
    const liveOrder = (s: string) =>
      ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(s) ? 0 : s === "FT" ? 1 : 2;
    const diff = liveOrder(a.fixture.status.short) - liveOrder(b.fixture.status.short);
    if (diff !== 0) return diff;
    return a.fixture.timestamp - b.fixture.timestamp;
  });
}
