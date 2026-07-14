import { unstable_cache } from "next/cache";
import { normalizeCategory, resolveCategoryForType } from "@/config/categories";
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
import { listUserCategoriesForUser } from "@/lib/db/user-categories";
import { reconcileStaleTransactionCategories } from "@/lib/db/reconcile-transaction-categories";
import {
  resolveCategoryForTransaction,
  resolveUserCategoryCatalog,
} from "@/lib/finance/resolve-user-categories";
import type { DayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import {
  assertFlowTransactionType,
  flowTransactionTypesWhere,
} from "@/lib/db/transaction-flow-filter";
import { buildJournalTransactionWhere } from "@/lib/journal/build-transaction-where";
import { getDefaultWalletId } from "@/lib/db/wallets";
import type {
  JournalCategoryExpenseBreakdown,
  JournalEntry,
  JournalEntryFormInput,
  JournalFilters,
  JournalListResult,
} from "@/types/journal";
import type { FlowTransactionType, ParsedTransaction, TransactionType } from "@/types/transaction";

const JOURNAL_ENTRY_SELECT = {
  id: true,
  type: true,
  amount: true,
  category: true,
  description: true,
  rawInput: true,
  occurredAt: true,
  walletId: true,
  transferPairId: true,
  wallet: { select: { name: true } },
} as const;

type JournalEntryRow = Prisma.TransactionGetPayload<{
  select: typeof JOURNAL_ENTRY_SELECT;
}>;

function toJournalEntry(row: JournalEntryRow): JournalEntry {
  const { wallet, ...rest } = row;

  return {
    ...rest,
    walletName: wallet?.name ?? null,
  };
}

function journalFiltersCacheKey(filters: JournalFilters): string {
  return [
    filters.q,
    filters.type,
    filters.category,
    filters.walletId,
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
    items: items.map(toJournalEntry),
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
    where: {
      ...buildJournalTransactionWhere(userId, filters),
      // Overview/AI previews only surface income & expense flows.
      ...(filters.type === "all" ? flowTransactionTypesWhere() : {}),
    },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: JOURNAL_ENTRY_SELECT,
  });

  return items.map(toJournalEntry);
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

async function queryJournalFlowTotals(
  userId: string,
  filters: JournalFilters,
): Promise<DayFlowTotals> {
  const where = buildJournalTransactionWhere(userId, filters);

  if (filters.type === "income") {
    const aggregate = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      totalIncome: aggregate._sum?.amount ?? 0,
      totalExpense: 0,
    };
  }

  if (filters.type === "expense") {
    const aggregate = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      totalIncome: 0,
      totalExpense: aggregate._sum?.amount ?? 0,
    };
  }

  const [incomeAggregate, expenseAggregate] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: "income" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: "expense" },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalIncome: incomeAggregate._sum?.amount ?? 0,
    totalExpense: expenseAggregate._sum?.amount ?? 0,
  };
}

/** Income/expense totals for active journal filters (respects date, type, category, q). */
export async function getJournalFlowTotals(
  userId: string,
  filters: JournalFilters,
): Promise<DayFlowTotals> {
  const cacheKey = journalFiltersCacheKey({ ...filters, page: 1 });

  return unstable_cache(
    () => queryJournalFlowTotals(userId, filters),
    ["journal-flow-totals", userId, cacheKey],
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

  const [grouped, catalog, userRecords] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        ...buildJournalTransactionWhere(userId, filters),
        type: "expense",
      },
      _sum: { amount: true },
    }),
    resolveUserCategoryCatalog(userId),
    listUserCategoriesForUser(userId),
  ]);

  return buildJournalCategoryExpenseBreakdown(
    grouped.map((row) => ({
      category: row.category,
      amount: row._sum.amount ?? 0,
    })),
    catalog,
    userRecords,
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
    {
      tags: [
        userDataTags.transactions(userId),
        userDataTags.categories(userId),
      ],
    },
  )();
}

export async function createJournalTransaction(
  userId: string,
  data: JournalEntryFormInput,
): Promise<JournalEntry> {
  const walletId = await getDefaultWalletId(userId);

  const entry = await prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      rawInput: data.rawInput,
      occurredAt: data.occurredAt,
      walletId,
    },
    select: JOURNAL_ENTRY_SELECT,
  });

  await invalidateAiInsightCacheOnTransactionMutation(userId, entry.occurredAt);
  revalidateAfterTransactionMutation(userId);

  return toJournalEntry(entry);
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

  return toJournalEntry(entry);
}

export async function updateTransactionCategoryQuick(
  userId: string,
  id: string,
  category: string,
  type?: FlowTransactionType,
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

  const nextType = assertFlowTransactionType(type ?? existing.type);
  const catalog = await resolveUserCategoryCatalog(userId);
  const nextCategory = resolveCategoryForTransaction(
    category,
    nextType,
    catalog,
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
    type: assertFlowTransactionType(entry.type),
    amount: entry.amount,
    category: normalizeCategory(entry.category),
    description: entry.description,
    occurredAt: entry.occurredAt.toISOString(),
  };
}

export async function updateTransactionWalletQuick(
  userId: string,
  id: string,
  walletId: string,
): Promise<JournalEntry> {
  const existing = await prisma.transaction.findFirst({
    where: scopedId(userId, id),
    select: { id: true, type: true },
  });

  if (!existing) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (existing.type === "transfer") {
    throw new Error("Wallet transfer tidak bisa dipindahkan per baris.");
  }

  const wallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      userId,
      OR: [{ isArchived: false }, { isArchived: true }],
    },
    select: { id: true, isArchived: true },
  });

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const updated = await prisma.transaction.updateMany({
    where: scopedId(userId, id),
    data: { walletId: wallet.id },
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

  return toJournalEntry(entry);
}

export interface DeleteJournalTransactionResult {
  /** Null when a transfer pair was deleted — no inbox summary to patch. */
  transaction: ParsedTransaction | null;
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

  // Deleting one transfer leg removes its counterpart too, so wallet balances stay consistent.
  if (record.type === "transfer") {
    await prisma.transaction.deleteMany({
      where: record.transferPairId
        ? scopedByUser(userId, { transferPairId: record.transferPairId })
        : scopedId(userId, id),
    });

    await invalidateAiInsightCacheOnTransactionMutation(
      userId,
      record.occurredAt,
    );
    revalidateAfterTransactionMutation(userId);

    return { transaction: null, inboxMessageId: null };
  }

  const snapshot: ParsedTransaction = {
    type: assertFlowTransactionType(record.type),
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
