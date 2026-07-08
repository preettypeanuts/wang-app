import { Suspense } from "react";

import { OverviewPageContent } from "@/components/overview/overview-page-content";
import { OverviewPageSkeleton } from "@/components/overview/overview-page-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";

export default function OverviewPage() {
  return (
    <OverviewScrollShell>
      <Suspense fallback={<OverviewPageSkeleton />}>
        <OverviewPageContent />
      </Suspense>
    </OverviewScrollShell>
  );
}
