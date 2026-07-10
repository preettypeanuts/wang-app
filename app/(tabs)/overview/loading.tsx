import { OverviewPageSkeleton } from "@/components/overview/overview-page-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";

export default function OverviewLoading() {
  return (
    <OverviewScrollShell>
      <OverviewPageSkeleton />
    </OverviewScrollShell>
  );
}
