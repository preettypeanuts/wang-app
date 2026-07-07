import { NotificationsScrollShell } from "@/components/notifications/notifications-scroll-shell";
import { requireUserId } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Auth gate only — feed loads client-side from cache/prefetch to avoid duplicate DB hits. */
export default async function NotificationsPage() {
  await requireUserId();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <NotificationsScrollShell />
    </div>
  );
}
