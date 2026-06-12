import { getTranslations, setRequestLocale } from "next-intl/server";

import { buildMetadata } from "@/lib/seo/metadata";

import { getStandings, getLeagueById } from "@/lib/data";

import { StandingsTable } from "@/components/league/standings-table";

import { LeaguePageHeader } from "@/components/league/league-page-header";

import { PageShell } from "@/components/layout/page-shell";

import { Card, CardContent } from "@/components/ui/card";

import { notFound } from "next/navigation";

import { translateLeagueName } from "@/lib/translations";



export const revalidate = 3600;



type Props = { params: Promise<{ locale: string; id: string }> };



export async function generateMetadata({ params }: Props) {

  const { id, locale } = await params;

  setRequestLocale(locale);

  const league = getLeagueById(Number(id));

  const t = await getTranslations("standings");

  const name = league

    ? translateLeagueName(league.id, league.name)

    : "联赛";

  return buildMetadata({

    title: t("title", { league: name }),

    description: t("description", { league: name }),

    path: `/league/${id}/standings`,

  });

}



export default async function StandingsPage({ params }: Props) {

  const { id, locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("standings");

  const tnav = await getTranslations("leagueNav");



  const leagueId = Number(id);

  const league = getLeagueById(leagueId);

  if (!league) notFound();



  let standingsGroups: Awaited<ReturnType<typeof getStandings>> = [];

  let loadFailed = false;

  try {

    const standings = await getStandings(leagueId);

    standingsGroups = standings.filter((group) => group.length > 0);

  } catch {

    loadFailed = true;

  }



  const leagueName = translateLeagueName(league.id, league.name);



  return (

    <PageShell activeLeagueId={leagueId}>

      <LeaguePageHeader

        league={league}

        title={t("title", { league: leagueName })}

        activeTab="standings"

        navLabels={{

          fixtures: tnav("fixtures"),

          standings: tnav("standings"),

          players: tnav("players"),

          teams: tnav("teams"),

        }}

      />



      <Card className="overflow-hidden">

        <CardContent className="p-0 pt-1 md:pt-2">

          {loadFailed ? (

            <p className="text-sm text-muted-foreground p-6 text-center">{t("loadFailed")}</p>

          ) : standingsGroups.length === 0 ? (

            <p className="text-sm text-muted-foreground p-6 text-center">{t("noData")}</p>

          ) : (

            standingsGroups.map((groupRows, index) => (

              <div key={index} className={index > 0 ? "border-t border-border" : ""}>

                {groupRows[0]?.group ? (

                  <p className="px-4 py-2.5 text-sm font-semibold bg-muted/40 border-b border-border">

                    {groupRows[0].group}

                  </p>

                ) : null}

                <StandingsTable

                  rows={groupRows}

                  locale={locale}

                  labels={{

                    pos: t("pos"),

                    team: t("team"),

                    played: t("played"),

                    won: t("won"),

                    drawn: t("drawn"),

                    lost: t("lost"),

                    gd: t("gd"),

                    points: t("points"),

                    form: t("form"),

                  }}

                />

              </div>

            ))

          )}

        </CardContent>

      </Card>

    </PageShell>

  );

}

