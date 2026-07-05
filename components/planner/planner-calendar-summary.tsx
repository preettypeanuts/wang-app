"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlannerCalendarSummaryTile } from "@/components/planner/planner-calendar-summary-tile";
import { PLANNED_ITEMS_DEFAULT_FILTERS } from "@/config/planner-manage-filters";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import { GRID_GAP } from "@/config/spacing";
import { formatIdr } from "@/lib/finance/format-currency";
import { getCalendarPaymentSummary } from "@/lib/planner/calendar-payment-summary";
import { buildPlannedItemsManageParams } from "@/lib/validations/planned-items-manage";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarSummaryProps {
  items: PlannedOccurrence[];
  monthKey: string;
  className?: string;
}

export function PlannerCalendarSummary({
  items,
  monthKey,
  className,
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
      "cards",
      new URLSearchParams(searchParams.toString()),
    );

    params.set("month", monthKey);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className={cn("grid grid-cols-2", GRID_GAP, className)}>
      <PlannerCalendarSummaryTile
        label="Belum dibayar"
        amount={formatIdr(summary.unpaidAmount)}
        subtitle={
          summary.unpaidCount > 0
            ? `${summary.unpaidCount} tagihan`
            : "Tidak ada tagihan"
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
        label="Sudah dibayar"
        amount={formatIdr(summary.paidAmount)}
        subtitle={
          summary.paidCount > 0
            ? `${summary.paidCount} tagihan`
            : "Belum ada pembayaran"
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
