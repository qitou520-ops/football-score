import type { PlayerSeasonStats } from "@/lib/mock/players";
import { ds } from "@/lib/design";

interface Props {
  stats: PlayerSeasonStats;
}

export function PlayerStatsTable({ stats }: Props) {
  const rows = [
    { label: "联赛", value: stats.league },
    { label: "球队", value: stats.team },
    { label: "出场", value: String(stats.appearances) },
    { label: "进球", value: String(stats.goals) },
    { label: "助攻", value: String(stats.assists) },
    { label: "黄牌", value: String(stats.yellowCards) },
    { label: "红牌", value: String(stats.redCards) },
    { label: "出场时间", value: `${stats.minutes} 分钟` },
    { label: "评分", value: stats.rating.toFixed(1) },
  ];

  return (
    <div className={ds.panel}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : "bg-card"}>
              <td className="px-4 py-2.5 text-muted-foreground w-1/3">{row.label}</td>
              <td className="px-4 py-2.5 font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
