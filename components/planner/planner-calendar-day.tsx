"use client";

import { PlannerCalendarEvent } from "@/components/planner/planner-calendar-event";
import {
  getPlannerEventColor,
  PLANNER_CALENDAR_CELL,
  PLANNER_CALENDAR_CELL_HOVER,
  PLANNER_CALENDAR_CELL_SELECTED,
  PLANNER_CALENDAR_DAY_NUMBER,
  PLANNER_CALENDAR_DAY_TODAY,
  PLANNER_MAX_CELL_EVENTS,
  PLANNER_TODAY_CIRCLE_COLOR,
} from "@/config/planner-calendar";
import {
  formatCalendarCellDayLabel,
  isToday,
} from "@/lib/planner/calendar";
import { toDayKey } from "@/lib/finance/day-range";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarDayProps {
  date: Date;
  inMonth: boolean;
  selected: boolean;
  items: PlannedOccurrence[];
  onSelect: (dayKey: string) => void;
}

export function PlannerCalendarDay({
  date,
  inMonth,
  selected,
  items,
  onSelect,
}: PlannerCalendarDayProps) {
  const dayKey = toDayKey(date);
  const today = isToday(date);
  const showMonthLabel = !inMonth && date.getDate() === 1;
  const dayLabel = showMonthLabel
    ? formatCalendarCellDayLabel(date, inMonth)
    : String(date.getDate());
  const visibleItems = items.slice(0, PLANNER_MAX_CELL_EVENTS);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <button
      type="button"
      aria-label={dayKey}
      aria-pressed={selected}
      onClick={() => onSelect(dayKey)}
      className={cn(
        PLANNER_CALENDAR_CELL,
        PLANNER_CALENDAR_CELL_HOVER,
        selected && PLANNER_CALENDAR_CELL_SELECTED,
        !inMonth && "bg-black/2 dark:bg-white/2",
      )}
    >
      <div className="flex shrink-0 justify-end px-0.5 pt-0.5">
        {today ? (
          <span
            className={PLANNER_CALENDAR_DAY_TODAY}
            style={{ backgroundColor: PLANNER_TODAY_CIRCLE_COLOR }}
          >
            {date.getDate()}
          </span>
        ) : (
          <span
            className={cn(
              PLANNER_CALENDAR_DAY_NUMBER,
              !inMonth && "text-[10px] text-muted-foreground/40",
              inMonth && "text-foreground/80",
            )}
          >
            {dayLabel}
          </span>
        )}
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-0.5 pb-0.5">
        {visibleItems.map((item) => (
          <PlannerCalendarEvent
            key={item.id}
            title={item.title}
            dueAt={item.dueAt}
            color={getPlannerEventColor(item.category, item.type)}
            type={item.type}
          />
        ))}
        {hiddenCount > 0 ? (
          <span className="px-0.5 text-[9px] font-medium leading-none text-muted-foreground">
            +{hiddenCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
