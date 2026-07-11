import { listBudgetsForMonth } from "@/lib/db/budgets";
import { sumRemainingBudgetTotal } from "@/lib/finance/sum-remaining-budget-total";
import {
  getCurrentMonthKey,
  parseMonthKey,
  shiftMonthKey,
} from "@/lib/planner/calendar";
import { sumUnpaidPayPlanForMonth } from "@/lib/planner/sum-unpaid-payplan-for-month";
import type { PlannedItemRecord } from "@/types/planner";

export interface PlansNextMonthObligations {
  nextMonthPayPlanTotal: number;
  remainingBudgetNextMonth: number;
}

export async function getPlansNextMonthObligations(
  userId: string,
  plannedItems: PlannedItemRecord[],
  referenceDate: Date = new Date(),
): Promise<PlansNextMonthObligations> {
  const nextMonthKey = shiftMonthKey(getCurrentMonthKey(referenceDate), 1);
  const nextParsed = parseMonthKey(nextMonthKey);

  if (!nextParsed) {
    return { nextMonthPayPlanTotal: 0, remainingBudgetNextMonth: 0 };
  }

  const budgetsNextMonth = await listBudgetsForMonth(userId, nextMonthKey);
  const { total: nextMonthPayPlanTotal } = sumUnpaidPayPlanForMonth(
    plannedItems,
    nextParsed.year,
    nextParsed.month,
  );

  return {
    nextMonthPayPlanTotal,
    remainingBudgetNextMonth: sumRemainingBudgetTotal(budgetsNextMonth),
  };
}

export function getPlansNextMonthPayPlanTotal(
  plannedItems: PlannedItemRecord[],
  referenceDate: Date = new Date(),
): number {
  const nextMonthKey = shiftMonthKey(getCurrentMonthKey(referenceDate), 1);
  const nextParsed = parseMonthKey(nextMonthKey);

  if (!nextParsed) {
    return 0;
  }

  return sumUnpaidPayPlanForMonth(
    plannedItems,
    nextParsed.year,
    nextParsed.month,
  ).total;
}
