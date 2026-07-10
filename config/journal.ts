import { CATEGORY_LABELS } from "@/config/categories";
import {
  UI_LABEL_ALL_CATEGORIES,
  UI_LABEL_ALL_TYPES,
  UI_LABEL_EXPENSE,
  UI_LABEL_INCOME,
} from "@/config/ui-labels";
import type { TransactionType } from "@/types/transaction";

export const JOURNAL_PAGE_SIZE = 15;

export const JOURNAL_TYPE_OPTIONS: {
  value: TransactionType | "all";
  label: string;
}[] = [
  { value: "all", label: UI_LABEL_ALL_TYPES },
  { value: "expense", label: UI_LABEL_EXPENSE },
  { value: "income", label: UI_LABEL_INCOME },
];

export const JOURNAL_CATEGORY_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "all", label: UI_LABEL_ALL_CATEGORIES },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];
