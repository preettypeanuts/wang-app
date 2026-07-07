import { InboxClientShell } from "@/components/inbox/inbox-client-shell";
import { InboxPageShell } from "@/components/inbox/inbox-page-shell";
import { requireUserId } from "@/lib/auth/session";
import { getInboxMessages } from "@/lib/db/inbox-messages";
import { getTodaySummary } from "@/lib/db/transactions";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const userId = await requireUserId();
  const [messages, summary] = await Promise.all([
    getInboxMessages(userId),
    getTodaySummary(userId),
  ]);

  return (
    <InboxPageShell>
      <InboxClientShell initialBootstrap={{ messages, summary }} />
    </InboxPageShell>
  );
}
