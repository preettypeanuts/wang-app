export interface CategorySummary {
  category: string;
  label: string;
  total: number;
  count: number;
}

export interface TodaySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categories: CategorySummary[];
}

export interface FinanceCondition {
  label: string;
  emoji: string;
}

export interface DailySummarySnapshot {
  date: string;
  title: string;
  content: string;
  insight: string | null;
  condition: FinanceCondition | null;
  summary: TodaySummary;
}
