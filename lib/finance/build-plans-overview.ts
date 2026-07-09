import { formatIdr } from "@/lib/finance/format-currency";
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
): number {
  return (
    availableBalance -
    estimatedCost -
    upcomingPayPlanTotal -
    remainingBudgetTotal
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
): PlansInsightMeta {
  if (
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0 &&
    remainingBudgetTotal <= 0
  ) {
    return { tone: "empty", label: "Kosong" };
  }

  const projectedBalance = computePlansProjectedBalance(
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

  if (projectedBalance >= safeThreshold) {
    return { tone: "safe", label: "Aman" };
  }

  if (projectedBalance >= 0) {
    return { tone: "tight", label: "Waspada" };
  }

  return { tone: "unsafe", label: "Risiko" };
}

export function buildPlansOverview(
  plans: PlanRecord[],
  availableBalance: number,
  insight: string,
  upcomingPayPlanTotal: number,
  upcomingPayPlanCount: number,
  budgetImpacts: PlanBudgetImpact[] = [],
  remainingBudgetTotal = 0,
): PlansOverview {
  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const projectedBalance = computePlansProjectedBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );

  return {
    activeCount: activePlans.length,
    estimatedCost,
    availableBalance,
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    remainingBudgetTotal,
    projectedBalance,
    budgetImpacts,
    insight,
    insightMeta: resolvePlansInsightMeta(
      estimatedCost,
      availableBalance,
      upcomingPayPlanTotal,
      remainingBudgetTotal,
    ),
  };
}

export function buildFallbackPlansInsight(
  estimatedCost: number,
  availableBalance: number,
  upcomingPayPlanTotal: number,
  remainingBudgetTotal: number,
): string {
  if (
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0 &&
    remainingBudgetTotal <= 0
  ) {
    return "Belum ada wish aktif. Tambahkan wishlist untuk melihat estimasi belanja.";
  }

  const projectedBalance = computePlansProjectedBalance(
    availableBalance,
    estimatedCost,
    upcomingPayPlanTotal,
    remainingBudgetTotal,
  );
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
    if (projectedBalance >= upcomingPayPlanTotal) {
      return `Saldo ${balanceLabel} cukup untuk tagihan PayPlan bulan ini (${payPlanLabel}). Proyeksi sisa ${formatIdr(projectedBalance)}.`;
    }

    if (projectedBalance >= 0) {
      return `Tagihan PayPlan bulan ini ${payPlanLabel} dari saldo ${balanceLabel} — sisa tipis (${formatIdr(projectedBalance)}).`;
    }

    return `Tagihan PayPlan bulan ini ${payPlanLabel} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(projectedBalance))}.`;
  }

  if (
    remainingBudgetTotal > 0 &&
    estimatedCost <= 0 &&
    upcomingPayPlanTotal <= 0
  ) {
    if (projectedBalance >= safeThreshold) {
      return `Saldo ${balanceLabel} cukup setelah sisihkan sisa budget PayPlan ${budgetLabel} bulan ini. Proyeksi sisa ${formatIdr(projectedBalance)}.`;
    }

    if (projectedBalance >= 0) {
      return `Sisa budget PayPlan ${budgetLabel} bulan ini perlu dipakai — proyeksi sisa saldo tipis (${formatIdr(projectedBalance)}). Hati-hati pengeluaran besar.`;
    }

    return `Sisa budget PayPlan ${budgetLabel} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(projectedBalance))}.`;
  }

  const payPlanNote =
    upcomingPayPlanTotal > 0
      ? ` Selain wish, ada tagihan PayPlan ${payPlanLabel} bulan ini —`
      : "";
  const budgetNote =
    remainingBudgetTotal > 0
      ? ` sisa budget PayPlan ${budgetLabel} masih perlu dipakai —`
      : "";

  if (projectedBalance >= safeThreshold) {
    return `Oke belanja ${spendLabel} dengan saldo ${balanceLabel}.${payPlanNote}${budgetNote} Proyeksi sisa masih longgar (${formatIdr(projectedBalance)}).`;
  }

  if (projectedBalance >= 0) {
    return `Cukup untuk ${spendLabel} dari saldo ${balanceLabel},${payPlanNote}${budgetNote} tapi proyeksi sisa tipis (${formatIdr(projectedBalance)}). Hati-hati tambah wish, tagihan, atau pengeluaran besar.`;
  }

  return `Belum aman. Estimasi ${spendLabel}${upcomingPayPlanTotal > 0 ? ` plus PayPlan ${payPlanLabel}` : ""}${remainingBudgetTotal > 0 ? ` plus sisa budget ${budgetLabel}` : ""} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(projectedBalance))}. Tunda atau kurangi wishlist.`;
}

export function isPlansInsightTone(value: string): value is PlansInsightTone {
  return (
    value === "empty" ||
    value === "safe" ||
    value === "tight" ||
    value === "unsafe"
  );
}
