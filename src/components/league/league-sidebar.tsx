import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POPULAR_LEAGUES } from "@/lib/api-football/constants";
import { translateLeagueName } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

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
              href={`/league/${league.id}/standings`}
              prefetch
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60",
                activeLeagueId === league.id && "bg-muted font-semibold"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={league.logo} alt="" className="h-5 w-5 object-contain shrink-0" />
              <span className="truncate">{translateLeagueName(league.id, league.name)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
