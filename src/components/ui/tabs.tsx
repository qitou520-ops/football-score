"use client";

import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-muted/60 w-fit max-w-full overflow-x-auto scrollbar-hide", ds.radiusMd, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            ds.radiusSm,
            activeTab === tab.id
              ? "bg-card text-foreground shadow-[var(--shadow-card)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
