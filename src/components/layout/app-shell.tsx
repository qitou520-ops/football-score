import { MobileHeader } from "./mobile-header";
import { DesktopHeader } from "./desktop-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
