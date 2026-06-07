import { getFootballProvider } from "@/lib/football/provider";
import { CURRENT_SEASON } from "@/lib/config";
import type { PlayerProfile, PlayerSearchResult } from "@/lib/football/types";

export type { PlayerProfile as MockPlayer, PlayerSeasonStats } from "@/lib/football/types";

export async function getPlayerById(id: number): Promise<PlayerProfile | null> {
  return getFootballProvider().getPlayerById(id, CURRENT_SEASON);
}

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  return getFootballProvider().searchPlayers(query, CURRENT_SEASON);
}
