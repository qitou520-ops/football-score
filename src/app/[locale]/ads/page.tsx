import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAds, getAllAds } from "@/lib/cms";
import { AD_POSITIONS } from "@/lib/cms/types";
import { PageShell } from "@/components/layout/page-shell";
import { AdBanner } from "@/components/ads/ad-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ads");
  return buildMetadata({ title: t("title"), description: t("description"), path: "/ads" });
}

export default async function AdsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ads");

  const [pageAds, allAds] = await Promise.all([
    getAds("ads-page"),
    getAllAds(),
  ]);

  const activeByPosition = AD_POSITIONS.map((pos) => ({
    ...pos,
    ads: allAds.filter((a) => a.active && a.position === pos.id),
  })).filter((g) => g.ads.length > 0);

  return (
    <PageShell showLeagues={false}>
      <h1 className="text-xl md:text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("description")}</p>

      {pageAds.length > 0 && (
        <section className="mb-8">
          <AdBanner position="ads-page" />
        </section>
      )}

      <div className="space-y-6">
        {activeByPosition.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{group.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdBanner position={group.id} />
            </CardContent>
          </Card>
        ))}

        {activeByPosition.length === 0 && pageAds.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">{t("empty")}</p>
        )}
      </div>
    </PageShell>
  );
}
