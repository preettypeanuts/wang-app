import { formatDayMonth } from "@/lib/finance/format-datetime";
import { endOfDay, startOfDay } from "@/lib/finance/day-range";
import type { PlannedItemRecord } from "@/types/planner";

function clampDayOfMonth(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return startOfDay(new Date(year, month, Math.min(day, lastDay)));
}

function addMonthsPreserveDay(value: Date, months: number, anchorDay: number): Date {
  const next = new Date(value.getFullYear(), value.getMonth() + months, 1);
  return clampDayOfMonth(next.getFullYear(), next.getMonth(), anchorDay);
}

function addWeeks(value: Date, weeks: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + weeks * 7);
  return startOfDay(next);
}

function addYearsPreserveDay(value: Date, years: number, anchorDay: number): Date {
  const next = new Date(value.getFullYear() + years, value.getMonth(), 1);
  return clampDayOfMonth(next.getFullYear(), next.getMonth(), anchorDay);
}

function getFirstDueDate(item: PlannedItemRecord): Date {
  switch (item.repeat) {
    case "weekly":
      return startOfDay(item.startAt);
    case "yearly":
      return clampDayOfMonth(
        item.startAt.getFullYear(),
        item.startAt.getMonth(),
        item.startAt.getDate(),
      );
    default:
      return clampDayOfMonth(
        item.startAt.getFullYear(),
        item.startAt.getMonth(),
        item.startAt.getDate(),
      );
  }
}

function getNextDueDate(item: PlannedItemRecord, current: Date): Date {
  switch (item.repeat) {
    case "weekly":
      return addWeeks(current, 1);
    case "yearly":
      return addYearsPreserveDay(current, 1, item.startAt.getDate());
    default:
      return addMonthsPreserveDay(current, 1, item.startAt.getDate());
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

function formatDaysUntilLabel(daysUntil: number): string {
  if (daysUntil > 0) {
    return `${daysUntil} hari lagi`;
  }

  if (daysUntil === 0) {
    return "hari ini";
  }

  return `${Math.abs(daysUntil)} hari lalu`;
}

function formatDueCountdown(daysUntil: number): string {
  if (daysUntil > 0) {
    return `Jatuh tempo dalam ${daysUntil} hari`;
  }

  if (daysUntil === 0) {
    return "Jatuh tempo hari ini";
  }

  return `Jatuh tempo ${Math.abs(daysUntil)} hari lalu`;
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

  return date.getTime() <= endOfDay(item.endAt).getTime();
}

function countElapsedPeriods(
  item: PlannedItemRecord,
  referenceDate: Date = new Date(),
): number {
  const today = startOfDay(referenceDate);
  const start = startOfDay(item.startAt);
  let cursor = getFirstDueDate(item);
  let completed = 0;
  let index = 0;

  while (isWithinOccurrenceLimit(item, index)) {
    if (cursor.getTime() > today.getTime()) {
      break;
    }

    if (cursor.getTime() >= start.getTime() && isOccurrenceBeforeEnd(item, cursor)) {
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
      label: `Sudah dibayar pada ${formatDayMonth(lastPaidDate)}`,
      daysUntil: null,
    };
  }

  if (paid >= elapsed && paid > 0) {
    const lastPaidDate = getDueDateForInstallmentIndex(item, paid - 1);
    const nextDueDate = getDueDateForInstallmentIndex(item, paid);

    if (!isOccurrenceBeforeEnd(item, nextDueDate)) {
      return {
        status: "paid",
        label: `Sudah dibayar pada ${formatDayMonth(lastPaidDate)}`,
        daysUntil: null,
      };
    }

    const daysUntil = getDaysUntilDue(nextDueDate, referenceDate);

    if (hasInstallments) {
      return {
        status: "paid",
        label: `Sudah dibayar pada ${formatDayMonth(lastPaidDate)}, cicilan berikutnya ${formatDaysUntilLabel(daysUntil)}`,
        daysUntil,
      };
    }

    const nextDueLabel =
      daysUntil > 0
        ? `jatuh tempo dalam ${daysUntil} hari`
        : formatDueCountdown(daysUntil).toLowerCase();

    return {
      status: "paid",
      label: `Sudah dibayar pada ${formatDayMonth(lastPaidDate)}, ${nextDueLabel}`,
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

  const total = item.installmentCount;
  const ratio = total > 0 ? Math.min(completed / total, 1) : 0;

  return { completed, total, ratio };
}

export function getInstallmentEndDate(
  item: PlannedItemRecord,
): Date | null {
  if (!item.installmentCount) {
    return null;
  }

  let cursor = getFirstDueDate(item);

  for (let index = 1; index < item.installmentCount; index += 1) {
    cursor = getNextDueDate(item, cursor);
  }

  return cursor;
}

export function isPlannedItemInfinite(item: PlannedItemRecord): boolean {
  return !item.installmentCount && !item.endAt;
}
