import { OverviewAiBriefSkeleton } from "@/components/overview/overview-ai-brief-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OVERVIEW_BALANCE_METRIC,
  OVERVIEW_BALANCE_METRICS,
  OVERVIEW_BENTO_GRID,
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SAVINGS_SNAPSHOT_PAIR,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SPAN_FULL,
  OVERVIEW_TOP_PAIR,
} from "@/config/overview";
import { cn } from "@/lib/utils";

function OverviewCardSkeleton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-hidden
      className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}
    >
      {children}
    </section>
  );
}

function OverviewSectionHeaderSkeleton() {
  return (
    <div className="flex items-start gap-2.5">
      <Skeleton className="size-8 shrink-0 rounded-4xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

export function OverviewPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat overview"
      className={OVERVIEW_BENTO_GRID}
    >
      <div className={OVERVIEW_TOP_PAIR}>
        <OverviewCardSkeleton className="h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className={OVERVIEW_SECTION_LABEL}>Overview</p>
              <Skeleton className="mt-2 h-7 w-40 max-w-full" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <Skeleton className="hidden h-9 w-24 shrink-0 rounded-xl md:block" />
          </div>
        </OverviewCardSkeleton>
        <OverviewAiBriefSkeleton className="h-full" />
      </div>

      <OverviewCardSkeleton className={OVERVIEW_SPAN_FULL}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-9 w-44 max-w-full" />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-full" />
        </div>
        <div className={OVERVIEW_BALANCE_METRICS}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={OVERVIEW_BALANCE_METRIC}>
              <Skeleton className="size-8 rounded-4xl" />
              <Skeleton className="mt-3 h-3 w-14" />
              <Skeleton className="mt-2 h-6 w-24" />
              <Skeleton className="mt-2 h-2.5 w-20" />
            </div>
          ))}
        </div>
      </OverviewCardSkeleton>

      <OverviewCardSkeleton>
        <OverviewSectionHeaderSkeleton />
        <Skeleton className="mt-4 h-12 w-full" />
      </OverviewCardSkeleton>

      <OverviewCardSkeleton>
        <OverviewSectionHeaderSkeleton />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </OverviewCardSkeleton>

      <OverviewCardSkeleton>
        <OverviewSectionHeaderSkeleton />
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
        <div className="mt-3 flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </OverviewCardSkeleton>

      <div className={OVERVIEW_SAVINGS_SNAPSHOT_PAIR}>
        <OverviewCardSkeleton className="h-full">
          <OverviewSectionHeaderSkeleton />
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
          <Skeleton className="mt-3 h-4 w-24" />
        </OverviewCardSkeleton>
        <OverviewCardSkeleton className="h-full">
          <OverviewSectionHeaderSkeleton />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </OverviewCardSkeleton>
      </div>

      <OverviewCardSkeleton className={OVERVIEW_SPAN_FULL}>
        <OverviewSectionHeaderSkeleton />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <Skeleton className="size-8 shrink-0 rounded-4xl" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-[70%]" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </OverviewCardSkeleton>
    </div>
  );
}
