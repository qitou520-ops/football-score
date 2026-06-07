"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MatchTimeline } from "./match-timeline";
import { MatchStatsComparison } from "./match-stats";
import { LiveCommentary } from "./live-commentary";
import type { Fixture, MatchEvent, MatchStatistic, H2HMatch } from "@/lib/api-football/types";
import { Link } from "@/i18n/navigation";
import { cn, formatMatchStatusLong } from "@/lib/utils";
import { translateLeagueName, translateTeamName } from "@/lib/translations";
import { ds } from "@/lib/design";

interface Props {
  fixture: Fixture;
  events: MatchEvent[];
  statistics: MatchStatistic[];
  h2h: H2HMatch[];
  labels: {
    overview: string;
    stats: string;
    timeline: string;
    commentary: string;
    commentaryLabels: {
      title: string;
      live: string;
      updating: string;
      empty: string;
      goal: string;
      yellowCard: string;
      redCard: string;
      substitution: string;
      var: string;
      assist: string;
      in: string;
      out: string;
    };
    h2h: string;
    live: string;
    referee: string;
    venue: string;
    date: string;
    noEvents: string;
    noStats: string;
  };
  live: boolean;
}

export function MatchDetailClient({ fixture, events, statistics, labels, live }: Props) {
  const [tab, setTab] = useState("commentary");
  const locale = useLocale();
  const { fixture: f, league, teams, goals } = fixture;

  const tabs = [
    { id: "commentary", label: labels.commentary },
    { id: "overview", label: labels.overview },
    { id: "stats", label: labels.stats },
    { id: "timeline", label: labels.timeline },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={league.logo} alt="" className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
        <span className="truncate">{translateLeagueName(league.id, league.name)}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline truncate">{league.round}</span>
        {live && (
          <Badge variant="live" className="ml-auto shrink-0">
            {labels.live}
            {f.status.elapsed != null ? ` ${f.status.elapsed}'` : ""}
          </Badge>
        )}
      </div>

      <Card className="mb-3 md:mb-4 overflow-hidden">
        <CardContent className="py-4 md:py-8 px-3 md:px-6">
          <div className="flex items-center justify-between gap-2 md:justify-center md:gap-12">
            <TeamBlock team={teams.home} />
            <div className="text-center shrink-0 px-1">
              <div className={cn(
                ds.score,
                "text-2xl md:text-5xl",
                live && "text-[var(--live)]"
              )}>
                {goals.home ?? "-"} : {goals.away ?? "-"}
              </div>
              <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                {formatMatchStatusLong(f.status, locale)}
              </p>
            </div>
            <TeamBlock team={teams.away} />
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-12 md:top-14 z-10 bg-background/95 backdrop-blur -mx-3 px-3 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
        <Tabs tabs={tabs} activeTab={tab} onChange={setTab} className="mb-3 md:mb-4 overflow-x-auto scrollbar-hide" />
      </div>

      {tab === "commentary" && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <LiveCommentary
              matchId={f.id}
              homeTeam={translateTeamName(teams.home.id, teams.home.name)}
              awayTeam={translateTeamName(teams.away.id, teams.away.name)}
              labels={labels.commentaryLabels}
            />
          </CardContent>
        </Card>
      )}
      {tab === "overview" && (
        <Card>
          <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3 text-xs md:text-sm">
            {f.referee && <Row label={labels.referee} value={f.referee} />}
            {f.venue.name && <Row label={labels.venue} value={`${f.venue.name}, ${f.venue.city}`} />}
            <Row
              label={labels.date}
              value={new Date(f.date).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
            />
          </CardContent>
        </Card>
      )}
      {tab === "stats" && (
        <Card>
          <CardContent className="p-0">
            <MatchStatsComparison statistics={statistics} emptyText={labels.noStats} />
          </CardContent>
        </Card>
      )}
      {tab === "timeline" && (
        <Card>
          <CardContent className="p-0">
            <MatchTimeline events={events} emptyText={labels.noEvents} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeamBlock({ team }: { team: { id: number; name: string; logo: string } }) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="flex flex-col items-center gap-1.5 md:gap-3 flex-1 max-w-[90px] md:max-w-[140px] min-w-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={team.logo}
        alt={translateTeamName(team.id, team.name)}
        className="h-10 w-10 md:h-20 md:w-20 object-contain"
      />
      <span className="text-[11px] md:text-base font-semibold text-center leading-tight line-clamp-2">
        {translateTeamName(team.id, team.name)}
      </span>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-border/50 last:border-0 gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right truncate">{value}</span>
    </div>
  );
}
