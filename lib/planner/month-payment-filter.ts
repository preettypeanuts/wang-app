import {
  isOccurrencePaid,
  isPayableOccurrence,
} from "@/lib/planner/installment-occurrence";
import type {
  PlannedOccurrence,
  PlannedPaymentStatusFilter,
} from "@/types/planner";

export function getPlannedItemIdsForMonthPayment(
  occurrences: PlannedOccurrence[],
  paymentStatus: Exclude<PlannedPaymentStatusFilter, "all">,
): Set<string> {
  const ids = new Set<string>();

  for (const occurrence of occurrences) {
    if (!isPayableOccurrence(occurrence)) {
      continue;
    }

    const isPaid = isOccurrencePaid(occurrence);

    if (paymentStatus === "paid" && isPaid) {
      ids.add(occurrence.plannedItemId);
    }

    if (paymentStatus === "unpaid" && !isPaid) {
      ids.add(occurrence.plannedItemId);
    }
  }

  return ids;
}
