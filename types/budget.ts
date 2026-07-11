export type BudgetLimitMode = "daily" | "fixed";

export type BudgetPaceStatus = "over" | "fast" | "on_track" | "slow" | "unset";

export interface BudgetPace {
  elapsedDays: number;
  remainingDays: number;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFutureMonth: boolean;
  avgDailySpent: number | null;
  plannedDailyBudget: number | null;
  adjustedDailyBudget: number | null;
  dailyDelta: number | null;
  paceStatus: BudgetPaceStatus;
}

export interface CategoryBudgetRecord {
  id: string;
  category: string;
  periodMonth: string;
  limitMode: BudgetLimitMode;
  dailyAmount: number | null;
  fixedLimit: number | null;
  dayCount: number | null;
  note: string | null;
  repeatNextMonth: boolean;
}

export interface BudgetStatus {
  budget: CategoryBudgetRecord;
  categoryLabel: string;
  periodMonth: string;
  dayCount: number;
  totalLimit: number;
  spent: number;
  remaining: number;
  usedPercent: number;
  remainingPercent: number;
  pace: BudgetPace;
}

export interface CategoryBudgetFormInput {
  category: string;
  periodMonth: string;
  limitMode: BudgetLimitMode;
  dailyAmount?: number;
  fixedLimit?: number;
  dayCount?: number;
  note?: string;
  repeatNextMonth?: boolean;
}
