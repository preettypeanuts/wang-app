import { startOfDay } from "@/lib/finance/day-range";
import {
  getDueDateForInstallmentIndex,
  getPlannedItemPaymentStatus,
} from "@/lib/planner/installment-progress";
import { canMarkPlannedItemPaid } from "@/lib/planner/item-payment";
import type { PlannedItemRecord } from "@/types/planner";

export interface UpcomingUnpaidPayPlanEntry {
  item: PlannedItemRecord;
  dueAt: Date;
  daysUntil: number;
}

function getDaysUntilDue(dueDate: Date, referenceDate: Date): number {
  const today = startOfDay(referenceDate);

  return Math.round(
    (startOfDay(dueDate).getTime() - today.getTime()) / 86_400_000,
  );
}

function isOccurrenceBeforeEnd(item: PlannedItemRecord, date: Date): boolean {
  if (!item.endAt) {
    return true;
  }

  return date.getTime() <= item.endAt.getTime();
}

/** Unpaid PayPlan bills — synced with canMarkPlannedItemPaid (one row per item). */
export function listUpcomingUnpaidPayPlanEntries(
  items: PlannedItemRecord[],
  referenceDate: Date = new Date(),
): UpcomingUnpaidPayPlanEntry[] {
  return items
    .filter((item) => item.flowType === "expense")
    .filter(canMarkPlannedItemPaid)
    .map((item) => {
      const dueAt = getDueDateForInstallmentIndex(
        item,
        item.paidInstallmentCount,
      );

      if (!isOccurrenceBeforeEnd(item, dueAt)) {
        return null;
      }

      const paymentStatus = getPlannedItemPaymentStatus(item, referenceDate);
      const daysUntil =
        paymentStatus?.daysUntil ?? getDaysUntilDue(dueAt, referenceDate);

      return { item, dueAt, daysUntil };
    })
    .filter((entry): entry is UpcomingUnpaidPayPlanEntry => entry !== null);
}
