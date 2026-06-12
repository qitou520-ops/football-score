import { getTranslations, setRequestLocale } from "next-intl/server";

import { notFound } from "next/navigation";

import { buildMetadata, sportsEventJsonLd, breadcrumbJsonLd } from "@/lib/seo/metadata";

import {

  getFixtureById,

  getFixtureStatistics,

  getHeadToHead,

} from "@/lib/data";

import { StructuredData } from "@/lib/seo/structured-data";

import { MatchDetailClient } from "@/components/match/match-detail-client";

import { SidebarWidget } from "@/components/layout/sidebar-widget";

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

  const tchat = await getTranslations("match.chatLabels");

  const homeLabel = tc("home");



  const fixture = await getFixtureById(Number(id));

  if (!fixture) notFound();



  let statistics: Awaited<ReturnType<typeof getFixtureStatistics>> = [];

  let h2h: Awaited<ReturnType<typeof getHeadToHead>> = [];



  try {

    [statistics, h2h] = await Promise.all([

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

          statistics={statistics}

          h2h={h2h}

          labels={{

            commentary: t("commentary"),

            stats: t("stats"),

            h2h: tc("h2h"),

            preMatch: t("preMatch"),

            live: tc("live"),

            referee: tm("referee"),

            venue: tm("venue"),

            date: tm("date"),

            noStats: tm("noStats"),

            chatLabels: {

              title: tchat("title"),

              nickname: tchat("nickname"),

              placeholder: tchat("placeholder"),

              send: tchat("send"),

              disclaimer: tchat("disclaimer"),

              empty: tchat("empty"),

              sending: tchat("sending"),

              rateLimited: tchat("rateLimited"),

              invalidMessage: tchat("invalidMessage"),

              guestPrefix: tchat("guestPrefix"),

            },

          }}

          live={live}

        />



        <div className="mt-6 hidden lg:block">

          <SidebarWidget />

        </div>

      </div>

    </>

  );

}


