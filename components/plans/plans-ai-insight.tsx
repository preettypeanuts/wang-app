import { generatePlansInsight } from "@/lib/ai/generate-plans-insight";
import { PlansAiSummary } from "@/components/plans/plans-ai-summary";
import { buildPlansOverview } from "@/lib/finance/build-plans-overview";
import type { PlansInsightInputs } from "@/types/plan";

export async function PlansAiInsight({
  userId,
  plans,
  availableBalance,
  upcomingPayPlanTotal,
  upcomingPayPlanCount,
  upcomingIncomeTotal,
  upcomingIncomeCount,
  remainingBudgetTotal,
  budgetImpacts,
}: PlansInsightInputs) {
  const insight = await generatePlansInsight(
    userId,
    plans,
    availableBalance,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
    budgetImpacts,
    upcomingIncomeTotal,
  );
  const overview = buildPlansOverview(
    plans,
    availableBalance,
    insight,
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    budgetImpacts,
    remainingBudgetTotal,
    upcomingIncomeTotal,
    upcomingIncomeCount,
  );

  return <PlansAiSummary overview={overview} />;
}
