import { InboxClientShell } from "@/components/inbox/inbox-client-shell";
import { InboxPageShell } from "@/components/inbox/inbox-page-shell";

export default function InboxPage() {
  return (
    <InboxPageShell>
      <InboxClientShell />
    </InboxPageShell>
  );
}
