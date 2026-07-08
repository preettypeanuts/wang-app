import {
  getPlannedItemPaymentStatus,
  isPlannedItemInfinite,
} from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

export function canMarkPlannedItemPaid(item: PlannedItemRecord): boolean {
  if (item.flowType === "income") {
    return false;
  }

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

export function getPlannedItemPaymentIndex(item: PlannedItemRecord): number {
  return item.paidInstallmentCount;
}

export function getMarkPlannedItemPaidLabel(): string {
  return "Paid";
}
