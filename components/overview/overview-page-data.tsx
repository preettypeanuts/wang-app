import { Suspense } from "react";

import {
  OverviewDesktopFilterTrigger,
} from "@/components/overview/overview-filters-bridge";
import { OverviewAiBrief } from "@/components/overview/overview-ai-brief";
import { OverviewAiBriefSkeleton } from "@/components/overview/overview-ai-brief-skeleton";
import { OverviewScrollShell } from "@/components/overview/overview-scroll-shell";
import { OverviewView } from "@/components/overview/overview-view";
import { getSession, requireUserId } from "@/lib/auth/session";
import { getOverviewPageData } from "@/lib/db/overview";
import { parseOverviewFilters } from "@/lib/overview/parse-overview-filters";

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
    <OverviewScrollShell>
      <OverviewView
        data={data}
        greetingAction={<OverviewDesktopFilterTrigger />}
        aiBrief={
          <Suspense fallback={<OverviewAiBriefSkeleton className="h-full" />}>
            <OverviewAiBrief {...aiBriefInputs} className="h-full" />
          </Suspense>
        }
      />
    </OverviewScrollShell>
  );
}
