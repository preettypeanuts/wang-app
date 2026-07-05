import { toDayKey } from "@/lib/finance/day-range";
import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import {
  getCurrentMonthKey,
  getMonthRange,
  parseMonthKey,
} from "@/lib/planner/calendar";
import type {
  PlannedOccurrence,
  PlannerDayMark,
  PlannerMonthData,
} from "@/types/planner";

function buildDayMarks(items: PlannedOccurrence[]): PlannerDayMark[] {
  const markMap = new Map<string, PlannerDayMark>();

  for (const item of items) {
    const dayKey = toDayKey(item.dueAt);
    const existing = markMap.get(dayKey);

    if (existing) {
      existing.count += 1;
      existing.totalAmount += item.amount;
      continue;
    }

    markMap.set(dayKey, {
      dayKey,
      count: 1,
      totalAmount: item.amount,
    });
  }

  return [...markMap.values()].sort((left, right) =>
    left.dayKey.localeCompare(right.dayKey),
  );
}

export async function getPlannerMonthData(
  monthKey: string = getCurrentMonthKey(),
): Promise<PlannerMonthData> {
  const parsed = parseMonthKey(monthKey) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };

  const { start, end } = getMonthRange(parsed.year, parsed.month);
  const plannedItems = await getPlannedItemsForExpansion();
  const items = expandPlannedItems(plannedItems, start, end);

  return {
    monthKey,
    year: parsed.year,
    month: parsed.month,
    marks: buildDayMarks(items),
    items,
  };
}
