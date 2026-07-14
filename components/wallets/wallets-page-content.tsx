import { JournalShell } from "@/components/journal/journal-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { STACK_GAP } from "@/config/spacing";
import { WALLETS_PAGE_DESC, WALLETS_PAGE_TITLE } from "@/config/wallet-labels";
import { cn } from "@/lib/utils";

interface WalletsPageContentProps {
  children: React.ReactNode;
}

export function WalletsPageContent({ children }: WalletsPageContentProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <JournalShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col md:p-3",
            STACK_GAP,
            "overflow-y-auto overscroll-y-contain",
            "md:pb-20",
          )}
          title={WALLETS_PAGE_TITLE}
        >
          <header className="shrink-0 max-md:hidden">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              {WALLETS_PAGE_TITLE}
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
              {WALLETS_PAGE_DESC}
            </p>
          </header>

          <p className="text-[11px] text-muted-foreground md:hidden">
            {WALLETS_PAGE_DESC}
          </p>

          {children}
        </MobileScrollSurface>
      </JournalShell>
    </div>
  );
}
