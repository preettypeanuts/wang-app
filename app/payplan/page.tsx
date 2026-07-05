import { PlannerCalendar } from "@/components/planner/planner-calendar";
import { PlannedItemsManage } from "@/components/planner/planned-items-manage";
import { PlannerShell } from "@/components/planner/planner-shell";
import { PlannerTabBar } from "@/components/planner/planner-tab-bar";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import { APP_GUTTER, STACK_GAP } from "@/config/spacing";
import { getPlannerMonthData } from "@/lib/db/planner";
import { listPlannedItems } from "@/lib/db/planned-items";
import { pickDefaultDayKey } from "@/lib/planner/calendar";
import { parsePlannerSearchParams } from "@/lib/validations/planner";
import { cn } from "@/lib/utils";
import { isPayPlanManageTab } from "@/types/planner";

export const dynamic = "force-dynamic";

interface PayPlanPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PayPlanPage({ searchParams }: PayPlanPageProps) {
  const params = await searchParams;
  const { monthKey, tab, filters } = parsePlannerSearchParams(params);
  const isManage = isPayPlanManageTab(tab);
  const needsMonthOccurrences = isManage && filters.paymentStatus !== "all";
  const [data, plannedItems] = await Promise.all([
    tab === "calendar" || needsMonthOccurrences
      ? getPlannerMonthData(monthKey)
      : null,
    isManage ? listPlannedItems() : null,
  ]);
  const initialDayKey = data
    ? pickDefaultDayKey(data.monthKey, data.marks)
    : null;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", APP_GUTTER)}>
      <PlannerShell className="min-h-0 flex-1">
        <div className={cn("flex min-h-0 flex-1 flex-col", STACK_GAP)}>
          <header className="shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-2">
                <MobileBackButton className="mt-0.5 shrink-0 md:hidden" />
                <div className="min-w-0">
                  <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">
                    PayPlan
                  </h1>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                    Tagihan dan pemasukan terjadwal.
                  </p>
                </div>
              </div>

              <PlannerTabBar
                tab={tab}
                monthKey={monthKey}
                className="mt-0.5 shrink-0"
              />
            </div>
          </header>

          {isManage && plannedItems ? (
            <PlannedItemsManage
              tab={tab}
              items={plannedItems.map((item) => ({
                ...item,
                startAt: item.startAt.toISOString(),
                endAt: item.endAt?.toISOString() ?? null,
              }))}
              filters={filters}
              monthOccurrences={
                data?.items.map((item) => ({
                  ...item,
                  dueAt: item.dueAt.toISOString(),
                })) ?? []
              }
            />
          ) : null}

          {tab === "calendar" && data && initialDayKey ? (
            <PlannerCalendar
              monthKey={data.monthKey}
              year={data.year}
              month={data.month}
              initialDayKey={initialDayKey}
              items={data.items.map((item) => ({
                ...item,
                dueAt: item.dueAt.toISOString(),
              }))}
            />
          ) : null}
        </div>
      </PlannerShell>
    </div>
  );
}
