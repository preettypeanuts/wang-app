import { Skeleton } from "@/components/ui/skeleton";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
} from "@/config/overview";
import { cn } from "@/lib/utils";

/** Matches overview-ai-brief-card body: text-[13px] leading-[1.6] × 2 lines. */
const OVERVIEW_AI_BRIEF_TEXT_LINE = "h-[1.3rem]";

interface OverviewAiBriefSkeletonProps {
  className?: string;
}

export function OverviewAiBriefSkeleton({
  className,
}: OverviewAiBriefSkeletonProps) {
  return (
    <section
      aria-busy="true"
      aria-label="Memuat AI Brief"
      className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-4xl" />
          <p className={OVERVIEW_SECTION_LABEL}>AI Brief</p>
        </div>
        <Skeleton className="h-6 w-18 shrink-0 rounded-full" />
      </div>

      <div
        aria-hidden
        className="mt-3 min-h-[2.6rem] text-[13px] leading-[1.6]"
      >
        <Skeleton
          className={cn(OVERVIEW_AI_BRIEF_TEXT_LINE, "w-full rounded-sm")}
        />
        <Skeleton
          className={cn(OVERVIEW_AI_BRIEF_TEXT_LINE, "w-[78%] rounded-sm")}
        />
      </div>
    </section>
  );
}
