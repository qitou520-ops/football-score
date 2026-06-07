import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getStandings, getLeagueById } from "@/lib/data";
import { StandingsTable } from "@/components/league/standings-table";
import { LeagueNav } from "@/components/league/league-nav";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ds } from "@/lib/design";
import { translateLeagueName, translateCountryName } from "@/lib/translations";

/** 积分榜数据缓存 1 小时，减少 API 调用 */
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
  const tc = await getTranslations("common");

  const leagueId = Number(id);
  const league = getLeagueById(leagueId);
  if (!league) notFound();

  let rows: Awaited<ReturnType<typeof getStandings>>[0] | undefined;
  let standingsError: string | null = null;
  try {
    const standings = await getStandings(leagueId);
    rows = standings[0];
  } catch (err) {
    standingsError = err instanceof Error ? err.message : "获取积分榜失败";
  }

  if (!rows && !standingsError) notFound();

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
          active="standings"
          labels={{ standings: tc("standings"), fixtures: tc("fixtures") }}
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 pt-1 md:pt-2">
          {standingsError ? (
            <p className="text-sm text-muted-foreground p-6 text-center">{standingsError}</p>
          ) : rows ? (
            <StandingsTable
              rows={rows}
              locale="zh"
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
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
