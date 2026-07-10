import { OverviewFiltersSkeleton } from "@/components/overview/overview-filters-skeleton";
import { OverviewPageSkeleton } from "@/components/overview/overview-page-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";

export default function OverviewLoading() {
  return (
    <OverviewScrollShell filtersSlot={<OverviewFiltersSkeleton />}>
      <OverviewPageSkeleton />
    </OverviewScrollShell>
  );
}
