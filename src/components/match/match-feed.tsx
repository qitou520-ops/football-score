"use client";

import { useState } from "react";
import useSWR from "swr";
import { addDays, format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import type { Fixture } from "@/lib/api-football/types";
import {
  groupFixturesByLeague,
  sortLeagueGroupsByPriority,
  sortLiveFirst,
} from "@/lib/match/group-fixtures";
import {
  WORLD_CUP_LEAGUE_ID,
  LEAGUE_PRIORITY_IDS,
  getLeagueById,
} from "@/lib/api-football/constants";
import { translateLeagueName } from "@/lib/translations/client";
import { MatchCard } from "./match-card";
import { Link } from "@/i18n/navigation";
import { MatchListSkeleton } from "@/components/ui/skeleton";
import { InlineAd } from "@/components/ads/inline-ad";
import { RemoteImage } from "@/components/ui/remote-image";

type FilterMode = "live" | "time";

interface ApiFixturesResponse {
  fixtures: Fixture[];
  error?: string;
}

async function fetchFixtures(url: string): Promise<ApiFixturesResponse> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiFixturesResponse;
  if (!res.ok) {
    return { fixtures: [], error: json.error || "加载失败" };
  }
  return { fixtures: json.fixtures ?? [], error: json.error };
}

interface MatchFeedProps {
  initialDate: string;
  showFilters?: boolean;
  featuredFixtures?: Fixture[];
  initialFixtures?: Fixture[];
  defaultFilter?: FilterMode;
}

export function MatchFeed({
  initialDate,
  showFilters = true,
  featuredFixtures = [],
  initialFixtures = [],
  defaultFilter = "time",
}: MatchFeedProps) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const [date, setDate] = useState(initialDate);
  const [filter, setFilter] = useState<FilterMode>(defaultFilter);

  const url =
    filter === "live"
      ? `/api/fixtures/live?locale=${locale}`
      : `/api/fixtures/date?date=${date}&locale=${locale}`;

  const fallbackData =
    filter === "time" && date === initialDate && initialFixtures.length > 0
      ? { fixtures: initialFixtures }
      : undefined;

  const { data, error, isLoading, mutate } = useSWR<ApiFixturesResponse>(url, fetchFixtures, {
    fallbackData,
    refreshInterval: filter === "live" ? 30000 : 0,
    revalidateOnFocus: filter === "live",
    dedupingInterval: 5000,
  });

  const fixtures = sortLiveFirst(data?.fixtures ?? []);
  const showInitialSkeleton = isLoading && !data && !fallbackData;
  const groups = sortLeagueGroupsByPriority(
    groupFixturesByLeague(fixtures),
    LEAGUE_PRIORITY_IDS
  );
  const worldCupFixtures = fixtures.filter((f) => f.league.id === WORLD_CUP_LEAGUE_ID);
  const otherGroups = groups.filter((g) => g.league.id !== WORLD_CUP_LEAGUE_ID);
  const worldCupLeague = getLeagueById(WORLD_CUP_LEAGUE_ID);

  const dateLabel = (() => {
    const d = parseISO(date);
    if (isToday(d)) return tc("today");
    if (isYesterday(d)) return tc("yesterday");
    if (isTomorrow(d)) return tc("tomorrow");
    return format(d, locale === "zh" ? "M月d日 EEEE" : "MMM d, EEEE", {
      locale: locale === "zh" ? zhCN : enUS,
    });
  })();

  const shiftDate = (days: number) => {
    setDate(format(addDays(parseISO(date), days), "yyyy-MM-dd"));
  };

  return (
    <div className={ds.stackSm}>
      {showFilters && (
        <>
          {filter === "time" && (
            <div className="flex items-center justify-center gap-3 py-1">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={tc("yesterday")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-semibold hover:bg-muted/50 transition-colors min-w-[120px] justify-center"
              >
                {dateLabel}
              </button>
              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={tc("tomorrow")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <FilterPill active={filter === "live"} onClick={() => setFilter("live")} live>
              {t("filterLive")}
            </FilterPill>
            <FilterPill active={filter === "time"} onClick={() => setFilter("time")}>
              {t("filterByTime")}
            </FilterPill>
          </div>
        </>
      )}

      {showInitialSkeleton ? (
        <div className={ds.panel}>
          <MatchListSkeleton rows={6} />
        </div>
      ) : error ? (
        <div className={cn(ds.card, "py-16 text-center")}>
          <p className="text-sm text-destructive mb-3">
            {error.message || tc("loading")}
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className={cn(ds.pill, ds.pillInactive)}
          >
            {tc("retry")}
          </button>
        </div>
      ) : fixtures.length === 0 && data?.error ? (
        <div className={cn(ds.card, "py-16 text-center")}>
          <p className="text-sm text-muted-foreground mb-3">
            {filter === "live" ? t("noLiveMatches") : t("noMatches")}
          </p>
          <p className="text-xs text-muted-foreground">{data.error}</p>
        </div>
      ) : fixtures.length === 0 && !showFilters ? (
        <div className={cn(ds.card, "py-16 text-center")}>
          <p className="text-sm text-muted-foreground">
            {filter === "live" ? t("noLiveMatches") : t("noMatches")}
          </p>
        </div>
      ) : (
        <div className={ds.stackSm}>
          {featuredFixtures.length > 0 && (
            <section className={ds.panel}>
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <span className={ds.sectionTitle}>{t("featuredMatches")}</span>
              </div>
              <div>
                {featuredFixtures.map((fixture) => (
                  <MatchCard key={fixture.fixture.id} fixture={fixture} />
                ))}
              </div>
            </section>
          )}
          {showFilters && worldCupLeague && worldCupFixtures.length > 0 && (
            <LeagueFixtureSection
              league={worldCupLeague}
              fixtures={worldCupFixtures}
            />
          )}
          {otherGroups.length > 0
            ? otherGroups.map(({ league, fixtures: leagueFixtures }, index) => (
                <LeagueFixtureSection
                  key={league.id}
                  league={league}
                  fixtures={leagueFixtures}
                  footer={index === 0 ? <InlineAd position="match-list-middle" /> : undefined}
                />
              ))
            : !showFilters ? (
                <div className={cn(ds.card, "py-16 text-center")}>
                  <p className="text-sm text-muted-foreground">
                    {filter === "live" ? t("noLiveMatches") : t("noMatches")}
                  </p>
                </div>
              ) : null}
        </div>
      )}
    </div>
  );
}

function LeagueFixtureSection({
  league,
  fixtures,
  emptyText,
  footer,
}: {
  league: { id: number; name: string; logo: string; country?: string };
  fixtures: Fixture[];
  emptyText?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className={ds.panel}>
      <Link
        href={`/league/${league.id}/fixtures`}
        prefetch
        className="flex items-center gap-2.5 px-4 py-3 bg-muted/50 hover:bg-muted transition-colors border-b border-border"
      >
        <RemoteImage src={league.logo} alt="" width={20} height={20} className="h-5 w-5" />
        <span className={ds.sectionTitle + " flex-1 truncate"}>
          {translateLeagueName(league.id, league.name, league.country)}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
      {fixtures.length === 0 && emptyText ? (
        <p className="text-sm text-muted-foreground p-6 text-center">{emptyText}</p>
      ) : (
        <div>
          {fixtures.map((fixture) => (
            <MatchCard key={fixture.fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
      {footer}
    </section>
  );
}

function FilterPill({
  children,
  active,
  onClick,
  live,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  live?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(ds.pill, active ? ds.pillActive : ds.pillInactive)}
    >
      {live && active && (
        <span className="h-2 w-2 rounded-full bg-[var(--live)] animate-pulse" />
      )}
      {children}
    </button>
  );
}
