import { Skeleton } from "@/components/ui/skeleton";
import { OVERVIEW_DESKTOP_FILTER_TRIGGER } from "@/config/overview-mobile";

export function OverviewFiltersSkeleton() {
  return (
    <div aria-hidden className={OVERVIEW_DESKTOP_FILTER_TRIGGER}>
      <Skeleton className="h-9 w-24 rounded-xl" />
    </div>
  );
}
