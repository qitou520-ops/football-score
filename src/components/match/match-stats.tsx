"use client";

import { useLocale } from "next-intl";
import type { MatchStatistic } from "@/lib/api-football/types";
import { translateStatType } from "@/lib/match/stat-labels";
import { translateTeamName } from "@/lib/translations/client";
import { cn } from "@/lib/utils";

interface MatchStatsProps {
  statistics: MatchStatistic[];
  emptyText?: string;
}

export function MatchStatsComparison({ statistics, emptyText = "暂无技术统计" }: MatchStatsProps) {
  const locale = useLocale();

  if (statistics.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">{emptyText}</p>
    );
  }

  const [home, away] = statistics;
  const statTypes = home.statistics.map((s) => s.type);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between text-sm font-medium mb-4">
        <span className="truncate max-w-[120px]">{translateTeamName(home.team.id, home.team.name)}</span>
        <span className="truncate max-w-[120px] text-right">{translateTeamName(away.team.id, away.team.name)}</span>
      </div>

      {statTypes.map((type) => {
        const homeVal = home.statistics.find((s) => s.type === type)?.value;
        const awayVal = away.statistics.find((s) => s.type === type)?.value;
        const h = parseStatValue(homeVal);
        const a = parseStatValue(awayVal);
        const total = h + a || 1;
        const homePct = (h / total) * 100;

        return (
          <div key={type}>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="font-mono">{homeVal ?? "-"}</span>
              <span>{translateStatType(type, locale)}</span>
              <span className="font-mono">{awayVal ?? "-"}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
              <div
                className={cn("bg-primary transition-all", homePct > 50 && "bg-emerald-500")}
                style={{ width: `${homePct}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${100 - homePct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function parseStatValue(val: number | string | null | undefined): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  const n = parseInt(String(val).replace("%", ""), 10);
  return isNaN(n) ? 0 : n;
}
