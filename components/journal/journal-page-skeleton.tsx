import { Skeleton } from "@/components/ui/skeleton";
import { JOURNAL_DESKTOP_SCROLL_TRAIL } from "@/config/journal-desktop";
import {
  JOURNAL_LIST_GROUP,
  JOURNAL_LIST_ROW,
  JOURNAL_LIST_SECTION_LABEL,
} from "@/config/journal-table";
import { SEPARATED_SURFACE } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

function JournalStatTileSkeleton() {
  return (
    <div className="flex min-h-22 flex-col justify-between rounded-2xl p-3.5">
      <Skeleton className="size-7 rounded-3xl bg-muted/80" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-14 bg-muted/70" />
        <Skeleton className="h-6 w-24 bg-muted/80" />
        <Skeleton className="h-2.5 w-20 bg-muted/60" />
      </div>
    </div>
  );
}

function JournalRowSkeleton() {
  return (
    <div className={JOURNAL_LIST_ROW}>
      <Skeleton className="size-8 shrink-0 rounded-3xl" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-[72%]" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <Skeleton className="h-5 w-20 shrink-0" />
    </div>
  );
}

export function JournalPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat journal"
      className={cn("flex flex-col", STACK_GAP)}
    >
      <header className="hidden shrink-0 md:block md:pt-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3 max-md:-mt-1 md:hidden">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-end">
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                SEPARATED_SURFACE,
                "min-w-38 flex-1 overflow-hidden rounded-2xl",
              )}
            >
              <JournalStatTileSkeleton />
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0">
        <div className="flex gap-2 md:rounded-2xl md:p-3">
          <Skeleton className="h-10 min-w-0 flex-1 rounded-xl" />
          <Skeleton className="size-10 shrink-0 rounded-xl md:hidden" />
          <Skeleton className="hidden h-10 w-28 shrink-0 rounded-xl md:block" />
          <Skeleton className="hidden h-10 w-32 shrink-0 rounded-xl md:block" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
          <div className={JOURNAL_LIST_SECTION_LABEL}>
            <Skeleton className="inline-block h-2.5 w-24" />
          </div>
          <div className={JOURNAL_LIST_GROUP}>
            {Array.from({ length: 5 }).map((_, index) => (
              <JournalRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>

      <div className={cn("hidden md:block", JOURNAL_DESKTOP_SCROLL_TRAIL)} />
    </div>
  );
}
