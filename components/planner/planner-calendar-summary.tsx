"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlannerCalendarSummaryTile } from "@/components/planner/planner-calendar-summary-tile";
import { PLANNED_ITEMS_DEFAULT_FILTERS } from "@/config/planner-manage-filters";
import {
  formatPayPlanBillCount,
  PAYPLAN_LABEL_NO_BILLS,
  PAYPLAN_LABEL_NO_PAYMENTS_YET,
  PAYPLAN_LABEL_PAID,
  PAYPLAN_LABEL_UNPAID,
} from "@/config/payplan-labels";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import { GRID_GAP } from "@/config/spacing";
import { formatIdr } from "@/lib/finance/format-currency";
import { getCalendarPaymentSummary } from "@/lib/planner/calendar-payment-summary";
import { buildPlannedItemsManageParams } from "@/lib/validations/planned-items-manage";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence, PlannerManageLayout } from "@/types/planner";

interface PlannerCalendarSummaryProps {
  items: PlannedOccurrence[];
  monthKey: string;
  className?: string;
  /** Manage layout for payment filter deep-link — table on mobile PayPlan. */
  manageLayout?: PlannerManageLayout;
}

export function PlannerCalendarSummary({
  items,
  monthKey,
  className,
  manageLayout = "cards",
}: PlannerCalendarSummaryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const summary = getCalendarPaymentSummary(items);
  const unpaid = SOLID_WIDGET_TILE_STYLES.expense;
  const paid = SOLID_WIDGET_TILE_STYLES.income;

  function openManagePaymentFilter(paymentStatus: "unpaid" | "paid") {
    const params = buildPlannedItemsManageParams(
      {
        ...PLANNED_ITEMS_DEFAULT_FILTERS,
        paymentStatus,
        flowType: "expense",
      },
      manageLayout,
      new URLSearchParams(searchParams.toString()),
    );

    params.set("month", monthKey);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className={cn("grid grid-cols-2", GRID_GAP, className)}>
      <PlannerCalendarSummaryTile
        label={PAYPLAN_LABEL_UNPAID}
        amount={formatIdr(summary.unpaidAmount)}
        subtitle={
          summary.unpaidCount > 0
            ? formatPayPlanBillCount(summary.unpaidCount)
            : PAYPLAN_LABEL_NO_BILLS
        }
        icon="receipt"
        surfaceClassName={unpaid.surface}
        iconClassName={unpaid.iconColor}
        labelClassName={unpaid.labelColor}
        amountClassName={unpaid.valueColor}
        subtitleClassName={unpaid.subtitleColor}
        onClick={() => openManagePaymentFilter("unpaid")}
      />
      <PlannerCalendarSummaryTile
        label={PAYPLAN_LABEL_PAID}
        amount={formatIdr(summary.paidAmount)}
        subtitle={
          summary.paidCount > 0
            ? formatPayPlanBillCount(summary.paidCount)
            : PAYPLAN_LABEL_NO_PAYMENTS_YET
        }
        icon="wallet"
        surfaceClassName={paid.surface}
        iconClassName={paid.iconColor}
        labelClassName={paid.labelColor}
        amountClassName={paid.valueColor}
        subtitleClassName={paid.subtitleColor}
        onClick={() => openManagePaymentFilter("paid")}
      />
    </section>
  );
}
