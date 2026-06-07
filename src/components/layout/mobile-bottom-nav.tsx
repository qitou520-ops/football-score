"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Radio, Newspaper, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

const TABS = [
  { href: "/", icon: Radio, label: "比赛" },
  { href: "/news", icon: Newspaper, navKey: "news" as const },
  { href: "/predictions", icon: TrendingUp, navKey: "predictions" as const },
  { href: "/search", icon: Search, navKey: "search" as const },
];

export function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/live") || pathname.startsWith("/match");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(ds.bottomNav, "md:hidden pb-[env(safe-area-inset-bottom)]")}
      aria-label="主导航"
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ href, icon: Icon, label, navKey }) => {
          const active = isActive(href);
          const tabLabel = label ?? t(navKey!);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-colors active:scale-95",
                active ? "text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium truncate max-w-full">{tabLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
