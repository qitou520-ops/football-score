"use client";

import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchStatsComparison } from "./match-stats";
import { LiveCommentary } from "./live-commentary";
import { MatchChatRoom } from "./match-chat-room";
import type { Fixture, MatchStatistic, H2HMatch } from "@/lib/api-football/types";
import { Link } from "@/i18n/navigation";
import { cn, formatMatchStatusLong } from "@/lib/utils";
import { translateLeagueName, translateTeamName } from "@/lib/translations/client";
import { ds } from "@/lib/design";
import { InlineAd } from "@/components/ads/inline-ad";

interface Props {
  fixture: Fixture;
  statistics: MatchStatistic[];
  h2h: H2HMatch[];
  labels: {
    commentary: string;
    stats: string;
    h2h: string;
    preMatch: string;
    live: string;
    referee: string;
    venue: string;
    date: string;
    noStats: string;
    chatLabels: {
      title: string;
      nickname: string;
      placeholder: string;
      send: string;
      disclaimer: string;
      empty: string;
      sending: string;
      rateLimited: string;
      invalidMessage: string;
      guestPrefix: string;
    };
  };
  live: boolean;
}

export function MatchDetailClient({ fixture, statistics, h2h, labels, live }: Props) {
  const locale = useLocale();
  const { fixture: f, league, teams, goals } = fixture;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-2 space-y-3 md:space-y-4">
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
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

        <Card className="overflow-hidden">
          <CardContent className="py-4 md:py-8 px-3 md:px-6">
            <div className="flex items-center justify-between gap-2 md:justify-center md:gap-12">
              <TeamBlock team={teams.home} />
              <div className="text-center shrink-0 px-1">
                <div
                  className={cn(
                    ds.score,
                    "text-2xl md:text-5xl",
                    live && "text-[var(--live)]"
                  )}
                >
                  {goals.home ?? "-"} : {goals.away ?? "-"}
                </div>
                <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                  {formatMatchStatusLong(f.status, locale)}
                </p>
              </div>
              <TeamBlock team={teams.away} />
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
              {f.referee && <MetaItem label={labels.referee} value={f.referee} />}
              {f.venue.name && (
                <MetaItem label={labels.venue} value={`${f.venue.name}${f.venue.city ? `, ${f.venue.city}` : ""}`} />
              )}
              <MetaItem
                label={labels.date}
                value={new Date(f.date).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <LiveCommentary
              matchId={f.id}
              homeTeam={translateTeamName(teams.home.id, teams.home.name)}
              awayTeam={translateTeamName(teams.away.id, teams.away.name)}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <MatchChatRoom matchId={f.id} labels={labels.chatLabels} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
            <CardTitle className="text-sm">{labels.stats}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MatchStatsComparison statistics={statistics} emptyText={labels.noStats} />
          </CardContent>
        </Card>

        {h2h.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
              <CardTitle className="text-sm">{labels.preMatch}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/50">
              {h2h.slice(0, 8).map((m) => (
                <Link
                  key={m.fixture.id}
                  href={`/match/${m.fixture.id}`}
                  prefetch
                  className="flex items-center justify-between text-sm px-4 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <span className="truncate flex-1">
                    {translateTeamName(m.teams.home.id, m.teams.home.name)}
                  </span>
                  <span className="font-mono mx-3 shrink-0 text-xs">
                    {m.goals.home}-{m.goals.away}
                  </span>
                  <span className="truncate flex-1 text-right">
                    {translateTeamName(m.teams.away.id, m.teams.away.name)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="lg:hidden">
          <InlineAd position="match-detail" />
        </div>
      </div>

      <aside className="hidden lg:block space-y-4">
        <InlineAd position="match-detail" />
        {h2h.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">{labels.h2h}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
              {h2h.slice(0, 5).map((m) => (
                <Link
                  key={m.fixture.id}
                  href={`/match/${m.fixture.id}`}
                  prefetch
                  className="flex items-center justify-between text-sm py-1.5 hover:text-primary"
                >
                  <span className="truncate">
                    {translateTeamName(m.teams.home.id, m.teams.home.name)}
                  </span>
                  <span className="font-mono mx-2 shrink-0">
                    {m.goals.home}-{m.goals.away}
                  </span>
                  <span className="truncate">
                    {translateTeamName(m.teams.away.id, m.teams.away.name)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </aside>
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

function MetaItem({ label, value }: { label: string; value: string }) {
  const locale = useLocale();
  const sep = locale === "zh" ? "：" : ": ";
  return (
    <div className="truncate">
      <span className="text-muted-foreground">{label}{sep}</span>
      <span>{value}</span>
    </div>
  );
}
