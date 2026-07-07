import { TRANSACTION_CATEGORIES, normalizeCategory } from "@/config/categories";
import { JOURNAL_PAGE_SIZE } from "@/config/journal";
import { buildJournalCategoryExpenseBreakdown } from "@/lib/finance/build-journal-category-breakdown";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import type {
  JournalCategoryExpenseBreakdown,
  JournalEntry,
  JournalEntryFormInput,
  JournalFilters,
  JournalListResult,
} from "@/types/journal";
import type { ParsedTransaction } from "@/types/transaction";
import type { Prisma } from "@/generated/prisma/client";

const JOURNAL_ENTRY_SELECT = {
  id: true,
  type: true,
  amount: true,
  category: true,
  description: true,
  rawInput: true,
  occurredAt: true,
} as const;

function buildWhere(
  userId: string,
  filters: JournalFilters,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type !== "all") {
    where.type = filters.type;
  }

  if (filters.category !== "all") {
    where.category = filters.category;
  }

  if (filters.q) {
    const query = filters.q.toLowerCase();
    const matchingCategoryIds = TRANSACTION_CATEGORIES.filter(
      (category) =>
        category.id.includes(query) ||
        category.label.toLowerCase().includes(query),
    ).map((category) => category.id);

    where.OR = [
      { description: { contains: filters.q, mode: "insensitive" } },
      { rawInput: { contains: filters.q, mode: "insensitive" } },
      ...(matchingCategoryIds.length > 0
        ? [{ category: { in: matchingCategoryIds } }]
        : [
            {
              category: {
                contains: filters.q,
                mode: "insensitive" as const,
              },
            },
          ]),
    ];
  }

  return where;
}

export async function listJournalTransactions(
  userId: string,
  filters: JournalFilters,
): Promise<JournalListResult> {
  const where = buildWhere(userId, filters);
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

  return {
    items,
    total,
    page: Math.min(page, totalPages),
    pageSize: JOURNAL_PAGE_SIZE,
    totalPages,
  };
}

export async function getJournalCategoryExpenseBreakdown(
  userId: string,
  filters: JournalFilters,
): Promise<JournalCategoryExpenseBreakdown> {
  if (filters.type === "income") {
    return { totalExpense: 0, categories: [] };
  }

  const grouped = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      ...buildWhere(userId, filters),
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

export async function createJournalTransaction(
  userId: string,
  data: JournalEntryFormInput,
): Promise<JournalEntry> {
  return prisma.transaction.create({
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

  return prisma.transaction.findFirstOrThrow({
    where: scopedId(userId, id),
    select: JOURNAL_ENTRY_SELECT,
  });
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

  const inboxMessage = await prisma.inboxMessage.findFirst({
    where: scopedByUser(userId, { transactionId: id }),
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    if (inboxMessage) {
      await tx.inboxMessage.updateMany({
        where: scopedId(userId, inboxMessage.id),
        data: {
          orphanedTransaction: snapshot as unknown as Prisma.InputJsonValue,
        },
      });
    }

    await tx.transaction.deleteMany({
      where: scopedId(userId, id),
    });
  });

  return {
    transaction: snapshot,
    inboxMessageId: inboxMessage?.id ?? null,
  };
}
