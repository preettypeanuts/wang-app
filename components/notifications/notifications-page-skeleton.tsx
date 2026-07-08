import { Skeleton } from "@/components/ui/skeleton";
import {
  NOTIFICATIONS_LIST_ITEM,
  NOTIFICATIONS_LIST_ITEM_INNER,
  NOTIFICATIONS_PAGE_SCROLL_INNER,
  NOTIFICATIONS_SUMMARY_BAR,
} from "@/config/notifications-page";
import { GLASS_SURFACE } from "@/config/glass";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

function NotificationItemSkeleton() {
  return (
    <div aria-hidden className={NOTIFICATIONS_LIST_ITEM}>
      <div className={NOTIFICATIONS_LIST_ITEM_INNER}>
        <Skeleton className="size-10 shrink-0 rounded-[0.85rem]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-[68%]" />
            <Skeleton className="h-2.5 w-10 shrink-0" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[85%]" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat notifikasi"
      className={NOTIFICATIONS_PAGE_SCROLL_INNER}
    >
      <header
        className={cn(
          "mb-3 hidden shrink-0 rounded-3xl px-3 pb-1 max-md:hidden md:block md:pt-3",
          GLASS_SURFACE,
        )}
      >
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-3 w-64 pb-3" />
      </header>

      <Skeleton className="h-3 w-56 max-md:-mt-1 md:hidden" />

      <div className={NOTIFICATIONS_SUMMARY_BAR}>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <div className={cn("flex flex-col", STACK_GAP)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
