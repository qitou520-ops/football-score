import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

interface LeagueNavProps {
  leagueId: number;
  active: "standings" | "fixtures";
  labels: { standings: string; fixtures: string };
}

export function LeagueNav({ leagueId, active, labels }: LeagueNavProps) {
  const tabs = [
    { key: "standings" as const, href: `/league/${leagueId}/standings`, label: labels.standings },
    { key: "fixtures" as const, href: `/league/${leagueId}/fixtures`, label: labels.fixtures },
  ];

  return (
    <div className={cn("flex gap-1 p-1 bg-muted/60 w-fit", ds.radiusMd)}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          prefetch
          className={cn(
            "px-4 py-1.5 text-sm font-medium transition-colors",
            ds.radiusSm,
            active === tab.key
              ? "bg-card text-foreground shadow-[var(--shadow-card)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
