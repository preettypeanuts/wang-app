import { PAYPLAN_FILTER_UNPAID } from "@/config/payplan-labels";
import { getPlannedItemPaymentStatus } from "@/lib/planner/installment-progress";
import {
  canMarkPlannedItemDone,
  getPlannedItemPaymentIndex,
} from "@/lib/planner/item-payment";
import type { UnpaidPayPlanChatItem } from "@/types/chat";
import type { PlannedItemRecord } from "@/types/planner";

export function listUnpaidPayPlanChatItems(
  items: PlannedItemRecord[],
): UnpaidPayPlanChatItem[] {
  return items
    .filter(canMarkPlannedItemDone)
    .map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      category: item.category,
      statusLabel:
        getPlannedItemPaymentStatus(item)?.label ?? PAYPLAN_FILTER_UNPAID,
      installmentIndex: getPlannedItemPaymentIndex(item),
      flowType: item.flowType,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "id"));
}

export function filterUnpaidPayPlanChatItems(
  items: UnpaidPayPlanChatItem[],
  query: string,
): UnpaidPayPlanChatItem[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
    const haystack = `${item.name} ${item.category}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
