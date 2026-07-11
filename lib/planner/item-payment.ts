import {
  PAYPLAN_LABEL_MARK_PAID,
  PAYPLAN_LABEL_MARK_RECEIVED,
} from "@/config/payplan-labels";
import {
  getPlannedItemPaymentStatus,
  isPlannedItemInfinite,
} from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

function hasMarkablePeriod(item: PlannedItemRecord): boolean {
  if (
    item.installmentCount !== null &&
    item.paidInstallmentCount < item.installmentCount
  ) {
    return true;
  }

  const paymentStatus = getPlannedItemPaymentStatus(item);

  if (paymentStatus?.status === "pending") {
    return true;
  }

  if (
    paymentStatus?.status === "paid" &&
    paymentStatus.daysUntil !== null &&
    isPlannedItemInfinite(item)
  ) {
    return true;
  }

  return false;
}

/** Expense-only mark-paid gate (chat, inbox, list views stay bills-focused). */
export function canMarkPlannedItemPaid(item: PlannedItemRecord): boolean {
  if (item.flowType === "income") {
    return false;
  }

  return hasMarkablePeriod(item);
}

/** Flow-agnostic gate: mark paid (expense) or received (income). */
export function canMarkPlannedItemDone(item: PlannedItemRecord): boolean {
  return hasMarkablePeriod(item);
}

export function getPlannedItemPaymentIndex(item: PlannedItemRecord): number {
  return item.paidInstallmentCount;
}

export function getMarkPlannedItemPaidLabel(): string {
  return PAYPLAN_LABEL_MARK_PAID;
}

export function getMarkPlannedItemActionLabel(item: PlannedItemRecord): string {
  return item.flowType === "income"
    ? PAYPLAN_LABEL_MARK_RECEIVED
    : PAYPLAN_LABEL_MARK_PAID;
}
