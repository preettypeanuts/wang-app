import {
  isOccurrencePaid,
  isPayableOccurrence,
} from "@/lib/planner/installment-occurrence";
import type { PlannedOccurrence } from "@/types/planner";

export interface CalendarPaymentSummary {
  unpaidAmount: number;
  unpaidCount: number;
  paidAmount: number;
  paidCount: number;
}

export function getCalendarPaymentSummary(
  items: PlannedOccurrence[],
): CalendarPaymentSummary {
  let unpaidAmount = 0;
  let unpaidCount = 0;
  let paidAmount = 0;
  let paidCount = 0;

  for (const item of items) {
    if (!isPayableOccurrence(item)) {
      continue;
    }

    if (isOccurrencePaid(item)) {
      paidAmount += item.amount;
      paidCount += 1;
      continue;
    }

    unpaidAmount += item.amount;
    unpaidCount += 1;
  }

  return {
    unpaidAmount,
    unpaidCount,
    paidAmount,
    paidCount,
  };
}
