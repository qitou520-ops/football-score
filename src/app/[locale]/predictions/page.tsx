import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPredictions } from "@/lib/data";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ds } from "@/lib/design";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("predictions");
  return buildMetadata({ title: t("title"), description: t("description"), path: "/predictions" });
}

export default async function PredictionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("predictions");
  const predictions = await getPredictions();

  return (
    <PageShell showLeagues={false}>
      <h1 className={ds.pageTitle + " mb-2"}>{t("title")}</h1>
      <p className={cn(ds.body, "text-muted-foreground mb-4 md:mb-6")}>{t("description")}</p>

      <div className={ds.stack}>
        {predictions.map((p) => (
          <Link key={p.id} href={`/predictions/${p.slug}`} prefetch>
            <Card className="hover:border-foreground/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge variant="outline" className="mb-2 text-xs">{p.league}</Badge>
                    <h2 className="font-semibold text-base md:text-lg mb-1">{p.title}</h2>
                    <p className="text-xs text-muted-foreground mb-1">{p.matchLabel}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{p.confidence}%</Badge>
                </div>
                <p className="text-sm text-primary mt-2 font-medium">
                  {t("pick")}：{p.prediction}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
