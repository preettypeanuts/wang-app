import { NotificationsPageSkeleton } from "@/components/notifications/notifications-page-skeleton";
import { NotificationsPageShell } from "@/components/notifications/notifications-page-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import {
  NOTIFICATIONS_PAGE_ROOT,
  NOTIFICATIONS_PAGE_SCROLL,
} from "@/config/notifications-page";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

export default function NotificationsLoading() {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <div className={NOTIFICATIONS_PAGE_ROOT}>
        <NotificationsPageShell className="min-h-0 flex-1">
          <MobileScrollSurface
            className={cn("py-3", NOTIFICATIONS_PAGE_SCROLL, STACK_GAP)}
            title="Notifikasi"
          >
            <NotificationsPageSkeleton />
          </MobileScrollSurface>
        </NotificationsPageShell>
      </div>
    </div>
  );
}
