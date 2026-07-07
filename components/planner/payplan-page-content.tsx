"use client";

import { BudgetManage } from "@/components/planner/budget-manage";
import { PayplanMobileLayoutGuard } from "@/components/planner/payplan-mobile-layout-guard";
import { PayplanMobileSearchRow } from "@/components/planner/payplan-mobile-search-row";
import {
  PayplanPageTabProvider,
  usePayplanPageTab,
} from "@/components/planner/payplan-page-tab-context";
import { PlannedItemsManage } from "@/components/planner/planned-items-manage";
import { PlannerCalendar } from "@/components/planner/planner-calendar";
import { PlannerCalendarTabBar } from "@/components/planner/planner-calendar-tab-bar";
import { PlannerShell } from "@/components/planner/planner-shell";
import { PlannerTabBar } from "@/components/planner/planner-tab-bar";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import {
  PAYPLAN_MOBILE_COMBINED_LIST,
  PAYPLAN_MOBILE_PAGE_INSET_X,
} from "@/config/payplan-mobile";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types/budget";
import type {
  PlannedItemKind,
  PlannedItemsFilters,
  PlannedRepeatInterval,
  PlannerCalendarLayout,
  PlannerTab,
  PlannedOccurrence,
} from "@/types/planner";
import { isPlannerManageLayout } from "@/types/planner";

type PlannedItemRecordSerialized = {
  id: string;
  name: string;
  kind: PlannedItemKind;
  repeat: PlannedRepeatInterval;
  amount: number;
  flowType: "income" | "expense";
  category: string;
  startAt: string;
  endAt: string | null;
  installmentCount: number | null;
  paidInstallmentCount: number;
  note: string | null;
};

interface PayplanPagePanelsProps {
  monthKey: string;
  calendarLayout: PlannerCalendarLayout;
  filters: PlannedItemsFilters;
  initialDayKey: string;
  monthKeyData: string;
  year: number;
  month: number;
  monthOccurrences: Array<Omit<PlannedOccurrence, "dueAt"> & { dueAt: string }>;
  plannedItemRecords: PlannedItemRecordSerialized[];
  budgets: BudgetStatus[];
}

function PayplanPagePanels({
  calendarLayout,
  filters,
  initialDayKey,
  monthKeyData,
  year,
  month,
  monthOccurrences,
  plannedItemRecords,
  monthKey,
  budgets,
}: PayplanPagePanelsProps) {
  const tabContext = usePayplanPageTab();
  const tab = tabContext?.tab ?? "calendar";
  const isCalendarTab = tab === "calendar";
  const isManage = isCalendarTab && isPlannerManageLayout(calendarLayout);
  const subtitle = isCalendarTab
    ? "Tagihan, pemasukan terjadwal, dan budget."
    : "Atur budget kategori — terhubung dengan Inbox.";
  const pageTitle = isCalendarTab ? "PayPlan" : "Budget";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <PayplanMobileLayoutGuard layout={calendarLayout} monthKey={monthKey} />
      <PlannerShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col md:p-3",
            STACK_GAP,
            "overflow-y-auto overscroll-y-contain",
            "md:pb-20",
            PAYPLAN_MOBILE_PAGE_INSET_X,
          )}
          title={pageTitle}
        >
          <header className="shrink-0 max-md:hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">
                  {pageTitle}
                </h1>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  {subtitle}
                </p>
              </div>

              <PlannerTabBar
                tab={tab}
                monthKey={monthKey}
                className="mt-0.5 shrink-0"
              />
            </div>

            {isCalendarTab ? (
              <div className="mt-3">
                <PlannerCalendarTabBar
                  layout={calendarLayout}
                  monthKey={monthKey}
                />
              </div>
            ) : null}
          </header>

          <div className="shrink-0 space-y-3 md:hidden">
            <p className="text-[11px] text-muted-foreground max-md:-mt-1">
              {subtitle}
            </p>

            {isCalendarTab ? (
              <PayplanMobileSearchRow filters={filters} layout="table" />
            ) : null}
          </div>

          <div className={cn(tab !== "budget" && "hidden")}>
            <BudgetManage monthKey={monthKey} budgets={budgets} />
          </div>

          <div className={cn(!isCalendarTab && "hidden")}>
            <div className={cn(isManage && "max-md:hidden")}>
              <PlannerCalendar
                monthKey={monthKeyData}
                year={year}
                month={month}
                initialDayKey={initialDayKey}
                items={monthOccurrences}
              />
            </div>

            {isManage ? (
              <div className="hidden md:block">
                <PlannedItemsManage
                  layout={calendarLayout}
                  items={plannedItemRecords}
                  filters={filters}
                  monthOccurrences={monthOccurrences}
                />
              </div>
            ) : null}

            <div className={PAYPLAN_MOBILE_COMBINED_LIST}>
              <PlannedItemsManage
                className="max-md:flex-none"
                hideMobileSearchRow
                layout="table"
                items={plannedItemRecords}
                filters={filters}
                monthOccurrences={monthOccurrences}
              />
            </div>
          </div>
        </MobileScrollSurface>
      </PlannerShell>
    </div>
  );
}

interface PayplanPageContentProps extends PayplanPagePanelsProps {
  initialTab: PlannerTab;
}

export function PayplanPageContent({
  initialTab,
  monthKey,
  ...panelProps
}: PayplanPageContentProps) {
  return (
    <PayplanPageTabProvider initialTab={initialTab} monthKey={monthKey}>
      <PayplanPagePanels monthKey={monthKey} {...panelProps} />
    </PayplanPageTabProvider>
  );
}
