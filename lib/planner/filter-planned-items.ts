import { getPlannedItemPaymentStatus } from "@/lib/planner/installment-progress";
import { getPlannedItemIdsForMonthPayment } from "@/lib/planner/month-payment-filter";
import { getPlannedItemEndMode } from "@/lib/validations/planned-item";
import type {
  PlannedItemRecord,
  PlannedItemsFilters,
  PlannedOccurrence,
} from "@/types/planner";

interface FilterPlannedItemsOptions {
  monthOccurrences?: PlannedOccurrence[];
}

export function filterPlannedItems(
  items: PlannedItemRecord[],
  filters: PlannedItemsFilters,
  options: FilterPlannedItemsOptions = {},
): PlannedItemRecord[] {
  const query = filters.q.trim().toLowerCase();
  const monthPaymentItemIds =
    filters.paymentStatus !== "all" && options.monthOccurrences
      ? getPlannedItemIdsForMonthPayment(
          options.monthOccurrences,
          filters.paymentStatus,
        )
      : null;

  return items.filter((item) => {
    if (query) {
      const inName = item.name.toLowerCase().includes(query);
      const inNote = item.note?.toLowerCase().includes(query) ?? false;

      if (!inName && !inNote) {
        return false;
      }
    }

    if (filters.kind !== "all" && item.kind !== filters.kind) {
      return false;
    }

    if (filters.repeat !== "all" && item.repeat !== filters.repeat) {
      return false;
    }

    if (filters.flowType !== "all" && item.flowType !== filters.flowType) {
      return false;
    }

    if (filters.endMode !== "all") {
      const endMode = getPlannedItemEndMode(item);

      if (endMode !== filters.endMode) {
        return false;
      }
    }

    if (filters.paymentStatus !== "all") {
      if (monthPaymentItemIds) {
        if (!monthPaymentItemIds.has(item.id)) {
          return false;
        }
      } else {
        const paymentStatus = getPlannedItemPaymentStatus(item);

        if (filters.paymentStatus === "paid") {
          if (paymentStatus?.status !== "paid") {
            return false;
          }
        } else if (paymentStatus?.status !== "pending") {
          return false;
        }
      }
    }

    return true;
  });
}

export function countActivePlannedItemFilters(
  filters: PlannedItemsFilters,
): number {
  let count = 0;

  if (filters.q.trim()) {
    count += 1;
  }

  if (filters.kind !== "all") {
    count += 1;
  }

  if (filters.repeat !== "all") {
    count += 1;
  }

  if (filters.flowType !== "all") {
    count += 1;
  }

  if (filters.endMode !== "all") {
    count += 1;
  }

  if (filters.paymentStatus !== "all") {
    count += 1;
  }

  return count;
}
