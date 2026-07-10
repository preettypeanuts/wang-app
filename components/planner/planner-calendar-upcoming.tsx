"use client";

import { PlannerCalendarUpcomingItem } from "@/components/planner/planner-calendar-upcoming-item";
import {
  PAYPLAN_LABEL_DAY_PASSED_HINT,
  PAYPLAN_LABEL_INFLOW,
  PAYPLAN_LABEL_NO_BILLS,
  PAYPLAN_LABEL_NO_SCHEDULED_ON_DATE,
  PAYPLAN_LABEL_OUTFLOW,
  PAYPLAN_LABEL_SELECTED_SCHEDULE,
} from "@/config/payplan-labels";
import {
  PLANNER_CALENDAR_UPCOMING_EMPTY,
  PLANNER_CALENDAR_UPCOMING_FRAME,
  PLANNER_CALENDAR_UPCOMING_HEADER,
  PLANNER_CALENDAR_UPCOMING_LIST,
} from "@/config/planner-calendar";
import { UI_LABEL_TOTAL } from "@/config/ui-labels";
import { PAYPLAN_CALENDAR_UPCOMING_FRAME_MOBILE } from "@/config/payplan-mobile";
import { cn } from "@/lib/utils";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { isPastDay } from "@/lib/planner/calendar";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarUpcomingProps {
  date: Date;
  items: PlannedOccurrence[];
  totalAmount: number;
}

export function PlannerCalendarUpcoming({
  date,
  items,
  totalAmount,
}: PlannerCalendarUpcomingProps) {
  const hasItems = items.length > 0;
  const isPast = isPastDay(date);

  return (
    <section
      className={cn(
        PLANNER_CALENDAR_UPCOMING_FRAME,
        PAYPLAN_CALENDAR_UPCOMING_FRAME_MOBILE,
      )}
    >
      <header className={PLANNER_CALENDAR_UPCOMING_HEADER}>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {PAYPLAN_LABEL_SELECTED_SCHEDULE}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-semibold capitalize">
            {formatWeekday(date)}, {formatDayMonth(date)}
          </h3>
        </div>
        {hasItems ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {UI_LABEL_TOTAL}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground/90">
              {formatIdr(Math.abs(totalAmount))}
              {totalAmount > 0
                ? ` ${PAYPLAN_LABEL_OUTFLOW}`
                : totalAmount < 0
                  ? ` ${PAYPLAN_LABEL_INFLOW}`
                  : ""}
            </p>
          </div>
        ) : null}
      </header>

      {hasItems ? (
        <div className={PLANNER_CALENDAR_UPCOMING_LIST}>
          {items.map((item) => (
            <PlannerCalendarUpcomingItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={PLANNER_CALENDAR_UPCOMING_EMPTY}>
          <p className="text-sm font-medium">{PAYPLAN_LABEL_NO_BILLS}</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {isPast
              ? PAYPLAN_LABEL_DAY_PASSED_HINT
              : PAYPLAN_LABEL_NO_SCHEDULED_ON_DATE}
          </p>
        </div>
      )}
    </section>
  );
}
