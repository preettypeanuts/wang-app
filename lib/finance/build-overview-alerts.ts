import { formatIdr } from "@/lib/finance/format-currency";
import {
  UI_LABEL_OVERVIEW_ALERT_DUE_TODAY,
  UI_LABEL_OVERVIEW_ALERT_NEGATIVE_BALANCE,
  UI_LABEL_OVERVIEW_ALERT_PAYMENT_OVERDUE,
  UI_LABEL_OVERVIEW_ALERT_THIN_WISH_BUFFER,
  UI_LABEL_OVERVIEW_ALERT_WISHES_EXCEED_BALANCE,
} from "@/config/ui-labels";
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
      title: UI_LABEL_OVERVIEW_ALERT_NEGATIVE_BALANCE,
      segments: [
        text("Cumulative balance "),
        amount(availableBalance),
        text(". Review recent spending."),
      ],
    });
  }

  for (const item of upcoming) {
    if (item.daysUntil < 0) {
      alerts.push({
        id: `overdue-${item.id}`,
        tone: "danger",
        title: UI_LABEL_OVERVIEW_ALERT_PAYMENT_OVERDUE,
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
        title: UI_LABEL_OVERVIEW_ALERT_DUE_TODAY,
        segments: [text(`${item.name} · `), amount(item.amount)],
      });
    }
  }

  if (plansOverview.insightMeta.tone === "unsafe") {
    const segments: OverviewAlertSegment[] = [
      text("Estimated wishes "),
      amount(plansOverview.estimatedCost),
    ];

    if (plansOverview.upcomingPayPlanTotal > 0) {
      segments.push(
        text(" + PayPlan this month "),
        amount(plansOverview.upcomingPayPlanTotal),
      );
    }

    if (plansOverview.remainingBudgetTotal > 0) {
      segments.push(
        text(" + remaining budget "),
        amount(plansOverview.remainingBudgetTotal),
      );
    }

    segments.push(
      text(" vs balance "),
      amount(plansOverview.availableBalance),
      text("."),
    );

    alerts.push({
      id: "plans-unsafe",
      tone: "danger",
      title: UI_LABEL_OVERVIEW_ALERT_WISHES_EXCEED_BALANCE,
      segments,
    });
  } else if (plansOverview.insightMeta.tone === "tight") {
    alerts.push({
      id: "plans-tight",
      tone: "warning",
      title: UI_LABEL_OVERVIEW_ALERT_THIN_WISH_BUFFER,
      segments: [
        text(
          "Remaining after wishes, PayPlan, and budget this month (cash only) ",
        ),
        amount(plansOverview.projectedBalance),
        text("."),
      ],
    });
  }

  return alerts.slice(0, 6);
}
