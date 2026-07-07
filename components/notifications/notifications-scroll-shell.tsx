import { NotificationsFeed } from "@/components/notifications/notifications-feed";
import { NotificationsPageShell } from "@/components/notifications/notifications-page-shell";
import { OVERVIEW_CARD_PADDING } from "@/config/overview";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import {
  NOTIFICATIONS_PAGE_ROOT,
  NOTIFICATIONS_PAGE_SCROLL,
} from "@/config/notifications-page";
import { SHELL_PADDING, STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";
import { GLASS_SURFACE } from "@/config/glass";

export function NotificationsScrollShell() {
  return (
    <div className={NOTIFICATIONS_PAGE_ROOT}>
      <NotificationsPageShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn("py-3", NOTIFICATIONS_PAGE_SCROLL, STACK_GAP)}
          title="Notifikasi"
        >
          <header className={cn("shrink-0 max-md:hidden md:pt-3 rounded-3xl px-3 mb-3 pb-1", GLASS_SURFACE)}>
            <h1 className="text-lg font-semibold tracking-tight">Notifikasi</h1>
            <p className="mt-1 text-xs pb-3">
              Riwayat alert, ringkasan, dan pengingat keuangan.
            </p>
          </header>

          <p className="shrink-0 text-[11px] max-md:-mt-1 md:hidden pb-3">
            Riwayat alert, ringkasan, dan pengingat keuangan.
          </p>

          <NotificationsFeed />
        </MobileScrollSurface>
      </NotificationsPageShell>
    </div>
  );
}
