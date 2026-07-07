import { normalizeCategory } from "@/config/categories";
import type { Prisma } from "@/generated/prisma/client";
import {
  toBudgetWriteData,
  toNextMonthBudgetInput,
} from "@/lib/db/budget-repeat";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import { buildBudgetStatus } from "@/lib/finance/compute-budget-status";
import {
  getMonthRange,
  parseMonthKey,
  shiftMonthKey,
} from "@/lib/planner/calendar";
import type {
  BudgetStatus,
  CategoryBudgetFormInput,
  CategoryBudgetRecord,
} from "@/types/budget";

const BUDGET_SELECT = {
  id: true,
  category: true,
  periodMonth: true,
  limitMode: true,
  dailyAmount: true,
  fixedLimit: true,
  dayCount: true,
  note: true,
  repeatNextMonth: true,
} as const;

function mapBudget(record: {
  id: string;
  category: string;
  periodMonth: string;
  limitMode: "daily" | "fixed";
  dailyAmount: number | null;
  fixedLimit: number | null;
  dayCount: number | null;
  note: string | null;
  repeatNextMonth: boolean;
}): CategoryBudgetRecord {
  return {
    id: record.id,
    category: record.category,
    periodMonth: record.periodMonth,
    limitMode: record.limitMode,
    dailyAmount: record.dailyAmount,
    fixedLimit: record.fixedLimit,
    dayCount: record.dayCount,
    note: record.note,
    repeatNextMonth: record.repeatNextMonth,
  };
}

function buildInboxManualExpenseWhere(
  userId: string,
  start: Date,
  end: Date,
): Prisma.TransactionWhereInput {
  return {
    userId,
    type: "expense",
    occurredAt: {
      gte: start,
      lte: end,
    },
    inboxMessage: {
      kind: "chat",
    },
  };
}

async function getCategorySpentMap(
  userId: string,
  periodMonth: string,
): Promise<Map<string, number>> {
  const parsed = parseMonthKey(periodMonth);
  if (!parsed) {
    return new Map();
  }

  const { start, end } = getMonthRange(parsed.year, parsed.month);
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: buildInboxManualExpenseWhere(userId, start, end),
    _sum: {
      amount: true,
    },
  });

  const spentMap = new Map<string, number>();
  for (const row of rows) {
    const key = normalizeCategory(row.category);
    spentMap.set(key, (spentMap.get(key) ?? 0) + (row._sum.amount ?? 0));
  }

  return spentMap;
}

async function provisionRepeatingBudgetsFromPreviousMonth(
  userId: string,
  periodMonth: string,
): Promise<void> {
  const previousMonth = shiftMonthKey(periodMonth, -1);
  const repeating = await prisma.categoryBudget.findMany({
    where: {
      userId,
      periodMonth: previousMonth,
      repeatNextMonth: true,
    },
    select: BUDGET_SELECT,
  });

  if (repeating.length === 0) {
    return;
  }

  for (const source of repeating) {
    await prisma.categoryBudget.upsert({
      where: {
        userId_category_periodMonth: {
          userId,
          category: source.category,
          periodMonth,
        },
      },
      create: {
        userId,
        category: source.category,
        periodMonth,
        limitMode: source.limitMode,
        dailyAmount: source.dailyAmount,
        fixedLimit: source.fixedLimit,
        dayCount: source.dayCount,
        note: source.note,
        repeatNextMonth: true,
      },
      update: {},
    });
  }
}

async function syncNextMonthBudget(
  userId: string,
  input: CategoryBudgetFormInput,
): Promise<void> {
  const nextPeriodMonth = shiftMonthKey(input.periodMonth, 1);

  if (input.repeatNextMonth) {
    const nextInput = toNextMonthBudgetInput(input, nextPeriodMonth);
    await prisma.categoryBudget.upsert({
      where: {
        userId_category_periodMonth: {
          userId,
          category: input.category,
          periodMonth: nextPeriodMonth,
        },
      },
      create: {
        userId,
        ...toBudgetWriteData(nextInput),
      },
      update: toBudgetWriteData(nextInput),
    });
    return;
  }

  await prisma.categoryBudget.updateMany({
    where: {
      userId,
      category: input.category,
      periodMonth: nextPeriodMonth,
    },
    data: {
      repeatNextMonth: false,
    },
  });
}

export async function listBudgetsForMonth(
  userId: string,
  periodMonth: string,
): Promise<BudgetStatus[]> {
  await provisionRepeatingBudgetsFromPreviousMonth(userId, periodMonth);

  const [budgets, spentMap] = await Promise.all([
    prisma.categoryBudget.findMany({
      where: { userId, periodMonth },
      select: BUDGET_SELECT,
      orderBy: { category: "asc" },
    }),
    getCategorySpentMap(userId, periodMonth),
  ]);

  return budgets.map((budget) =>
    buildBudgetStatus(mapBudget(budget), spentMap.get(budget.category) ?? 0),
  );
}

export async function getBudgetForCategory(
  userId: string,
  category: string,
  periodMonth: string,
  additionalSpent = 0,
): Promise<{ budget: CategoryBudgetRecord; status: BudgetStatus } | null> {
  const budget = await prisma.categoryBudget.findUnique({
    where: {
      userId_category_periodMonth: {
        userId,
        category,
        periodMonth,
      },
    },
    select: BUDGET_SELECT,
  });

  if (!budget) {
    return null;
  }

  const parsed = parseMonthKey(periodMonth);
  if (!parsed) {
    return null;
  }

  const { start, end } = getMonthRange(parsed.year, parsed.month);
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: buildInboxManualExpenseWhere(userId, start, end),
    _sum: {
      amount: true,
    },
  });

  const normalizedCategory = normalizeCategory(category);
  let spentTotal = additionalSpent;
  for (const row of rows) {
    if (normalizeCategory(row.category) === normalizedCategory) {
      spentTotal += row._sum.amount ?? 0;
    }
  }

  const record = mapBudget(budget);
  return {
    budget: record,
    status: buildBudgetStatus(record, spentTotal),
  };
}

export async function createCategoryBudget(
  userId: string,
  input: CategoryBudgetFormInput,
): Promise<CategoryBudgetRecord> {
  const created = await prisma.categoryBudget.create({
    data: {
      userId,
      ...toBudgetWriteData(input),
    },
    select: BUDGET_SELECT,
  });

  await syncNextMonthBudget(userId, input);

  return mapBudget(created);
}

export async function updateCategoryBudget(
  userId: string,
  id: string,
  input: CategoryBudgetFormInput,
): Promise<CategoryBudgetRecord> {
  const updated = await prisma.categoryBudget.updateMany({
    where: scopedId(userId, id),
    data: toBudgetWriteData(input),
  });

  if (updated.count === 0) {
    throw new Error("Budget tidak ditemukan.");
  }

  const record = await prisma.categoryBudget.findFirstOrThrow({
    where: scopedId(userId, id),
    select: BUDGET_SELECT,
  });

  await syncNextMonthBudget(userId, input);

  return mapBudget(record);
}

export async function deleteCategoryBudget(
  userId: string,
  id: string,
): Promise<void> {
  const deleted = await prisma.categoryBudget.deleteMany({
    where: scopedId(userId, id),
  });

  if (deleted.count === 0) {
    throw new Error("Budget tidak ditemukan.");
  }
}
