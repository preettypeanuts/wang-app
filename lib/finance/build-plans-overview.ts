import { formatIdr } from "@/lib/finance/format-currency";
import type {
  PlanBudgetImpact,
  PlanRecord,
  PlansInsightMeta,
  PlansInsightTone,
  PlansOverview,
} from "@/types/plan";

export function resolvePlansInsightMeta(
  estimatedCost: number,
  availableBalance: number,
  upcomingPayPlanTotal: number,
): PlansInsightMeta {
  if (estimatedCost <= 0 && upcomingPayPlanTotal <= 0) {
    return { tone: "empty", label: "Kosong" };
  }

  const projectedBalance =
    availableBalance - estimatedCost - upcomingPayPlanTotal;

  if (projectedBalance >= estimatedCost) {
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
): PlansOverview {
  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const projectedBalance =
    availableBalance - estimatedCost - upcomingPayPlanTotal;

  return {
    activeCount: activePlans.length,
    estimatedCost,
    availableBalance,
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    projectedBalance,
    budgetImpacts,
    insight,
    insightMeta: resolvePlansInsightMeta(
      estimatedCost,
      availableBalance,
      upcomingPayPlanTotal,
    ),
  };
}

export function buildFallbackPlansInsight(
  estimatedCost: number,
  availableBalance: number,
  upcomingPayPlanTotal: number,
): string {
  if (estimatedCost <= 0 && upcomingPayPlanTotal <= 0) {
    return "Belum ada wish aktif. Tambahkan wishlist untuk melihat estimasi belanja.";
  }

  const projectedBalance =
    availableBalance - estimatedCost - upcomingPayPlanTotal;
  const spendLabel = formatIdr(estimatedCost);
  const balanceLabel = formatIdr(availableBalance);
  const payPlanLabel = formatIdr(upcomingPayPlanTotal);

  if (upcomingPayPlanTotal > 0 && estimatedCost <= 0) {
    if (projectedBalance >= upcomingPayPlanTotal) {
      return `Saldo ${balanceLabel} cukup untuk tagihan PayPlan bulan ini (${payPlanLabel}). Proyeksi sisa ${formatIdr(projectedBalance)}.`;
    }

    if (projectedBalance >= 0) {
      return `Tagihan PayPlan bulan ini ${payPlanLabel} dari saldo ${balanceLabel} — sisa tipis (${formatIdr(projectedBalance)}).`;
    }

    return `Tagihan PayPlan bulan ini ${payPlanLabel} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(projectedBalance))}.`;
  }

  const payPlanNote =
    upcomingPayPlanTotal > 0
      ? ` Selain wish, ada tagihan PayPlan ${payPlanLabel} bulan ini —`
      : "";

  if (projectedBalance >= estimatedCost) {
    return `Oke belanja ${spendLabel} dengan saldo ${balanceLabel}.${payPlanNote} Proyeksi sisa masih longgar (${formatIdr(projectedBalance)}).`;
  }

  if (projectedBalance >= 0) {
    return `Cukup untuk ${spendLabel} dari saldo ${balanceLabel},${payPlanNote} tapi proyeksi sisa tipis (${formatIdr(projectedBalance)}). Prioritaskan wish penting dulu.`;
  }

  return `Belum aman. Estimasi ${spendLabel}${upcomingPayPlanTotal > 0 ? ` plus PayPlan ${payPlanLabel}` : ""} melebihi saldo ${balanceLabel} sebesar ${formatIdr(Math.abs(projectedBalance))}. Tunda atau kurangi wishlist.`;
}

export function isPlansInsightTone(value: string): value is PlansInsightTone {
  return (
    value === "empty" ||
    value === "safe" ||
    value === "tight" ||
    value === "unsafe"
  );
}
