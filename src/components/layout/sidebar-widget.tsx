import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/cms";
import { getNews, getPredictions } from "@/lib/data";
import { ChevronRight, Newspaper, TrendingUp, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

export async function SidebarWidget() {
  const t = await getTranslations("sidebar");
  const th = await getTranslations("home");
  const settings = await getSettings();
  const news = await getNews();
  const predictions = await getPredictions();
  const telegramUrl = settings.telegramUrl || "https://t.me/hga050h_com";

  return (
    <div className={ds.stackSm}>
      <Link
        href="/predictions"
        prefetch
        className={cn(ds.cardInteractive, "flex items-center gap-3 p-4")}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={ds.sectionTitle}>{th("featuredPredictions")}</p>
          <p className={cn(ds.caption, "truncate")}>{t("predictionsTip")}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      {news.length > 0 && (
        <div className={ds.panel}>
          <div className={cn(ds.cardHeader, "flex-row items-center justify-between")}>
            <h3 className={cn(ds.sectionTitle, "flex items-center gap-2")}>
              <Newspaper className="h-4 w-4" />
              {th("latestNews")}
            </h3>
            <Link href="/news" prefetch className={cn(ds.caption, "hover:text-foreground")}>
              更多
            </Link>
          </div>
          <ul>
            {news.slice(0, 4).map((article) => (
              <li key={article.id}>
                <Link
                  href={`/news/${article.slug}`}
                  prefetch
                  className="block px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0"
                >
                  <p className="font-medium line-clamp-2 leading-snug">{article.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {predictions.length > 0 && (
        <div className={ds.panel}>
          <div className={ds.cardHeader}>
            <h3 className={ds.sectionTitle}>{th("featuredPredictions")}</h3>
          </div>
          <ul>
            {predictions.slice(0, 3).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/predictions/${p.slug}`}
                  prefetch
                  className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0"
                >
                  <span className="truncate font-medium">{p.title}</span>
                  <span className={cn(ds.caption, "shrink-0")}>{p.confidence}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(ds.panel, "hover:opacity-95 transition-opacity")}
      >
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Send className="h-4 w-4" />
            <span className="text-sm font-bold">Telegram</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">{t("telegramTip")}</p>
        </div>
      </a>
    </div>
  );
}
