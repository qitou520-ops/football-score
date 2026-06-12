import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLeagueById, getLeagueTeamsList } from "@/lib/data";
import { LeaguePageHeader } from "@/components/league/league-page-header";
import { LeagueTeamsGrid } from "@/components/league/league-teams-grid";
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
  const t = await getTranslations("leagueTeams");
  const name = league ? translateLeagueName(league.id, league.name) : "联赛";
  return buildMetadata({
    title: t("title", { league: name }),
    description: t("description", { league: name }),
    path: `/league/${id}/teams`,
  });
}

export default async function LeagueTeamsPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leagueTeams");
  const tnav = await getTranslations("leagueNav");

  const leagueId = Number(id);
  const league = getLeagueById(leagueId);
  if (!league) notFound();

  const teams = await getLeagueTeamsList(leagueId);
  const leagueName = translateLeagueName(league.id, league.name);

  return (
    <PageShell activeLeagueId={leagueId}>
      <LeaguePageHeader
        league={league}
        title={t("title", { league: leagueName })}
        activeTab="teams"
        navLabels={{
          fixtures: tnav("fixtures"),
          standings: tnav("standings"),
          players: tnav("players"),
          teams: tnav("teams"),
        }}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <LeagueTeamsGrid teams={teams} emptyText={t("noData")} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
