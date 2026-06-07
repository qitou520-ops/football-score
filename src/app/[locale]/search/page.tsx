import { SearchPageClient } from "@/components/search/search-page-client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageShell } from "@/components/layout/page-shell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("search");
  return buildMetadata({ title: t("title"), description: t("description"), path: "/search" });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q } = await searchParams;
  const t = await getTranslations("search");
  const tc = await getTranslations("common");

  return (
    <PageShell showLeagues={false}>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("title")}</h1>
      <SearchPageClient
        initialQuery={q || ""}
        labels={{
          placeholder: tc("searchPlaceholder"),
          teams: t("teams"),
          players: t("players"),
          noResults: tc("noResults"),
          loading: tc("loading"),
        }}
      />
    </PageShell>
  );
}
