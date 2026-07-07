import {
  addDays,
  dateInputFromCalendarDate,
  endOfDay,
  parseDateOnlyInput,
  startOfDay,
} from "@/lib/finance/day-range";
import { formatCompactDayMonth, formatJournalDate } from "@/lib/finance/format-datetime";
import {
  formatPlannerMonthLabel,
  getDaysInMonth,
  getMonthRange,
  toMonthKey,
} from "@/lib/planner/calendar";

export interface JournalDateRange {
  from: string;
  to: string;
}

export function getDefaultJournalDateRange(
  reference: Date = new Date(),
): JournalDateRange {
  const anchor = startOfDay(reference);
  const { start } = getMonthRange(anchor.getFullYear(), anchor.getMonth());

  return {
    from: dateInputFromCalendarDate(start),
    to: dateInputFromCalendarDate(anchor),
  };
}

export function getLastMonthJournalDateRange(
  reference: Date = new Date(),
): JournalDateRange {
  const anchor = startOfDay(reference);
  const lastMonth = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  const { start, end } = getMonthRange(
    lastMonth.getFullYear(),
    lastMonth.getMonth(),
  );

  return {
    from: dateInputFromCalendarDate(start),
    to: dateInputFromCalendarDate(end),
  };
}

export function getLast30DaysJournalDateRange(
  reference: Date = new Date(),
): JournalDateRange {
  const anchor = startOfDay(reference);

  return {
    from: dateInputFromCalendarDate(addDays(anchor, -29)),
    to: dateInputFromCalendarDate(anchor),
  };
}

export function resolveJournalDateRangeBounds(range: JournalDateRange): {
  start: Date;
  end: Date;
} {
  const fromDate = parseDateOnlyInput(range.from);
  const toDate = parseDateOnlyInput(range.to);

  if (!fromDate || !toDate) {
    const fallback = getDefaultJournalDateRange();
    return resolveJournalDateRangeBounds(fallback);
  }

  const start = startOfDay(fromDate);
  const end = endOfDay(toDate);

  if (start.getTime() > end.getTime()) {
    return { start: startOfDay(toDate), end: endOfDay(fromDate) };
  }

  return { start, end };
}

function differenceInCalendarDays(end: Date, start: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay,
  );
}

export function getPreviousJournalDateRange(
  range: JournalDateRange,
): JournalDateRange {
  const { start, end } = resolveJournalDateRangeBounds(range);
  const dayCount = differenceInCalendarDays(end, start) + 1;
  const previousEnd = endOfDay(addDays(start, -1));
  const previousStart = startOfDay(addDays(previousEnd, -(dayCount - 1)));

  return {
    from: dateInputFromCalendarDate(previousStart),
    to: dateInputFromCalendarDate(previousEnd),
  };
}

function isFullCalendarMonth(range: JournalDateRange): boolean {
  const { start, end } = resolveJournalDateRangeBounds(range);
  const isFirstDay = start.getDate() === 1;
  const lastDay = getDaysInMonth(start.getFullYear(), start.getMonth());
  const isLastDay =
    end.getDate() === lastDay &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  return isFirstDay && isLastDay;
}

export function formatJournalPeriodLabel(range: JournalDateRange): string {
  const { start, end } = resolveJournalDateRangeBounds(range);

  if (isFullCalendarMonth(range)) {
    return formatPlannerMonthLabel(
      toMonthKey(start.getFullYear(), start.getMonth()),
    );
  }

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const monthYear = start.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    return `${start.getDate()}–${end.getDate()} ${monthYear}`;
  }

  return `${formatCompactDayMonth(start)} – ${formatJournalDate(end)}`;
}

export function formatJournalComparisonLabel(range: JournalDateRange): string {
  const previous = getPreviousJournalDateRange(range);
  return `vs ${formatJournalPeriodLabel(previous)}`;
}

export function isDefaultJournalDateRange(
  range: JournalDateRange,
  reference: Date = new Date(),
): boolean {
  const defaults = getDefaultJournalDateRange(reference);
  return range.from === defaults.from && range.to === defaults.to;
}

export function normalizeJournalDateRange(
  from: string,
  to: string,
): JournalDateRange {
  const fromDate = parseDateOnlyInput(from);
  const toDate = parseDateOnlyInput(to);

  if (!fromDate || !toDate) {
    return getDefaultJournalDateRange();
  }

  if (fromDate.getTime() <= toDate.getTime()) {
    return { from, to };
  }

  return {
    from: to,
    to: from,
  };
}
