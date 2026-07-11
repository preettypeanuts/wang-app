import { getCurrentMonthKey, parseMonthKey } from "@/lib/planner/calendar";
import type {
  BudgetPace,
  BudgetPaceStatus,
  BudgetStatus,
} from "@/types/budget";

export interface BudgetPeriodProgress {
  elapsedDays: number;
  remainingDays: number;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFutureMonth: boolean;
}

export function getBudgetPeriodProgress(
  periodMonth: string,
  dayCount: number,
  referenceDate: Date = new Date(),
): BudgetPeriodProgress {
  const currentMonthKey = getCurrentMonthKey(referenceDate);
  const isCurrentMonth = periodMonth === currentMonthKey;
  const isPastMonth = periodMonth < currentMonthKey;
  const isFutureMonth = periodMonth > currentMonthKey;

  if (isPastMonth) {
    return {
      elapsedDays: dayCount,
      remainingDays: 0,
      isCurrentMonth: false,
      isPastMonth: true,
      isFutureMonth: false,
    };
  }

  if (isFutureMonth) {
    return {
      elapsedDays: 0,
      remainingDays: dayCount,
      isCurrentMonth: false,
      isPastMonth: false,
      isFutureMonth: true,
    };
  }

  const parsed = parseMonthKey(periodMonth);
  const dayOfMonth = parsed
    ? Math.min(referenceDate.getDate(), dayCount)
    : Math.min(referenceDate.getDate(), dayCount);

  const elapsedDays = Math.max(0, Math.min(dayCount, dayOfMonth));
  const remainingDays = Math.max(0, dayCount - elapsedDays);

  return {
    elapsedDays,
    remainingDays,
    isCurrentMonth,
    isPastMonth: false,
    isFutureMonth: false,
  };
}

function resolvePlannedDailyBudget(status: BudgetStatus): number | null {
  if (status.budget.limitMode === "daily") {
    return status.budget.dailyAmount ?? null;
  }

  if (status.dayCount <= 0) {
    return null;
  }

  return Math.round(status.totalLimit / status.dayCount);
}

function resolvePaceStatus(
  remaining: number,
  avgDailySpent: number | null,
  plannedDailyBudget: number | null,
  progress: BudgetPeriodProgress,
): BudgetPaceStatus {
  if (remaining < 0) {
    return "over";
  }

  if (
    progress.isFutureMonth ||
    progress.elapsedDays <= 0 ||
    avgDailySpent === null ||
    plannedDailyBudget === null ||
    plannedDailyBudget <= 0
  ) {
    return "unset";
  }

  if (avgDailySpent > plannedDailyBudget) {
    return "fast";
  }

  if (avgDailySpent < plannedDailyBudget * 0.85) {
    return "slow";
  }

  return "on_track";
}

export function computeBudgetPace(
  status: Pick<
    BudgetStatus,
    "budget" | "periodMonth" | "dayCount" | "totalLimit" | "spent" | "remaining"
  >,
  referenceDate: Date = new Date(),
): BudgetPace {
  const progress = getBudgetPeriodProgress(
    status.periodMonth,
    status.dayCount,
    referenceDate,
  );

  const plannedDailyBudget = resolvePlannedDailyBudget(status as BudgetStatus);
  const avgDailySpent =
    progress.elapsedDays > 0
      ? Math.round(status.spent / progress.elapsedDays)
      : null;
  const adjustedDailyBudget =
    progress.remainingDays > 0
      ? Math.round(Math.max(0, status.remaining) / progress.remainingDays)
      : null;
  const dailyDelta =
    adjustedDailyBudget !== null && plannedDailyBudget !== null
      ? adjustedDailyBudget - plannedDailyBudget
      : null;

  return {
    ...progress,
    avgDailySpent,
    plannedDailyBudget,
    adjustedDailyBudget,
    dailyDelta,
    paceStatus: resolvePaceStatus(
      status.remaining,
      avgDailySpent,
      plannedDailyBudget,
      progress,
    ),
  };
}
