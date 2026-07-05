import type { TransactionType } from "@/types/transaction";

export interface JournalFilters {
  q: string;
  type: TransactionType | "all";
  category: string;
  page: number;
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

export interface JournalListResult {
  items: JournalEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JournalCondition {
  label: string;
  emoji: string;
}

export interface JournalDaySummary {
  date: Date;
  totalExpense: number;
  totalIncome: number;
  cumulativeBalance: number;
  expenseDelta: number;
  incomeDelta: number;
  balanceDelta: number;
  condition: JournalCondition;
}
