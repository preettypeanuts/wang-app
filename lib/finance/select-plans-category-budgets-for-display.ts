import type { BudgetStatus } from "@/types/budget";

export interface PlansCategoryBudgetsDisplay {
  visible: BudgetStatus[];
  hiddenCount: number;
}

/** Budget categories with remaining headroom, smallest remaining first. */
export function selectPlansCategoryBudgetsForDisplay(
  budgets: BudgetStatus[],
  maxVisible = 3,
): PlansCategoryBudgetsDisplay {
  const withRemaining = budgets
    .filter((budget) => budget.totalLimit > 0 && budget.remaining > 0)
    .sort((left, right) => left.remaining - right.remaining);

  return {
    visible: withRemaining.slice(0, maxVisible),
    hiddenCount: Math.max(0, withRemaining.length - maxVisible),
  };
}

/** Categories under spending pressure — highest usedPercent first. */
export function selectStressedCategoryBudgets(
  budgets: BudgetStatus[],
  usedPercentThreshold = 80,
): BudgetStatus[] {
  return budgets
    .filter(
      (budget) =>
        budget.totalLimit > 0 && budget.usedPercent >= usedPercentThreshold,
    )
    .sort((left, right) => right.usedPercent - left.usedPercent);
}
