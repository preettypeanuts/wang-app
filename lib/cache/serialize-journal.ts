import type {
  JournalDaySummary,
  JournalEntry,
  JournalListResult,
} from "@/types/journal";

export type SerializedJournalEntry = Omit<JournalEntry, "occurredAt"> & {
  occurredAt: string;
};

export type SerializedJournalListResult = Omit<JournalListResult, "items"> & {
  items: SerializedJournalEntry[];
};

export type SerializedJournalDaySummary = Omit<JournalDaySummary, "date"> & {
  date: string;
};

export function serializeJournalEntry(
  entry: JournalEntry,
): SerializedJournalEntry {
  return {
    ...entry,
    occurredAt: entry.occurredAt.toISOString(),
  };
}

export function hydrateJournalEntry(entry: SerializedJournalEntry): JournalEntry {
  return {
    ...entry,
    occurredAt: new Date(entry.occurredAt),
  };
}

export function serializeJournalListResult(
  result: JournalListResult,
): SerializedJournalListResult {
  return {
    ...result,
    items: result.items.map(serializeJournalEntry),
  };
}

export function hydrateJournalListResult(
  result: SerializedJournalListResult,
): JournalListResult {
  return {
    ...result,
    items: result.items.map(hydrateJournalEntry),
  };
}

export function serializeJournalDaySummary(
  summary: JournalDaySummary,
): SerializedJournalDaySummary {
  return {
    ...summary,
    date: summary.date.toISOString(),
  };
}

export function hydrateJournalDaySummary(
  summary: SerializedJournalDaySummary,
): JournalDaySummary {
  return {
    ...summary,
    date: new Date(summary.date),
  };
}
