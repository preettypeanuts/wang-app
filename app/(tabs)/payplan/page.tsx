import { Suspense } from "react";

import { PayplanPageData } from "@/components/planner/payplan-page-data";
import { PayplanPageSkeleton } from "@/components/planner/payplan-page-skeleton";
import { PlannerShell } from "@/components/planner/planner-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { PAYPLAN_MOBILE_PAGE_INSET_X } from "@/config/payplan-mobile";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface PayPlanPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function PayplanPageFallback() {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <PlannerShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col md:p-3",
            STACK_GAP,
            "overflow-y-auto overscroll-y-contain",
            "md:pb-20",
            PAYPLAN_MOBILE_PAGE_INSET_X,
          )}
          title="PayPlan"
        >
          <PayplanPageSkeleton />
        </MobileScrollSurface>
      </PlannerShell>
    </div>
  );
}

export default function PayPlanPage({ searchParams }: PayPlanPageProps) {
  return (
    <Suspense fallback={<PayplanPageFallback />}>
      <PayplanPageData searchParams={searchParams} />
    </Suspense>
  );
}
