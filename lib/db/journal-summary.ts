import { cache } from "react";

import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import {
  addDays,
  endOfDay,
  getDayRange,
  startOfDay,
} from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import type { JournalDaySummary } from "@/types/journal";

async function getDayTransactions(userId: string, date: Date) {
  const { start, end } = getDayRange(date);

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

export const getJournalDaySummary = cache(
  async (
    userId: string,
    date: Date = new Date(),
  ): Promise<JournalDaySummary> => {
    const day = startOfDay(date);
    const yesterday = addDays(day, -1);

    const [
      transactions,
      yesterdayTransactions,
      cumulativeBalance,
      yesterdayBalance,
    ] = await Promise.all([
      getDayTransactions(userId, day),
      getDayTransactions(userId, yesterday),
      getCumulativeBalance(userId, day),
      getCumulativeBalance(userId, yesterday),
    ]);

    const summary = buildTodaySummary(transactions);
    const yesterdaySummary = buildTodaySummary(yesterdayTransactions);
    const condition = buildFallbackJournalCondition(
      transactions,
      summary.totalExpense,
      summary.totalIncome,
      cumulativeBalance,
    );

    return {
      date: day,
      totalExpense: summary.totalExpense,
      totalIncome: summary.totalIncome,
      cumulativeBalance,
      expenseDelta: summary.totalExpense - yesterdaySummary.totalExpense,
      incomeDelta: summary.totalIncome - yesterdaySummary.totalIncome,
      balanceDelta: cumulativeBalance - yesterdayBalance,
      condition,
    };
  },
);
