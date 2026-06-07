"use client";

import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { cn, formatMatchCardStatusLabel, isLiveStatus } from "@/lib/utils";
import { ds } from "@/lib/design";
import type { Fixture } from "@/lib/api-football/types";
import { useLocale, useTranslations } from "next-intl";
import { translateTeamName } from "@/lib/translations";

interface MatchCardProps {
  fixture: Fixture;
  compact?: boolean;
}

export function MatchCard({ fixture }: MatchCardProps) {
  const locale = useLocale();
  const tc = useTranslations("common");
  const { fixture: f, teams, goals } = fixture;
  const live = isLiveStatus(f.status.short);
  const statusLabel = formatMatchCardStatusLabel(f.status, f.date, locale);

  const hasScore = goals.home != null && goals.away != null;

  return (
    <Link
      href={`/match/${f.id}`}
      className={cn(
        ds.listRow,
        live && "bg-[var(--live-muted)]"
      )}
    >
      <div className="w-10 sm:w-12 shrink-0 text-center">
        {live ? (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-bold bg-[var(--live)] text-white tabular-nums">
            {statusLabel}
          </span>
        ) : (
          <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold tabular-nums">
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-3">
        <TeamCell name={translateTeamName(teams.home.id, teams.home.name)} logo={teams.home.logo} winner={teams.home.winner} align="right" />
        <div className="shrink-0 text-center min-w-[3rem]">
          {hasScore ? (
            <span className={cn(ds.score, "text-sm sm:text-base", live && "text-[var(--live)]")}>
              {goals.home} - {goals.away}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">{tc("vs")}</span>
          )}
        </div>
        <TeamCell name={translateTeamName(teams.away.id, teams.away.name)} logo={teams.away.logo} winner={teams.away.winner} align="left" />
      </div>

      <button
        type="button"
        className="shrink-0 p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        aria-label="收藏"
        onClick={(e) => e.preventDefault()}
      >
        <Star className="h-4 w-4" />
      </button>
    </Link>
  );
}

function TeamCell({
  name,
  logo,
  winner,
  align,
}: {
  name: string;
  logo: string;
  winner: boolean | null;
  align: "left" | "right";
}) {
  return (
    <div className={cn("flex items-center gap-1.5 min-w-0", align === "right" && "flex-row-reverse")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0" />
      <span className={cn(
        "text-xs sm:text-sm truncate",
        align === "right" ? "text-right" : "text-left",
        winner === true && "font-bold"
      )}>
        {name}
      </span>
    </div>
  );
}
