import { formatIdr } from "@/lib/finance/format-currency";
import type { PlansOverview, PlansUpcomingImpactItem } from "@/types/plan";
import type { OverviewAlert, OverviewAlertSegment } from "@/types/overview";

interface BuildOverviewAlertsInput {
  upcoming: PlansUpcomingImpactItem[];
  plansOverview: PlansOverview;
  availableBalance: number;
}

function text(value: string): OverviewAlertSegment {
  return { kind: "text", value };
}

function amount(value: number): OverviewAlertSegment {
  return { kind: "amount", value };
}

export function formatOverviewAlertMessage(
  segments: OverviewAlertSegment[],
): string {
  return segments
    .map((segment) =>
      segment.kind === "amount" ? formatIdr(segment.value) : segment.value,
    )
    .join("");
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
      segments: [
        text("Saldo kumulatif "),
        amount(availableBalance),
        text(". Periksa pengeluaran terbaru."),
      ],
    });
  }

  for (const item of upcoming) {
    if (item.daysUntil < 0) {
      alerts.push({
        id: `overdue-${item.id}`,
        tone: "danger",
        title: "Terlambat bayar",
        segments: [
          text(`${item.name} · `),
          amount(item.amount),
          text(` · ${item.daysUntilLabel}`),
        ],
      });
      continue;
    }

    if (item.daysUntil === 0) {
      alerts.push({
        id: `due-today-${item.id}`,
        tone: "warning",
        title: "Jatuh tempo hari ini",
        segments: [text(`${item.name} · `), amount(item.amount)],
      });
    }
  }

  if (plansOverview.insightMeta.tone === "unsafe") {
    const segments: OverviewAlertSegment[] = [
      text("Estimasi wish "),
      amount(plansOverview.estimatedCost),
    ];

    if (plansOverview.upcomingPayPlanTotal > 0) {
      segments.push(
        text(" + PayPlan bulan ini "),
        amount(plansOverview.upcomingPayPlanTotal),
      );
    }

    if (plansOverview.remainingBudgetTotal > 0) {
      segments.push(
        text(" + sisa budget "),
        amount(plansOverview.remainingBudgetTotal),
      );
    }

    segments.push(
      text(" vs saldo "),
      amount(plansOverview.availableBalance),
      text("."),
    );

    alerts.push({
      id: "plans-unsafe",
      tone: "danger",
      title: "Wish melebihi saldo",
      segments,
    });
  } else if (plansOverview.insightMeta.tone === "tight") {
    alerts.push({
      id: "plans-tight",
      tone: "warning",
      title: "Sisa wish tipis",
      segments: [
        text("Proyeksi sisa setelah wish, PayPlan, dan sisa budget bulan ini "),
        amount(plansOverview.projectedBalance),
        text("."),
      ],
    });
  }

  return alerts.slice(0, 6);
}
