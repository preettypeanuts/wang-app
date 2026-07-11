import { Suspense } from "react";

import { PlansAiInsight } from "@/components/plans/plans-ai-insight";
import { PlansAiInsightSkeleton } from "@/components/plans/plans-ai-insight-skeleton";
import { PlansPageContent } from "@/components/plans/plans-page-content";
import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import { requireUserId } from "@/lib/auth/session";
import { getAvailableBalance } from "@/lib/db/balance";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildPlansBudgetImpact } from "@/lib/finance/build-plans-budget-impact";
import { sumRemainingBudgetTotal } from "@/lib/finance/sum-remaining-budget-total";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { getCurrentMonthKey } from "@/lib/planner/calendar";
import { sumUpcomingPayPlanThisMonth } from "@/lib/planner/sum-upcoming-payplan-this-month";
import { sumUpcomingIncomeThisMonth } from "@/lib/planner/sum-upcoming-income-this-month";

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

  const monthKey = getCurrentMonthKey();

  const [plans, savingsGoals, availableBalance, upcomingImpact, budgets, plannedItems] =
    await Promise.all([
      listPlans(userId),
      listSavingsGoals(userId),
      getAvailableBalance(userId),
      getPlansUpcomingImpact(userId),
      listBudgetsForMonth(userId, monthKey),
      getPlannedItemsForExpansion(userId),
    ]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const remainingBudgetTotal = sumRemainingBudgetTotal(budgets);
  const { upcomingPayPlanTotal, upcomingPayPlanCount } =
    sumUpcomingPayPlanThisMonth(upcomingImpact);
  const { upcomingIncomeTotal, upcomingIncomeCount } =
    sumUpcomingIncomeThisMonth(plannedItems);
  const budgetImpacts = await buildPlansBudgetImpact(
    userId,
    activePlans,
    monthKey,
  );
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(
      estimatedCost,
      availableBalance,
      upcomingPayPlanTotal,
      remainingBudgetTotal,
      upcomingIncomeTotal,
    ),
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    budgetImpacts,
    remainingBudgetTotal,
    upcomingIncomeTotal,
    upcomingIncomeCount,
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
            <PlansAiInsightSkeleton
              showMetrics={
                estimatedCost > 0 ||
                upcomingPayPlanTotal > 0 ||
                remainingBudgetTotal > 0
              }
            />
          }
        >
          <PlansAiInsight
            userId={userId}
            plans={plans}
            availableBalance={availableBalance}
            upcomingPayPlanTotal={upcomingPayPlanTotal}
            upcomingPayPlanCount={upcomingPayPlanCount}
            upcomingIncomeTotal={upcomingIncomeTotal}
            upcomingIncomeCount={upcomingIncomeCount}
            remainingBudgetTotal={remainingBudgetTotal}
            budgetImpacts={budgetImpacts}
          />
        </Suspense>
      }
    />
  );
}
