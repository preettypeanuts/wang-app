import {
  formatPayPlanDueInDays,
  formatPayPlanExpectedInDays,
  formatPayPlanInstallmentPaid,
  formatPayPlanInstallmentReceived,
  PAYPLAN_LABEL_ALREADY_PAID,
  PAYPLAN_LABEL_ALREADY_RECEIVED,
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

/** Income counterpart of payable — can be marked as received. */
export function isReceivableOccurrence(item: PlannedOccurrence): boolean {
  return item.type === "income" && item.installmentIndex !== null;
}

/** Either an expense to pay or income to receive. */
export function isTrackableOccurrence(item: PlannedOccurrence): boolean {
  return item.installmentIndex !== null;
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

export function canMarkOccurrenceReceived(item: PlannedOccurrence): boolean {
  return isReceivableOccurrence(item) && !isOccurrencePaid(item);
}

/** Interactive: can be marked done regardless of flow direction. */
export function canMarkOccurrenceDone(item: PlannedOccurrence): boolean {
  return isTrackableOccurrence(item) && !isOccurrencePaid(item);
}

function getDaysUntilDue(dueDate: Date, referenceDate: Date): number {
  const today = startOfDay(referenceDate);

  return Math.round((startOfDay(dueDate).getTime() - today.getTime()) / 86_400_000);
}

function getSettledLabel(item: PlannedOccurrence): string {
  if (item.type === "income") {
    return isInstallmentOccurrence(item)
      ? formatPayPlanInstallmentReceived(getInstallmentDisplayNumber(item))
      : PAYPLAN_LABEL_ALREADY_RECEIVED;
  }

  if (isInstallmentOccurrence(item)) {
    return formatPayPlanInstallmentPaid(getInstallmentDisplayNumber(item));
  }

  return PAYPLAN_LABEL_ALREADY_PAID;
}

function getCountdownLabel(item: PlannedOccurrence, daysUntil: number): string {
  return item.type === "income"
    ? formatPayPlanExpectedInDays(daysUntil)
    : formatPayPlanDueInDays(daysUntil);
}

export function getOccurrencePaymentStatus(
  item: PlannedOccurrence,
  referenceDate: Date = new Date(),
): OccurrencePaymentStatus | null {
  if (!isTrackableOccurrence(item)) {
    return null;
  }

  if (isOccurrencePaid(item)) {
    return {
      status: "paid",
      label: getSettledLabel(item),
      daysUntil: null,
    };
  }

  const daysUntil = getDaysUntilDue(item.dueAt, referenceDate);

  return {
    status: "pending",
    label: getCountdownLabel(item, daysUntil),
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
