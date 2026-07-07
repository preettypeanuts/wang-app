import { NOTIFICATIONS_ROUTE } from "@/config/navigation";
import { prefetchInboxBootstrap } from "@/lib/inbox/fetch-inbox-bootstrap";
import { prefetchNotificationsFeed } from "@/lib/notifications/fetch-notifications-feed";

export function warmRouteDataOnHover(href: string): void {
  if (href === "/") {
    prefetchInboxBootstrap();
    return;
  }

  if (href === NOTIFICATIONS_ROUTE) {
    prefetchNotificationsFeed();
  }
}
