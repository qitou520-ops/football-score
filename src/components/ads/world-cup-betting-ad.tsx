import { getTranslations } from "next-intl/server";
import { Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

export const WC_BETTING_URL = "https://hga050h.com";

interface WorldCupBettingAdProps {
  variant?: "banner" | "sidebar" | "compact";
  className?: string;
}

export async function WorldCupBettingAd({
  variant = "sidebar",
  className,
}: WorldCupBettingAdProps) {
  const t = await getTranslations("ads.worldCup");

  if (variant === "banner") {
    return (
      <a
        href={WC_BETTING_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn(
          "block rounded-[var(--radius-lg)] overflow-hidden transition-opacity hover:opacity-95",
          className
        )}
      >
        <div className="relative bg-gradient-to-r from-[#0f3d2e] via-[#1a6b47] to-[#8b6914] px-5 py-4 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,#fff_0%,transparent_60%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 border border-white/25">
                <Trophy className="h-5 w-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest opacity-80 mb-0.5">
                  {t("badge")}
                </p>
                <p className="text-base md:text-lg font-bold leading-tight">{t("title")}</p>
                <p className="text-xs md:text-sm opacity-90 mt-0.5 truncate">{t("subtitle")}</p>
              </div>
            </div>
            <span className="shrink-0 hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/15 border border-white/30 text-sm font-semibold">
              {t("cta")}
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={WC_BETTING_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn(ds.panel, "hover:opacity-95 transition-opacity block", className)}
      >
        <div className="bg-gradient-to-br from-[#14281d] via-[#1e5631] to-[#2d7a4a] px-4 py-4 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Trophy className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug">{t("title")}</p>
              <p className="text-xs opacity-85 mt-1 leading-relaxed">{t("compactDesc")}</p>
              <p className="text-xs font-semibold text-amber-300 mt-2">{t("cta")} →</p>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={WC_BETTING_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn(ds.panel, "hover:opacity-95 transition-opacity block", className)}
    >
      <div className="relative bg-gradient-to-br from-[#0f3d2e] via-[#1a6b47] to-[#6b5a1e] px-4 py-5 text-white overflow-hidden">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-amber-400/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-amber-300" />
            <span className="text-[11px] uppercase tracking-wider opacity-80">{t("badge")}</span>
          </div>
          <p className="text-base font-bold leading-snug">{t("title")}</p>
          <p className="text-xs opacity-90 mt-1.5 leading-relaxed">{t("sidebarDesc")}</p>
          <span className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-semibold">
            {t("cta")}
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
