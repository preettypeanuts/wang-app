import { formatIdr } from "@/lib/finance/format-currency";
import { selectStressedCategoryBudgets } from "@/lib/finance/select-plans-category-budgets-for-display";
import type { BudgetStatus } from "@/types/budget";
import type { PlansInsightTone } from "@/types/plan";

export function formatPlansCategoryBudgetLinesForPrompt(
  budgets: BudgetStatus[],
): string[] {
  const withLimit = budgets.filter((budget) => budget.totalLimit > 0);

  if (withLimit.length === 0) {
    return [];
  }

  return withLimit.map(
    (budget) =>
      `- ${budget.categoryLabel}: limit ${formatIdr(budget.totalLimit)}, sisa ${formatIdr(budget.remaining)} (${budget.usedPercent}% terpakai)`,
  );
}

export function buildFallbackCategoryBudgetHint(
  categoryBudgets: BudgetStatus[],
  tone: PlansInsightTone,
): string {
  const stressed = selectStressedCategoryBudgets(categoryBudgets);
  const target =
    stressed[0] ??
    categoryBudgets
      .filter((budget) => budget.totalLimit > 0 && budget.remaining > 0)
      .sort((left, right) => left.remaining - right.remaining)[0];

  if (!target) {
    return "";
  }

  const shouldAdvise =
    tone === "unsafe" ||
    tone === "tight" ||
    target.usedPercent >= 80;

  if (!shouldAdvise) {
    return "";
  }

  if (target.usedPercent >= 80) {
    return ` Budget ${target.categoryLabel} sudah ${target.usedPercent}% terpakai — kurangi pengeluaran di kategori itu dulu.`;
  }

  return ` Prioritaskan tagihan dulu, budget ${target.categoryLabel} masih sisa ${formatIdr(target.remaining)}.`;
}
