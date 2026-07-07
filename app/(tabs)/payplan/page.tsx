import { PayplanPageContent } from "@/components/planner/payplan-page-content";
import { requireUserId } from "@/lib/auth/session";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import { listPlannedItems } from "@/lib/db/planned-items";
import { getPlannerMonthData } from "@/lib/db/planner";
import { pickDefaultDayKey } from "@/lib/planner/calendar";
import { parsePlannerSearchParams } from "@/lib/validations/planner";

export const dynamic = "force-dynamic";

interface PayPlanPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PayPlanPage({ searchParams }: PayPlanPageProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const { monthKey, tab, calendarLayout, filters } =
    parsePlannerSearchParams(params);

  const [data, plannedItems, budgets] = await Promise.all([
    getPlannerMonthData(userId, monthKey),
    listPlannedItems(userId),
    listBudgetsForMonth(userId, monthKey),
  ]);

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
    />
  );
}
