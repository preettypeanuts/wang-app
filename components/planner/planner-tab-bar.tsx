"use client";

import {
  CalendarBlankIcon,
  SquaresFourIcon,
  TableIcon,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PlannerTab } from "@/types/planner";

interface PlannerTabBarProps {
  tab: PlannerTab;
  monthKey: string;
  className?: string;
}

export function PlannerTabBar({ tab, monthKey, className }: PlannerTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(nextTab: PlannerTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    params.delete("layout");

    if (nextTab === "calendar") {
      params.set("month", monthKey);
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
          value="cards"
          className="gap-1.5 px-2.5 text-xs"
          aria-label="Card"
        >
          <SquaresFourIcon className="size-3.5" />
          <span className="hidden sm:inline">Card</span>
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className="gap-1.5 px-2.5 text-xs"
          aria-label="Table"
        >
          <TableIcon className="size-3.5" />
          <span className="hidden sm:inline">Table</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
