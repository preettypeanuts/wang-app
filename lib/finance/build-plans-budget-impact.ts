import { getCategoryLabel, normalizeCategory } from "@/config/categories";
import { getBudgetForCategory } from "@/lib/db/budgets";
import type { PlanBudgetImpact, PlanBudgetImpactStatus, PlanRecord } from "@/types/plan";

const STATUS_ORDER: Record<PlanBudgetImpactStatus, number> = {
  over: 0,
  waspada: 1,
  aman: 2,
};

export function resolvePlanBudgetImpactStatus(
  budgetLimit: number,
  projectedSpent: number,
): PlanBudgetImpactStatus {
  if (budgetLimit <= 0) {
    return "aman";
  }

  const remaining = budgetLimit - projectedSpent;
  const remainingPercent = Math.max(
    0,
    100 - Math.round((projectedSpent / budgetLimit) * 100),
  );

  if (remaining < 0) {
    return "over";
  }

  if (remainingPercent <= 20) {
    return "waspada";
  }

  return "aman";
}

export async function buildPlansBudgetImpact(
  userId: string,
  activePlans: PlanRecord[],
  monthKey: string,
): Promise<PlanBudgetImpact[]> {
  const wishTotalByCategory = new Map<string, number>();

  for (const plan of activePlans) {
    const category = normalizeCategory(plan.category);
    wishTotalByCategory.set(
      category,
      (wishTotalByCategory.get(category) ?? 0) + plan.amount,
    );
  }

  const impacts: PlanBudgetImpact[] = [];

  for (const [category, wishTotal] of wishTotalByCategory) {
    if (wishTotal <= 0) {
      continue;
    }

    const result = await getBudgetForCategory(
      userId,
      category,
      monthKey,
      wishTotal,
    );

    if (!result) {
      continue;
    }

    const { status } = result;
    const projectedSpent = status.spent;
    const currentSpent = projectedSpent - wishTotal;

    impacts.push({
      category,
      categoryLabel: getCategoryLabel(category),
      budgetLimit: status.totalLimit,
      currentSpent,
      projectedSpent,
      status: resolvePlanBudgetImpactStatus(status.totalLimit, projectedSpent),
    });
  }

  return impacts.sort(
    (left, right) => STATUS_ORDER[left.status] - STATUS_ORDER[right.status],
  );
}
