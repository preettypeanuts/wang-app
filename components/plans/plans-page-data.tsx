import { Suspense } from "react";

import { PlansAiInsight } from "@/components/plans/plans-ai-insight";
import { PlansAiInsightSkeleton } from "@/components/plans/plans-ai-insight-skeleton";
import { PlansPageContent } from "@/components/plans/plans-page-content";
import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import { requireUserId } from "@/lib/auth/session";
import { getAvailableBalance } from "@/lib/db/balance";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";

interface PlansPageDataProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parsePlansPageTab(
  params: Record<string, string | string[] | undefined>,
): PlansPageTab {
  const tab = params.tab;
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value === "savings" ? "savings" : "wish";
}

export async function PlansPageData({ searchParams }: PlansPageDataProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const initialTab = parsePlansPageTab(params);

  const [plans, savingsGoals, availableBalance, upcomingImpact] =
    await Promise.all([
      listPlans(userId),
      listSavingsGoals(userId),
      getAvailableBalance(userId),
      getPlansUpcomingImpact(userId),
    ]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(estimatedCost, availableBalance),
  );
  const savingsOverview = buildSavingsOverview(savingsGoals, availableBalance);

  return (
    <PlansPageContent
      initialTab={initialTab}
      plans={plans}
      plansOverview={plansOverview}
      upcomingImpact={upcomingImpact}
      savingsGoals={savingsGoals}
      savingsOverview={savingsOverview}
      aiInsight={
        <Suspense
          fallback={
            <PlansAiInsightSkeleton showMetrics={estimatedCost > 0} />
          }
        >
          <PlansAiInsight
            userId={userId}
            plans={plans}
            availableBalance={availableBalance}
          />
        </Suspense>
      }
    />
  );
}
