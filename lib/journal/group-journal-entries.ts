import { toDayKey } from "@/lib/finance/day-range";
import { formatJournalSectionDate } from "@/lib/finance/format-datetime";
import type { JournalEntry } from "@/types/journal";

export interface JournalEntryGroup {
  dayKey: string;
  label: string;
  totalIncome: number;
  totalExpense: number;
  items: JournalEntry[];
}

function summarizeJournalDay(items: JournalEntry[]) {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of items) {
    // Wallet transfers and balance adjustments — not part of day totals.
    if (item.type === "transfer" || item.type === "adjustment") {
      continue;
    }

    if (item.type === "income") {
      totalIncome += item.amount;
      continue;
    }

    totalExpense += item.amount;
  }

  return { totalIncome, totalExpense };
}

export function groupJournalEntriesByDay(
  items: JournalEntry[],
  referenceDate: Date = new Date(),
): JournalEntryGroup[] {
  const groups = new Map<string, JournalEntry[]>();

  for (const item of items) {
    const dayKey = toDayKey(item.occurredAt);
    const existing = groups.get(dayKey);

    if (existing) {
      existing.push(item);
      continue;
    }

    groups.set(dayKey, [item]);
  }

  return [...groups.entries()].map(([dayKey, groupItems]) => {
    const { totalIncome, totalExpense } = summarizeJournalDay(groupItems);

    return {
      dayKey,
      label: formatJournalSectionDate(groupItems[0].occurredAt, referenceDate),
      totalIncome,
      totalExpense,
      items: groupItems,
    };
  });
}
