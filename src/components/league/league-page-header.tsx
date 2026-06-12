import { LeagueNav } from "./league-nav";
import { ds } from "@/lib/design";
import { RemoteImage } from "@/components/ui/remote-image";
import { translateLeagueName, translateCountryName } from "@/lib/translations";

interface LeaguePageHeaderProps {
  league: { id: number; name: string; country: string; logo: string };
  title: string;
  activeTab: "fixtures" | "standings" | "players" | "teams";
  navLabels: {
    fixtures: string;
    standings: string;
    players: string;
    teams: string;
  };
}

export function LeaguePageHeader({
  league,
  title,
  activeTab,
  navLabels,
}: LeaguePageHeaderProps) {
  const leagueName = translateLeagueName(league.id, league.name);
  const countryName = translateCountryName(league.country);

  return (
    <>
      <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
        <RemoteImage
          src={league.logo}
          alt=""
          width={40}
          height={40}
          className="h-8 w-8 md:h-10 md:w-10"
          sizes="40px"
        />
        <div className="min-w-0">
          <h1 className={ds.pageTitle + " truncate"}>{title || leagueName}</h1>
          <p className="text-xs text-muted-foreground">{countryName}</p>
        </div>
      </div>

      <div className="mb-4">
        <LeagueNav leagueId={league.id} active={activeTab} labels={navLabels} />
      </div>
    </>
  );
}
