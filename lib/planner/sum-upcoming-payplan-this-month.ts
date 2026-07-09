import { getMonthRange } from "@/lib/planner/calendar";
import type { PlansUpcomingImpactItem } from "@/types/plan";

export function sumUpcomingPayPlanThisMonth(
  items: PlansUpcomingImpactItem[],
  referenceDate: Date = new Date(),
): { upcomingPayPlanTotal: number; upcomingPayPlanCount: number } {
  const { start, end } = getMonthRange(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
  );
  const startMs = start.getTime();
  const endMs = end.getTime();

  const thisMonth = items.filter((item) => {
    const dueMs = new Date(item.dueAt).getTime();
    return dueMs >= startMs && dueMs <= endMs;
  });

  return {
    upcomingPayPlanTotal: thisMonth.reduce((sum, item) => sum + item.amount, 0),
    upcomingPayPlanCount: thisMonth.length,
  };
}
