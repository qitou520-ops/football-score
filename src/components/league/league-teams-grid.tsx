"use client";

import { Link } from "@/i18n/navigation";
import type { LeagueTeamItem } from "@/lib/football/types";
import { translateTeamName } from "@/lib/translations/client";
import { RemoteImage } from "@/components/ui/remote-image";
import { ds } from "@/lib/design";

interface LeagueTeamsGridProps {
  teams: LeagueTeamItem[];
  emptyText: string;
}

export function LeagueTeamsGrid({ teams, emptyText }: LeagueTeamsGridProps) {
  if (teams.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">{emptyText}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/team/${team.id}`}
          prefetch
          className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-md)] border border-border bg-card hover:bg-muted/40 transition-colors"
        >
          <RemoteImage
            src={team.logo}
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 md:h-12 md:w-12"
            sizes="48px"
          />
          <span className={ds.caption + " text-center line-clamp-2 font-medium"}>
            {translateTeamName(team.id, team.name)}
          </span>
        </Link>
      ))}
    </div>
  );
}
