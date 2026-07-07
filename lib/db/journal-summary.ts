import { cache } from "react";

import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { endOfDay } from "@/lib/finance/day-range";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import {
  formatJournalComparisonLabel,
  formatJournalPeriodLabel,
  getPreviousJournalDateRange,
  resolveJournalDateRangeBounds,
} from "@/lib/finance/journal-period";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type { JournalDaySummary, JournalFilters } from "@/types/journal";

async function getRangeTransactions(
  userId: string,
  start: Date,
  end: Date,
) {
  return prisma.transaction.findMany({
    where: scopedByUser(userId, {
      occurredAt: {
        gte: start,
        lte: end,
      },
    }),
    select: {
      type: true,
      amount: true,
      category: true,
      description: true,
    },
    orderBy: {
      occurredAt: "asc",
    },
  });
}

async function getCumulativeBalance(userId: string, date: Date): Promise<number> {
  const end = endOfDay(date);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        occurredAt: { lte: end },
        type: "income",
      }),
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        occurredAt: { lte: end },
        type: "expense",
      }),
      _sum: { amount: true },
    }),
  ]);

  return (incomeAgg._sum?.amount ?? 0) - (expenseAgg._sum?.amount ?? 0);
}

/** Journal header widget — totals for selected period vs previous equal-length period. */
export const getJournalDaySummary = cache(
  async (
    userId: string,
    filters: JournalFilters,
  ): Promise<JournalDaySummary> => {
    const range = { from: filters.from, to: filters.to };
    const { start, end } = resolveJournalDateRangeBounds(range);
    const previousRange = getPreviousJournalDateRange(range);
    const previousBounds = resolveJournalDateRangeBounds(previousRange);

    const [
      currentFlow,
      previousFlow,
      rangeTransactions,
      cumulativeBalance,
      previousEndBalance,
    ] = await Promise.all([
      getDayFlowTotals(userId, start, end),
      getDayFlowTotals(userId, previousBounds.start, previousBounds.end),
      getRangeTransactions(userId, start, end),
      getCumulativeBalance(userId, end),
      getCumulativeBalance(userId, previousBounds.end),
    ]);

    const summary = buildTodaySummary(rangeTransactions);
    const condition = buildFallbackJournalCondition(
      rangeTransactions,
      summary.totalExpense,
      summary.totalIncome,
      cumulativeBalance,
    );

    return {
      periodLabel: formatJournalPeriodLabel(range),
      comparisonLabel: formatJournalComparisonLabel(range),
      totalExpense: currentFlow.totalExpense,
      totalIncome: currentFlow.totalIncome,
      cumulativeBalance,
      expenseDelta: currentFlow.totalExpense - previousFlow.totalExpense,
      incomeDelta: currentFlow.totalIncome - previousFlow.totalIncome,
      balanceDelta: cumulativeBalance - previousEndBalance,
      condition,
    };
  },
);
