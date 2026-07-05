import { JOURNAL_PAGE_SIZE } from "@/config/journal";
import { TRANSACTION_CATEGORIES } from "@/config/categories";
import { prisma } from "@/lib/db/prisma";
import type { JournalFilters, JournalListResult } from "@/types/journal";
import type { Prisma } from "@/generated/prisma/client";

function buildWhere(filters: JournalFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {};

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
  filters: JournalFilters,
): Promise<JournalListResult> {
  const where = buildWhere(filters);
  const page = filters.page;
  const skip = (page - 1) * JOURNAL_PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: JOURNAL_PAGE_SIZE,
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        rawInput: true,
        occurredAt: true,
      },
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
