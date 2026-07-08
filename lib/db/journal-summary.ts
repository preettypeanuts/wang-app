import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import {
  hydrateJournalDaySummary,
  serializeJournalDaySummary,
  type SerializedJournalDaySummary,
} from "@/lib/cache/serialize-journal";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { endOfDay, parseDayKey, startOfDay } from "@/lib/finance/day-range";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import { getMonthRange, getCurrentMonthKey } from "@/lib/planner/calendar";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type { JournalDaySummary } from "@/types/journal";
import { cache } from "react";

async function getMonthTransactions(
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

async function buildJournalDaySummary(
  userId: string,
  date: Date,
): Promise<JournalDaySummary> {
  const anchor = startOfDay(date);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const currentMonthStart = getMonthRange(year, month).start;
  const currentMonthEnd = endOfDay(anchor);

  const lastMonthAnchor = new Date(year, month - 1, 1);
  const lastMonthRange = getMonthRange(
    lastMonthAnchor.getFullYear(),
    lastMonthAnchor.getMonth(),
  );

  const [
    currentMonthFlow,
    lastMonthFlow,
    monthTransactions,
    cumulativeBalance,
    lastMonthEndBalance,
  ] = await Promise.all([
    getDayFlowTotals(userId, currentMonthStart, currentMonthEnd),
    getDayFlowTotals(userId, lastMonthRange.start, lastMonthRange.end),
    getMonthTransactions(userId, currentMonthStart, currentMonthEnd),
    getCumulativeBalance(userId, anchor),
    getCumulativeBalance(userId, lastMonthRange.end),
  ]);

  const summary = buildTodaySummary(monthTransactions);
  const condition = buildFallbackJournalCondition(
    monthTransactions,
    summary.totalExpense,
    summary.totalIncome,
    cumulativeBalance,
  );

  return {
    date: currentMonthStart,
    totalExpense: currentMonthFlow.totalExpense,
    totalIncome: currentMonthFlow.totalIncome,
    cumulativeBalance,
    expenseDelta:
      currentMonthFlow.totalExpense - lastMonthFlow.totalExpense,
    incomeDelta: currentMonthFlow.totalIncome - lastMonthFlow.totalIncome,
    balanceDelta: cumulativeBalance - lastMonthEndBalance,
    condition,
  };
}

function getCachedJournalDaySummary(userId: string, monthKey: string) {
  return unstable_cache(
    async (): Promise<SerializedJournalDaySummary> => {
      const summary = await buildJournalDaySummary(userId, parseDayKey(`${monthKey}-01`));
      return serializeJournalDaySummary(summary);
    },
    ["journal-day-summary", userId, monthKey],
    { tags: [userDataTags.transactions(userId)] },
  );
}

/** Journal header widget — current month (MTD) vs previous full month. */
export const getJournalDaySummary = cache(
  async (
    userId: string,
    date: Date = new Date(),
  ): Promise<JournalDaySummary> => {
    const monthKey = getCurrentMonthKey(date);
    const cached = await getCachedJournalDaySummary(userId, monthKey)();
    return hydrateJournalDaySummary(cached);
  },
);
