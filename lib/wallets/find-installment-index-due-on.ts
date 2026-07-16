import { getDueDateForInstallmentIndex } from "@/lib/planner/installment-progress";
import { startOfDay, toDayKey } from "@/lib/finance/day-range";
import type { PlannedItemRecord } from "@/types/planner";

/** Installment index whose due date falls on referenceDate, if any. */
export function findInstallmentIndexDueOn(
  item: PlannedItemRecord,
  referenceDate: Date,
): number | null {
  const targetDayKey = toDayKey(referenceDate);
  let index = 0;

  while (index < 600) {
    const dueAt = getDueDateForInstallmentIndex(item, index);

    if (toDayKey(dueAt) === targetDayKey) {
      return index;
    }

    if (startOfDay(dueAt).getTime() > startOfDay(referenceDate).getTime()) {
      return null;
    }

    index += 1;
  }

  return null;
}
