"use client";

import { usePathname } from "@/i18n/navigation";

export function NavigationProgress() {
  const pathname = usePathname();

  return (
    <div key={pathname} className="fixed top-0 inset-x-0 z-[100] h-0.5 overflow-hidden pointer-events-none">
      <div className="h-full bg-primary animate-[progress_0.4s_ease-out_forwards] origin-left" />
    </div>
  );
}
