import { cache } from "react";

import { generateJournalCondition } from "@/lib/ai/generate-journal-condition";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { endOfDay, getDayRange, startOfDay, addDays } from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import type { JournalDaySummary } from "@/types/journal";

async function getDayTransactions(date: Date) {
  const { start, end } = getDayRange(date);

  return prisma.transaction.findMany({
    where: {
      occurredAt: {
        gte: start,
        lte: end,
      },
    },
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

async function getCumulativeBalance(date: Date): Promise<number> {
  const end = endOfDay(date);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        occurredAt: { lte: end },
        type: "income",
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        occurredAt: { lte: end },
        type: "expense",
      },
      _sum: { amount: true },
    }),
  ]);

  return (incomeAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0);
}

export const getJournalDaySummary = cache(
  async (date: Date = new Date()): Promise<JournalDaySummary> => {
    const day = startOfDay(date);
    const yesterday = addDays(day, -1);

    const [
      transactions,
      yesterdayTransactions,
      cumulativeBalance,
      yesterdayBalance,
    ] = await Promise.all([
      getDayTransactions(day),
      getDayTransactions(yesterday),
      getCumulativeBalance(day),
      getCumulativeBalance(yesterday),
    ]);

    const summary = buildTodaySummary(transactions);
    const yesterdaySummary = buildTodaySummary(yesterdayTransactions);
    const condition = await generateJournalCondition(
      day,
      transactions,
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
