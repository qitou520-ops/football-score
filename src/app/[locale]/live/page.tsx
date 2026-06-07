import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { MatchFeed } from "@/components/match/match-feed";
import { PageShell } from "@/components/layout/page-shell";
import { format } from "date-fns";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("live");
  return buildMetadata({ title: t("title"), description: t("description"), path: "/live" });
}

export default async function LivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <PageShell>
      <MatchFeed initialDate={today} />
    </PageShell>
  );
}
