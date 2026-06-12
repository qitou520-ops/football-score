import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POPULAR_LEAGUES } from "@/lib/api-football/constants";
import { translateLeagueName } from "@/lib/translations/client";
import { SiteLogo } from "@/components/brand/site-logo";
import { getSettings } from "@/lib/cms";

export async function Footer() {
  const t = await getTranslations("common");
  const tf = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const settings = await getSettings();

  return (
    <footer className="hidden md:block border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              <SiteLogo name={settings.siteName || t("siteName")} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">
              {settings.siteDescription || tf("description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t("standings")}</h3>
            <ul className="space-y-2">
              {POPULAR_LEAGUES.slice(0, 5).map((league) => (
                <li key={league.id}>
                  <Link
                    href={`/league/${league.id}/fixtures`}
                    prefetch
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {translateLeagueName(league.id, league.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t("news")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/news" prefetch className="hover:text-foreground transition-colors">
                  {t("news")}
                </Link>
              </li>
              <li>
                <Link href="/predictions" prefetch className="hover:text-foreground transition-colors">
                  {t("predictions")}
                </Link>
              </li>
              <li>
                <Link href="/live" prefetch className="hover:text-foreground transition-colors">
                  {tn("liveScores")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("siteName")} · {tf("copyright")}
        </div>
      </div>
    </footer>
  );
}
