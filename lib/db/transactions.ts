import { unstable_cache } from "next/cache";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { invalidateAiInsightCacheOnTransactionMutation } from "@/lib/db/ai-insight-cache";
import { prisma } from "@/lib/db/prisma";
import { flowTransactionTypesWhere } from "@/lib/db/transaction-flow-filter";
import { scopedByUser } from "@/lib/db/user-scope";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { getDayRange, parseDayKey, toDayKey } from "@/lib/finance/day-range";
import type { TodaySummary } from "@/types/summary";
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

interface CreateTransactionInput {
  userId: string;
  rawInput: string;
  transaction: ParsedTransaction;
  inboxMessageId?: string;
  walletId?: string | null;
}

function getTodayRange() {
  return getDayRange(new Date());
}

export async function createTransaction({
  userId,
  rawInput,
  transaction,
  inboxMessageId,
  walletId,
}: CreateTransactionInput) {
  const saved = await prisma.transaction.create({
    data: {
      userId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      occurredAt: new Date(transaction.occurredAt),
      rawInput,
      inboxMessageId,
      walletId: walletId ?? null,
    },
  });

  await invalidateAiInsightCacheOnTransactionMutation(userId, saved.occurredAt);
  revalidateAfterTransactionMutation(userId);

  return saved;
}

interface CreateMultipleTransactionsInput {
  userId: string;
  rawInput: string;
  transactions: ParsedTransaction[];
  inboxMessageId?: string;
  walletId?: string | null;
}

/** Atomic batch insert for multi-transaction inbox messages. */
export async function createMultipleTransactions({
  userId,
  rawInput,
  transactions,
  inboxMessageId,
  walletId,
}: CreateMultipleTransactionsInput) {
  if (transactions.length === 0) {
    return [];
  }

  if (transactions.length === 1) {
    return [
      await createTransaction({
        userId,
        rawInput,
        transaction: transactions[0],
        inboxMessageId,
        walletId,
      }),
    ];
  }

  const saved = await prisma.$transaction(
    transactions.map((transaction, index) =>
      prisma.transaction.create({
        data: {
          userId,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          occurredAt: new Date(transaction.occurredAt),
          rawInput,
          inboxMessageId,
          walletId: walletId ?? null,
          createdAt: new Date(Date.now() + index),
        },
      }),
    ),
  );

  for (const row of saved) {
    await invalidateAiInsightCacheOnTransactionMutation(userId, row.occurredAt);
  }
  revalidateAfterTransactionMutation(userId);

  return saved;
}

async function queryTodaySummary(
  userId: string,
  dayKey: string,
): Promise<TodaySummary> {
  const { start, end } = getDayRange(parseDayKey(dayKey));

  const transactions = await prisma.transaction.findMany({
    where: scopedByUser(userId, {
      occurredAt: {
        gte: start,
        lte: end,
      },
      ...flowTransactionTypesWhere(),
    }),
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

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const dayKey = toDayKey(new Date());

  return unstable_cache(
    () => queryTodaySummary(userId, dayKey),
    ["today-summary", userId, dayKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}

export interface TodayTransactionRow {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  rawInput: string;
  occurredAt: string;
}

async function queryTodayTransactionRows(
  userId: string,
  dayKey: string,
): Promise<TodayTransactionRow[]> {
  const { start, end } = getDayRange(parseDayKey(dayKey));

  const rows = await prisma.transaction.findMany({
    where: scopedByUser(userId, {
      occurredAt: {
        gte: start,
        lte: end,
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
  });

  return rows.map((row) => ({
    ...row,
    occurredAt: row.occurredAt.toISOString(),
  }));
}

export async function getTodayTransactionRows(
  userId: string,
  dayKey = toDayKey(new Date()),
): Promise<TodayTransactionRow[]> {
  return unstable_cache(
    () => queryTodayTransactionRows(userId, dayKey),
    ["today-transaction-rows", userId, dayKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}

export interface MonthTransactionAggregateRow {
  type: TransactionType;
  amount: number;
  category: string;
}

async function queryMonthTransactionAggregates(
  userId: string,
  monthKey: string,
  startIso: string,
  endIso: string,
): Promise<MonthTransactionAggregateRow[]> {
  return prisma.transaction.findMany({
    where: scopedByUser(userId, {
      occurredAt: {
        gte: new Date(startIso),
        lte: new Date(endIso),
      },
      ...flowTransactionTypesWhere(),
    }),
    select: {
      type: true,
      amount: true,
      category: true,
    },
  });
}

export async function getMonthTransactionAggregates(
  userId: string,
  monthKey: string,
  start: Date,
  end: Date,
): Promise<MonthTransactionAggregateRow[]> {
  return unstable_cache(
    () =>
      queryMonthTransactionAggregates(
        userId,
        monthKey,
        start.toISOString(),
        end.toISOString(),
      ),
    ["month-transaction-aggregates", userId, monthKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}
