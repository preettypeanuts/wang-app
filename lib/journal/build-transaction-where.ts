import { TRANSACTION_CATEGORIES } from "@/config/categories";
import type { Prisma } from "@/generated/prisma/client";
import { resolveJournalDateRangeBounds } from "@/lib/journal/journal-date-range";
import type { JournalFilters } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

export function buildJournalTransactionWhere(
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

  const dateRange = resolveJournalDateRangeBounds(filters);

  if (dateRange) {
    where.occurredAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  return where;
}

export function buildJournalTransactionWhereForDay(
  userId: string,
  filters: JournalFilters,
  dayStart: Date,
  dayEnd: Date,
): Prisma.TransactionWhereInput {
  const base = buildJournalTransactionWhere(userId, {
    ...filters,
    dateFrom: null,
    dateTo: null,
  });

  return {
    ...base,
    occurredAt: {
      gte: dayStart,
      lte: dayEnd,
    },
  };
}

export function buildJournalTransactionWhereForRange(
  userId: string,
  filters: JournalFilters,
  rangeStart: Date,
  rangeEnd: Date,
): Prisma.TransactionWhereInput {
  const base = buildJournalTransactionWhere(userId, {
    ...filters,
    dateFrom: null,
    dateTo: null,
  });

  return {
    ...base,
    occurredAt: {
      gte: rangeStart,
      lte: rangeEnd,
    },
  };
}

export function hasJournalTransactionFilters(filters: JournalFilters): boolean {
  return (
    filters.q !== "" ||
    filters.type !== "all" ||
    filters.category !== "all" ||
    Boolean(filters.dateFrom || filters.dateTo)
  );
}

export function isJournalTypeFilter(
  value: JournalFilters["type"],
): value is TransactionType {
  return value === "income" || value === "expense";
}
