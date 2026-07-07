import type { TransactionType } from "@/types/transaction";

export interface JournalFilters {
  q: string;
  type: TransactionType | "all";
  category: string;
  page: number;
  from: string;
  to: string;
}

export interface JournalEntry {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  rawInput: string;
  occurredAt: Date;
}

export interface JournalEntryFormInput {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  rawInput: string;
  occurredAt: Date;
}

export interface JournalListResult {
  items: JournalEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JournalCondition {
  label: string;
}

export interface JournalDaySummary {
  /** Selected period label for the widget header. */
  periodLabel: string;
  /** Comparison period label shown under Keluar/Masuk deltas. */
  comparisonLabel: string;
  totalExpense: number;
  totalIncome: number;
  cumulativeBalance: number;
  expenseDelta: number;
  incomeDelta: number;
  balanceDelta: number;
  condition: JournalCondition;
}

export interface JournalCategoryExpenseShare {
  category: string;
  label: string;
  amount: number;
  percent: number;
}

export interface JournalCategoryExpenseBreakdown {
  totalExpense: number;
  categories: JournalCategoryExpenseShare[];
}
