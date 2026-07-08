import { Suspense } from "react";

import { PlansPageData } from "@/components/plans/plans-page-data";
import { PlansPageSkeleton } from "@/components/plans/plans-page-skeleton";
import { PlansShell } from "@/components/plans/plans-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { WISH_PAGE_TITLE } from "@/config/navigation";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface PlansPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function PlansPageFallback() {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <PlansShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col md:p-3",
            STACK_GAP,
            "overflow-y-auto overscroll-y-contain",
            "md:pb-20",
          )}
          title={WISH_PAGE_TITLE}
        >
          <PlansPageSkeleton />
        </MobileScrollSurface>
      </PlansShell>
    </div>
  );
}

export default function PlansPage({ searchParams }: PlansPageProps) {
  return (
    <Suspense fallback={<PlansPageFallback />}>
      <PlansPageData searchParams={searchParams} />
    </Suspense>
  );
}
