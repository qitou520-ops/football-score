import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getTeamById, getTeamFixtures } from "@/lib/data";
import { MatchCard } from "@/components/match/match-card";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ds } from "@/lib/design";
import { cn } from "@/lib/utils";
import { translateTeamName, translateCountryName } from "@/lib/translations";

/** 球队资料缓存 24 小时，减少 API 调用 */
export const revalidate = 86400;

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const team = await getTeamById(Number(id));
  const t = await getTranslations("team");
  const name = team
    ? translateTeamName(team.team.id, team.team.name)
    : "球队";
  return buildMetadata({
    title: t("title", { team: name }),
    description: t("description", { team: name }),
    path: `/team/${id}`,
  });
}

export default async function TeamPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");
  const tc = await getTranslations("common");

  const team = await getTeamById(Number(id));
  if (!team) notFound();

  const fixtures = await getTeamFixtures(Number(id));
  const finished = fixtures.filter((f) => f.fixture.status.short === "FT");
  const upcoming = fixtures.filter((f) => f.fixture.status.short === "NS");
  const teamName = translateTeamName(team.team.id, team.team.name);
  const countryName = translateCountryName(team.team.country);

  return (
    <PageShell showLeagues={false}>
      <div className={cn(ds.card, "p-4 md:p-6 mb-4 md:mb-6")}>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={team.team.logo} alt={teamName} className="h-16 w-16 md:h-24 md:w-24 object-contain" />
          <div>
            <h1 className={ds.pageTitle}>{teamName}</h1>
            <p className="text-sm text-muted-foreground">{countryName}</p>
            {team.team.founded && (
              <p className="text-xs text-muted-foreground mt-1">成立于 {team.team.founded} 年</p>
            )}
            {team.venue && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {team.venue.name} · 容量 {team.venue.capacity.toLocaleString("zh-CN")} 人
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <StatBox label="近期赛果" value={String(finished.length)} />
        <StatBox label="即将进行" value={String(upcoming.length)} />
        <StatBox label="主场" value={team.venue?.city || "-"} />
      </div>

      <Card className="overflow-hidden mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t("recentResults")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {finished.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">暂无赛果</p>
          ) : (
            finished.map((f) => <MatchCard key={f.fixture.id} fixture={f} />)
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t("upcomingFixtures")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">暂无赛程</p>
          ) : (
            upcoming.map((f) => <MatchCard key={f.fixture.id} fixture={f} />)
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 返回{tc("home")}
        </Link>
      </div>
    </PageShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className={ds.statBox}>
      <p className="text-2xl font-bold">{value}</p>
      <p className={cn(ds.caption, "mt-1")}>{label}</p>
    </div>
  );
}
