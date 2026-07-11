import {
  DAILY_DIGEST_HOUR_WIB,
  NOTIFICATION_ROUTES,
} from "@/config/notifications";
import { generateJournalCondition } from "@/lib/ai/generate-journal-condition";
import { getAvailableBalance } from "@/lib/db/balance";
import { listBudgetsForMonth } from "@/lib/db/budgets";
import {
  ensureDailySummaryForDay,
  ensurePendingDailySummaries,
  getYesterdayDailySummary,
} from "@/lib/db/daily-summary";
import { listPlans } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import { scopedByUser } from "@/lib/db/user-scope";
import {
  ensurePendingWeeklySummary,
  isMondayInAppTimezone,
} from "@/lib/db/weekly-summary";
import { buildDailySummaryTitle } from "@/lib/finance/build-daily-summary-message";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import {
  buildOverviewAlerts,
  formatOverviewAlertMessage,
} from "@/lib/finance/build-overview-alerts";
import { buildOverviewBrief } from "@/lib/finance/build-overview-brief";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { buildWeeklySummaryTitle } from "@/lib/finance/build-weekly-summary-message";
import {
  addDays,
  getDayRange,
  getHourInAppTimezone,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { sumRemainingBudgetTotal } from "@/lib/finance/sum-remaining-budget-total";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import { getPlannedItemsForExpansion } from "@/lib/db/planned-items";
import { getCurrentMonthKey } from "@/lib/planner/calendar";
import { listUpcomingIncomePayPlanEntries } from "@/lib/planner/list-upcoming-income-payplan";
import { sumUpcomingPayPlanThisMonth } from "@/lib/planner/sum-upcoming-payplan-this-month";
import { sumUpcomingIncomeThisMonth } from "@/lib/planner/sum-upcoming-income-this-month";
import type { NotificationDraft } from "@/types/notification";

function firstLine(text: string): string {
  return text.split("\n").find((line) => line.trim().length > 0) ?? text;
}

function secondLine(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[1] ?? lines[0] ?? text;
}

interface BuildUserNotificationDraftsOptions {
  /** Cron path — skip AI backfill/Gemini so the HTTP handler finishes quickly. */
  cron?: boolean;
}

async function getYesterdaySummaryContentForCron(
  userId: string,
  yesterday: Date,
): Promise<{ content: string; date: Date } | null> {
  const message = await prisma.inboxMessage.findFirst({
    where: {
      userId,
      kind: "daily_summary",
      summaryDate: startOfDay(yesterday),
    },
    select: { content: true },
  });

  if (!message) {
    return null;
  }

  return { content: message.content, date: yesterday };
}

function isDailyDigestDeliveryTime(referenceDate: Date): boolean {
  return getHourInAppTimezone(referenceDate) === DAILY_DIGEST_HOUR_WIB;
}

export async function buildUserNotificationDrafts(
  userId: string,
  referenceDate: Date = new Date(),
  options: BuildUserNotificationDraftsOptions = {},
): Promise<NotificationDraft[]> {
  const isCron = options.cron === true;
  const dayKey = toDayKey(referenceDate);
  const yesterday = addDays(startOfDay(referenceDate), -1);
  const shouldDeliverDailyDigest =
    !isCron || isDailyDigestDeliveryTime(referenceDate);
  const digestDay = isCron ? yesterday : referenceDate;
  const { start: digestStart, end: digestEnd } = getDayRange(digestDay);
  const shouldEnsureWeekly = isCron || isMondayInAppTimezone(referenceDate);

  if (!isCron) {
    await ensurePendingDailySummaries(userId);
  } else if (shouldDeliverDailyDigest) {
    await ensureDailySummaryForDay(userId, yesterday);
  }

  const weeklySummaryPromise = shouldEnsureWeekly
    ? ensurePendingWeeklySummary(userId, referenceDate)
    : Promise.resolve({
        created: false,
        content: null,
        weekStartDay: null,
        weekEnd: null,
      } as const);

  const [
    availableBalance,
    plans,
    savingsGoals,
    upcoming,
    todayTransactions,
    yesterdaySummary,
    weeklySummary,
    budgets,
    plannedItems,
  ] = await Promise.all([
    getAvailableBalance(userId, referenceDate),
    listPlans(userId),
    listSavingsGoals(userId),
    getPlansUpcomingImpact(userId, referenceDate, 14),
    prisma.transaction.findMany({
      where: scopedByUser(userId, {
        occurredAt: { gte: digestStart, lte: digestEnd },
      }),
      select: {
        type: true,
        amount: true,
        category: true,
        description: true,
      },
    }),
    isCron
      ? getYesterdaySummaryContentForCron(userId, yesterday)
      : getYesterdayDailySummary(userId),
    weeklySummaryPromise,
    listBudgetsForMonth(userId, getCurrentMonthKey(referenceDate)),
    getPlannedItemsForExpansion(userId),
  ]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const { upcomingPayPlanTotal, upcomingPayPlanCount } =
    sumUpcomingPayPlanThisMonth(upcoming, referenceDate);
  const { upcomingIncomeTotal, upcomingIncomeCount } =
    sumUpcomingIncomeThisMonth(plannedItems, referenceDate);
  const remainingBudgetTotal = sumRemainingBudgetTotal(budgets);
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(
      estimatedCost,
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

  const drafts: NotificationDraft[] = [];

  for (const item of upcoming) {
    if (item.daysUntil > 1) {
      continue;
    }

    if (item.daysUntil < 0) {
      drafts.push({
        kind: "bill_reminder",
        title: "Terlambat bayar",
        body: `${item.name} · ${formatIdr(item.amount)} · ${item.daysUntilLabel}`,
        href: NOTIFICATION_ROUTES.payplan,
        dedupeKey: `bill-overdue:${item.id}:${dayKey}`,
      });
      continue;
    }

    if (item.daysUntil === 0) {
      drafts.push({
        kind: "bill_reminder",
        title: "Tagihan jatuh tempo hari ini",
        body: `${item.name} · ${formatIdr(item.amount)}`,
        href: NOTIFICATION_ROUTES.payplan,
        dedupeKey: `bill-today:${item.id}:${dayKey}`,
      });
      continue;
    }

    drafts.push({
      kind: "bill_reminder",
      title: "Tagihan besok",
      body: `${item.name} · ${formatIdr(item.amount)} · ${item.dueLabel}`,
      href: NOTIFICATION_ROUTES.payplan,
      dedupeKey: `bill-tomorrow:${item.id}:${dayKey}`,
    });
  }

  const upcomingIncome = listUpcomingIncomePayPlanEntries(
    plannedItems,
    referenceDate,
    14,
  );

  for (const income of upcomingIncome) {
    if (income.daysUntil < 0 || income.daysUntil > 1) {
      continue;
    }

    if (income.daysUntil === 0) {
      drafts.push({
        kind: "bill_reminder",
        title: "Pemasukan masuk hari ini",
        body: `${income.item.name} · ${formatIdr(income.item.amount)}`,
        href: NOTIFICATION_ROUTES.payplan,
        dedupeKey: `income-today:${income.item.id}:${dayKey}`,
      });
      continue;
    }

    drafts.push({
      kind: "bill_reminder",
      title: "Pemasukan masuk besok",
      body: `${income.item.name} · ${formatIdr(income.item.amount)}`,
      href: NOTIFICATION_ROUTES.payplan,
      dedupeKey: `income-tomorrow:${income.item.id}:${dayKey}`,
    });
  }

  if (shouldDeliverDailyDigest && yesterdaySummary) {
    drafts.push({
      kind: "daily_summary",
      title: buildDailySummaryTitle(yesterday),
      body: firstLine(yesterdaySummary.content),
      href: NOTIFICATION_ROUTES.inbox,
      dedupeKey: `daily-summary:${toDayKey(yesterday)}`,
    });
  }

  if (
    weeklySummary.created &&
    weeklySummary.content &&
    weeklySummary.weekStartDay &&
    weeklySummary.weekEnd
  ) {
    drafts.push({
      kind: "weekly_summary",
      title: buildWeeklySummaryTitle(
        weeklySummary.weekStartDay,
        weeklySummary.weekEnd,
      ),
      body: secondLine(weeklySummary.content),
      href: NOTIFICATION_ROUTES.inbox,
      dedupeKey: `weekly-summary:${toDayKey(weeklySummary.weekStartDay)}`,
    });
  }

  const digestSummary = buildTodaySummary(todayTransactions);
  const condition = isCron
    ? buildFallbackJournalCondition(
        todayTransactions,
        digestSummary.totalExpense,
        digestSummary.totalIncome,
        availableBalance,
      )
    : await generateJournalCondition(
        userId,
        referenceDate,
        todayTransactions,
        availableBalance,
      );
  const brief = buildOverviewBrief(condition, digestSummary, plansOverview, {
    period: isCron ? "yesterday" : "today",
  });

  if (shouldDeliverDailyDigest) {
    drafts.push({
      kind: "ai_brief",
      title: `Ringkasan AI · ${brief.conditionLabel}`,
      body: brief.text,
      href: NOTIFICATION_ROUTES.overview,
      dedupeKey: `ai-brief:${dayKey}`,
    });
  }

  const alerts = buildOverviewAlerts({
    upcoming,
    plansOverview,
    availableBalance,
  });

  for (const alert of alerts) {
    drafts.push({
      kind: "alert",
      title: alert.title,
      body: formatOverviewAlertMessage(alert.segments),
      href: NOTIFICATION_ROUTES.overview,
      dedupeKey: `alert:${alert.id}:${dayKey}`,
    });
  }

  for (const goal of savingsGoals) {
    if (goal.status !== "active" || goal.targetAmount <= 0) {
      continue;
    }

    const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);

    if (progress < 50) {
      continue;
    }

    if (progress >= 100) {
      drafts.push({
        kind: "savings",
        title: "Target tabungan tercapai",
        body: `${goal.name} · ${formatIdr(goal.savedAmount)}`,
        href: NOTIFICATION_ROUTES.plans,
        dedupeKey: `savings-done:${goal.id}`,
      });
      continue;
    }

    if (progress >= 80) {
      drafts.push({
        kind: "savings",
        title: "Tabungan hampir tercapai",
        body: `${goal.name} · ${progress}% · ${formatIdr(goal.savedAmount)}`,
        href: NOTIFICATION_ROUTES.plans,
        dedupeKey: `savings-near:${goal.id}:${dayKey}`,
      });
    }
  }

  return drafts;
}
