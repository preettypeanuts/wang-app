import { listBudgetsForMonth } from "@/lib/db/budgets";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import type {
  DailyBudgetDayStatus,
  DailyCategoryBudgetReflection,
  DailySummaryReflectionContext,
} from "@/lib/finance/format-daily-summary-reflection-context";

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
}

function toPeriodMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function resolveDailyBudgetDayStatus(
  daySpent: number,
  dailyLimit: number,
): {
  dayDelta: number;
  dayStatus: DailyBudgetDayStatus;
} {
  const dayDelta = daySpent - dailyLimit;

  if (dayDelta > 0) {
    return { dayDelta, dayStatus: "over" };
  }

  if (dayDelta === 0) {
    return { dayDelta, dayStatus: "at" };
  }

  return { dayDelta, dayStatus: "under" };
}

export async function buildDailySummaryReflectionContext(
  userId: string,
  date: Date,
  transactions: DailySummaryTransaction[],
  cumulativeBalance: number,
): Promise<DailySummaryReflectionContext> {
  const summary = buildTodaySummary(transactions);

  if (summary.categories.length === 0) {
    return { cumulativeBalance, categoryBudgets: [] };
  }

  const periodMonth = toPeriodMonth(date);
  const budgets = await listBudgetsForMonth(userId, periodMonth);
  const budgetByCategory = new Map(
    budgets.map((status) => [status.budget.category, status]),
  );

  const categoryBudgets: DailyCategoryBudgetReflection[] = [];

  for (const category of summary.categories) {
    const monthlyStatus = budgetByCategory.get(category.category);
    if (!monthlyStatus) {
      continue;
    }

    let dailyLimit: number | null = null;
    let dayDelta: number | null = null;
    let dayStatus: DailyBudgetDayStatus | null = null;

    if (
      monthlyStatus.budget.limitMode === "daily" &&
      monthlyStatus.budget.dailyAmount &&
      monthlyStatus.budget.dailyAmount > 0
    ) {
      dailyLimit = monthlyStatus.budget.dailyAmount;
      const resolved = resolveDailyBudgetDayStatus(category.total, dailyLimit);
      dayDelta = resolved.dayDelta;
      dayStatus = resolved.dayStatus;
    }

    categoryBudgets.push({
      category: category.category,
      categoryLabel: category.label,
      daySpent: category.total,
      dailyLimit,
      dayDelta,
      dayStatus,
      monthlyStatus,
    });
  }

  return { cumulativeBalance, categoryBudgets };
}

export type {
  DailyCategoryBudgetReflection,
  DailySummaryReflectionContext,
} from "@/lib/finance/format-daily-summary-reflection-context";
