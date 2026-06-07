import { StubFootballProvider } from "@/lib/football/provider/base";
import type { FootballProviderId } from "@/lib/football/types";

function createStubProvider(id: FootballProviderId, name: string, envKey: string) {
  return class extends StubFootballProvider {
    readonly id = id;
    readonly name = name;

    isConfigured(): boolean {
      return Boolean(process.env[envKey]?.trim());
    }
  };
}

/** Goalserve — 适配器待实现 */
export const GoalserveProvider = createStubProvider(
  "goalserve",
  "Goalserve",
  "GOALSERVE_API_KEY"
);

/** SportsDataIO — 适配器待实现 */
export const SportsDataIOProvider = createStubProvider(
  "sportsdataio",
  "SportsDataIO",
  "SPORTSDATAIO_API_KEY"
);

/** Sportradar — 适配器待实现 */
export const SportradarProvider = createStubProvider(
  "sportradar",
  "Sportradar",
  "SPORTRADAR_API_KEY"
);
