"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PLANNER_CALENDAR_TAB_LIST,
  PLANNER_CALENDAR_TAB_TRIGGER,
} from "@/config/planner-calendar";
import { PAYPLAN_LABEL_CALENDAR, PAYPLAN_LABEL_MONTHLY_CALENDAR } from "@/config/payplan-labels";
import { PAYPLAN_CALENDAR_TAB_LIST_MOBILE } from "@/config/payplan-mobile";
import {
  CalendarBlankIcon,
  ListIcon,
  SquaresFourIcon,
  TableIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PlannerCalendarLayout } from "@/types/planner";

interface PlannerCalendarTabBarProps {
  layout: PlannerCalendarLayout;
  monthKey: string;
  className?: string;
}

export function PlannerCalendarTabBar({
  layout,
  monthKey,
  className,
}: PlannerCalendarTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(nextLayout: PlannerCalendarLayout) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "calendar");
    params.set("month", monthKey);

    if (nextLayout === "month") {
      params.delete("layout");
    } else {
      params.set("layout", nextLayout);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs
      value={layout}
      onValueChange={(value) => navigate(value as PlannerCalendarLayout)}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(PLANNER_CALENDAR_TAB_LIST, PAYPLAN_CALENDAR_TAB_LIST_MOBILE)}
      >
        <TabsTrigger
          value="month"
          className={PLANNER_CALENDAR_TAB_TRIGGER}
          aria-label={PAYPLAN_LABEL_MONTHLY_CALENDAR}
        >
          <CalendarBlankIcon className="size-3.5" />
          <span className="inline md:hidden">{PAYPLAN_LABEL_CALENDAR}</span>
          <span className="hidden sm:inline md:inline">{PAYPLAN_LABEL_CALENDAR}</span>
        </TabsTrigger>
        <TabsTrigger
          value="cards"
          className={cn(PLANNER_CALENDAR_TAB_TRIGGER, "max-md:hidden")}
          aria-label="Card"
        >
          <SquaresFourIcon className="size-3.5" />
          <span className="hidden sm:inline">Card</span>
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className={PLANNER_CALENDAR_TAB_TRIGGER}
          aria-label="List"
        >
          <ListIcon className="size-3.5 md:hidden" />
          <TableIcon className="hidden size-3.5 md:block" />
          <span className="inline md:hidden">List</span>
          <span className="hidden sm:inline md:inline">Table</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
