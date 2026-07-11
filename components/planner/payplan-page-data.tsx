import { PayplanPageContent } from "@/components/planner/payplan-page-content";
import { requireUserId } from "@/lib/auth/session";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import { listPlannedItems } from "@/lib/db/planned-items";
import { getPlannerMonthData } from "@/lib/db/planner";
import {
  getMonthRange,
  parseMonthKey,
  pickDefaultDayKey,
  shiftMonthKey,
} from "@/lib/planner/calendar";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import { summarizePlannedCashFlow } from "@/lib/planner/summarize-cash-flow";
import { parsePlannerSearchParams } from "@/lib/validations/planner";

interface PayplanPageDataProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function PayplanPageData({ searchParams }: PayplanPageDataProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const { monthKey, tab, calendarLayout, filters } =
    parsePlannerSearchParams(params);

  const plannedItems = await listPlannedItems(userId);

  const [data, budgets] = await Promise.all([
    getPlannerMonthData(userId, monthKey, plannedItems),
    listBudgetsForMonth(userId, monthKey),
  ]);

  const nextMonthKey = shiftMonthKey(monthKey, 1);
  const nextParsed = parseMonthKey(nextMonthKey) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };
  const nextRange = getMonthRange(nextParsed.year, nextParsed.month);
  const nextMonthCashFlow = summarizePlannedCashFlow(
    expandPlannedItems(plannedItems, nextRange.start, nextRange.end),
  );

  const initialDayKey = pickDefaultDayKey(data.monthKey, data.marks);
  const monthOccurrences = data.items.map((item) => ({
    ...item,
    dueAt: item.dueAt.toISOString(),
  }));
  const plannedItemRecords = plannedItems.map((item) => ({
    ...item,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt?.toISOString() ?? null,
  }));

  return (
    <PayplanPageContent
      initialTab={tab}
      monthKey={monthKey}
      calendarLayout={calendarLayout}
      filters={filters}
      initialDayKey={initialDayKey}
      monthKeyData={data.monthKey}
      year={data.year}
      month={data.month}
      monthOccurrences={monthOccurrences}
      plannedItemRecords={plannedItemRecords}
      budgets={budgets}
      nextMonthKey={nextMonthKey}
      nextMonthCashFlow={nextMonthCashFlow}
    />
  );
}
