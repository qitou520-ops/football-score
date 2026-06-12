"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ArrowLeftRight,
  Circle,
  Clock,
  MonitorPlay,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { translatePlayerName } from "@/lib/translations/client";
import { COMMENTARY_ZH_LABELS } from "@/lib/commentary/zh-text";
import { ds } from "@/lib/design";
import type { LiveCommentaryItem, LiveCommentaryResponse } from "@/lib/mock/commentary-types";

const fetcher = async (url: string): Promise<LiveCommentaryResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      matchId: 0,
      isLive: false,
      elapsed: null,
      status: "",
      items: [],
      updatedAt: new Date().toISOString(),
    };
  }
  return res.json();
};

interface LiveCommentaryProps {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
}

export function LiveCommentary({ matchId, homeTeam, awayTeam }: LiveCommentaryProps) {
  const labels = COMMENTARY_ZH_LABELS;
  const [pollLive, setPollLive] = useState(false);
  const { data, isValidating } = useSWR<LiveCommentaryResponse>(
    `/api/match/${matchId}/commentary`,
    fetcher,
    {
      refreshInterval: pollLive ? 15000 : 0,
      revalidateOnFocus: pollLive,
      dedupingInterval: 5000,
      onSuccess: (payload) => setPollLive(payload.isLive),
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
        <ul className="divide-y divide-border/50">
          {items.map((item) => (
            <CommentaryRow
              key={item.id}
              item={item}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentaryRow({
  item,
  homeTeam,
  awayTeam,
}: {
  item: LiveCommentaryItem;
  homeTeam: string;
  awayTeam: string;
}) {
  if (item.type === "status") {
    return <StatusRow item={item} />;
  }

  const teamName = item.team === "home" ? homeTeam : item.team === "away" ? awayTeam : "";
  const isGoal = item.type === "goal";

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        isGoal && "bg-emerald-500/8 dark:bg-emerald-500/10"
      )}
    >
      <div className="w-12 shrink-0 pt-0.5 text-right">
        <TimeBadge item={item} />
      </div>
      <div className="shrink-0 pt-0.5">
        <EventIcon type={item.type} />
      </div>
      <div className="flex-1 min-w-0">
        <EventContent item={item} teamName={teamName} />
      </div>
    </li>
  );
}

function StatusRow({ item }: { item: LiveCommentaryItem }) {
  const isHt = item.statusKind === "ht";
  const isFt = item.statusKind === "ft";

  return (
    <li className="px-4 py-3 bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="w-12 shrink-0 flex justify-end">
          {item.minute != null ? <TimeBadge item={item} /> : <Clock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div
          className={cn(
            "flex-1 text-center text-xs font-bold py-1.5 px-3 rounded-full",
            isFt && "bg-foreground text-background",
            isHt && "bg-muted border border-border text-foreground",
            !isHt && !isFt && "text-muted-foreground"
          )}
        >
          {item.text}
          {item.detail && (
            <span className={cn("block font-normal mt-0.5", isFt ? "opacity-80" : "text-muted-foreground")}>
              {item.detail}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function TimeBadge({ item }: { item: LiveCommentaryItem }) {
  if (item.minute == null) return null;
  const label = item.extraMinute ? `${item.minute}+${item.extraMinute}'` : `${item.minute}'`;
  return (
    <span className="text-xs font-bold font-mono tabular-nums text-muted-foreground">
      {label}
    </span>
  );
}

function EventIcon({ type }: { type: LiveCommentaryItem["type"] }) {
  const base = "flex h-7 w-7 items-center justify-center rounded-full border bg-background";

  switch (type) {
    case "goal":
      return (
        <div className={cn(base, "border-emerald-500")}>
          <Circle className="h-3 w-3 fill-emerald-500 stroke-none" />
        </div>
      );
    case "yellow_card":
      return (
        <div className={cn(base, "border-yellow-400")}>
          <Square className="h-3 w-3 fill-yellow-400 stroke-none" />
        </div>
      );
    case "red_card":
      return (
        <div className={cn(base, "border-red-500")}>
          <Square className="h-3 w-3 fill-red-500 stroke-none" />
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

function EventContent({
  item,
  teamName,
}: {
  item: LiveCommentaryItem;
  teamName: string;
}) {
  const labels = COMMENTARY_ZH_LABELS;
  const typeLabel = {
    goal: labels.goal,
    yellow_card: labels.yellowCard,
    red_card: labels.redCard,
    substitution: labels.substitution,
    var: labels.var,
    status: "",
  }[item.type];

  const isGoal = item.type === "goal";

  return (
    <div>
      <p className={cn("text-sm font-semibold", isGoal && "text-emerald-600 dark:text-emerald-400")}>
        {item.text || typeLabel}
      </p>
      {item.player && item.type !== "substitution" && (
        <p className="text-sm font-medium mt-0.5">
          {translatePlayerName(undefined, item.player)}
        </p>
      )}
      {item.type === "substitution" && (
        <div className="text-xs mt-1 space-y-0.5 text-muted-foreground">
          {item.playerIn && (
            <p className="text-emerald-600 dark:text-emerald-400">
              ↑ {labels.in} {translatePlayerName(undefined, item.playerIn)}
            </p>
          )}
          {item.playerOut && (
            <p className="text-red-500">
              ↓ {labels.out} {translatePlayerName(undefined, item.playerOut)}
            </p>
          )}
        </div>
      )}
      {item.assist && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {labels.assist}：{translatePlayerName(undefined, item.assist)}
        </p>
      )}
      {item.score && isGoal && (
        <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
          {item.score.home} - {item.score.away}
        </p>
      )}
      {item.detail && item.type !== "substitution" && (
        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
      )}
      {teamName && (
        <p className="text-[10px] text-muted-foreground mt-1">{teamName}</p>
      )}
    </div>
  );
}
