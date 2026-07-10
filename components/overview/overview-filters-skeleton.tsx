import { Skeleton } from "@/components/ui/skeleton";
import { JOURNAL_FILTERS_MOBILE_ROW } from "@/config/journal-mobile";

export function OverviewFiltersSkeleton() {
  return (
    <>
      <div className={JOURNAL_FILTERS_MOBILE_ROW} aria-hidden>
        <Skeleton className="h-10 min-w-0 flex-1 rounded-xl" />
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      </div>
      <div
        aria-hidden
        className="hidden h-[4.25rem] gap-3 rounded-2xl p-3 md:flex"
      >
        <Skeleton className="h-9 min-w-0 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </>
  );
}
