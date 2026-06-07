import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFixtureById, getFixtureStatistics } from "@/lib/data";
import { MatchStatsComparison } from "@/components/match/match-stats";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
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
  return buildMetadata({
    title: `${home} vs ${away} - ${t("stats")}`,
    description: t("description", { home, away }),
    path: `/match/${id}/stats`,
  });
}

export default async function MatchStatsPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");
  const tm = await getTranslations("matchLabels");

  const fixture = await getFixtureById(Number(id));
  if (!fixture) notFound();

  const statistics = await getFixtureStatistics(fixture.fixture.id);
  const homeName = translateTeamName(fixture.teams.home.id, fixture.teams.home.name);
  const awayName = translateTeamName(fixture.teams.away.id, fixture.teams.away.name);

  return (
    <PageShell showLeagues={false}>
      <div className="mb-4 md:mb-6">
        <Link href={`/match/${id}`} prefetch className="text-sm text-primary hover:underline">
          ← {tm("back")}
        </Link>
        <h1 className="text-lg md:text-2xl font-bold mt-2">
          {homeName} vs {awayName} — {tc("statistics")}
        </h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">{tc("statistics")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MatchStatsComparison statistics={statistics} emptyText={tm("noStats")} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
