import { formatIdr } from "@/lib/finance/format-currency";
import {
  UI_LABEL_PLANS_INSIGHT_EMPTY,
  UI_LABEL_PLANS_INSIGHT_SAFE,
  UI_LABEL_PLANS_INSIGHT_TIGHT,
  UI_LABEL_PLANS_INSIGHT_UNSAFE,
} from "@/config/ui-labels";
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
  salaryCycleProjection: number | null = null,
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
  const incomeNote =
    upcomingIncomeTotal > 0
      ? ` Gaji terjadwal ${formatIdr(upcomingIncomeTotal)} belum diterima — dianggarkan untuk tagihan bulan depan, bukan untuk belanja sekarang.`
      : "";
  const salaryCycleNote =
    salaryCycleProjection !== null
      ? ` Proyeksi setelah gaji masuk dan sisihkan tagihan bulan depan: ${formatIdr(salaryCycleProjection)}.`
      : "";
  const spendLabel = formatIdr(estimatedCost);
  const balanceLabel = formatIdr(availableBalance);
  const payPlanLabel = formatIdr(upcomingPayPlanTotal);
  const budgetLabel = formatIdr(remainingBudgetTotal);
  const safeThreshold = resolveSafeThreshold(
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );

  if (
    upcomingPayPlanTotal > 0 &&
    estimatedCost <= 0 &&
    remainingBudgetTotal <= 0
  ) {
    if (spendableBalance >= upcomingPayPlanTotal) {
      return `Saldo ${balanceLabel} cukup untuk tagihan PayPlan bulan ini (${payPlanLabel}). Sisa ${formatIdr(spendableBalance)}.${incomeNote}${salaryCycleNote}`;
    }

    if (spendableBalance >= 0) {
      return `Tagihan PayPlan bulan ini ${payPlanLabel} dari saldo ${balanceLabel} — sisa tipis (${formatIdr(spendableBalance)}).${incomeNote}${salaryCycleNote}`;
    }

    return `Tagihan PayPlan bulan ini ${payPlanLabel} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(spendableBalance))}.${incomeNote}${salaryCycleNote}`;
  }

  if (
    remainingBudgetTotal > 0 &&
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0
  ) {
    if (spendableBalance >= safeThreshold) {
      return `Saldo ${balanceLabel} cukup setelah sisihkan sisa budget PayPlan ${budgetLabel} bulan ini. Sisa ${formatIdr(spendableBalance)}.${incomeNote}${salaryCycleNote}`;
    }

    if (spendableBalance >= 0) {
      return `Sisa budget PayPlan ${budgetLabel} bulan ini perlu dipakai — sisa saldo tipis (${formatIdr(spendableBalance)}). Hati-hati pengeluaran besar.${incomeNote}${salaryCycleNote}`;
    }

    return `Sisa budget PayPlan ${budgetLabel} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(spendableBalance))}.${incomeNote}${salaryCycleNote}`;
  }

  const payPlanNote =
    upcomingPayPlanTotal > 0
      ? ` Selain wish, ada tagihan PayPlan ${payPlanLabel} bulan ini —`
      : "";
  const budgetNote =
    remainingBudgetTotal > 0
      ? ` sisa budget PayPlan ${budgetLabel} masih perlu dipakai —`
      : "";

  if (spendableBalance >= safeThreshold) {
    return `Oke belanja ${spendLabel} dengan saldo ${balanceLabel}.${payPlanNote}${budgetNote} Sisa masih longgar (${formatIdr(spendableBalance)}).${incomeNote}${salaryCycleNote}`;
  }

  if (spendableBalance >= 0) {
    return `Cukup untuk ${spendLabel} dari saldo ${balanceLabel},${payPlanNote}${budgetNote} tapi sisa tipis (${formatIdr(spendableBalance)}). Hati-hati tambah wish, tagihan, atau pengeluaran besar.${incomeNote}${salaryCycleNote}`;
  }

  return `Belum aman. Estimasi ${spendLabel}${upcomingPayPlanTotal > 0 ? ` plus PayPlan ${payPlanLabel}` : ""}${remainingBudgetTotal > 0 ? ` plus sisa budget ${budgetLabel}` : ""} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(spendableBalance))}. Tunda atau kurangi wishlist.${incomeNote}${salaryCycleNote}`;
}

export function isPlansInsightTone(value: string): value is PlansInsightTone {
  return (
    value === "empty" ||
    value === "safe" ||
    value === "tight" ||
    value === "unsafe"
  );
}
