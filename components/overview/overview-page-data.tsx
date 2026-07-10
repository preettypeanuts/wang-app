import { Suspense } from "react";

import {
  OverviewDesktopFilterTrigger,
  parseOverviewFilters,
} from "@/components/overview/overview-filters-bridge";
import { OverviewAiBrief } from "@/components/overview/overview-ai-brief";
import { OverviewAiBriefSkeleton } from "@/components/overview/overview-ai-brief-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";
import { OverviewView } from "@/components/overview/overview-view";
import { getSession, requireUserId } from "@/lib/auth/session";
import { getOverviewPageData } from "@/lib/db/overview";

interface OverviewPageDataProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function OverviewPageData({
  searchParams,
}: OverviewPageDataProps) {
  const [userId, session, params] = await Promise.all([
    requireUserId(),
    getSession(),
    searchParams,
  ]);
  const filters = parseOverviewFilters(params);
  const { data, aiBriefInputs } = await getOverviewPageData(
    userId,
    session?.user?.name,
    filters,
  );

  return (
    <OverviewScrollShell filtersSlot={<OverviewDesktopFilterTrigger />}>
      <OverviewView
        data={data}
        aiBrief={
          <Suspense fallback={<OverviewAiBriefSkeleton className="h-full" />}>
            <OverviewAiBrief {...aiBriefInputs} className="h-full" />
          </Suspense>
        }
      />
    </OverviewScrollShell>
  );
}
