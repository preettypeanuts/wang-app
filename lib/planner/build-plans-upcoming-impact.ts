import { unstable_cache } from "next/cache";

import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { addDays, parseDayKey, startOfDay, toDayKey } from "@/lib/finance/day-range";
import { formatCompactDayMonth } from "@/lib/finance/format-datetime";
import {
  getDueDateForInstallmentIndex,
  getPlannedItemPaymentStatus,
} from "@/lib/planner/installment-progress";
import type { PlansUpcomingImpactItem } from "@/types/plan";

const DEFAULT_HORIZON_DAYS = 60;
const MAX_ITEMS = 8;

function formatDaysUntilLabel(daysUntil: number): string {
  if (daysUntil > 0) {
    return `${daysUntil} hari lagi`;
  }

  if (daysUntil === 0) {
    return "hari ini";
  }

  return `${Math.abs(daysUntil)} hari lalu`;
}

export async function getPlansUpcomingImpact(
  userId: string,
  referenceDate: Date = new Date(),
  horizonDays = DEFAULT_HORIZON_DAYS,
): Promise<PlansUpcomingImpactItem[]> {
  const dayKey = toDayKey(referenceDate);

  return unstable_cache(
    () => buildPlansUpcomingImpact(userId, dayKey, horizonDays),
    ["plans-upcoming-impact", userId, dayKey, String(horizonDays)],
    { tags: [userDataTags.plannedItems(userId)] },
  )();
}

async function buildPlansUpcomingImpact(
  userId: string,
  dayKey: string,
  horizonDays: number,
): Promise<PlansUpcomingImpactItem[]> {
  const referenceDate = parseDayKey(dayKey);
  const today = startOfDay(referenceDate);
  const rangeEnd = addDays(today, horizonDays);
  const plannedItems = await getPlannedItemsForExpansion(userId);

  return plannedItems
    .filter((item) => item.flowType === "expense")
    .map((item) => {
      const paymentStatus = getPlannedItemPaymentStatus(item, referenceDate);

      if (!paymentStatus || paymentStatus.status !== "pending") {
        return null;
      }

      const dueAt = getDueDateForInstallmentIndex(
        item,
        item.paidInstallmentCount,
      );
      const daysUntil = paymentStatus.daysUntil ?? 0;

      return {
        id: `${item.id}:${dueAt.toISOString()}`,
        name: item.name,
        amount: item.amount,
        dueAt: dueAt.toISOString(),
        dueLabel: formatCompactDayMonth(dueAt),
        daysUntil,
        daysUntilLabel: formatDaysUntilLabel(daysUntil),
      };
    })
    .filter((item): item is PlansUpcomingImpactItem => {
      if (!item) {
        return false;
      }

      return startOfDay(new Date(item.dueAt)).getTime() <= rangeEnd.getTime();
    })
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt))
    .slice(0, MAX_ITEMS);
}
