import { JournalPageSkeleton } from "@/components/journal/journal-page-skeleton";
import { JournalShell } from "@/components/journal/journal-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { JOURNAL_DESKTOP_SCROLL_SURFACE } from "@/config/journal-desktop";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

export default function JournalLoading() {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <JournalShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            STACK_GAP,
            "max-md:overflow-y-auto max-md:overscroll-y-contain",
            JOURNAL_DESKTOP_SCROLL_SURFACE,
          )}
          title="Journal"
        >
          <JournalPageSkeleton />
        </MobileScrollSurface>
      </JournalShell>
    </div>
  );
}
