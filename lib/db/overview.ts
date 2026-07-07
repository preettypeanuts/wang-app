import { getCategoryLabel } from "@/config/categories";
import { getAvailableBalance } from "@/lib/db/balance";
import { listPlans } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import { scopedByUser } from "@/lib/db/user-scope";
import { buildOverviewAlerts } from "@/lib/finance/build-overview-alerts";
import { buildOverviewBrief } from "@/lib/finance/build-overview-brief";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { addDays, getDayRange } from "@/lib/finance/day-range";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatOverviewGreeting } from "@/lib/finance/format-overview-greeting";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import {
  formatPlannerMonthLabel,
  getCurrentMonthKey,
  getMonthRange,
} from "@/lib/planner/calendar";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import type { OverviewPageData } from "@/types/overview";

export async function getOverviewPageData(
  userId: string,
): Promise<OverviewPageData> {
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
    prisma.transaction.findMany({
      where: scopedByUser(userId, {
        occurredAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      }),
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        rawInput: true,
        occurredAt: true,
      },
      orderBy: {
        occurredAt: "asc",
      },
    }),
    prisma.transaction.findMany({
      where: scopedByUser(userId, {
        occurredAt: {
          gte: parsedMonth.start,
          lte: parsedMonth.end,
        },
      }),
      select: {
        type: true,
        amount: true,
        category: true,
      },
    }),
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
        right.occurredAt.getTime() - left.occurredAt.getTime(),
    )
    .slice(0, 6);

  const todaySummary = buildTodaySummary(journalTransactions);
  const monthSummary = buildTodaySummary(monthTransactions);

  const condition = buildFallbackJournalCondition(
    journalTransactions,
    todaySummary.totalExpense,
    todaySummary.totalIncome,
    availableBalance,
  );

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
    greeting: formatOverviewGreeting(now),
    balance: availableBalance,
    dayDeltas: {
      incomeDelta: todayFlow.totalIncome - yesterdayFlow.totalIncome,
      expenseDelta: todayFlow.totalExpense - yesterdayFlow.totalExpense,
      balanceDelta: availableBalance - yesterdayBalance,
    },
    aiBrief: buildOverviewBrief(condition, todaySummary, plansOverview),
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
      timeLabel: formatJournalTime(transaction.occurredAt),
      categoryLabel: getCategoryLabel(transaction.category),
    })),
  };
}
