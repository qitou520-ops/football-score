import { getTranslations, setRequestLocale } from "next-intl/server";

import { buildMetadata } from "@/lib/seo/metadata";

import { getLeagueFixtures, getLeagueById } from "@/lib/data";

import { MatchCard } from "@/components/match/match-card";

import { LeaguePageHeader } from "@/components/league/league-page-header";

import { PageShell } from "@/components/layout/page-shell";

import { Card, CardContent } from "@/components/ui/card";

import { notFound } from "next/navigation";

import { translateLeagueName } from "@/lib/translations";



type Props = { params: Promise<{ locale: string; id: string }> };



export async function generateMetadata({ params }: Props) {

  const { id, locale } = await params;

  setRequestLocale(locale);

  const league = getLeagueById(Number(id));

  const t = await getTranslations("fixtures");

  const name = league

    ? translateLeagueName(league.id, league.name)

    : "联赛";

  return buildMetadata({

    title: t("title", { league: name }),

    description: t("description", { league: name }),

    path: `/league/${id}/fixtures`,

  });

}



export default async function FixturesPage({ params }: Props) {

  const { id, locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("fixtures");

  const tnav = await getTranslations("leagueNav");



  const leagueId = Number(id);

  const league = getLeagueById(leagueId);

  const fixtures = await getLeagueFixtures(leagueId);



  if (!league) notFound();



  const leagueName = translateLeagueName(league.id, league.name);



  return (

    <PageShell activeLeagueId={leagueId}>

      <LeaguePageHeader

        league={league}

        title={t("title", { league: leagueName })}

        activeTab="fixtures"

        navLabels={{

          fixtures: tnav("fixtures"),

          standings: tnav("standings"),

          players: tnav("players"),

          teams: tnav("teams"),

        }}

      />



      <Card className="overflow-hidden">

        <CardContent className="p-0">

          {fixtures.length === 0 ? (

            <p className="text-sm text-muted-foreground p-6 text-center">{t("noData")}</p>

          ) : (

            fixtures.map((f) => <MatchCard key={f.fixture.id} fixture={f} />)

          )}

        </CardContent>

      </Card>

    </PageShell>

  );

}

