import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPredictionBySlug } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const article = await getPredictionBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/predictions/${slug}`,
    type: "article",
  });
}

export default async function PredictionArticlePage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("predictions");
  const tm = await getTranslations("matchLabels");

  const article = await getPredictionBySlug(slug);
  if (!article) notFound();

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-3xl">
      <Link href="/predictions" prefetch className="text-sm text-primary hover:underline">
        ← {tm("back")}
      </Link>
      <article className="mt-4">
        <Badge variant="outline" className="mb-2">{article.league}</Badge>
        <p className="text-sm text-muted-foreground mb-2">{article.matchLabel}</p>
        <div className="flex items-start gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold flex-1">{article.title}</h1>
          <Badge variant="secondary" className="shrink-0">{article.confidence}%</Badge>
        </div>
        <p className="text-primary font-semibold mb-4">
          {t("pick")}：{article.prediction}
        </p>
        <div className="prose dark:prose-invert whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>
      </article>
    </div>
  );
}
