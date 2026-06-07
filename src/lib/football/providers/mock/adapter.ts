/**
 * Mock 数据 → 统一领域模型 适配器
 */
import type * as Domain from "@/lib/football/types";
import type { MockPlayer } from "@/lib/mock/players";

export function adaptMockPlayer(raw: MockPlayer): Domain.PlayerProfile {
  return {
    player: raw.player,
    statistics: raw.statistics,
  };
}
