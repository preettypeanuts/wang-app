"use client";

import { CalendarBlankIcon, ChartBarIcon } from "@/lib/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePayplanPageTab } from "@/components/planner/payplan-page-tab-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAYPLAN_ROUTE } from "@/config/navigation";
import {
  getPayplanTabState,
  setPayplanTabState,
  syncPayplanTabUrl,
} from "@/lib/payplan/payplan-tab-store";
import { cn } from "@/lib/utils";
import type { PlannerTab } from "@/types/planner";

interface PlannerTabBarProps {
  tab: PlannerTab;
  monthKey: string;
  className?: string;
}

function isPayplanPath(pathname: string): boolean {
  return pathname === PAYPLAN_ROUTE || pathname.startsWith(`${PAYPLAN_ROUTE}/`);
}

export function PlannerTabBar({
  tab: tabProp,
  monthKey,
  className,
}: PlannerTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabContext = usePayplanPageTab();
  const tab = tabContext?.tab ?? tabProp;

  function navigate(nextTab: PlannerTab) {
    if (tabContext) {
      tabContext.setTab(nextTab);
      return;
    }

    if (isPayplanPath(pathname)) {
      const resolvedMonthKey = monthKey || getPayplanTabState().monthKey;
      if (resolvedMonthKey) {
        setPayplanTabState(nextTab, resolvedMonthKey);
        syncPayplanTabUrl(nextTab, resolvedMonthKey);
        return;
      }
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
      className={cn("w-fit shrink-0", className)}
    >
      <TabsList className="h-8">
        <TabsTrigger
          value="calendar"
          className="gap-1.5 px-2.5 text-xs"
          aria-label="Kalender"
        >
          <CalendarBlankIcon className="size-3.5" />
          <span className="hidden sm:inline">Kalender</span>
        </TabsTrigger>
        <TabsTrigger
          value="budget"
          className="gap-1.5 px-2.5 text-xs"
          aria-label="Budget"
        >
          <ChartBarIcon className="size-3.5" />
          <span className="hidden sm:inline">Budget</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
