import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata, sportsEventJsonLd, breadcrumbJsonLd } from "@/lib/seo/metadata";
import {
  getFixtureById,
  getFixtureEvents,
  getFixtureStatistics,
  getHeadToHead,
} from "@/lib/data";
import { StructuredData } from "@/lib/seo/structured-data";
import { MatchDetailClient } from "@/components/match/match-detail-client";
import { SidebarWidget } from "@/components/layout/sidebar-widget";
import { AdBanner } from "@/components/ads/ad-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { isLiveStatus } from "@/lib/utils";
import { translateTeamName } from "@/lib/translations";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const fixture = await getFixtureById(Number(id));
  if (!fixture) return {};

  const t = await getTranslations("match");
  const home = translateTeamName(fixture.teams.home.id, fixture.teams.home.name);
  const away = translateTeamName(fixture.teams.away.id, fixture.teams.away.name);
  const title = t("title", { home, away });
  const description = t("description", { home, away });

  return buildMetadata({ title, description, path: `/match/${id}` });
}

export default async function MatchPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("match");
  const tc = await getTranslations("common");
  const tm = await getTranslations("matchLabels");
  const tcl = await getTranslations("match.commentaryLabels");
  const homeLabel = tc("home");

  const fixture = await getFixtureById(Number(id));
  if (!fixture) notFound();

  let events: Awaited<ReturnType<typeof getFixtureEvents>> = [];
  let statistics: Awaited<ReturnType<typeof getFixtureStatistics>> = [];
  let h2h: Awaited<ReturnType<typeof getHeadToHead>> = [];

  try {
    [events, statistics, h2h] = await Promise.all([
      getFixtureEvents(fixture.fixture.id).catch(() => []),
      getFixtureStatistics(fixture.fixture.id).catch(() => []),
      getHeadToHead(fixture.teams.home.id, fixture.teams.away.id).catch(() => []),
    ]);
  } catch {
    /* 免费套餐部分接口不可用时不阻断页面 */
  }

  const live = isLiveStatus(fixture.fixture.status.short);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const homeName = translateTeamName(fixture.teams.home.id, fixture.teams.home.name);
  const awayName = translateTeamName(fixture.teams.away.id, fixture.teams.away.name);
  const matchName = `${homeName} vs ${awayName}`;

  return (
    <>
      <StructuredData
        data={[
          sportsEventJsonLd({
            id: fixture.fixture.id,
            homeTeam: homeName,
            awayTeam: awayName,
            date: fixture.fixture.date,
            venue: fixture.fixture.venue.name || undefined,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
          }),
          breadcrumbJsonLd([
            { name: homeLabel, url: siteUrl },
            { name: matchName, url: `${siteUrl}/match/${id}` },
          ]),
        ]}
      />

      <div className="container mx-auto px-3 md:px-4 py-3 md:py-6 max-w-7xl">
        <MatchDetailClient
          fixture={fixture}
          events={events}
          statistics={statistics}
          h2h={h2h}
          labels={{
            overview: t("overview"),
            stats: t("stats"),
            timeline: t("timeline"),
            commentary: t("commentary"),
            commentaryLabels: {
              title: tcl("title"),
              live: tcl("live"),
              updating: tcl("updating"),
              empty: tcl("empty"),
              goal: tcl("goal"),
              yellowCard: tcl("yellowCard"),
              redCard: tcl("redCard"),
              substitution: tcl("substitution"),
              var: tcl("var"),
              assist: tcl("assist"),
              in: tcl("in"),
              out: tcl("out"),
            },
            h2h: tc("h2h"),
            live: tc("live"),
            referee: tm("referee"),
            venue: tm("venue"),
            date: tm("date"),
            noEvents: tm("noEvents"),
            noStats: tm("noStats"),
          }}
          live={live}
        />

        <div className="hidden lg:grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2" />
          <aside className="space-y-4">
            <AdBanner position="match-detail" />
            {h2h.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{tc("h2h")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
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
            <SidebarWidget />
          </aside>
        </div>

        {h2h.length > 0 && (
          <div className="md:hidden mt-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">{tc("h2h")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pb-3">
                {h2h.slice(0, 5).map((m) => (
                  <Link
                    key={m.fixture.id}
                    href={`/match/${m.fixture.id}`}
                    prefetch
                    className="flex items-center justify-between text-xs py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="truncate flex-1">
                      {translateTeamName(m.teams.home.id, m.teams.home.name)}
                    </span>
                    <span className="font-mono mx-2 shrink-0">
                      {m.goals.home}-{m.goals.away}
                    </span>
                    <span className="truncate flex-1 text-right">
                      {translateTeamName(m.teams.away.id, m.teams.away.name)}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
