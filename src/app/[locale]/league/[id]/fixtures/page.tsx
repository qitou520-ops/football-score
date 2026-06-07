import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLeagueFixtures, getLeagueById } from "@/lib/data";
import { MatchCard } from "@/components/match/match-card";
import { LeagueNav } from "@/components/league/league-nav";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ds } from "@/lib/design";
import { translateLeagueName, translateCountryName } from "@/lib/translations";

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
  const tc = await getTranslations("common");

  const leagueId = Number(id);
  const league = getLeagueById(leagueId);
  const fixtures = await getLeagueFixtures(leagueId);

  if (!league) notFound();

  const leagueName = translateLeagueName(league.id, league.name);
  const countryName = translateCountryName(league.country);

  return (
    <PageShell activeLeagueId={leagueId}>
      <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={league.logo} alt="" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
        <div className="min-w-0">
          <h1 className={ds.pageTitle + " truncate"}>
            {t("title", { league: leagueName })}
          </h1>
          <p className="text-xs text-muted-foreground">{countryName}</p>
        </div>
      </div>

      <div className="mb-4">
        <LeagueNav
          leagueId={leagueId}
          active="fixtures"
          labels={{ standings: tc("standings"), fixtures: tc("fixtures") }}
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {fixtures.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">暂无赛程</p>
          ) : (
            fixtures.map((f) => <MatchCard key={f.fixture.id} fixture={f} />)
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
