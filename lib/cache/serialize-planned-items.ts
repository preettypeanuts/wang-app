import type { PlannedItemRecord, PlannedOccurrence } from "@/types/planner";

export type SerializedPlannedItemRecord = Omit<
  PlannedItemRecord,
  "startAt" | "endAt"
> & {
  startAt: string;
  endAt: string | null;
};

export type SerializedPlannedOccurrence = Omit<PlannedOccurrence, "dueAt"> & {
  dueAt: string;
};

export function serializePlannedItem(
  item: PlannedItemRecord,
): SerializedPlannedItemRecord {
  return {
    ...item,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt?.toISOString() ?? null,
  };
}

export function hydratePlannedItem(
  item: SerializedPlannedItemRecord,
): PlannedItemRecord {
  return {
    ...item,
    startAt: new Date(item.startAt),
    endAt: item.endAt ? new Date(item.endAt) : null,
  };
}

export function serializePlannedOccurrence(
  item: PlannedOccurrence,
): SerializedPlannedOccurrence {
  return {
    ...item,
    dueAt: item.dueAt.toISOString(),
  };
}

export function hydratePlannedOccurrence(
  item: SerializedPlannedOccurrence,
): PlannedOccurrence {
  return {
    ...item,
    dueAt: new Date(item.dueAt),
  };
}
