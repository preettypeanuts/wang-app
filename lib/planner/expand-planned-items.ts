import {
  clampDateOnlyDay,
  dateOnlyFromParts,
  endOfDay,
  getDateOnlyParts,
  startOfDay,
} from "@/lib/finance/day-range";
import type { PlannedItemRecord, PlannedOccurrence } from "@/types/planner";

function addMonthsDateOnly(
  value: Date,
  months: number,
  anchorDay: number,
): Date {
  const { year, month } = getDateOnlyParts(value);
  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  return clampDateOnlyDay(targetYear, normalizedMonth, anchorDay);
}

function addWeeksDateOnly(value: Date, weeks: number): Date {
  const { year, month, day } = getDateOnlyParts(value);
  const next = dateOnlyFromParts(year, month, day);
  next.setUTCDate(next.getUTCDate() + weeks * 7);
  return next;
}

function addYearsDateOnly(value: Date, years: number, anchorDay: number): Date {
  const { year, month } = getDateOnlyParts(value);
  return clampDateOnlyDay(year + years, month, anchorDay);
}

function isWithinInstallmentLimit(
  item: PlannedItemRecord,
  occurrenceIndex: number,
): boolean {
  if (!item.installmentCount) {
    return true;
  }

  return occurrenceIndex < item.installmentCount;
}

function isBeforeEndDate(item: PlannedItemRecord, date: Date): boolean {
  if (!item.endAt) {
    return true;
  }

  return date.getTime() <= item.endAt.getTime();
}

function toOccurrence(
  item: PlannedItemRecord,
  dueAt: Date,
  installmentIndex: number,
): PlannedOccurrence {
  return {
    id: `${item.id}:${dueAt.toISOString()}`,
    plannedItemId: item.id,
    type: item.flowType,
    amount: item.amount,
    category: item.category,
    title: item.name,
    dueAt,
    note: item.note,
    kind: item.kind,
    installmentIndex,
    installmentCount: item.installmentCount,
    paidInstallmentCount: item.paidInstallmentCount,
  };
}

function expandMonthly(
  item: PlannedItemRecord,
  rangeStart: Date,
  rangeEnd: Date,
): PlannedOccurrence[] {
  const anchorDay = getDateOnlyParts(item.startAt).day;
  const startParts = getDateOnlyParts(item.startAt);
  const occurrences: PlannedOccurrence[] = [];
  let cursor = clampDateOnlyDay(startParts.year, startParts.month, anchorDay);
  let index = 0;

  while (cursor.getTime() <= rangeEnd.getTime()) {
    if (
      cursor.getTime() >= item.startAt.getTime() &&
      cursor.getTime() >= rangeStart.getTime() &&
      isWithinInstallmentLimit(item, index) &&
      isBeforeEndDate(item, cursor)
    ) {
      occurrences.push(toOccurrence(item, cursor, index));
    }

    if (!isWithinInstallmentLimit(item, index + 1)) {
      break;
    }

    index += 1;
    cursor = addMonthsDateOnly(cursor, 1, anchorDay);

    if (index > 600) {
      break;
    }
  }

  return occurrences;
}

function expandWeekly(
  item: PlannedItemRecord,
  rangeStart: Date,
  rangeEnd: Date,
): PlannedOccurrence[] {
  const occurrences: PlannedOccurrence[] = [];
  let cursor = item.startAt;
  let index = 0;

  while (cursor.getTime() <= rangeEnd.getTime()) {
    if (
      cursor.getTime() >= rangeStart.getTime() &&
      isWithinInstallmentLimit(item, index) &&
      isBeforeEndDate(item, cursor)
    ) {
      occurrences.push(toOccurrence(item, cursor, index));
    }

    if (!isWithinInstallmentLimit(item, index + 1)) {
      break;
    }

    index += 1;
    cursor = addWeeksDateOnly(cursor, 1);

    if (index > 520) {
      break;
    }
  }

  return occurrences;
}

function expandYearly(
  item: PlannedItemRecord,
  rangeStart: Date,
  rangeEnd: Date,
): PlannedOccurrence[] {
  const anchorDay = getDateOnlyParts(item.startAt).day;
  const startParts = getDateOnlyParts(item.startAt);
  const occurrences: PlannedOccurrence[] = [];
  let cursor = clampDateOnlyDay(startParts.year, startParts.month, anchorDay);
  let index = 0;

  while (cursor.getTime() <= rangeEnd.getTime()) {
    if (
      cursor.getTime() >= item.startAt.getTime() &&
      cursor.getTime() >= rangeStart.getTime() &&
      isWithinInstallmentLimit(item, index) &&
      isBeforeEndDate(item, cursor)
    ) {
      occurrences.push(toOccurrence(item, cursor, index));
    }

    if (!isWithinInstallmentLimit(item, index + 1)) {
      break;
    }

    index += 1;
    cursor = addYearsDateOnly(cursor, 1, anchorDay);

    if (index > 50) {
      break;
    }
  }

  return occurrences;
}

export function expandPlannedItems(
  items: PlannedItemRecord[],
  rangeStart: Date,
  rangeEnd: Date,
): PlannedOccurrence[] {
  const start = startOfDay(rangeStart);
  const end = endOfDay(rangeEnd);
  const occurrences: PlannedOccurrence[] = [];

  for (const item of items) {
    switch (item.repeat) {
      case "weekly":
        occurrences.push(...expandWeekly(item, start, end));
        break;
      case "yearly":
        occurrences.push(...expandYearly(item, start, end));
        break;
      default:
        occurrences.push(...expandMonthly(item, start, end));
        break;
    }
  }

  return occurrences.sort(
    (left, right) => left.dueAt.getTime() - right.dueAt.getTime(),
  );
}
