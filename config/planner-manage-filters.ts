import {
  PLANNED_ITEM_KINDS,
  PLANNED_REPEAT_INTERVALS,
} from "@/config/planner-items";
import {
  PAYPLAN_FILTER_ALL_ENDS,
  PAYPLAN_FILTER_ALL_FLOWS,
  PAYPLAN_FILTER_ALL_KINDS,
  PAYPLAN_FILTER_ALL_REPEATS,
  PAYPLAN_FILTER_ALL_STATUS,
  PAYPLAN_FILTER_END_DATE,
  PAYPLAN_FILTER_INSTALLMENTS,
  PAYPLAN_FILTER_NO_END,
  PAYPLAN_FILTER_PAID,
  PAYPLAN_FILTER_UNPAID,
} from "@/config/payplan-labels";
import { UI_LABEL_EXPENSE, UI_LABEL_INCOME } from "@/config/ui-labels";
import type {
  PlannedEndMode,
  PlannedItemKind,
  PlannedRepeatInterval,
} from "@/types/planner";

export const PLANNED_ITEMS_DEFAULT_FILTERS = {
  q: "",
  kind: "all",
  repeat: "all",
  flowType: "all",
  endMode: "all",
  paymentStatus: "all",
} as const;

export const PLANNED_ITEMS_PAYMENT_OPTIONS = [
  { value: "all", label: PAYPLAN_FILTER_ALL_STATUS },
  { value: "unpaid", label: PAYPLAN_FILTER_UNPAID },
  { value: "paid", label: PAYPLAN_FILTER_PAID },
] as const;

export const PLANNED_ITEMS_FLOW_OPTIONS = [
  { value: "all", label: PAYPLAN_FILTER_ALL_FLOWS },
  { value: "expense", label: UI_LABEL_EXPENSE },
  { value: "income", label: UI_LABEL_INCOME },
] as const;

export const PLANNED_ITEMS_END_MODE_OPTIONS: {
  value: PlannedEndMode | "all";
  label: string;
}[] = [
  { value: "all", label: PAYPLAN_FILTER_ALL_ENDS },
  { value: "never", label: PAYPLAN_FILTER_NO_END },
  { value: "installments", label: PAYPLAN_FILTER_INSTALLMENTS },
  { value: "date", label: PAYPLAN_FILTER_END_DATE },
];

export const PLANNED_ITEMS_KIND_OPTIONS: {
  value: PlannedItemKind | "all";
  label: string;
}[] = [
  { value: "all", label: PAYPLAN_FILTER_ALL_KINDS },
  ...PLANNED_ITEM_KINDS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  })),
];

export const PLANNED_ITEMS_REPEAT_OPTIONS: {
  value: PlannedRepeatInterval | "all";
  label: string;
}[] = [
  { value: "all", label: PAYPLAN_FILTER_ALL_REPEATS },
  ...PLANNED_REPEAT_INTERVALS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  })),
];
