import { Suspense } from "react";

import { OverviewAiBrief } from "@/components/overview/overview-ai-brief";
import { OverviewAiBriefSkeleton } from "@/components/overview/overview-ai-brief-skeleton";
import { OverviewView } from "@/components/overview/overview-view";
import { requireUserId } from "@/lib/auth/session";
import { getOverviewPageData } from "@/lib/db/overview";

export async function OverviewPageContent() {
  const userId = await requireUserId();
  const { data, aiBriefInputs } = await getOverviewPageData(userId);

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
