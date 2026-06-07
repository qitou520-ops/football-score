import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function MatchListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="h-4 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-4 w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-3 md:px-4 py-3 md:py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className={cn("h-64 w-full", ds.radiusLg)} />
      <Skeleton className={cn("h-48 w-full", ds.radiusLg)} />
    </div>
  );
}

export function AdBannerSkeleton() {
  return <Skeleton className={cn("h-20 w-full", ds.radiusLg)} />;
}
