import { getCategoryLabel } from "@/config/categories";
import { getAvailableBalance } from "@/lib/db/balance";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import {
  getMonthTransactionAggregates,
  getTodayTransactionRows,
} from "@/lib/db/transactions";
import { buildOverviewAlerts } from "@/lib/finance/build-overview-alerts";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { addDays, getDayRange, toDayKey } from "@/lib/finance/day-range";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatOverviewGreeting } from "@/lib/finance/format-overview-greeting";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import {
  formatPlannerMonthLabel,
  getCurrentMonthKey,
  getMonthRange,
} from "@/lib/planner/calendar";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import type { OverviewPageResult } from "@/types/overview";

export async function getOverviewPageData(
  userId: string,
): Promise<OverviewPageResult> {
  const now = new Date();
  const yesterday = addDays(now, -1);
  const monthKey = getCurrentMonthKey(now);
  const parsedMonth = getMonthRange(now.getFullYear(), now.getMonth());
  const { start: todayStart, end: todayEnd } = getDayRange(now);
  const { start: yesterdayStart, end: yesterdayEnd } = getDayRange(yesterday);

  const [
    availableBalance,
    yesterdayBalance,
    plans,
    savingsGoals,
    upcomingImpact,
    todayFlow,
    yesterdayFlow,
    todayTransactionRows,
    monthTransactions,
  ] = await Promise.all([
    getAvailableBalance(userId, now),
    getAvailableBalance(userId, yesterday),
    listPlans(userId),
    listSavingsGoals(userId),
    getPlansUpcomingImpact(userId, now),
    getDayFlowTotals(userId, todayStart, todayEnd),
    getDayFlowTotals(userId, yesterdayStart, yesterdayEnd),
    getTodayTransactionRows(userId, toDayKey(now)),
    getMonthTransactionAggregates(
      userId,
      monthKey,
      parsedMonth.start,
      parsedMonth.end,
    ),
  ]);

  const journalTransactions = todayTransactionRows.map((transaction) => ({
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
  }));

  const todayActivityRows = [...todayTransactionRows]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, 6);

  const todaySummary = buildTodaySummary(journalTransactions);
  const monthSummary = buildTodaySummary(monthTransactions);

  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(
      plans
        .filter((plan) => plan.status === "active")
        .reduce((sum, plan) => sum + plan.amount, 0),
      availableBalance,
    ),
  );

  const savingsOverview = buildSavingsOverview(
    savingsGoals,
    availableBalance,
  );

  return {
    data: {
      greeting: formatOverviewGreeting(now),
      balance: availableBalance,
      dayDeltas: {
        incomeDelta: todayFlow.totalIncome - yesterdayFlow.totalIncome,
        expenseDelta: todayFlow.totalExpense - yesterdayFlow.totalExpense,
        balanceDelta: availableBalance - yesterdayBalance,
      },
      alerts: buildOverviewAlerts({
        upcoming: upcomingImpact,
        plansOverview,
        availableBalance,
      }),
      upcoming: upcomingImpact,
      plansOverview,
      savingsOverview,
      monthlySnapshot: {
        monthLabel: formatPlannerMonthLabel(monthKey),
        totalIncome: monthSummary.totalIncome,
        totalExpense: monthSummary.totalExpense,
        netFlow: monthSummary.totalIncome - monthSummary.totalExpense,
        transactionCount: monthTransactions.length,
      },
      todaySummary,
      todayActivity: todayActivityRows.map((transaction) => ({
        id: transaction.id,
        title: transaction.rawInput.trim() || transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        timeLabel: formatJournalTime(new Date(transaction.occurredAt)),
        categoryLabel: getCategoryLabel(transaction.category),
      })),
    },
    aiBriefInputs: {
      userId,
      journalTransactions,
      availableBalance,
      todaySummary,
      plansOverview,
    },
  };
}
