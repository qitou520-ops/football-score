"use client";

import useSWR from "swr";
import type { Fixture } from "@/lib/api-football/types";
import { groupFixturesByLeague } from "@/lib/match/group-fixtures";
import { MatchCard } from "./match-card";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ds } from "@/lib/design";
import { cn } from "@/lib/utils";
import { MatchListSkeleton } from "@/components/ui/skeleton";
import { translateLeagueName } from "@/lib/translations/client";

interface ApiFixturesResponse {
  fixtures: Fixture[];
  error?: string;
}

async function fetchLive(url: string): Promise<ApiFixturesResponse> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiFixturesResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error || "加载失败");
  }
  return json;
}

export function LiveScoreFeed() {
  const t = useTranslations("live");
  const { data, error, isLoading, mutate } = useSWR<ApiFixturesResponse>(
    "/api/fixtures/live",
    fetchLive,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const fixtures = data?.fixtures ?? [];
  const groups = groupFixturesByLeague(fixtures);

  if (isLoading) {
    return (
      <div className={ds.panel}>
        <MatchListSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(ds.card, "py-16 text-center")}>
        <p className="text-sm text-destructive mb-3">{error.message}</p>
        <button
          type="button"
          onClick={() => mutate()}
          className={cn(ds.pill, ds.pillInactive)}
        >
          重试
        </button>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">{t("noLive")}</p>
    );
  }

  return (
    <div className={ds.stackSm}>
      {groups.map(({ league, fixtures: leagueFixtures }) => (
        <section key={league.id} className={ds.panel}>
          <Link
            href={`/league/${league.id}/fixtures`}
            prefetch
            className="flex items-center gap-2.5 px-4 py-3 bg-muted/50 hover:bg-muted transition-colors border-b border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={league.logo} alt="" className="h-5 w-5 object-contain" />
            <span className={ds.sectionTitle + " flex-1 truncate"}>
              {translateLeagueName(league.id, league.name, league.country)}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
          <div>
            {leagueFixtures.map((fixture) => (
              <MatchCard key={fixture.fixture.id} fixture={fixture} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
