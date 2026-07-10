"use client";

import {
  PAYPLAN_LABEL_NEXT_MONTH,
  PAYPLAN_LABEL_PREVIOUS_MONTH,
} from "@/config/payplan-labels";
import {
  APPLE_CALENDAR_HEADER,
  APPLE_CALENDAR_MONTH_TITLE,
  APPLE_CALENDAR_PILL,
} from "@/config/payplan-apple-calendar";
import { CaretLeftIcon, CaretRightIcon } from "@/lib/icons";
import { formatAppleMonthTitle } from "@/lib/planner/calendar";

interface PlannerCalendarMobileHeaderProps {
  monthKey: string;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function PlannerCalendarMobileHeader({
  monthKey,
  year,
  onPrevious,
  onNext,
}: PlannerCalendarMobileHeaderProps) {
  return (
    <header className={APPLE_CALENDAR_HEADER}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className={APPLE_CALENDAR_PILL}
          aria-label={PAYPLAN_LABEL_PREVIOUS_MONTH}
        >
          <CaretLeftIcon className="size-3.5 opacity-80" />
          <span className="tabular-nums">{year}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className={APPLE_CALENDAR_PILL}
          aria-label={PAYPLAN_LABEL_NEXT_MONTH}
        >
          <CaretRightIcon className="size-3.5 opacity-80" />
        </button>
      </div>

      <h2 className={APPLE_CALENDAR_MONTH_TITLE}>
        {formatAppleMonthTitle(monthKey)}
      </h2>
    </header>
  );
}
