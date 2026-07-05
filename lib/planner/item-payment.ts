import { getPlannedItemPaymentStatus } from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

export function canMarkPlannedItemPaid(item: PlannedItemRecord): boolean {
  if (item.flowType === "income") {
    return false;
  }

  const paymentStatus = getPlannedItemPaymentStatus(item);
  return paymentStatus?.status === "pending";
}

export function getPlannedItemPaymentIndex(item: PlannedItemRecord): number {
  return item.paidInstallmentCount;
}

export function getMarkPlannedItemPaidLabel(): string {
  return "Paid";
}
