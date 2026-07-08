import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";

export interface DayFlowTotals {
  totalIncome: number;
  totalExpense: number;
}

async function queryDayFlowTotals(
  userId: string,
  startIso: string,
  endIso: string,
): Promise<DayFlowTotals> {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        occurredAt: { gte: start, lte: end },
        type: "income",
      }),
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        occurredAt: { gte: start, lte: end },
        type: "expense",
      }),
      _sum: { amount: true },
    }),
  ]);

  return {
    totalIncome: incomeAgg._sum?.amount ?? 0,
    totalExpense: expenseAgg._sum?.amount ?? 0,
  };
}

export async function getDayFlowTotals(
  userId: string,
  start: Date,
  end: Date,
): Promise<DayFlowTotals> {
  const rangeKey = `${start.toISOString()}::${end.toISOString()}`;

  return unstable_cache(
    () => queryDayFlowTotals(userId, start.toISOString(), end.toISOString()),
    ["day-flow-totals", userId, rangeKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}
