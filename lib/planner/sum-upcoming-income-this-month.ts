import { getMonthRange } from "@/lib/planner/calendar";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import { canMarkOccurrenceReceived } from "@/lib/planner/installment-occurrence";
import type { PlannedItemRecord } from "@/types/planner";

/**
 * Sum of planned income still expected (not yet received) in the current month.
 * Mirrors the expense upcoming-total used for projected balance.
 */
export function sumUpcomingIncomeThisMonth(
  items: PlannedItemRecord[],
  referenceDate: Date = new Date(),
): { upcomingIncomeTotal: number; upcomingIncomeCount: number } {
  const { start, end } = getMonthRange(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
  );

  const occurrences = expandPlannedItems(items, start, end).filter(
    canMarkOccurrenceReceived,
  );

  return {
    upcomingIncomeTotal: occurrences.reduce(
      (sum, item) => sum + item.amount,
      0,
    ),
    upcomingIncomeCount: occurrences.length,
  };
}
