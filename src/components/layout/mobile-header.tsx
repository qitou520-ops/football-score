"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Search } from "lucide-react";
import { ds } from "@/lib/design";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/brand/site-logo";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export function MobileHeader() {
  const tc = useTranslations("common");
  const { siteName } = useSiteSettings();

  return (
    <header className={cn(ds.header, "md:hidden")}>
      <div className="flex h-12 items-center justify-between px-4">
        <Link href="/" prefetch>
          <SiteLogo name={siteName || tc("siteName")} size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <div className="px-4 pb-3">
        <Link href="/search" prefetch>
          <div className={cn(ds.searchBar, "py-2")}>
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{tc("searchPlaceholder")}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
