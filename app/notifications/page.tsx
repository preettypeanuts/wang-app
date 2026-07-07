import { NotificationsScrollShell } from "@/components/notifications/notifications-scroll-shell";
import { requireUserId } from "@/lib/auth/session";
import { listAppNotificationFeedPage } from "@/lib/db/app-notifications";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const userId = await requireUserId();
  const initialFeed = await listAppNotificationFeedPage(userId);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <NotificationsScrollShell initialFeed={initialFeed} />
    </div>
  );
}
