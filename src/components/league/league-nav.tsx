import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type LeagueNavTab = "fixtures" | "standings" | "players" | "teams";

interface LeagueNavProps {
  leagueId: number;
  active: LeagueNavTab;
  labels: {
    fixtures: string;
    standings: string;
    players: string;
    teams: string;
  };
}

export function LeagueNav({ leagueId, active, labels }: LeagueNavProps) {
  const tabs: { key: LeagueNavTab; href: string; label: string }[] = [
    { key: "fixtures", href: `/league/${leagueId}/fixtures`, label: labels.fixtures },
    { key: "standings", href: `/league/${leagueId}/standings`, label: labels.standings },
    { key: "players", href: `/league/${leagueId}/players`, label: labels.players },
    { key: "teams", href: `/league/${leagueId}/teams`, label: labels.teams },
  ];

  return (
    <nav className="flex gap-5 md:gap-8 border-b border-border overflow-x-auto scrollbar-hide -mx-1 px-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          prefetch
          className={cn(
            "pb-2.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0",
            active === tab.key
              ? "text-primary border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
