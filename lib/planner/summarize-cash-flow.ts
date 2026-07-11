import type { PlannedOccurrence } from "@/types/planner";

export interface PlannedCashFlowSummary {
  incomeTotal: number;
  expenseTotal: number;
  net: number;
  incomeCount: number;
  expenseCount: number;
}

/** Aggregate planned occurrences into income vs expense totals + net flow. */
export function summarizePlannedCashFlow(
  items: PlannedOccurrence[],
): PlannedCashFlowSummary {
  let incomeTotal = 0;
  let expenseTotal = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const item of items) {
    if (item.type === "income") {
      incomeTotal += item.amount;
      incomeCount += 1;
      continue;
    }

    expenseTotal += item.amount;
    expenseCount += 1;
  }

  return {
    incomeTotal,
    expenseTotal,
    net: incomeTotal - expenseTotal,
    incomeCount,
    expenseCount,
  };
}
