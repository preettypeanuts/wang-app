import type { BudgetStatus } from "@/types/budget";

/** Sum positive remaining budget across all categories for the month. */
export function sumRemainingBudgetTotal(budgets: BudgetStatus[]): number {
  return budgets.reduce(
    (sum, budget) => sum + Math.max(0, budget.remaining),
    0,
  );
}
