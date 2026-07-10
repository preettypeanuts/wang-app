import {
  UI_LABEL_DATE_FROM,
  UI_LABEL_DATE_UNTIL,
  UI_LABEL_LAST_30_DAYS,
  UI_LABEL_LAST_7_DAYS,
  UI_LABEL_THIS_MONTH,
} from "@/config/ui-labels";
import {
  addDays,
  dateInputFromCalendarDate,
  endOfDay,
  parseDayKey,
  startOfDay,
  todayDateInputValue,
} from "@/lib/finance/day-range";
import { formatCompactDayMonth } from "@/lib/finance/format-datetime";
import type { JournalFilters } from "@/types/journal";

export interface JournalDateRangeBounds {
  start: Date;
  end: Date;
}

export interface JournalDateRangePreset {
  label: string;
  dateFrom: string;
  dateTo: string;
}

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidJournalDateInput(value: string): boolean {
  return DAY_KEY_PATTERN.test(value);
}

export function isJournalDateRangeActive(filters: JournalFilters): boolean {
  return Boolean(filters.dateFrom || filters.dateTo);
}

export function resolveJournalDateRangeBounds(
  filters: JournalFilters,
): JournalDateRangeBounds | null {
  if (!filters.dateFrom && !filters.dateTo) {
    return null;
  }

  const start = filters.dateFrom
    ? startOfDay(parseDayKey(filters.dateFrom))
    : startOfDay(parseDayKey("1970-01-01"));

  const end = filters.dateTo
    ? endOfDay(parseDayKey(filters.dateTo))
    : endOfDay(new Date());

  if (start.getTime() > end.getTime()) {
    return null;
  }

  return { start, end };
}

export function formatJournalDateRangeLabel(
  filters: JournalFilters,
): string | null {
  if (!filters.dateFrom && !filters.dateTo) {
    return null;
  }

  if (filters.dateFrom && filters.dateTo) {
    return `${formatCompactDayMonth(filters.dateFrom)} – ${formatCompactDayMonth(filters.dateTo)}`;
  }

  if (filters.dateFrom) {
    return `${UI_LABEL_DATE_FROM} ${formatCompactDayMonth(filters.dateFrom)}`;
  }

  return `${UI_LABEL_DATE_UNTIL} ${formatCompactDayMonth(filters.dateTo!)}`;
}

export function getJournalDateRangePresets(): JournalDateRangePreset[] {
  const today = todayDateInputValue();
  const todayDate = parseDayKey(today);
  const { year, month } = {
    year: todayDate.getFullYear(),
    month: todayDate.getMonth(),
  };
  const monthStart = dateInputFromCalendarDate(new Date(year, month, 1));

  return [
    {
      label: UI_LABEL_LAST_7_DAYS,
      dateFrom: dateInputFromCalendarDate(addDays(todayDate, -6)),
      dateTo: today,
    },
    {
      label: UI_LABEL_LAST_30_DAYS,
      dateFrom: dateInputFromCalendarDate(addDays(todayDate, -29)),
      dateTo: today,
    },
    {
      label: UI_LABEL_THIS_MONTH,
      dateFrom: monthStart,
      dateTo: today,
    },
  ];
}
