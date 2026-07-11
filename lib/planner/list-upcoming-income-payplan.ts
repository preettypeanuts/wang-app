import { addDays, startOfDay } from "@/lib/finance/day-range";
import { expandPlannedItems } from "@/lib/planner/expand-planned-items";
import {
  canMarkOccurrenceReceived,
  getOccurrencePaymentStatus,
} from "@/lib/planner/installment-occurrence";
import type { PlannedItemRecord, PlannedOccurrence } from "@/types/planner";

export interface UpcomingIncomePayPlanEntry {
  item: PlannedItemRecord;
  dueAt: Date;
  daysUntil: number;
}

function selectUpcomingOccurrence(
  occurrences: PlannedOccurrence[],
  referenceDate: Date,
): PlannedOccurrence | null {
  const today = startOfDay(referenceDate);
  const pending = occurrences.filter(canMarkOccurrenceReceived);

  if (pending.length === 0) {
    return null;
  }

  const upcoming = pending
    .filter(
      (occurrence) => startOfDay(occurrence.dueAt).getTime() >= today.getTime(),
    )
    .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime());

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  return pending.sort(
    (left, right) => left.dueAt.getTime() - right.dueAt.getTime(),
  )[0];
}

/**
 * Upcoming planned income not yet received — income counterpart of
 * listUpcomingUnpaidPayPlanEntries. Prefers the nearest upcoming occurrence.
 */
export function listUpcomingIncomePayPlanEntries(
  items: PlannedItemRecord[],
  referenceDate: Date = new Date(),
  horizonDays = 60,
): UpcomingIncomePayPlanEntry[] {
  const today = startOfDay(referenceDate);
  const rangeStart = addDays(today, -horizonDays);
  const rangeEnd = addDays(today, horizonDays);
  const itemById = new Map(items.map((item) => [item.id, item]));

  const occurrences = expandPlannedItems(items, rangeStart, rangeEnd).filter(
    (occurrence) => occurrence.type === "income",
  );

  const occurrencesByItem = new Map<string, PlannedOccurrence[]>();

  for (const occurrence of occurrences) {
    const group = occurrencesByItem.get(occurrence.plannedItemId) ?? [];
    group.push(occurrence);
    occurrencesByItem.set(occurrence.plannedItemId, group);
  }

  const entries: UpcomingIncomePayPlanEntry[] = [];

  for (const [plannedItemId, itemOccurrences] of occurrencesByItem) {
    const item = itemById.get(plannedItemId);

    if (!item) {
      continue;
    }

    const selected = selectUpcomingOccurrence(itemOccurrences, referenceDate);

    if (!selected) {
      continue;
    }

    const paymentStatus = getOccurrencePaymentStatus(selected, referenceDate);

    if (!paymentStatus || paymentStatus.daysUntil === null) {
      continue;
    }

    entries.push({
      item,
      dueAt: selected.dueAt,
      daysUntil: paymentStatus.daysUntil,
    });
  }

  return entries;
}
