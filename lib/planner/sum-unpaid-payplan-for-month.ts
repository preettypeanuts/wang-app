import { getMonthRange } from "@/lib/planner/calendar";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import { canMarkOccurrencePaid } from "@/lib/planner/installment-occurrence";
import type { PlannedItemRecord } from "@/types/planner";

/**
 * Sum of all unpaid PayPlan expense occurrences due in a calendar month.
 * Unlike the upcoming-impact list (one nearest bill per item), this totals
 * every unpaid occurrence in the month — including weekly installments.
 */
export function sumUnpaidPayPlanForMonth(
  items: PlannedItemRecord[],
  year: number,
  month: number,
): { total: number; count: number } {
  const { start, end } = getMonthRange(year, month);

  const occurrences = expandPlannedItems(items, start, end).filter(
    (occurrence) =>
      occurrence.type === "expense" && canMarkOccurrencePaid(occurrence),
  );

  return {
    total: occurrences.reduce((sum, occurrence) => sum + occurrence.amount, 0),
    count: occurrences.length,
  };
}
