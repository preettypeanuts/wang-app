import type { FlowTransactionType, TransactionType } from "@/types/transaction";

export interface JournalFilters {
  q: string;
  type: FlowTransactionType | "all";
  category: string;
  /** Wallet id or "all". */
  walletId: string;
  page: number;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface JournalEntry {
  id: string;
  type: TransactionType;
  /** Signed for transfer legs (negative = out of the wallet). */
  amount: number;
  category: string;
  description: string;
  rawInput: string;
  occurredAt: Date;
  walletId: string | null;
  walletName: string | null;
  transferPairId: string | null;
}

export interface JournalEntryFormInput {
  type: FlowTransactionType;
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
  /** Anchor date for the active summary period (month start or range start). */
  date: Date;
  /** Totals for the active period. */
  totalExpense: number;
  totalIncome: number;
  cumulativeBalance: number;
  /** Delta vs the previous comparable period. */
  expenseDelta: number;
  incomeDelta: number;
  balanceDelta: number;
  condition: JournalCondition;
  /** Human label when a custom date range is active. */
  periodLabel?: string | null;
  /** Subtitle for delta chips — e.g. vs bulan lalu / vs periode sebelumnya. */
  periodDeltaLabel?: string;
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
