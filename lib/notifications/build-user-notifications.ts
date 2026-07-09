import { generateJournalCondition } from "@/lib/ai/generate-journal-condition";
import { getAvailableBalance } from "@/lib/db/balance";
import {
  ensurePendingDailySummaries,
  getYesterdayDailySummary,
} from "@/lib/db/daily-summary";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import {
  ensurePendingWeeklySummary,
  isMondayInAppTimezone,
} from "@/lib/db/weekly-summary";
import { buildOverviewAlerts } from "@/lib/finance/build-overview-alerts";
import { buildOverviewBrief } from "@/lib/finance/build-overview-brief";
import { buildDailySummaryTitle } from "@/lib/finance/build-daily-summary-message";
import { buildWeeklySummaryTitle } from "@/lib/finance/build-weekly-summary-message";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import {
  addDays,
  getDayRange,
  getYesterday,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import { sumUpcomingPayPlanThisMonth } from "@/lib/planner/sum-upcoming-payplan-this-month";
import { NOTIFICATION_ROUTES } from "@/config/notifications";
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
): Promise<{ content: string; date: Date } | null> {
  const yesterday = getYesterday();

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

export async function buildUserNotificationDrafts(
  userId: string,
  referenceDate: Date = new Date(),
  options: BuildUserNotificationDraftsOptions = {},
): Promise<NotificationDraft[]> {
  const isCron = options.cron === true;
  const dayKey = toDayKey(referenceDate);
  const yesterday = addDays(referenceDate, -1);
  const { start: todayStart, end: todayEnd } = getDayRange(referenceDate);
  const shouldEnsureWeekly = isCron || isMondayInAppTimezone(referenceDate);

  if (!isCron) {
    await ensurePendingDailySummaries(userId);
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
  ] = await Promise.all([
    getAvailableBalance(userId, referenceDate),
    listPlans(userId),
    listSavingsGoals(userId),
    getPlansUpcomingImpact(userId, referenceDate, 14),
    prisma.transaction.findMany({
      where: scopedByUser(userId, {
        occurredAt: { gte: todayStart, lte: todayEnd },
      }),
      select: {
        type: true,
        amount: true,
        category: true,
        description: true,
      },
    }),
    isCron
      ? getYesterdaySummaryContentForCron(userId)
      : getYesterdayDailySummary(userId),
    weeklySummaryPromise,
  ]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const { upcomingPayPlanTotal, upcomingPayPlanCount } =
    sumUpcomingPayPlanThisMonth(upcoming, referenceDate);
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(
      estimatedCost,
      availableBalance,
      upcomingPayPlanTotal,
    ),
    upcomingPayPlanTotal,
    upcomingPayPlanCount,
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

  if (yesterdaySummary) {
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

  const todaySummary = buildTodaySummary(todayTransactions);
  const condition = isCron
    ? buildFallbackJournalCondition(
        todayTransactions,
        todaySummary.totalExpense,
        todaySummary.totalIncome,
        availableBalance,
      )
    : await generateJournalCondition(
        userId,
        referenceDate,
        todayTransactions,
        availableBalance,
      );
  const brief = buildOverviewBrief(condition, todaySummary, plansOverview);

  drafts.push({
    kind: "ai_brief",
    title: `Ringkasan AI · ${brief.conditionLabel}`,
    body: brief.text,
    href: NOTIFICATION_ROUTES.overview,
    dedupeKey: `ai-brief:${dayKey}`,
  });

  const alerts = buildOverviewAlerts({
    upcoming,
    plansOverview,
    availableBalance,
  });

  for (const alert of alerts) {
    drafts.push({
      kind: "alert",
      title: alert.title,
      body: alert.message,
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
