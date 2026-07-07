"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePayplanPageTab } from "@/components/planner/payplan-page-tab-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PAYPLAN_TOP_BAR_TABS_LIST,
  PAYPLAN_TOP_BAR_TABS_TRIGGER,
} from "@/config/payplan-mobile";
import { getCurrentMonthKey } from "@/lib/planner/calendar";
import { CalendarBlankIcon, ChartBarIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PlannerTab } from "@/types/planner";

export function PlannerMobileTopBarTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabContext = usePayplanPageTab();
  const tab = (tabContext?.tab ??
    (searchParams.get("tab") === "budget" ? "budget" : "calendar")) as PlannerTab;
  const monthKey =
    tabContext?.monthKey ??
    (searchParams.get("month")?.trim() || getCurrentMonthKey());

  function navigate(nextTab: PlannerTab) {
    if (tabContext) {
      tabContext.setTab(nextTab);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    params.set("month", monthKey);

    if (nextTab === "budget") {
      params.delete("layout");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => navigate(value as PlannerTab)}
      className="shrink-0"
    >
      <TabsList variant="line" className={PAYPLAN_TOP_BAR_TABS_LIST}>
        <TabsTrigger
          value="calendar"
          className={cn(PAYPLAN_TOP_BAR_TABS_TRIGGER)}
          aria-label="Kalender"
        >
          <CalendarBlankIcon aria-hidden />
        </TabsTrigger>
        <TabsTrigger
          value="budget"
          className={cn(PAYPLAN_TOP_BAR_TABS_TRIGGER)}
          aria-label="Budget"
        >
          <ChartBarIcon aria-hidden />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
