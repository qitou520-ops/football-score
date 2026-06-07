import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getNewsBySlug } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/news/${slug}`,
    type: "article",
  });
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tm = await getTranslations("matchLabels");

  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-3xl">
      <Link href="/news" prefetch className="text-sm text-primary hover:underline">
        ← {tm("back")}
      </Link>
      <article className="mt-4">
        <Badge variant="secondary" className="mb-3">{article.category}</Badge>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
        <time className="text-sm text-muted-foreground">
          {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
        </time>
        <div className="prose dark:prose-invert mt-6 whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>
      </article>
    </div>
  );
}
