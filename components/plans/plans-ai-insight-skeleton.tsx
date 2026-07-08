import { Skeleton } from "@/components/ui/skeleton";
import { PLANS_AI_SUMMARY_SHELL } from "@/config/plans";
import { cn } from "@/lib/utils";

/** Matches plans-ai-summary body: text-[13px] leading-[1.6] × 2 lines. */
const PLANS_AI_SUMMARY_TEXT_LINE = "h-[1.3rem]";

interface PlansAiInsightSkeletonProps {
  /** Reserve metrics row when active wishes have estimated spend. */
  showMetrics?: boolean;
}

export function PlansAiInsightSkeleton({
  showMetrics = true,
}: PlansAiInsightSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat AI summary"
      className={PLANS_AI_SUMMARY_SHELL}
    >
      <div className="relative flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              AI summary
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            <div aria-hidden className="size-8 shrink-0" />
          </div>
        </div>

        <div
          aria-hidden
          className="mt-3 min-h-[2.6rem] text-[13px] leading-[1.6] tracking-[-0.01em]"
        >
          <Skeleton
            className={cn(PLANS_AI_SUMMARY_TEXT_LINE, "w-full rounded-sm")}
          />
          <Skeleton
            className={cn(PLANS_AI_SUMMARY_TEXT_LINE, "w-[82%] rounded-sm")}
          />
        </div>

        {showMetrics ? (
          <Skeleton className="mt-2.5 h-4 w-full max-w-md rounded-sm" />
        ) : null}
      </div>
    </div>
  );
}
