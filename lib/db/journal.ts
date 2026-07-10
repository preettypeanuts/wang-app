import { unstable_cache } from "next/cache";
import {
  normalizeCategory,
  resolveCategoryForType,
} from "@/config/categories";
import { JOURNAL_PAGE_SIZE } from "@/config/journal";
import type { Prisma } from "@/generated/prisma/client";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import {
  hydrateJournalListResult,
  type SerializedJournalListResult,
  serializeJournalListResult,
} from "@/lib/cache/serialize-journal";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { invalidateAiInsightCacheOnTransactionMutation } from "@/lib/db/ai-insight-cache";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import { buildJournalCategoryExpenseBreakdown } from "@/lib/finance/build-journal-category-breakdown";
import { buildJournalTransactionWhere } from "@/lib/journal/build-transaction-where";
import type {
  JournalCategoryExpenseBreakdown,
  JournalEntry,
  JournalEntryFormInput,
  JournalFilters,
  JournalListResult,
} from "@/types/journal";
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

const JOURNAL_ENTRY_SELECT = {
  id: true,
  type: true,
  amount: true,
  category: true,
  description: true,
  rawInput: true,
  occurredAt: true,
} as const;

function journalFiltersCacheKey(filters: JournalFilters): string {
  return [
    filters.q,
    filters.type,
    filters.category,
    filters.dateFrom ?? "",
    filters.dateTo ?? "",
    filters.page,
  ].join("|");
}

async function queryJournalTransactions(
  userId: string,
  filters: JournalFilters,
): Promise<SerializedJournalListResult> {
  const where = buildJournalTransactionWhere(userId, filters);
  const page = filters.page;
  const skip = (page - 1) * JOURNAL_PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: JOURNAL_PAGE_SIZE,
      select: JOURNAL_ENTRY_SELECT,
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / JOURNAL_PAGE_SIZE));

  return serializeJournalListResult({
    items,
    total,
    page: Math.min(page, totalPages),
    pageSize: JOURNAL_PAGE_SIZE,
    totalPages,
  });
}

export async function listJournalTransactions(
  userId: string,
  filters: JournalFilters,
): Promise<JournalListResult> {
  const cacheKey = journalFiltersCacheKey(filters);
  const cached = await unstable_cache(
    () => queryJournalTransactions(userId, filters),
    ["journal-transactions", userId, cacheKey],
    { tags: [userDataTags.transactions(userId)] },
  )();

  return hydrateJournalListResult(cached);
}

const JOURNAL_PREVIEW_LIMIT = 6;

async function queryJournalTransactionPreview(
  userId: string,
  filters: JournalFilters,
  limit: number,
): Promise<JournalEntry[]> {
  const items = await prisma.transaction.findMany({
    where: buildJournalTransactionWhere(userId, filters),
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: JOURNAL_ENTRY_SELECT,
  });

  return items;
}

export async function listJournalTransactionPreview(
  userId: string,
  filters: JournalFilters,
  limit = JOURNAL_PREVIEW_LIMIT,
): Promise<JournalEntry[]> {
  const cacheKey = journalFiltersCacheKey({ ...filters, page: 1 });

  return unstable_cache(
    () => queryJournalTransactionPreview(userId, filters, limit),
    ["journal-transaction-preview", userId, cacheKey, String(limit)],
    { tags: [userDataTags.transactions(userId)] },
  )();
}

export async function countJournalTransactions(
  userId: string,
  filters: JournalFilters,
): Promise<number> {
  const cacheKey = journalFiltersCacheKey({ ...filters, page: 1 });

  return unstable_cache(
    () =>
      prisma.transaction.count({
        where: buildJournalTransactionWhere(userId, filters),
      }),
    ["journal-transaction-count", userId, cacheKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}

async function queryJournalCategoryExpenseBreakdown(
  userId: string,
  filters: JournalFilters,
): Promise<JournalCategoryExpenseBreakdown> {
  if (filters.type === "income") {
    return { totalExpense: 0, categories: [] };
  }

  const grouped = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      ...buildJournalTransactionWhere(userId, filters),
      type: "expense",
    },
    _sum: { amount: true },
  });

  return buildJournalCategoryExpenseBreakdown(
    grouped.map((row) => ({
      category: row.category,
      amount: row._sum.amount ?? 0,
    })),
  );
}

export async function getJournalCategoryExpenseBreakdown(
  userId: string,
  filters: JournalFilters,
): Promise<JournalCategoryExpenseBreakdown> {
  const cacheKey = journalFiltersCacheKey(filters);

  return unstable_cache(
    () => queryJournalCategoryExpenseBreakdown(userId, filters),
    ["journal-category-breakdown", userId, cacheKey],
    { tags: [userDataTags.transactions(userId)] },
  )();
}

export async function createJournalTransaction(
  userId: string,
  data: JournalEntryFormInput,
): Promise<JournalEntry> {
  const entry = await prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      rawInput: data.rawInput,
      occurredAt: data.occurredAt,
    },
    select: JOURNAL_ENTRY_SELECT,
  });

  await invalidateAiInsightCacheOnTransactionMutation(userId, entry.occurredAt);
  revalidateAfterTransactionMutation(userId);

  return entry;
}

export async function updateJournalTransaction(
  userId: string,
  id: string,
  data: JournalEntryFormInput,
): Promise<JournalEntry> {
  const updated = await prisma.transaction.updateMany({
    where: scopedId(userId, id),
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      rawInput: data.rawInput,
      occurredAt: data.occurredAt,
    },
  });

  if (updated.count === 0) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const entry = await prisma.transaction.findFirstOrThrow({
    where: scopedId(userId, id),
    select: JOURNAL_ENTRY_SELECT,
  });

  await invalidateAiInsightCacheOnTransactionMutation(userId, entry.occurredAt);
  revalidateAfterTransactionMutation(userId);

  return entry;
}

export async function updateTransactionCategoryQuick(
  userId: string,
  id: string,
  category: string,
  type?: TransactionType,
): Promise<ParsedTransaction> {
  const existing = await prisma.transaction.findFirst({
    where: scopedId(userId, id),
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      occurredAt: true,
    },
  });

  if (!existing) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const nextType = type ?? existing.type;
  const nextCategory = resolveCategoryForType(
    normalizeCategory(category),
    nextType,
  );

  const updated = await prisma.transaction.updateMany({
    where: scopedId(userId, id),
    data: {
      category: nextCategory,
      type: nextType,
    },
  });

  if (updated.count === 0) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const entry = await prisma.transaction.findFirstOrThrow({
    where: scopedId(userId, id),
    select: JOURNAL_ENTRY_SELECT,
  });

  await invalidateAiInsightCacheOnTransactionMutation(userId, entry.occurredAt);
  revalidateAfterTransactionMutation(userId);

  return {
    id: entry.id,
    type: entry.type,
    amount: entry.amount,
    category: normalizeCategory(entry.category),
    description: entry.description,
    occurredAt: entry.occurredAt.toISOString(),
  };
}

export interface DeleteJournalTransactionResult {
  transaction: ParsedTransaction;
  inboxMessageId: string | null;
}

export async function deleteJournalTransaction(
  userId: string,
  id: string,
): Promise<DeleteJournalTransactionResult> {
  const record = await prisma.transaction.findFirst({
    where: scopedId(userId, id),
  });

  if (!record) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const snapshot: ParsedTransaction = {
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
  };

  const inboxMessageId = record.inboxMessageId;

  const remainingLinkedCount = inboxMessageId
    ? await prisma.transaction.count({
        where: scopedByUser(userId, {
          inboxMessageId,
          id: { not: id },
        }),
      })
    : 0;

  await prisma.$transaction(async (tx) => {
    if (inboxMessageId && remainingLinkedCount === 0) {
      await tx.inboxMessage.updateMany({
        where: scopedId(userId, inboxMessageId),
        data: {
          orphanedTransaction: snapshot as unknown as Prisma.InputJsonValue,
        },
      });
    }

    await tx.transaction.deleteMany({
      where: scopedId(userId, id),
    });
  });

  await invalidateAiInsightCacheOnTransactionMutation(
    userId,
    record.occurredAt,
  );
  revalidateAfterTransactionMutation(userId);

  return {
    transaction: snapshot,
    inboxMessageId,
  };
}
