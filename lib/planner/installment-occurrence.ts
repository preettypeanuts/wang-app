import {
  formatPayPlanDueInDays,
  formatPayPlanInstallmentPaid,
  PAYPLAN_LABEL_ALREADY_PAID,
} from "@/config/payplan-labels";
import { startOfDay } from "@/lib/finance/day-range";
import type { PlannedOccurrence } from "@/types/planner";

export type OccurrencePaymentStatusState = "paid" | "pending";

export interface OccurrencePaymentStatus {
  status: OccurrencePaymentStatusState;
  label: string;
  daysUntil: number | null;
}

export function isInstallmentOccurrence(item: PlannedOccurrence): boolean {
  return item.installmentCount !== null && item.installmentCount > 0;
}

export function isPayableOccurrence(item: PlannedOccurrence): boolean {
  return item.type === "expense" && item.installmentIndex !== null;
}

export function getInstallmentDisplayNumber(item: PlannedOccurrence): number {
  return (item.installmentIndex ?? 0) + 1;
}

export function isOccurrencePaid(item: PlannedOccurrence): boolean {
  if (item.installmentIndex === null) {
    return false;
  }

  return item.paidInstallmentCount > item.installmentIndex;
}

export function canMarkOccurrencePaid(item: PlannedOccurrence): boolean {
  return isPayableOccurrence(item) && !isOccurrencePaid(item);
}

function getDaysUntilDue(dueDate: Date, referenceDate: Date): number {
  const today = startOfDay(referenceDate);

  return Math.round((startOfDay(dueDate).getTime() - today.getTime()) / 86_400_000);
}

function formatDueCountdown(daysUntil: number): string {
  return formatPayPlanDueInDays(daysUntil);
}

function getPaidLabel(item: PlannedOccurrence): string {
  if (isInstallmentOccurrence(item)) {
    return formatPayPlanInstallmentPaid(getInstallmentDisplayNumber(item));
  }

  return PAYPLAN_LABEL_ALREADY_PAID;
}

export function getOccurrencePaymentStatus(
  item: PlannedOccurrence,
  referenceDate: Date = new Date(),
): OccurrencePaymentStatus | null {
  if (!isPayableOccurrence(item)) {
    return null;
  }

  if (isOccurrencePaid(item)) {
    return {
      status: "paid",
      label: getPaidLabel(item),
      daysUntil: null,
    };
  }

  const daysUntil = getDaysUntilDue(item.dueAt, referenceDate);

  return {
    status: "pending",
    label: formatDueCountdown(daysUntil),
    daysUntil,
  };
}

/** @deprecated Use isOccurrencePaid */
export function isInstallmentOccurrencePaid(item: PlannedOccurrence): boolean {
  return isOccurrencePaid(item);
}

/** @deprecated Use canMarkOccurrencePaid */
export function canMarkInstallmentPaid(item: PlannedOccurrence): boolean {
  return canMarkOccurrencePaid(item);
}
