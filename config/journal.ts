import { CATEGORY_LABELS } from "@/config/categories";
import type { TransactionType } from "@/types/transaction";

export const JOURNAL_PAGE_SIZE = 15;

export const JOURNAL_TYPE_OPTIONS: {
  value: TransactionType | "all";
  label: string;
}[] = [
  { value: "all", label: "Semua tipe" },
  { value: "expense", label: "Pengeluaran" },
  { value: "income", label: "Pemasukan" },
];

export const JOURNAL_CATEGORY_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "all", label: "Semua kategori" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];
