"use client";

import { Link } from "@/i18n/navigation";
import { RemoteImage } from "@/components/ui/remote-image";
import type { StandingRow } from "@/lib/api-football/types";
import { translateTeamName } from "@/lib/translations/client";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  rows: StandingRow[];
  locale?: string;
  labels: {
    pos: string;
    team: string;
    played: string;
    won: string;
    drawn: string;
    lost: string;
    gd: string;
    points: string;
    form: string;
  };
}

export function StandingsTable({ rows, labels }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs">
            <th className="py-2 px-2 text-left w-8">{labels.pos}</th>
            <th className="py-2 px-2 text-left">{labels.team}</th>
            <th className="py-2 px-2 text-center w-8">{labels.played}</th>
            <th className="py-2 px-2 text-center w-8 hidden sm:table-cell">{labels.won}</th>
            <th className="py-2 px-2 text-center w-8 hidden sm:table-cell">{labels.drawn}</th>
            <th className="py-2 px-2 text-center w-8 hidden sm:table-cell">{labels.lost}</th>
            <th className="py-2 px-2 text-center w-10">{labels.gd}</th>
            <th className="py-2 px-2 text-center w-10 font-semibold">{labels.points}</th>
            <th className="py-2 px-2 text-center w-20 hidden md:table-cell">{labels.form}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.team.id}
              className={cn(
                "border-b border-border/50 hover:bg-accent/30 transition-colors",
                row.rank <= 4 && "border-l-2 border-l-emerald-500",
                row.rank === 5 && "border-l-2 border-l-blue-500"
              )}
            >
              <td className="py-2.5 px-2 text-muted-foreground">{row.rank}</td>
              <td className="py-2.5 px-2">
                <Link
                  href={`/team/${row.team.id}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <RemoteImage src={row.team.logo} alt="" width={20} height={20} className="h-5 w-5" />
                  <span className="font-medium truncate max-w-[140px] sm:max-w-none">
                    {translateTeamName(row.team.id, row.team.name)}
                  </span>
                </Link>
              </td>
              <td className="py-2.5 px-2 text-center">{row.all.played}</td>
              <td className="py-2.5 px-2 text-center hidden sm:table-cell">{row.all.win}</td>
              <td className="py-2.5 px-2 text-center hidden sm:table-cell">{row.all.draw}</td>
              <td className="py-2.5 px-2 text-center hidden sm:table-cell">{row.all.lose}</td>
              <td className="py-2.5 px-2 text-center">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
              <td className="py-2.5 px-2 text-center font-bold">{row.points}</td>
              <td className="py-2.5 px-2 hidden md:table-cell">
                <FormGuide form={row.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormGuide({ form }: { form: string }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {form.split("").map((r, i) => (
        <span
          key={i}
          className={cn(
            "w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center text-white",
            r === "W" && "bg-emerald-500",
            r === "D" && "bg-gray-400",
            r === "L" && "bg-red-500"
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
