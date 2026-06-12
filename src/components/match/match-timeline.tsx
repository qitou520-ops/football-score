import type { MatchEvent } from "@/lib/api-football/types";
import { translatePlayerName, translateTeamName } from "@/lib/translations/client";
import { cn } from "@/lib/utils";

interface MatchTimelineProps {
  events: MatchEvent[];
  emptyText?: string;
}

const EVENT_ICONS: Record<string, string> = {
  Goal: "⚽",
  "Yellow Card": "🟨",
  "Red Card": "🟥",
  subst: "🔄",
  Var: "📺",
};

export function MatchTimeline({ events, emptyText = "暂无比赛事件" }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">{emptyText}</p>
    );
  }

  const sorted = [...events].sort((a, b) => b.time.elapsed - a.time.elapsed);

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 py-2.5 px-3 border-b border-border/50",
            event.detail === "Own Goal" && "opacity-70"
          )}
        >
          <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">
            {event.time.elapsed}&apos;
            {event.time.extra ? `+${event.time.extra}` : ""}
          </span>
          <span className="text-base">{EVENT_ICONS[event.type] || EVENT_ICONS[event.detail] || "•"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {translatePlayerName(event.player.id, event.player.name)}
            </p>
            {event.assist.name && (
              <p className="text-xs text-muted-foreground">
                助攻：{translatePlayerName(event.assist.id ?? undefined, event.assist.name)}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {translateTeamName(event.team.id, event.team.name)}
          </span>
        </div>
      ))}
    </div>
  );
}
