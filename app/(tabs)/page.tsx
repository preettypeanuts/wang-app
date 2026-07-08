import { Suspense } from "react";

import { InboxPageData } from "@/components/inbox/inbox-page-data";
import { InboxPageSkeleton } from "@/components/inbox/inbox-page-skeleton";
import { InboxPageShell } from "@/components/inbox/inbox-page-shell";

function InboxPageFallback() {
  return (
    <InboxPageShell>
      <InboxPageSkeleton />
    </InboxPageShell>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxPageFallback />}>
      <InboxPageData />
    </Suspense>
  );
}
