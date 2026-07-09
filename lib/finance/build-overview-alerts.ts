import { formatIdr } from "@/lib/finance/format-currency";
import type { PlansOverview, PlansUpcomingImpactItem } from "@/types/plan";
import type { OverviewAlert } from "@/types/overview";

interface BuildOverviewAlertsInput {
  upcoming: PlansUpcomingImpactItem[];
  plansOverview: PlansOverview;
  availableBalance: number;
}

export function buildOverviewAlerts({
  upcoming,
  plansOverview,
  availableBalance,
}: BuildOverviewAlertsInput): OverviewAlert[] {
  const alerts: OverviewAlert[] = [];

  if (availableBalance < 0) {
    alerts.push({
      id: "negative-balance",
      tone: "danger",
      title: "Saldo negatif",
      message: `Saldo kumulatif ${formatIdr(availableBalance)}. Periksa pengeluaran terbaru.`,
    });
  }

  for (const item of upcoming) {
    if (item.daysUntil < 0) {
      alerts.push({
        id: `overdue-${item.id}`,
        tone: "danger",
        title: "Terlambat bayar",
        message: `${item.name} · ${formatIdr(item.amount)} · ${item.daysUntilLabel}`,
      });
      continue;
    }

    if (item.daysUntil === 0) {
      alerts.push({
        id: `due-today-${item.id}`,
        tone: "warning",
        title: "Jatuh tempo hari ini",
        message: `${item.name} · ${formatIdr(item.amount)}`,
      });
    }
  }

  if (plansOverview.insightMeta.tone === "unsafe") {
    alerts.push({
      id: "plans-unsafe",
      tone: "danger",
      title: "Wish melebihi saldo",
      message: `Estimasi wish ${formatIdr(plansOverview.estimatedCost)}${plansOverview.upcomingPayPlanTotal > 0 ? ` + PayPlan bulan ini ${formatIdr(plansOverview.upcomingPayPlanTotal)}` : ""} vs saldo ${formatIdr(plansOverview.availableBalance)}.`,
    });
  } else if (plansOverview.insightMeta.tone === "tight") {
    alerts.push({
      id: "plans-tight",
      tone: "warning",
      title: "Sisa wish tipis",
      message: `Proyeksi sisa setelah wish dan PayPlan bulan ini ${formatIdr(plansOverview.projectedBalance)}.`,
    });
  }

  return alerts.slice(0, 6);
}
