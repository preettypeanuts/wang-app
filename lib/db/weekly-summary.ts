import { endOfWeek, getDay, startOfWeek } from "date-fns";

import {
  buildWeeklySummaryMessage,
  type WeeklySummaryStats,
} from "@/lib/finance/build-weekly-summary-message";
import {
  addDays,
  endOfDay,
  parseDayKey,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";

export interface WeekRange {
  /** Monday 00:00 WIB */
  start: Date;
  /** Sunday 23:59:59.999 WIB */
  end: Date;
  /** Monday calendar day (startOfDay) — use as InboxMessage.summaryDate */
  weekStartDay: Date;
}

/** Senin–Minggu for the week containing `referenceDate` (app timezone). */
export function getWeekRange(referenceDate: Date): WeekRange {
  const anchor = parseDayKey(toDayKey(referenceDate));
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });

  return {
    start: startOfDay(weekStart),
    end: endOfDay(weekEnd),
    weekStartDay: startOfDay(weekStart),
  };
}

export function isMondayInAppTimezone(date: Date): boolean {
  const anchor = parseDayKey(toDayKey(date));
  return getDay(anchor) === 1;
}

async function getWeekFlowTotals(
  userId: string,
  start: Date,
  end: Date,
): Promise<{ totalIncome: number; totalExpense: number }> {
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        type: "income",
        occurredAt: { gte: start, lte: end },
      }),
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: scopedByUser(userId, {
        type: "expense",
        occurredAt: { gte: start, lte: end },
      }),
      _sum: { amount: true },
    }),
  ]);

  return {
    totalIncome: incomeAgg._sum.amount ?? 0,
    totalExpense: expenseAgg._sum.amount ?? 0,
  };
}

async function getTopExpenseCategory(
  userId: string,
  start: Date,
  end: Date,
): Promise<{ categoryId: string | null; amount: number }> {
  const groups = await prisma.transaction.groupBy({
    by: ["category"],
    where: scopedByUser(userId, {
      type: "expense",
      occurredAt: { gte: start, lte: end },
    }),
    _sum: { amount: true },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: 1,
  });

  const top = groups[0];
  if (!top || (top._sum.amount ?? 0) <= 0) {
    return { categoryId: null, amount: 0 };
  }

  return {
    categoryId: top.category,
    amount: top._sum.amount ?? 0,
  };
}

export async function collectWeeklySummaryStats(
  userId: string,
  weekStartDay: Date,
): Promise<WeeklySummaryStats> {
  const week = getWeekRange(weekStartDay);
  const previousWeek = getWeekRange(addDays(week.weekStartDay, -7));

  const [current, previous, top] = await Promise.all([
    getWeekFlowTotals(userId, week.start, week.end),
    getWeekFlowTotals(userId, previousWeek.start, previousWeek.end),
    getTopExpenseCategory(userId, week.start, week.end),
  ]);

  const hasPreviousActivity =
    previous.totalExpense > 0 || previous.totalIncome > 0;

  return {
    weekStart: week.weekStartDay,
    weekEnd: week.end,
    totalExpense: current.totalExpense,
    totalIncome: current.totalIncome,
    topCategoryId: top.categoryId,
    topCategoryAmount: top.amount,
    previousWeekExpense: hasPreviousActivity ? previous.totalExpense : null,
  };
}

export interface EnsureWeeklySummaryResult {
  /** True only when this call inserted a new weekly_summary row. */
  created: boolean;
  content: string | null;
  weekStartDay: Date | null;
  weekEnd: Date | null;
}

const EMPTY_WEEKLY_RESULT: EnsureWeeklySummaryResult = {
  created: false,
  content: null,
  weekStartDay: null,
  weekEnd: null,
};

async function createWeeklySummaryForWeek(
  userId: string,
  weekStartDay: Date,
): Promise<EnsureWeeklySummaryResult> {
  const summaryDate = startOfDay(weekStartDay);
  const existing = await prisma.inboxMessage.findFirst({
    where: {
      userId,
      kind: "weekly_summary",
      summaryDate,
    },
    select: { id: true },
  });

  if (existing) {
    return EMPTY_WEEKLY_RESULT;
  }

  const stats = await collectWeeklySummaryStats(userId, summaryDate);
  const content = buildWeeklySummaryMessage(stats);
  const week = getWeekRange(summaryDate);

  await prisma.inboxMessage.create({
    data: {
      userId,
      role: "assistant",
      kind: "weekly_summary",
      content,
      summaryDate,
      // Appear at the start of the new week (right after last week's Sunday).
      createdAt: addDays(week.end, 1),
    },
  });

  return {
    created: true,
    content,
    weekStartDay: summaryDate,
    weekEnd: week.end,
  };
}

const ensurePendingWeeklySummaryByUser = new Map<
  string,
  Promise<EnsureWeeklySummaryResult>
>();

/**
 * On Monday, ensure a weekly_summary exists for the previous Mon–Sun week.
 * `created` is true only on the first generation (used to avoid repeat pushes).
 */
export async function ensurePendingWeeklySummary(
  userId: string,
  referenceDate: Date = new Date(),
): Promise<EnsureWeeklySummaryResult> {
  const dayKey = toDayKey(referenceDate);
  const cacheKey = `${userId}:${dayKey}`;
  const existing = ensurePendingWeeklySummaryByUser.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = runEnsurePendingWeeklySummary(userId, referenceDate).finally(
    () => {
      ensurePendingWeeklySummaryByUser.delete(cacheKey);
    },
  );

  ensurePendingWeeklySummaryByUser.set(cacheKey, promise);
  return promise;
}

async function runEnsurePendingWeeklySummary(
  userId: string,
  referenceDate: Date,
): Promise<EnsureWeeklySummaryResult> {
  if (!isMondayInAppTimezone(referenceDate)) {
    return EMPTY_WEEKLY_RESULT;
  }

  const thisWeek = getWeekRange(referenceDate);
  const previousWeekStart = addDays(thisWeek.weekStartDay, -7);

  return createWeeklySummaryForWeek(userId, previousWeekStart);
}
