"use client";

import { Link } from "@/i18n/navigation";
import { POPULAR_LEAGUES } from "@/lib/api-football/constants";
import { translateLeagueName } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

interface LeagueScrollBarProps {
  activeLeagueId?: number;
  className?: string;
}

export function LeagueScrollBar({ activeLeagueId, className }: LeagueScrollBarProps) {
  return (
    <div
      className={cn(
        "md:hidden overflow-x-auto scrollbar-hide -mx-3 px-3",
        className
      )}
    >
      <div className="flex gap-2 pb-1 min-w-max">
        <Link
          href="/live"
          className={cn(ds.pill, "text-xs shrink-0 bg-primary text-primary-foreground border-primary")}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
          直播
        </Link>
        {POPULAR_LEAGUES.map((league) => (
          <Link
            key={league.id}
            href={`/league/${league.id}/standings`}
            className={cn(
              ds.pill,
              "text-xs shrink-0",
              activeLeagueId === league.id
                ? "border-primary bg-primary/10 text-primary"
                : ds.pillInactive + " text-muted-foreground"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={league.logo} alt="" className="h-4 w-4 object-contain" />
            {translateLeagueName(league.id, league.name)}
          </Link>
        ))}
      </div>
    </div>
  );
}
