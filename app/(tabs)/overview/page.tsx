import { Suspense } from "react";

import { OverviewFiltersSkeleton } from "@/components/overview/overview-filters-skeleton";
import { OverviewPageData } from "@/components/overview/overview-page-data";
import { OverviewPageSkeleton } from "@/components/overview/overview-page-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";

interface OverviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function OverviewPage({ searchParams }: OverviewPageProps) {
  return (
    <Suspense
      fallback={
        <OverviewScrollShell filtersSlot={<OverviewFiltersSkeleton />}>
          <OverviewPageSkeleton />
        </OverviewScrollShell>
      }
    >
      <OverviewPageData searchParams={searchParams} />
    </Suspense>
  );
}
