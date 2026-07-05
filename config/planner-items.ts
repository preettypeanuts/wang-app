import type {
  PlannedItemKind,
  PlannedRepeatInterval,
} from "@/types/planner";

export const PLANNED_ITEM_KINDS: {
  value: PlannedItemKind;
  label: string;
  category: string;
  flowType: "income" | "expense";
}[] = [
  { value: "bill", label: "Bill", category: "housing", flowType: "expense" },
  {
    value: "subscription",
    label: "Subscription",
    category: "subscription",
    flowType: "expense",
  },
  {
    value: "installment",
    label: "Installment",
    category: "shopping",
    flowType: "expense",
  },
  {
    value: "income",
    label: "Income",
    category: "salary",
    flowType: "income",
  },
];

export const PLANNED_REPEAT_INTERVALS: {
  value: PlannedRepeatInterval;
  label: string;
}[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "yearly", label: "Yearly" },
];

export function getPlannedKindLabel(kind: PlannedItemKind): string {
  return (
    PLANNED_ITEM_KINDS.find((entry) => entry.value === kind)?.label ?? kind
  );
}

export function getPlannedRepeatLabel(repeat: PlannedRepeatInterval): string {
  return (
    PLANNED_REPEAT_INTERVALS.find((entry) => entry.value === repeat)?.label ??
    repeat
  );
}

export function getDefaultCategoryForKind(kind: PlannedItemKind): string {
  return (
    PLANNED_ITEM_KINDS.find((entry) => entry.value === kind)?.category ??
    "other"
  );
}

export function getFlowTypeForKind(
  kind: PlannedItemKind,
): "income" | "expense" {
  return (
    PLANNED_ITEM_KINDS.find((entry) => entry.value === kind)?.flowType ??
    "expense"
  );
}
