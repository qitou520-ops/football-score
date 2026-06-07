"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  const switchLocale = (next: "zh" | "en") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className={cn("flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-border p-0.5", className)}>
      <Button
        type="button"
        variant={locale === "zh" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5 text-xs"
        onClick={() => switchLocale("zh")}
        aria-label={t("language")}
      >
        中文
      </Button>
      <Button
        type="button"
        variant={locale === "en" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5 text-xs"
        onClick={() => switchLocale("en")}
        aria-label={t("language")}
      >
        EN
      </Button>
    </div>
  );
}
