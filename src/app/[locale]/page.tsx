import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { MatchFeed } from "@/components/match/match-feed";
import { PageShell } from "@/components/layout/page-shell";
import { getFeaturedMatchFixtures } from "@/lib/data";
import { format } from "date-fns";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return buildMetadata({ title: t("title"), description: t("description"), path: "" });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const today = format(new Date(), "yyyy-MM-dd");
  const featuredFixtures = await getFeaturedMatchFixtures();

  return (
    <PageShell>
      <MatchFeed initialDate={today} featuredFixtures={featuredFixtures} />
    </PageShell>
  );
}
