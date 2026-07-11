import { getCategoryLabel } from "@/config/categories";
import {
  UI_LABEL_OVERVIEW_ACTIVITY,
  UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_FILTERED,
  UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_PERIOD,
  UI_LABEL_OVERVIEW_ACTIVITY_TODAY,
  UI_LABEL_OVERVIEW_EXPENSE,
  UI_LABEL_OVERVIEW_INCOME,
  UI_LABEL_OVERVIEW_IN_TODAY,
  UI_LABEL_OVERVIEW_OUT_TODAY,
  UI_LABEL_OVERVIEW_VS_YESTERDAY,
  UI_LABEL_PERIOD_FALLBACK,
  UI_LABEL_VS_PREVIOUS_PERIOD,
} from "@/config/ui-labels";
import { getAvailableBalance } from "@/lib/db/balance";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import {
  countJournalTransactions,
  getJournalFlowTotals,
  listJournalTransactionPreview,
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
import {
  addDays,
  getDayRange,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatOverviewGreeting } from "@/lib/finance/format-overview-greeting";
import type { DayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import { getDayFlowTotals } from "@/lib/finance/get-day-flow-totals";
import { hasJournalTransactionFilters } from "@/lib/journal/build-transaction-where";
import {
  formatJournalDateRangeLabel,
  isJournalDateRangeActive,
  resolveJournalDateRangeBounds,
} from "@/lib/journal/journal-date-range";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import {
  formatPlannerMonthLabel,
  getCurrentMonthKey,
  getMonthRange,
} from "@/lib/planner/calendar";
import { sumUpcomingPayPlanThisMonth } from "@/lib/planner/sum-upcoming-payplan-this-month";
import { sumUpcomingIncomeThisMonth } from "@/lib/planner/sum-upcoming-income-this-month";
import type { JournalFilters } from "@/types/journal";
import type {
  OverviewFilterContext,
  OverviewPageResult,
} from "@/types/overview";
import type { TodaySummary } from "@/types/summary";

const OVERVIEW_ACTIVITY_LIMIT = 6;
const OVERVIEW_AI_BRIEF_TRANSACTION_LIMIT = 30;

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

function buildPreviousPeriodFilters(
  filters: JournalFilters,
): JournalFilters | null {
  const bounds = resolveJournalDateRangeBounds(filters);

  if (!bounds) {
    return null;
  }

  const rangeDays =
    Math.round(
      (startOfDay(bounds.end).getTime() - startOfDay(bounds.start).getTime()) /
        86_400_000,
    ) + 1;
  const previousEnd = addDays(bounds.start, -1);
  const previousStart = addDays(previousEnd, -(rangeDays - 1));

  return {
    ...filters,
    dateFrom: toDayKey(previousStart),
    dateTo: toDayKey(previousEnd),
    page: 1,
  };
}

function buildOverviewFilterContext(
  filters: JournalFilters,
  periodLabel: string | null,
): OverviewFilterContext | undefined {
  const dateActive = isJournalDateRangeActive(filters);
  const typeCategoryActive = hasOverviewTypeCategoryFilters(filters);

  if (!dateActive && !typeCategoryActive) {
    return undefined;
  }

  if (dateActive) {
    const period = periodLabel ?? UI_LABEL_PERIOD_FALLBACK;

    return {
      isDateRangeActive: true,
      periodLabel,
      incomeLabel: UI_LABEL_OVERVIEW_INCOME,
      expenseLabel: UI_LABEL_OVERVIEW_EXPENSE,
      balanceDeltaLabel: UI_LABEL_VS_PREVIOUS_PERIOD,
      activityTitle: UI_LABEL_OVERVIEW_ACTIVITY,
      activitySubtitle: period,
      activityEmptyMessage: typeCategoryActive
        ? UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_FILTERED
        : UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_PERIOD,
    };
  }

  return {
    isDateRangeActive: false,
    periodLabel: null,
    incomeLabel: UI_LABEL_OVERVIEW_IN_TODAY,
    expenseLabel: UI_LABEL_OVERVIEW_OUT_TODAY,
    balanceDeltaLabel: UI_LABEL_OVERVIEW_VS_YESTERDAY,
    activityTitle: UI_LABEL_OVERVIEW_ACTIVITY_TODAY,
    activitySubtitle: null,
    activityEmptyMessage: UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_FILTERED,
  };
}

function buildFilteredTodaySummary(
  flow: DayFlowTotals,
  balance: number,
): TodaySummary {
  return {
    totalIncome: flow.totalIncome,
    totalExpense: flow.totalExpense,
    balance,
    categories: [],
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
  const aggregateFilters = dateRangeActive
    ? { ...filters, page: 1 }
    : activityFilters;
  const previousPeriodFilters = dateRangeActive
    ? buildPreviousPeriodFilters(filters)
    : null;
  const yesterdayAggregateFilters = !dateRangeActive
    ? {
        ...activityFilters,
        dateFrom: toDayKey(yesterday),
        dateTo: toDayKey(yesterday),
        page: 1,
      }
    : null;
  const dateBounds = dateRangeActive
    ? resolveJournalDateRangeBounds(filters)
    : null;
  const aiBriefFilters = dateRangeActive
    ? { ...filters, page: 1 }
    : activityFilters;
  const periodLabel = dateRangeActive
    ? formatJournalDateRangeLabel(filters)
    : null;

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
    filteredFlow,
    previousFilteredFlow,
    periodEndBalance,
    previousPeriodEndBalance,
    filteredActivityRows,
    filteredTransactionCount,
    aiBriefTransactionRows,
    plannedItemsForIncome,
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
    filtersActive
      ? getJournalFlowTotals(userId, aggregateFilters)
      : Promise.resolve(null),
    filtersActive && previousPeriodFilters
      ? getJournalFlowTotals(userId, previousPeriodFilters)
      : filtersActive && yesterdayAggregateFilters
        ? getJournalFlowTotals(userId, yesterdayAggregateFilters)
        : Promise.resolve(null),
    dateBounds
      ? getAvailableBalance(userId, dateBounds.end)
      : Promise.resolve(null),
    dateBounds
      ? getAvailableBalance(userId, addDays(dateBounds.start, -1))
      : Promise.resolve(null),
    filtersActive
      ? listJournalTransactionPreview(
          userId,
          activityFilters,
          OVERVIEW_ACTIVITY_LIMIT,
        )
      : Promise.resolve(null),
    dateRangeActive
      ? countJournalTransactions(userId, filters)
      : Promise.resolve(null),
    filtersActive
      ? listJournalTransactionPreview(
          userId,
          aiBriefFilters,
          OVERVIEW_AI_BRIEF_TRANSACTION_LIMIT,
        )
      : Promise.resolve(null),
    getPlannedItemsForExpansion(userId),
  ]);

  const activityRows = filtersActive
    ? (filteredActivityRows ?? [])
    : [...todayTransactionRows]
        .sort(
          (left, right) =>
            new Date(right.occurredAt).getTime() -
            new Date(left.occurredAt).getTime(),
        )
        .slice(0, OVERVIEW_ACTIVITY_LIMIT);

  const defaultTodaySummary = buildTodaySummary(
    todayTransactionRows.map((transaction) => ({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
    })),
  );
  const monthSummary = buildTodaySummary(monthTransactions);

  const displayBalance = dateRangeActive
    ? (periodEndBalance ?? availableBalance)
    : availableBalance;

  const todaySummary: TodaySummary =
    filtersActive && filteredFlow
      ? buildFilteredTodaySummary(filteredFlow, displayBalance)
      : defaultTodaySummary;

  const heroDeltas =
    filtersActive && filteredFlow && previousFilteredFlow
      ? {
          incomeDelta:
            filteredFlow.totalIncome - previousFilteredFlow.totalIncome,
          expenseDelta:
            filteredFlow.totalExpense - previousFilteredFlow.totalExpense,
          balanceDelta: dateRangeActive
            ? (periodEndBalance ?? availableBalance) -
              (previousPeriodEndBalance ?? yesterdayBalance)
            : availableBalance - yesterdayBalance,
        }
      : {
          incomeDelta: todayFlow.totalIncome - yesterdayFlow.totalIncome,
          expenseDelta: todayFlow.totalExpense - yesterdayFlow.totalExpense,
          balanceDelta: availableBalance - yesterdayBalance,
        };

  const monthlySnapshot = dateRangeActive
    ? {
        monthLabel: periodLabel ?? formatPlannerMonthLabel(monthKey),
        totalIncome: filteredFlow?.totalIncome ?? 0,
        totalExpense: filteredFlow?.totalExpense ?? 0,
        netFlow:
          (filteredFlow?.totalIncome ?? 0) - (filteredFlow?.totalExpense ?? 0),
        transactionCount: filteredTransactionCount ?? 0,
        isCustomPeriod: true,
      }
    : {
        monthLabel: formatPlannerMonthLabel(monthKey),
        totalIncome: monthSummary.totalIncome,
        totalExpense: monthSummary.totalExpense,
        netFlow: monthSummary.totalIncome - monthSummary.totalExpense,
        transactionCount: monthTransactions.length,
        isCustomPeriod: false,
      };

  const filterContext = buildOverviewFilterContext(filters, periodLabel);

  const aiBriefJournalTransactions = (
    filtersActive ? (aiBriefTransactionRows ?? []) : todayTransactionRows
  ).map((transaction) => ({
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
  }));

  const { upcomingPayPlanTotal, upcomingPayPlanCount } =
    sumUpcomingPayPlanThisMonth(upcomingImpact, now);
  const { upcomingIncomeTotal, upcomingIncomeCount } =
    sumUpcomingIncomeThisMonth(plannedItemsForIncome, now);
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
      upcomingIncomeTotal,
    ),
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
    [],
    remainingBudgetTotal,
    upcomingIncomeTotal,
    upcomingIncomeCount,
  );

  const savingsOverview = buildSavingsOverview(savingsGoals, availableBalance);

  return {
    data: {
      greeting: formatOverviewGreeting(now, userName),
      balance: displayBalance,
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
      journalTransactions: aiBriefJournalTransactions,
      availableBalance: displayBalance,
      todaySummary,
      plansOverview,
    },
  };
}
