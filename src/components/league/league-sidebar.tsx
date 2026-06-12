import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POPULAR_LEAGUES } from "@/lib/api-football/constants";
import { translateLeagueName } from "@/lib/translations/client";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import { RemoteImage } from "@/components/ui/remote-image";

interface LeagueSidebarProps {
  activeLeagueId?: number;
  className?: string;
}

export async function LeagueSidebar({ activeLeagueId, className }: LeagueSidebarProps) {
  const t = await getTranslations("home");

  return (
    <nav className={cn(ds.panel, className)}>
      <div className={ds.cardHeader}>
        <h2 className={ds.sectionTitle}>{t("topLeagues")}</h2>
      </div>
      <ul className="py-1">
        {POPULAR_LEAGUES.map((league) => (
          <li key={league.id}>
            <Link
              href={`/league/${league.id}/fixtures`}
              prefetch
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60",
                activeLeagueId === league.id && "bg-muted font-semibold"
              )}
            >
              <RemoteImage src={league.logo} alt="" width={20} height={20} className="h-5 w-5" />
              <span className="truncate">{translateLeagueName(league.id, league.name)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
