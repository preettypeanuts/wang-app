import { PlansAiInsightSkeleton } from "@/components/plans/plans-ai-insight-skeleton";
import { PLANS_LOADING_WISHLIST } from "@/config/plans-labels";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLANS_CARD,
  PLANS_CARD_LIST,
  PLANS_WIDGET_GRID,
  PLANS_WIDGET_TILE_LAYOUT,
} from "@/config/plans";
import { SEPARATED_SURFACE } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

function PlanCardSkeleton() {
  return (
    <div aria-hidden className={cn(PLANS_CARD, "flex min-h-38 flex-col p-4")}>
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-auto space-y-2 pt-4">
        <Skeleton className="h-px w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

export function PlansPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label={PLANS_LOADING_WISHLIST}
      className={cn("flex flex-col", STACK_GAP)}
    >
      <div className="hidden items-start justify-between gap-3 md:flex">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-40 shrink-0 rounded-full" />
      </div>

      <div className="flex items-center justify-between gap-3 md:hidden">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-9 w-36 shrink-0 rounded-full" />
      </div>

      <div className={PLANS_WIDGET_GRID}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(SEPARATED_SURFACE, PLANS_WIDGET_TILE_LAYOUT)}
          >
            <Skeleton className="size-8 rounded-4xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>

      <PlansAiInsightSkeleton />

      <div className={PLANS_CARD_LIST}>
        {Array.from({ length: 4 }).map((_, index) => (
          <PlanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
