import { LeagueSidebar } from "@/components/league/league-sidebar";
import { LeagueScrollBar } from "@/components/league/league-scroll-bar";
import { SidebarWidget } from "@/components/layout/sidebar-widget";
import { AdBanner } from "@/components/ads/ad-banner";
import { ds } from "@/lib/design";

interface PageShellProps {
  children: React.ReactNode;
  activeLeagueId?: number;
  showLeagues?: boolean;
}

export function PageShell({
  children,
  activeLeagueId,
  showLeagues = true,
}: PageShellProps) {
  return (
    <>
      <div className="hidden md:block border-b border-border bg-card">
        <div className={`container mx-auto max-w-7xl ${ds.pageX} py-3`}>
          <AdBanner position="homepage-top" />
        </div>
      </div>

      <div className={`container mx-auto ${ds.pageX} ${ds.pageY} max-w-7xl`}>
        <div className="md:hidden mb-3">
          <AdBanner position="mobile-banner" />
        </div>

        {showLeagues && (
          <LeagueScrollBar activeLeagueId={activeLeagueId} className="mb-3 md:hidden" />
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-12 ${ds.gridGap}`}>
          {showLeagues && (
            <aside className="lg:col-span-2 hidden lg:block">
              <div className="sticky top-14">
                <LeagueSidebar activeLeagueId={activeLeagueId} />
              </div>
            </aside>
          )}

          <div className={showLeagues ? "lg:col-span-7 min-w-0" : "lg:col-span-9 min-w-0"}>
            {children}
          </div>

          <aside className="lg:col-span-3 hidden lg:block">
            <div className={`sticky top-14 ${ds.stackSm}`}>
              <AdBanner position="homepage-sidebar" />
              <SidebarWidget />
              <AdBanner position="homepage-sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
