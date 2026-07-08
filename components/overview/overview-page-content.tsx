import { Suspense } from "react";

import { OverviewAiBrief } from "@/components/overview/overview-ai-brief";
import { OverviewAiBriefSkeleton } from "@/components/overview/overview-ai-brief-skeleton";
import { OverviewView } from "@/components/overview/overview-view";
import { getSession, requireUserId } from "@/lib/auth/session";
import { getOverviewPageData } from "@/lib/db/overview";

export async function OverviewPageContent() {
  const [userId, session] = await Promise.all([
    requireUserId(),
    getSession(),
  ]);
  const { data, aiBriefInputs } = await getOverviewPageData(
    userId,
    session?.user?.name,
  );

  return (
    <OverviewView
      data={data}
      aiBrief={
        <Suspense fallback={<OverviewAiBriefSkeleton className="h-full" />}>
          <OverviewAiBrief {...aiBriefInputs} className="h-full" />
        </Suspense>
      }
    />
  );
}
