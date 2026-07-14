import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import {
  UI_LABEL_VS_LAST_MONTH,
  UI_LABEL_VS_PREVIOUS_PERIOD,
} from "@/config/ui-labels";
import {
  hydrateJournalDaySummary,
  serializeJournalDaySummary,
  type SerializedJournalDaySummary,
} from "@/lib/cache/serialize-journal";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import {
  addDays,
  endOfDay,
  getDateOnlyParts,
  parseDayKey,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import {
  formatJournalDateRangeLabel,
  resolveJournalDateRangeBounds,
} from "@/lib/journal/journal-date-range";
import {
  getCurrentMonthKey,
  getMonthRange,
  parseMonthKey,
  shiftMonthKey,
  toMonthKey,
} from "@/lib/planner/calendar";
import { prisma } from "@/lib/db/prisma";
import { flowTransactionTypesWhere, toFlowTransactionRows } from "@/lib/db/transaction-flow-filter";
import { scopedByUser } from "@/lib/db/user-scope";
import type { JournalDaySummary, JournalFilters } from "@/types/journal";
import { cache } from "react";

async function getMonthTransactions(
  userId: string,
  start: Date,
  end: Date,
) {
  return toFlowTransactionRows(
    await prisma.transaction.findMany({
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
        description: true,
      },
      orderBy: {
        occurredAt: "asc",
      },
    }),
  );
}

async function getCumulativeBalance(userId: string, date: Date): Promise<number> {
  const end = endOfDay(date);

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

async function buildJournalRangeSummary(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date,
  periodLabel: string,
): Promise<JournalDaySummary> {
  const rangeDays =
    Math.round(
      (startOfDay(rangeEnd).getTime() - startOfDay(rangeStart).getTime()) /
        86_400_000,
    ) + 1;
  const previousEnd = addDays(rangeStart, -1);
  const previousStart = addDays(previousEnd, -(rangeDays - 1));

  const [
    currentFlow,
    previousFlow,
    rangeTransactions,
    cumulativeBalance,
    previousEndBalance,
  ] = await Promise.all([
    getDayFlowTotals(userId, rangeStart, rangeEnd),
    getDayFlowTotals(userId, previousStart, previousEnd),
    getMonthTransactions(userId, rangeStart, rangeEnd),
    getCumulativeBalance(userId, rangeEnd),
    getCumulativeBalance(userId, previousEnd),
  ]);

  const summary = buildTodaySummary(rangeTransactions);
  const condition = buildFallbackJournalCondition(
    rangeTransactions,
    summary.totalExpense,
    summary.totalIncome,
    cumulativeBalance,
  );

  return {
    date: rangeStart,
    totalExpense: currentFlow.totalExpense,
    totalIncome: currentFlow.totalIncome,
    cumulativeBalance,
    expenseDelta: currentFlow.totalExpense - previousFlow.totalExpense,
    incomeDelta: currentFlow.totalIncome - previousFlow.totalIncome,
    balanceDelta: cumulativeBalance - previousEndBalance,
    condition,
    periodLabel,
    periodDeltaLabel: UI_LABEL_VS_PREVIOUS_PERIOD,
  };
}

async function buildJournalDaySummary(
  userId: string,
  date: Date,
): Promise<JournalDaySummary> {
  const anchor = startOfDay(date);
  const { year, month } = getDateOnlyParts(anchor);
  const currentMonthStart = getMonthRange(year, month).start;
  const currentMonthEnd = endOfDay(anchor);

  const lastMonthKey = shiftMonthKey(toMonthKey(year, month), -1);
  const lastMonthParsed = parseMonthKey(lastMonthKey);

  if (!lastMonthParsed) {
    throw new Error("Bulan journal tidak valid.");
  }

  const lastMonthRange = getMonthRange(
    lastMonthParsed.year,
    lastMonthParsed.month,
  );

  const [
    currentMonthFlow,
    lastMonthFlow,
    monthTransactions,
    cumulativeBalance,
    lastMonthEndBalance,
  ] = await Promise.all([
    getDayFlowTotals(userId, currentMonthStart, currentMonthEnd),
    getDayFlowTotals(userId, lastMonthRange.start, lastMonthRange.end),
    getMonthTransactions(userId, currentMonthStart, currentMonthEnd),
    getCumulativeBalance(userId, anchor),
    getCumulativeBalance(userId, lastMonthRange.end),
  ]);

  const summary = buildTodaySummary(monthTransactions);
  const condition = buildFallbackJournalCondition(
    monthTransactions,
    summary.totalExpense,
    summary.totalIncome,
    cumulativeBalance,
  );

  return {
    date: currentMonthStart,
    totalExpense: currentMonthFlow.totalExpense,
    totalIncome: currentMonthFlow.totalIncome,
    cumulativeBalance,
    expenseDelta:
      currentMonthFlow.totalExpense - lastMonthFlow.totalExpense,
    incomeDelta: currentMonthFlow.totalIncome - lastMonthFlow.totalIncome,
    balanceDelta: cumulativeBalance - lastMonthEndBalance,
    condition,
    periodLabel: null,
    periodDeltaLabel: UI_LABEL_VS_LAST_MONTH,
  };
}

function getCachedJournalDaySummary(
  userId: string,
  monthKey: string,
  asOfDayKey: string,
) {
  return unstable_cache(
    async (): Promise<SerializedJournalDaySummary> => {
      const summary = await buildJournalDaySummary(
        userId,
        parseDayKey(asOfDayKey),
      );
      return serializeJournalDaySummary(summary);
    },
    ["journal-day-summary", userId, monthKey, asOfDayKey],
    { tags: [userDataTags.transactions(userId)] },
  );
}

/** Journal header widget — current month (MTD) vs previous full month. */
export const getJournalDaySummary = cache(
  async (
    userId: string,
    date: Date = new Date(),
  ): Promise<JournalDaySummary> => {
    const monthKey = getCurrentMonthKey(date);
    const asOfDayKey = toDayKey(date);
    const cached = await getCachedJournalDaySummary(
      userId,
      monthKey,
      asOfDayKey,
    )();
    return hydrateJournalDaySummary(cached);
  },
);

function getCachedJournalRangeSummary(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  return unstable_cache(
    async (): Promise<SerializedJournalDaySummary> => {
      const filters: JournalFilters = {
        q: "",
        type: "all",
        category: "all",
        walletId: "all",
        page: 1,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      };
      const bounds = resolveJournalDateRangeBounds(filters);

      if (!bounds) {
        const summary = await buildJournalDaySummary(userId, new Date());
        return serializeJournalDaySummary(summary);
      }

      const summary = await buildJournalRangeSummary(
        userId,
        bounds.start,
        bounds.end,
        formatJournalDateRangeLabel(filters) ?? "",
      );
      return serializeJournalDaySummary(summary);
    },
    ["journal-range-summary", userId, dateFrom, dateTo],
    { tags: [userDataTags.transactions(userId)] },
  );
}

/** Summary tiles follow active journal filters (month default or custom range). */
export const getJournalFilteredSummary = cache(
  async (
    userId: string,
    filters: JournalFilters,
  ): Promise<JournalDaySummary> => {
    const bounds = resolveJournalDateRangeBounds(filters);

    if (!bounds) {
      return getJournalDaySummary(userId);
    }

    const cached = await getCachedJournalRangeSummary(
      userId,
      filters.dateFrom ?? "",
      filters.dateTo ?? "",
    )();
    return hydrateJournalDaySummary(cached);
  },
);
