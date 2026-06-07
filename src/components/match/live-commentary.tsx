"use client";

import useSWR from "swr";
import {
  ArrowLeftRight,
  Circle,
  MonitorPlay,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import type { LiveCommentaryItem, LiveCommentaryResponse } from "@/lib/mock/commentary-types";

const fetcher = async (url: string): Promise<LiveCommentaryResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

interface LiveCommentaryProps {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  labels: {
    title: string;
    live: string;
    updating: string;
    empty: string;
    goal: string;
    yellowCard: string;
    redCard: string;
    substitution: string;
    var: string;
    assist: string;
    in: string;
    out: string;
  };
}

export function LiveCommentary({ matchId, homeTeam, awayTeam, labels }: LiveCommentaryProps) {
  const { data, isValidating } = useSWR<LiveCommentaryResponse>(
    `/api/match/${matchId}/commentary`,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
        {labels.updating}
      </div>
    );
  }

  const { items, isLive, elapsed } = data;

  return (
    <div className="relative">
      <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className={ds.sectionTitle}>{labels.title}</h3>
        <div className="flex items-center gap-2">
          {isValidating && (
            <span className={cn(ds.caption, "flex items-center gap-1")}>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {labels.updating}
            </span>
          )}
          {isLive && elapsed != null && (
            <span className={ds.liveBadge}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)] animate-pulse" />
              {labels.live} {elapsed}&apos;
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">{labels.empty}</p>
      ) : (
        <div className="px-3 md:px-4 py-4">
          <div className="relative">
            <div className="absolute left-[27px] md:left-1/2 md:-translate-x-px top-2 bottom-2 w-0.5 bg-border" aria-hidden />
            <ul className="space-y-1">
              {items.map((item) => (
                <CommentaryRow
                  key={item.id}
                  item={item}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  labels={labels}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentaryRow({
  item,
  homeTeam,
  awayTeam,
  labels,
}: {
  item: LiveCommentaryItem;
  homeTeam: string;
  awayTeam: string;
  labels: LiveCommentaryProps["labels"];
}) {
  if (item.type === "status") {
    return <StatusRow item={item} />;
  }

  const isHome = item.team === "home";
  const teamName = isHome ? homeTeam : awayTeam;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[54px_1fr] md:grid-cols-[1fr_54px_1fr] gap-2 md:gap-4 py-2.5 items-start",
        !isHome && "md:[direction:rtl]"
      )}
    >
      <div className="hidden md:block" />
      <div className="flex justify-center md:justify-center relative z-10">
        <div className={cn("flex flex-col items-center gap-1", !isHome && "md:[direction:ltr]")}>
          <TimeBadge item={item} />
          <EventIcon type={item.type} />
        </div>
      </div>
      <div className={cn("min-w-0", !isHome && "md:[direction:ltr] md:text-right")}>
        <EventCard item={item} teamName={teamName} labels={labels} align={isHome ? "left" : "right"} />
      </div>
    </li>
  );
}

function StatusRow({ item }: { item: LiveCommentaryItem }) {
  const isHt = item.statusKind === "ht";
  const isFt = item.statusKind === "ft";

  return (
    <li className="relative py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <div
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-xs font-bold text-center",
            isFt && "bg-foreground text-background",
            isHt && "bg-muted text-foreground border border-border",
            !isHt && !isFt && "bg-muted/60 text-muted-foreground"
          )}
        >
          {item.text}
          {item.detail && (
            <span className={cn("block font-normal mt-0.5", isFt ? "opacity-80" : "text-muted-foreground")}>
              {item.detail}
            </span>
          )}
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>
    </li>
  );
}

function TimeBadge({ item }: { item: LiveCommentaryItem }) {
  if (item.minute == null) return null;
  const label = item.extraMinute ? `${item.minute}+${item.extraMinute}'` : `${item.minute}'`;
  return (
    <span className="text-[10px] font-bold font-mono tabular-nums text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
      {label}
    </span>
  );
}

function EventIcon({ type }: { type: LiveCommentaryItem["type"] }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background";

  switch (type) {
    case "goal":
      return (
        <div className={cn(base, "border-emerald-500 text-emerald-600")}>
          <Circle className="h-3.5 w-3.5 fill-emerald-500 stroke-none" />
        </div>
      );
    case "yellow_card":
      return (
        <div className={cn(base, "border-yellow-400")}>
          <Square className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 stroke-none" />
        </div>
      );
    case "red_card":
      return (
        <div className={cn(base, "border-red-500")}>
          <Square className="h-3.5 w-3.5 fill-red-500 text-red-500 stroke-none" />
        </div>
      );
    case "substitution":
      return (
        <div className={cn(base, "border-blue-500 text-blue-600")}>
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </div>
      );
    case "var":
      return (
        <div className={cn(base, "border-violet-500 text-violet-600")}>
          <MonitorPlay className="h-3.5 w-3.5" />
        </div>
      );
    default:
      return <div className={cn(base, "border-border")} />;
  }
}

function EventCard({
  item,
  teamName,
  labels,
  align,
}: {
  item: LiveCommentaryItem;
  teamName: string;
  labels: LiveCommentaryProps["labels"];
  align: "left" | "right";
}) {
  const typeLabel = {
    goal: labels.goal,
    yellow_card: labels.yellowCard,
    red_card: labels.redCard,
    substitution: labels.substitution,
    var: labels.var,
    status: "",
  }[item.type];

  const accent = {
    goal: "border-l-emerald-500",
    yellow_card: "border-l-yellow-400",
    red_card: "border-l-red-500",
    substitution: "border-l-blue-500",
    var: "border-l-violet-500",
    status: "border-l-border",
  }[item.type];

  return (
    <div
      className={cn(
        ds.eventCard,
        accent,
        align === "right" && "md:border-l-0 md:border-r-[3px]",
        align === "right" && item.type === "goal" && "md:border-r-emerald-500",
        align === "right" && item.type === "yellow_card" && "md:border-r-yellow-400",
        align === "right" && item.type === "red_card" && "md:border-r-red-500",
        align === "right" && item.type === "substitution" && "md:border-r-blue-500",
        align === "right" && item.type === "var" && "md:border-r-violet-500"
      )}
    >
      <div className="flex items-center gap-2 mb-1 md:hidden">
        <EventIcon type={item.type} />
        <TimeBadge item={item} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{typeLabel}</p>
      {item.player && (
        <p className="text-sm font-bold mt-0.5">{item.player}</p>
      )}
      {item.type === "substitution" && (
        <div className="text-xs mt-1 space-y-0.5">
          <p className="text-emerald-600">↑ {labels.in} {item.playerIn}</p>
          <p className="text-red-500">↓ {labels.out} {item.playerOut}</p>
        </div>
      )}
      {item.assist && (
        <p className="text-xs text-muted-foreground mt-0.5">{labels.assist}：{item.assist}</p>
      )}
      {item.score && (
        <p className="text-sm font-mono font-bold text-emerald-600 mt-1">
          {item.score.home} - {item.score.away}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
      {item.detail && item.type !== "substitution" && (
        <p className="text-xs text-muted-foreground/80 mt-0.5 italic">{item.detail}</p>
      )}
      <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{teamName}</p>
    </div>
  );
}
