import {
  addDays,
  endOfDay,
  startOfDay,
} from "@/lib/finance/day-range";
import type { PlannedItemRecord, PlannedOccurrence } from "@/types/planner";

function clampDayOfMonth(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return startOfDay(new Date(year, month, Math.min(day, lastDay)));
}

function addMonthsPreserveDay(value: Date, months: number, anchorDay: number): Date {
  const next = new Date(value.getFullYear(), value.getMonth() + months, 1);
  return clampDayOfMonth(next.getFullYear(), next.getMonth(), anchorDay);
}

function addWeeks(value: Date, weeks: number): Date {
  return addDays(value, weeks * 7);
}

function addYearsPreserveDay(value: Date, years: number, anchorDay: number): Date {
  const next = new Date(value.getFullYear() + years, value.getMonth(), 1);
  return clampDayOfMonth(next.getFullYear(), next.getMonth(), anchorDay);
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

  return date.getTime() <= endOfDay(item.endAt).getTime();
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
  const anchorDay = item.startAt.getDate();
  const occurrences: PlannedOccurrence[] = [];
  let cursor = clampDayOfMonth(
    item.startAt.getFullYear(),
    item.startAt.getMonth(),
    anchorDay,
  );
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
    cursor = addMonthsPreserveDay(cursor, 1, anchorDay);

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
  let cursor = startOfDay(item.startAt);
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
    cursor = addWeeks(cursor, 1);

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
  const anchorDay = item.startAt.getDate();
  const occurrences: PlannedOccurrence[] = [];
  let cursor = clampDayOfMonth(
    item.startAt.getFullYear(),
    item.startAt.getMonth(),
    anchorDay,
  );
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
    cursor = addYearsPreserveDay(cursor, 1, anchorDay);

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
