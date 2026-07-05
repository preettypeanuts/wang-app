"use client";

import {
  PLANNER_CALENDAR_NAV_BUTTON,
  PLANNER_CALENDAR_NAV_GROUP,
} from "@/config/planner-calendar";
import { formatPlannerMonthLabel } from "@/lib/planner/calendar";
import { cn } from "@/lib/utils";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PlannerCalendarHeaderProps {
  monthKey: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}

export function PlannerCalendarHeader({
  monthKey,
  onPrevious,
  onToday,
  onNext,
}: PlannerCalendarHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <h2 className="truncate text-base font-semibold capitalize tracking-tight text-foreground/95 sm:text-lg">
        {formatPlannerMonthLabel(monthKey)}
      </h2>

      <div className={PLANNER_CALENDAR_NAV_GROUP}>
        <button
          type="button"
          aria-label="Bulan sebelumnya"
          onClick={onPrevious}
          className={cn(PLANNER_CALENDAR_NAV_BUTTON, "w-7")}
        >
          <CaretLeftIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className={cn(
            PLANNER_CALENDAR_NAV_BUTTON,
            "border-x border-black/10 px-2.5 text-[11px] font-medium dark:border-white/12",
          )}
        >
          Hari ini
        </button>
        <button
          type="button"
          aria-label="Bulan berikutnya"
          onClick={onNext}
          className={cn(PLANNER_CALENDAR_NAV_BUTTON, "w-7")}
        >
          <CaretRightIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
