"use client";

import { Link } from "@/i18n/navigation";
import type { LeagueTopScorer } from "@/lib/football/types";
import { translatePlayerName, translateTeamName } from "@/lib/translations/client";
import { cn } from "@/lib/utils";
import { RemoteImage } from "@/components/ui/remote-image";

interface LeagueTopScorersProps {
  scorers: LeagueTopScorer[];
  labels: {
    player: string;
    team: string;
    goals: string;
    assists: string;
    played: string;
    empty: string;
  };
}

export function LeagueTopScorers({ scorers, labels }: LeagueTopScorersProps) {
  if (scorers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">{labels.empty}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-muted-foreground">
            <th className="text-left font-medium px-4 py-2.5 w-10">#</th>
            <th className="text-left font-medium px-2 py-2.5">{labels.player}</th>
            <th className="text-left font-medium px-2 py-2.5 hidden sm:table-cell">{labels.team}</th>
            <th className="text-center font-medium px-2 py-2.5 w-14">{labels.played}</th>
            <th className="text-center font-medium px-2 py-2.5 w-14">{labels.goals}</th>
            <th className="text-center font-medium px-4 py-2.5 w-14 hidden md:table-cell">{labels.assists}</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((row, index) => (
            <tr
              key={`${row.player.id}-${row.team.id}`}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-2.5 text-muted-foreground font-mono tabular-nums">
                {index + 1}
              </td>
              <td className="px-2 py-2.5">
                <Link
                  href={`/player/${row.player.id}`}
                  prefetch
                  className="flex items-center gap-2.5 hover:text-primary min-w-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.player.photo}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover bg-muted shrink-0"
                  />
                  <span className="font-medium truncate">
                    {translatePlayerName(row.player.id, row.player.name)}
                  </span>
                </Link>
              </td>
              <td className="px-2 py-2.5 hidden sm:table-cell">
                <div className="flex items-center gap-2 min-w-0">
                  <RemoteImage src={row.team.logo} alt="" width={20} height={20} className="h-5 w-5" />
                  <span className="truncate text-muted-foreground">
                    {translateTeamName(row.team.id, row.team.name)}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums text-muted-foreground">
                {row.appearances}
              </td>
              <td className="px-2 py-2.5 text-center">
                <span
                  className={cn(
                    "font-mono font-bold tabular-nums",
                    index < 3 && "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {row.goals}
                </span>
              </td>
              <td className="px-4 py-2.5 text-center font-mono tabular-nums text-muted-foreground hidden md:table-cell">
                {row.assists}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
