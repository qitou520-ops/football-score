"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import { SiteLogo } from "@/components/brand/site-logo";

const NAV_ITEMS = [
  { href: "/news", labelKey: "news" as const },
  { href: "/predictions", labelKey: "predictions" as const },
  { href: "/live", labelKey: "liveScores" as const },
];

export function DesktopHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className={cn(ds.header, "hidden md:block h-14")}>
      <div className="container mx-auto max-w-7xl px-4 h-full">
        <div className="flex h-full items-center gap-6">
          <Link href="/" prefetch className="shrink-0">
            <SiteLogo name={tc("siteName")} />
          </Link>

          <Link href="/search" prefetch className="flex-1 max-w-lg mx-auto">
            <div className={ds.searchBar}>
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{tc("searchPlaceholder")}</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 shrink-0">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors",
                  isActive(item.href)
                    ? "text-foreground font-semibold bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
