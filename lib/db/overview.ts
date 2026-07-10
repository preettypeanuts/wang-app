import { getCategoryLabel } from "@/config/categories";
import { getAvailableBalance } from "@/lib/db/balance";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import { getJournalFilteredSummary } from "@/lib/db/journal-summary";
import {
  listJournalTransactionPreview,
  countJournalTransactions,
} from "@/lib/db/journal";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import {
  getMonthTransactionAggregates,
  getTodayTransactionRows,
} from "@/lib/db/transactions";
import { buildOverviewAlerts } from "@/lib/finance/build-overview-alerts";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { sumRemainingBudgetTotal } from "@/lib/finance/sum-remaining-budget-total";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { addDays, getDayRange, toDayKey } from "@/lib/finance/day-range";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatOverviewGreeting } from "@/lib/finance/format-overview-greeting";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import { hasJournalTransactionFilters } from "@/lib/journal/build-transaction-where";
import { isJournalDateRangeActive } from "@/lib/journal/journal-date-range";
import {
  formatPlannerMonthLabel,
  getCurrentMonthKey,
  getMonthRange,
} from "@/lib/planner/calendar";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import { sumUpcomingPayPlanThisMonth } from "@/lib/planner/sum-upcoming-payplan-this-month";
import type { JournalFilters } from "@/types/journal";
import type {
  OverviewFilterContext,
  OverviewPageResult,
} from "@/types/overview";
import type { TodaySummary } from "@/types/summary";

function hasOverviewTypeCategoryFilters(filters: JournalFilters): boolean {
  return (
    filters.q !== "" || filters.type !== "all" || filters.category !== "all"
  );
}

function buildOverviewActivityFilters(
  filters: JournalFilters,
  now: Date,
): JournalFilters {
  const dayKey = toDayKey(now);

  if (isJournalDateRangeActive(filters)) {
    return { ...filters, page: 1 };
  }

  return {
    ...filters,
    dateFrom: dayKey,
    dateTo: dayKey,
    page: 1,
  };
}

function buildOverviewFilterContext(
  filters: JournalFilters,
  periodLabel: string | null,
  periodDeltaLabel: string | null,
): OverviewFilterContext | undefined {
  const dateActive = isJournalDateRangeActive(filters);
  const typeCategoryActive = hasOverviewTypeCategoryFilters(filters);

  if (!dateActive && !typeCategoryActive) {
    return undefined;
  }

  if (dateActive) {
    const period = periodLabel ?? "periode";

    return {
      isDateRangeActive: true,
      periodLabel,
      incomeLabel: "Pemasukan",
      expenseLabel: "Pengeluaran",
      balanceDeltaLabel: periodDeltaLabel ?? "vs periode sebelumnya",
      activityTitle: "Aktivitas",
      activitySubtitle: period,
      activityEmptyMessage: typeCategoryActive
        ? "Tidak ada transaksi yang cocok dengan filter."
        : "Belum ada transaksi di periode ini.",
    };
  }

  return {
    isDateRangeActive: false,
    periodLabel: null,
    incomeLabel: "In hari ini",
    expenseLabel: "Out hari ini",
    balanceDeltaLabel: "vs kemarin",
    activityTitle: "Aktivitas hari ini",
    activitySubtitle: null,
    activityEmptyMessage: "Tidak ada transaksi yang cocok dengan filter.",
  };
}

export async function getOverviewPageData(
  userId: string,
  userName?: string | null,
  filters: JournalFilters = {
    q: "",
    type: "all",
    category: "all",
    page: 1,
    dateFrom: null,
    dateTo: null,
  },
): Promise<OverviewPageResult> {
  const now = new Date();
  const yesterday = addDays(now, -1);
  const monthKey = getCurrentMonthKey(now);
  const parsedMonth = getMonthRange(now.getFullYear(), now.getMonth());
  const { start: todayStart, end: todayEnd } = getDayRange(now);
  const { start: yesterdayStart, end: yesterdayEnd } = getDayRange(yesterday);
  const dateRangeActive = isJournalDateRangeActive(filters);
  const filtersActive = hasJournalTransactionFilters(filters);
  const activityFilters = buildOverviewActivityFilters(filters, now);

  const [
    availableBalance,
    yesterdayBalance,
    plans,
    savingsGoals,
    upcomingImpact,
    todayFlow,
    yesterdayFlow,
    todayTransactionRows,
    monthTransactions,
    budgets,
    filteredSummary,
    filteredActivityRows,
    filteredTransactionCount,
  ] = await Promise.all([
    getAvailableBalance(userId, now),
    getAvailableBalance(userId, yesterday),
    listPlans(userId),
    listSavingsGoals(userId),
    getPlansUpcomingImpact(userId, now),
    getDayFlowTotals(userId, todayStart, todayEnd),
    getDayFlowTotals(userId, yesterdayStart, yesterdayEnd),
    getTodayTransactionRows(userId, toDayKey(now)),
    getMonthTransactionAggregates(
      userId,
      monthKey,
      parsedMonth.start,
      parsedMonth.end,
    ),
    listBudgetsForMonth(userId, monthKey),
    dateRangeActive
      ? getJournalFilteredSummary(userId, filters)
      : Promise.resolve(null),
    filtersActive
      ? listJournalTransactionPreview(userId, activityFilters)
      : Promise.resolve(null),
    dateRangeActive
      ? countJournalTransactions(userId, filters)
      : Promise.resolve(null),
  ]);

  const activityRows = filtersActive
    ? (filteredActivityRows ?? [])
    : [...todayTransactionRows]
        .sort(
          (left, right) =>
            new Date(right.occurredAt).getTime() -
            new Date(left.occurredAt).getTime(),
        )
        .slice(0, 6);

  const journalTransactions = (
    filtersActive ? activityRows : todayTransactionRows
  ).map((transaction) => ({
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
  }));

  const todaySummary: TodaySummary =
    dateRangeActive && filteredSummary
      ? {
          totalIncome: filteredSummary.totalIncome,
          totalExpense: filteredSummary.totalExpense,
          balance: filteredSummary.cumulativeBalance,
          categories: [],
        }
      : buildTodaySummary(journalTransactions);
  const monthSummary = buildTodaySummary(monthTransactions);

  const heroDeltas = dateRangeActive
    ? {
        incomeDelta: filteredSummary?.incomeDelta ?? 0,
        expenseDelta: filteredSummary?.expenseDelta ?? 0,
        balanceDelta: filteredSummary?.balanceDelta ?? 0,
      }
    : {
        incomeDelta: todayFlow.totalIncome - yesterdayFlow.totalIncome,
        expenseDelta: todayFlow.totalExpense - yesterdayFlow.totalExpense,
        balanceDelta: availableBalance - yesterdayBalance,
      };

  const monthlySnapshot = dateRangeActive
    ? {
        monthLabel:
          filteredSummary?.periodLabel ?? formatPlannerMonthLabel(monthKey),
        totalIncome: filteredSummary?.totalIncome ?? 0,
        totalExpense: filteredSummary?.totalExpense ?? 0,
        netFlow:
          (filteredSummary?.totalIncome ?? 0) -
          (filteredSummary?.totalExpense ?? 0),
        transactionCount: filteredTransactionCount ?? 0,
      }
    : {
        monthLabel: formatPlannerMonthLabel(monthKey),
        totalIncome: monthSummary.totalIncome,
        totalExpense: monthSummary.totalExpense,
        netFlow: monthSummary.totalIncome - monthSummary.totalExpense,
        transactionCount: monthTransactions.length,
      };

  const filterContext = buildOverviewFilterContext(
    filters,
    filteredSummary?.periodLabel ?? null,
    filteredSummary?.periodDeltaLabel ?? null,
  );

  const { upcomingPayPlanTotal, upcomingPayPlanCount } =
    sumUpcomingPayPlanThisMonth(upcomingImpact, now);
  const activePlanCost = plans
    .filter((plan) => plan.status === "active")
    .reduce((sum, plan) => sum + plan.amount, 0);
  const remainingBudgetTotal = sumRemainingBudgetTotal(budgets);
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(
      activePlanCost,
      availableBalance,
      upcomingPayPlanTotal,
      remainingBudgetTotal,
    ),
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    [],
    remainingBudgetTotal,
  );

  const savingsOverview = buildSavingsOverview(savingsGoals, availableBalance);

  return {
    data: {
      greeting: formatOverviewGreeting(now, userName),
      balance: dateRangeActive
        ? (filteredSummary?.cumulativeBalance ?? availableBalance)
        : availableBalance,
      dayDeltas: heroDeltas,
      alerts: buildOverviewAlerts({
        upcoming: upcomingImpact,
        plansOverview,
        availableBalance,
      }),
      upcoming: upcomingImpact,
      plansOverview,
      savingsOverview,
      monthlySnapshot,
      todaySummary,
      filterContext,
      todayActivity: activityRows.map((transaction) => ({
        id: transaction.id,
        title: transaction.rawInput.trim() || transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        timeLabel: formatJournalTime(new Date(transaction.occurredAt)),
        categoryLabel: getCategoryLabel(transaction.category),
      })),
    },
    aiBriefInputs: {
      userId,
      journalTransactions,
      availableBalance,
      todaySummary,
      plansOverview,
    },
  };
}
