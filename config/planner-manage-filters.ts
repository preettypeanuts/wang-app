import {
  PLANNED_ITEM_KINDS,
  PLANNED_REPEAT_INTERVALS,
} from "@/config/planner-items";
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
  { value: "all", label: "Semua status" },
  { value: "unpaid", label: "Belum dibayar" },
  { value: "paid", label: "Sudah dibayar" },
] as const;

export const PLANNED_ITEMS_FLOW_OPTIONS = [
  { value: "all", label: "Semua arus" },
  { value: "expense", label: UI_LABEL_EXPENSE },
  { value: "income", label: UI_LABEL_INCOME },
] as const;

export const PLANNED_ITEMS_END_MODE_OPTIONS: {
  value: PlannedEndMode | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua akhir" },
  { value: "never", label: "Tanpa akhir (∞)" },
  { value: "installments", label: "Cicilan (12x)" },
  { value: "date", label: "Tanggal akhir" },
];

export const PLANNED_ITEMS_KIND_OPTIONS: {
  value: PlannedItemKind | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua jenis" },
  ...PLANNED_ITEM_KINDS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  })),
];

export const PLANNED_ITEMS_REPEAT_OPTIONS: {
  value: PlannedRepeatInterval | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua pengulangan" },
  ...PLANNED_REPEAT_INTERVALS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  })),
];
