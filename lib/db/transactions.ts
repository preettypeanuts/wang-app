import { buildTodaySummary } from "@/lib/finance/build-summary";
import { getDayRange } from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import type { ParsedTransaction } from "@/types/transaction";
import type { TodaySummary } from "@/types/summary";

interface CreateTransactionInput {
  rawInput: string;
  transaction: ParsedTransaction;
}

function getTodayRange() {
  return getDayRange(new Date());
}

export async function createTransaction({
  rawInput,
  transaction,
}: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      occurredAt: new Date(transaction.occurredAt),
      rawInput,
    },
  });
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const { start, end } = getTodayRange();

  const transactions = await prisma.transaction.findMany({
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
    },
    orderBy: {
      occurredAt: "desc",
    },
  });

  return buildTodaySummary(transactions);
}
