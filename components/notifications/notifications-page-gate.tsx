import { NotificationsScrollShell } from "@/components/notifications/notifications-scroll-shell";
import { requireUserId } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export async function NotificationsPageGate() {
  await requireUserId();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <NotificationsScrollShell />
    </div>
  );
}
