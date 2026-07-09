import { normalizeCategory } from "@/config/categories";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { generatePlansInsightWithGemini } from "@/lib/ai/generate-plans-insight-gemini";
import {
  getCachedAiInsight,
  setCachedAiInsight,
  todayDateKey,
} from "@/lib/db/ai-insight-cache";
import { buildFallbackPlansInsight } from "@/lib/finance/build-plans-overview";
import type { PlanBudgetImpact, PlanRecord } from "@/types/plan";

function groupWishNamesByCategory(
  plans: PlanRecord[],
): Map<string, string[]> {
  const namesByCategory = new Map<string, string[]>();

  for (const plan of plans) {
    if (plan.status !== "active") {
      continue;
    }

    const category = normalizeCategory(plan.category);
    const names = namesByCategory.get(category) ?? [];
    names.push(plan.name);
    namesByCategory.set(category, names);
  }

  return namesByCategory;
}

export async function generatePlansInsight(
  userId: string,
  plans: PlanRecord[],
  availableBalance: number,
  upcomingPayPlanTotal: number,
  budgetImpacts: PlanBudgetImpact[],
): Promise<string> {
  const dateKey = todayDateKey();
  const cached = await getCachedAiInsight<string>(
    userId,
    "plans_insight",
    dateKey,
  );

  if (cached) {
    return cached;
  }

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const riskyBudgetImpacts = budgetImpacts.filter(
    (impact) => impact.status !== "aman",
  );
  const wishNamesByCategory = groupWishNamesByCategory(activePlans);

  if (isGeminiConfigured()) {
    try {
      const insight = await generatePlansInsightWithGemini({
        activeCount: activePlans.length,
        estimatedCost,
        availableBalance,
        upcomingPayPlanTotal,
        planNames: activePlans.map((plan) => plan.name),
        riskyBudgetImpacts,
        wishNamesByCategory,
      });
      await setCachedAiInsight(userId, "plans_insight", dateKey, insight);
      return insight;
    } catch {
      return buildFallbackPlansInsight(
        estimatedCost,
        availableBalance,
        upcomingPayPlanTotal,
      );
    }
  }

  return buildFallbackPlansInsight(
    estimatedCost,
    availableBalance,
    upcomingPayPlanTotal,
  );
}
