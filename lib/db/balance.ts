import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { endOfDay, toDayKey } from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";

async function queryAvailableBalance(
  userId: string,
  asOfIso: string,
): Promise<number> {
  const asOf = new Date(asOfIso);
  const end = endOfDay(asOf);

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

/** Cumulative balance from all transactions up to now. */
export async function getAvailableBalance(
  userId: string,
  asOf = new Date(),
): Promise<number> {
  const dayKey = toDayKey(asOf);

  return unstable_cache(
    () => queryAvailableBalance(userId, asOf.toISOString()),
    ["available-balance", userId, dayKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}
