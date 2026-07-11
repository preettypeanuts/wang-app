import { buildFallbackCategoryBudgetHint } from "@/lib/finance/build-plans-category-budget-hints";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  UI_LABEL_PLANS_INSIGHT_EMPTY,
  UI_LABEL_PLANS_INSIGHT_SAFE,
  UI_LABEL_PLANS_INSIGHT_TIGHT,
  UI_LABEL_PLANS_INSIGHT_UNSAFE,
} from "@/config/ui-labels";
import type { BudgetStatus } from "@/types/budget";
import type {
  PlanBudgetImpact,
  PlanRecord,
  PlansInsightMeta,
  PlansInsightTone,
  PlansOverview,
} from "@/types/plan";

export function computePlansProjectedBalance(
  availableBalance: number,
  estimatedCost: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
  upcomingIncomeTotal = 0,
): number {
  return (
    availableBalance +
    upcomingIncomeTotal -
    estimatedCost -
    upcomingPayPlanTotal -
    remainingBudgetTotal
  );
}

/** Cash-only projection — unreceived income is excluded. */
export function computePlansSpendableBalance(
  availableBalance: number,
  estimatedCost: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
): number {
  return computePlansProjectedBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
    0,
  );
}

/**
 * Forward projection when salary is still expected this month.
 * Salary is earmarked for next month's PayPlan bills and remaining budget,
 * while this month's obligations must be covered by current cash.
 */
export function computePlansSalaryCycleProjection(
  availableBalance: number,
  estimatedCost: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
  upcomingIncomeTotal: number,
  nextMonthPayPlanTotal = 0,
  remainingBudgetNextMonth = 0,
): number {
  if (upcomingIncomeTotal <= 0) {
    return computePlansSpendableBalance(
      availableBalance,
      estimatedCost,
      upcomingPayPlanTotal,
      remainingBudgetTotal,
    );
  }

  return (
    availableBalance +
    upcomingIncomeTotal -
    estimatedCost -
    upcomingPayPlanTotal -
    remainingBudgetTotal -
    nextMonthPayPlanTotal -
    remainingBudgetNextMonth
  );
}

function resolveSafeThreshold(
  estimatedCost: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
): number {
  if (estimatedCost > 0) {
    return estimatedCost * 2;
  }

  if (upcomingPayPlanTotal > 0) {
    return upcomingPayPlanTotal;
  }

  if (remainingBudgetTotal > 0) {
    return Math.round(remainingBudgetTotal * 0.5);
  }

  return 0;
}

export function resolvePlansInsightMeta(
  estimatedCost: number,
  availableBalance: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
  _upcomingIncomeTotal = 0,
): PlansInsightMeta {
  if (
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0 &&
    remainingBudgetTotal <= 0
  ) {
    return { tone: "empty", label: UI_LABEL_PLANS_INSIGHT_EMPTY };
  }

  const spendableBalance = computePlansSpendableBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );
  const safeThreshold = resolveSafeThreshold(
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );

  if (spendableBalance >= safeThreshold) {
    return { tone: "safe", label: UI_LABEL_PLANS_INSIGHT_SAFE };
  }

  if (spendableBalance >= 0) {
    return { tone: "tight", label: UI_LABEL_PLANS_INSIGHT_TIGHT };
  }

  return { tone: "unsafe", label: UI_LABEL_PLANS_INSIGHT_UNSAFE };
}

export interface BuildPlansOverviewOptions {
  nextMonthPayPlanTotal?: number;
  remainingBudgetNextMonth?: number;
  categoryBudgets?: BudgetStatus[];
}

export function buildPlansOverview(
  plans: PlanRecord[],
  availableBalance: number,
  insight: string,
  upcomingPayPlanTotal: number,
  upcomingPayPlanCount: number,
  budgetImpacts: PlanBudgetImpact[] = [],
  remainingBudgetTotal = 0,
  upcomingIncomeTotal = 0,
  upcomingIncomeCount = 0,
  options: BuildPlansOverviewOptions = {},
): PlansOverview {
  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const projectedBalance = computePlansSpendableBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );
  const salaryCycleProjection =
    upcomingIncomeTotal > 0
      ? computePlansSalaryCycleProjection(
          availableBalance,
          estimatedCost,
          upcomingPayPlanTotal,
          remainingBudgetTotal,
          upcomingIncomeTotal,
          options.nextMonthPayPlanTotal ?? 0,
          options.remainingBudgetNextMonth ?? 0,
        )
      : null;

  return {
    activeCount: activePlans.length,
    estimatedCost,
    availableBalance,
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    upcomingIncomeTotal,
    upcomingIncomeCount,
    remainingBudgetTotal,
    categoryBudgets: options.categoryBudgets ?? [],
    nextMonthPayPlanTotal: options.nextMonthPayPlanTotal ?? 0,
    remainingBudgetNextMonth: options.remainingBudgetNextMonth ?? 0,
    projectedBalance,
    salaryCycleProjection,
    budgetImpacts,
    insight,
    insightMeta: resolvePlansInsightMeta(
      estimatedCost,
      availableBalance,
      upcomingPayPlanTotal,
      remainingBudgetTotal,
      upcomingIncomeTotal,
    ),
  };
}

export function buildFallbackPlansInsight(
  estimatedCost: number,
  availableBalance: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
  upcomingIncomeTotal = 0,
  _salaryCycleProjection: number | null = null,
  categoryBudgets: BudgetStatus[] = [],
): string {
  if (
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0 &&
    remainingBudgetTotal <= 0
  ) {
    return "Belum ada wish aktif. Tambahkan wishlist untuk melihat estimasi belanja.";
  }

  const spendableBalance = computePlansSpendableBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );
  const safeThreshold = resolveSafeThreshold(
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );
  const insightMeta = resolvePlansInsightMeta(
    estimatedCost,
    availableBalance,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
    upcomingIncomeTotal,
  );
  const incomeHint =
    upcomingIncomeTotal > 0 ? " Gaji terjadwal belum bisa dipakai sekarang." : "";
  const budgetHint = buildFallbackCategoryBudgetHint(
    categoryBudgets,
    insightMeta.tone,
  );

  if (spendableBalance >= safeThreshold) {
    return `Aman — masih ada ruang ${formatIdr(spendableBalance)}.${incomeHint}${budgetHint}`;
  }

  if (spendableBalance >= 0) {
    const action =
      estimatedCost > 0
        ? "Hati-hati tambah wish lagi."
        : "Hati-hati pengeluaran besar.";
    return `Cukup tipis, sisa ${formatIdr(spendableBalance)} — ${action}${incomeHint}${budgetHint}`;
  }

  const shortfall = Math.abs(spendableBalance);
  const action =
    estimatedCost > 0
      ? "Tunda atau kurangi wishlist."
      : "Periksa tagihan dan budget kategori bulan ini.";

  return `Belum aman, kurang ${formatIdr(shortfall)} — ${action}${incomeHint}${budgetHint}`;
}

export function isPlansInsightTone(value: string): value is PlansInsightTone {
  return (
    value === "empty" ||
    value === "safe" ||
    value === "tight" ||
    value === "unsafe"
  );
}
