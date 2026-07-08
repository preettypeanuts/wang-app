import { unstable_cache } from "next/cache";

import {
  hydratePlannedOccurrence,
  serializePlannedOccurrence,
  type SerializedPlannedOccurrence,
} from "@/lib/cache/serialize-planned-items";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { toDayKey } from "@/lib/finance/day-range";
import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import {
  getCurrentMonthKey,
  getMonthRange,
  parseMonthKey,
} from "@/lib/planner/calendar";
import type {
  PlannedItemRecord,
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

type SerializedPlannerMonthData = Omit<PlannerMonthData, "items"> & {
  items: SerializedPlannedOccurrence[];
};

function computePlannerMonthData(
  userId: string,
  monthKey: string,
  plannedItems: PlannedItemRecord[],
): PlannerMonthData {
  const parsed = parseMonthKey(monthKey) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };

  const { start, end } = getMonthRange(parsed.year, parsed.month);
  const items = expandPlannedItems(plannedItems, start, end);

  return {
    monthKey,
    year: parsed.year,
    month: parsed.month,
    marks: buildDayMarks(items),
    items,
  };
}

async function queryPlannerMonthData(
  userId: string,
  monthKey: string,
): Promise<SerializedPlannerMonthData> {
  const plannedItems = await getPlannedItemsForExpansion(userId);
  const data = computePlannerMonthData(userId, monthKey, plannedItems);

  return {
    ...data,
    items: data.items.map(serializePlannedOccurrence),
  };
}

function hydratePlannerMonthData(
  data: SerializedPlannerMonthData,
): PlannerMonthData {
  return {
    ...data,
    items: data.items.map(hydratePlannedOccurrence),
  };
}

export async function getPlannerMonthData(
  userId: string,
  monthKey: string = getCurrentMonthKey(),
  plannedItems?: PlannedItemRecord[],
): Promise<PlannerMonthData> {
  if (plannedItems) {
    return computePlannerMonthData(userId, monthKey, plannedItems);
  }

  const cached = await unstable_cache(
    () => queryPlannerMonthData(userId, monthKey),
    ["planner-month", userId, monthKey],
    {
      tags: [
        userDataTags.plannedItems(userId),
        userDataTags.transactions(userId),
      ],
    },
  )();

  return hydratePlannerMonthData(cached);
}
