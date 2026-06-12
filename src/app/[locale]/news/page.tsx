import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getNews } from "@/lib/data";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ds } from "@/lib/design";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  return buildMetadata({ title: t("title"), description: t("description"), path: "/news" });
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const articles = await getNews(locale);

  return (
    <PageShell showLeagues={false}>
      <h1 className={ds.pageTitle + " mb-4 md:mb-6"}>{t("title")}</h1>
      <div className={ds.stack}>
        {articles.map((article) => (
          <Link key={article.id} href={`/news/${article.slug}`} prefetch>
            <Card className="hover:border-foreground/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-1">
                  <Badge variant="secondary" className="shrink-0 text-xs">{article.category}</Badge>
                </div>
                <h2 className="font-semibold text-base md:text-lg mb-1">{article.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                <time className="text-xs text-muted-foreground mt-2 block">
                  {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                </time>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
