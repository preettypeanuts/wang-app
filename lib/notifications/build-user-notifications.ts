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
import { buildOverviewAlerts } from "@/lib/finance/build-overview-alerts";
import { buildOverviewBrief } from "@/lib/finance/build-overview-brief";
import { buildDailySummaryTitle } from "@/lib/finance/build-daily-summary-message";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import { addDays, getDayRange, toDayKey } from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";
import {
  NOTIFICATION_ROUTES,
} from "@/config/notifications";
import type { NotificationDraft } from "@/types/notification";

function firstLine(text: string): string {
  return text.split("\n").find((line) => line.trim().length > 0) ?? text;
}

export async function buildUserNotificationDrafts(
  userId: string,
  referenceDate: Date = new Date(),
): Promise<NotificationDraft[]> {
  const dayKey = toDayKey(referenceDate);
  const yesterday = addDays(referenceDate, -1);
  const { start: todayStart, end: todayEnd } = getDayRange(referenceDate);

  await ensurePendingDailySummaries(userId);

  const [
    availableBalance,
    plans,
    savingsGoals,
    upcoming,
    todayTransactions,
    yesterdaySummary,
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
    getYesterdayDailySummary(userId),
  ]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const plansOverview = buildPlansOverview(
    plans,
    availableBalance,
    buildFallbackPlansInsight(estimatedCost, availableBalance),
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

  const todaySummary = buildTodaySummary(todayTransactions);
  const condition = await generateJournalCondition(
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
