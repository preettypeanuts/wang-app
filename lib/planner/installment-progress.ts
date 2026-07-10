import {
  clampDateOnlyDay,
  dateOnlyFromParts,
  getDateOnlyParts,
  startOfDay,
} from "@/lib/finance/day-range";
import {
  formatPayPlanDueInDays,
  formatPayPlanDueInDaysLower,
  formatPayPlanPaidOn,
  formatPayPlanPaidOnWithDue,
  formatPayPlanPaidOnWithNext,
} from "@/config/payplan-labels";
import type { PlannedItemRecord, PlannedRepeatInterval } from "@/types/planner";

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

function getFirstDueDate(item: PlannedItemRecord): Date {
  switch (item.repeat) {
    case "weekly":
      return item.startAt;
    case "yearly": {
      const { year, month, day } = getDateOnlyParts(item.startAt);
      return clampDateOnlyDay(year, month, day);
    }
    default: {
      const { year, month, day } = getDateOnlyParts(item.startAt);
      return clampDateOnlyDay(year, month, day);
    }
  }
}

function getNextDueDate(item: PlannedItemRecord, current: Date): Date {
  const anchorDay = getDateOnlyParts(item.startAt).day;

  switch (item.repeat) {
    case "weekly":
      return addWeeksDateOnly(current, 1);
    case "yearly":
      return addYearsDateOnly(current, 1, anchorDay);
    default:
      return addMonthsDateOnly(current, 1, anchorDay);
  }
}

export interface InstallmentProgress {
  completed: number;
  total: number;
  ratio: number;
}

export type InstallmentPaymentStatusState = "paid" | "pending";

export interface InstallmentPaymentStatus {
  status: InstallmentPaymentStatusState;
  label: string;
  daysUntil: number | null;
}

export function getDueDateForInstallmentIndex(
  item: PlannedItemRecord,
  index: number,
): Date {
  let cursor = getFirstDueDate(item);

  for (let step = 0; step < index; step += 1) {
    cursor = getNextDueDate(item, cursor);
  }

  return cursor;
}

export interface PlannedInstallmentScheduleEntry {
  index: number;
  dueAt: Date;
  isPaid: boolean;
}

export function getPlannedItemInstallmentSchedule(
  item: PlannedItemRecord,
): PlannedInstallmentScheduleEntry[] {
  if (!item.installmentCount) {
    return [];
  }

  return Array.from({ length: item.installmentCount }, (_, index) => ({
    index,
    dueAt: getDueDateForInstallmentIndex(item, index),
    isPaid: index < item.paidInstallmentCount,
  }));
}

function formatDaysUntilLabel(daysUntil: number): string {
  if (daysUntil > 0) {
    return `in ${daysUntil} days`;
  }

  if (daysUntil === 0) {
    return "today";
  }

  return `${Math.abs(daysUntil)} days ago`;
}

function formatDueCountdown(daysUntil: number): string {
  return formatPayPlanDueInDays(daysUntil);
}

function getDaysUntilDue(dueDate: Date, referenceDate: Date): number {
  const today = startOfDay(referenceDate);

  return Math.round(
    (startOfDay(dueDate).getTime() - today.getTime()) / 86_400_000,
  );
}

function isWithinOccurrenceLimit(
  item: PlannedItemRecord,
  index: number,
): boolean {
  if (item.installmentCount !== null) {
    return index < item.installmentCount;
  }

  return true;
}

function isOccurrenceBeforeEnd(item: PlannedItemRecord, date: Date): boolean {
  if (!item.endAt) {
    return true;
  }

  return date.getTime() <= item.endAt.getTime();
}

function countElapsedPeriods(
  item: PlannedItemRecord,
  referenceDate: Date = new Date(),
): number {
  const today = startOfDay(referenceDate);
  const start = item.startAt;
  let cursor = getFirstDueDate(item);
  let completed = 0;
  let index = 0;

  while (isWithinOccurrenceLimit(item, index)) {
    if (cursor.getTime() > today.getTime()) {
      break;
    }

    if (
      cursor.getTime() >= start.getTime() &&
      isOccurrenceBeforeEnd(item, cursor)
    ) {
      completed += 1;
    }

    index += 1;

    if (!isWithinOccurrenceLimit(item, index)) {
      break;
    }

    cursor = getNextDueDate(item, cursor);

    if (!isOccurrenceBeforeEnd(item, cursor)) {
      break;
    }

    if (index > 600) {
      break;
    }
  }

  return completed;
}

export function getPlannedItemPaymentStatus(
  item: PlannedItemRecord,
  referenceDate: Date = new Date(),
): InstallmentPaymentStatus | null {
  if (item.flowType === "income") {
    return null;
  }

  const paid = item.paidInstallmentCount;
  const total = item.installmentCount;
  const elapsed = countElapsedPeriods(item, referenceDate);
  const hasInstallments = total !== null && total > 0;

  if (hasInstallments && paid >= total) {
    const lastPaidDate = getDueDateForInstallmentIndex(item, total - 1);

    return {
      status: "paid",
      label: formatPayPlanPaidOn(lastPaidDate),
      daysUntil: null,
    };
  }

  if (paid >= elapsed && paid > 0) {
    const lastPaidDate = getDueDateForInstallmentIndex(item, paid - 1);
    const nextDueDate = getDueDateForInstallmentIndex(item, paid);

    if (!isOccurrenceBeforeEnd(item, nextDueDate)) {
      return {
        status: "paid",
        label: formatPayPlanPaidOn(lastPaidDate),
        daysUntil: null,
      };
    }

    const daysUntil = getDaysUntilDue(nextDueDate, referenceDate);

    if (hasInstallments) {
      return {
        status: "paid",
        label: formatPayPlanPaidOnWithNext(lastPaidDate, daysUntil),
        daysUntil,
      };
    }

    const nextDueLabel =
      daysUntil > 0
        ? formatPayPlanDueInDaysLower(daysUntil)
        : formatDueCountdown(daysUntil).toLowerCase();

    return {
      status: "paid",
      label: formatPayPlanPaidOnWithDue(lastPaidDate, nextDueLabel),
      daysUntil,
    };
  }

  const dueDate = getDueDateForInstallmentIndex(item, paid);

  if (!isOccurrenceBeforeEnd(item, dueDate)) {
    return null;
  }

  const daysUntil = getDaysUntilDue(dueDate, referenceDate);

  return {
    status: "pending",
    label: formatDueCountdown(daysUntil),
    daysUntil,
  };
}

export function getInstallmentPaymentStatus(
  item: PlannedItemRecord,
  referenceDate: Date = new Date(),
): InstallmentPaymentStatus | null {
  return getPlannedItemPaymentStatus(item, referenceDate);
}

export function getInstallmentProgress(
  item: PlannedItemRecord,
  referenceDate: Date = new Date(),
): InstallmentProgress | null {
  if (!item.installmentCount) {
    return null;
  }

  const total = item.installmentCount;

  if (item.kind === "installment") {
    const completed = Math.min(item.paidInstallmentCount, total);
    const ratio = total > 0 ? completed / total : 0;

    return { completed, total, ratio };
  }

  const today = startOfDay(referenceDate);
  let cursor = getFirstDueDate(item);
  let completed = 0;

  for (let index = 0; index < item.installmentCount; index += 1) {
    if (cursor.getTime() > today.getTime()) {
      break;
    }

    completed += 1;

    if (index + 1 < item.installmentCount) {
      cursor = getNextDueDate(item, cursor);
    }
  }

  const ratio = total > 0 ? Math.min(completed / total, 1) : 0;

  return { completed, total, ratio };
}

export function getInstallmentEndDate(item: PlannedItemRecord): Date | null {
  if (!item.installmentCount) {
    return null;
  }

  let cursor = getFirstDueDate(item);

  for (let index = 1; index < item.installmentCount; index += 1) {
    cursor = getNextDueDate(item, cursor);
  }

  return cursor;
}

export function computeInstallmentScheduleFromAmounts(
  startAt: Date,
  repeat: PlannedRepeatInterval,
  totalAmount: number,
  paymentAmount: number,
): { installmentCount: number; endAt: Date } | null {
  if (totalAmount <= 0 || paymentAmount <= 0) {
    return null;
  }

  if (Number.isNaN(startAt.getTime())) {
    return null;
  }

  const installmentCount = Math.ceil(totalAmount / paymentAmount);

  if (installmentCount > 600) {
    return null;
  }

  const scheduleItem: PlannedItemRecord = {
    id: "",
    name: "",
    kind: "installment",
    repeat,
    amount: paymentAmount,
    flowType: "expense",
    category: "shopping",
    startAt,
    endAt: null,
    installmentCount,
    paidInstallmentCount: 0,
    note: null,
  };

  const endAt = getInstallmentEndDate(scheduleItem);
  if (!endAt || Number.isNaN(endAt.getTime())) {
    return null;
  }

  return { installmentCount, endAt };
}

export function isPlannedItemInfinite(item: PlannedItemRecord): boolean {
  return !item.installmentCount && !item.endAt;
}
