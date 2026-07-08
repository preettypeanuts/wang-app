import { InboxPageSkeleton } from "@/components/inbox/inbox-page-skeleton";
import { InboxPageShell } from "@/components/inbox/inbox-page-shell";

export default function InboxLoading() {
  return (
    <InboxPageShell>
      <InboxPageSkeleton />
    </InboxPageShell>
  );
}
