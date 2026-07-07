import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TabsRouteLoadingProps {
  className?: string;
}

/** Marker for PersistentTabLayout — do not cache this as a tab panel. */
export function TabsRouteLoading({ className }: TabsRouteLoadingProps) {
  return (
    <div
      data-slot="tabs-route-loading"
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col gap-4 p-6",
        "max-md:px-[calc(0.75rem+var(--mobile-safe-left))] max-md:pt-[var(--mobile-top-bar-offset)]",
        className,
      )}
    >
      <Skeleton className="h-8 w-48 max-md:hidden" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full flex-1 rounded-2xl" />
    </div>
  );
}

TabsRouteLoading.displayName = "TabsRouteLoading";
