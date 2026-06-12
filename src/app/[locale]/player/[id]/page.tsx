import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPlayerById } from "@/lib/data";
import { PageShell } from "@/components/layout/page-shell";
import { PlayerStatsTable } from "@/components/player/player-stats-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ds } from "@/lib/design";
import { cn } from "@/lib/utils";
import {
  translatePlayerName,
  translateCountryName,
  translateTeamName,
  translateLeagueName,
} from "@/lib/translations";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const data = await getPlayerById(Number(id));
  const t = await getTranslations("player");
  const name = data
    ? translatePlayerName(data.player.id, data.player.name)
    : "球员";
  return buildMetadata({
    title: t("title", { player: name }),
    description: t("description", { player: name }),
    path: `/player/${id}`,
  });
}

export default async function PlayerPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const tm = await getTranslations("matchLabels");

  const data = await getPlayerById(Number(id));
  if (!data) notFound();

  const { player, statistics } = data;
  const stats = statistics[0];
  const playerName = translatePlayerName(player.id, player.name);
  const nationality = translateCountryName(player.nationality);

  return (
    <PageShell showLeagues={false}>
      <div className={cn(ds.card, "p-4 md:p-6 mb-4 md:mb-6")}>
        <div className="flex items-start gap-4 md:gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player.photo}
            alt={playerName}
            className={cn("h-24 w-24 md:h-32 md:w-32 object-cover bg-muted", ds.radiusLg)}
          />
          <div className="flex-1">
            <h1 className={ds.pageTitle}>{playerName}</h1>
            <p className="text-muted-foreground">{nationality}</p>
            {stats && (
              <p className="text-sm text-muted-foreground mt-1">
                {translateTeamName(undefined, stats.team)} · {translateLeagueName(undefined, stats.league)}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <Stat label="年龄" value={`${player.age} 岁`} />
              <Stat label="身高" value={player.height || "-"} />
              <Stat label="体重" value={player.weight || "-"} />
              <Stat label="出生日期" value={player.birth.date} />
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <HighlightStat label="进球" value={stats.goals} />
          <HighlightStat label="助攻" value={stats.assists} />
          <HighlightStat label="出场" value={stats.appearances} />
          <HighlightStat label="评分" value={stats.rating.toFixed(1)} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tm("seasonStats")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <PlayerStatsTable stats={stats} />
          ) : (
            <p className="text-muted-foreground text-sm">暂无赛季统计数据</p>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function HighlightStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={ds.statBox}>
      <p className="text-2xl font-bold">{value}</p>
      <p className={cn(ds.caption, "mt-1")}>{label}</p>
    </div>
  );
}
