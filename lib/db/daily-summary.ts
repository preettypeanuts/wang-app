import { generateDailySummaryInsight } from "@/lib/ai/generate-daily-summary-insight";
import {
  buildDailySummaryMessage,
  buildDailySummarySnapshot,
} from "@/lib/finance/build-daily-summary-message";
import {
  buildFallbackDailySummaryCondition,
} from "@/lib/finance/build-daily-summary-insight";
import {
  endOfDay,
  getDayRange,
  getYesterday,
  parseDayKey,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";
import {
  parseStoredDailySummaryInsight,
  serializeDailySummaryInsight,
} from "@/lib/finance/stored-daily-summary-insight";
import { prisma } from "@/lib/db/prisma";
import type { DailySummarySnapshot } from "@/types/summary";

async function getTransactionsForDay(date: Date) {
  const { start, end } = getDayRange(date);

  return prisma.transaction.findMany({
    where: {
      occurredAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      type: true,
      amount: true,
      category: true,
      description: true,
    },
    orderBy: {
      occurredAt: "asc",
    },
  });
}

async function getCumulativeBalance(date: Date): Promise<number> {
  const end = endOfDay(date);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        occurredAt: { lte: end },
        type: "income",
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        occurredAt: { lte: end },
        type: "expense",
      },
      _sum: { amount: true },
    }),
  ]);

  return (incomeAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0);
}

async function createDailySummaryForDay(date: Date): Promise<void> {
  const summaryDate = startOfDay(date);
  const transactions = await getTransactionsForDay(date);
  const cumulativeBalance = await getCumulativeBalance(date);
  const bundle = await generateDailySummaryInsight(
    date,
    transactions,
    cumulativeBalance,
  );
  const content = buildDailySummaryMessage(date, transactions, bundle.insight);
  const storedInsight = serializeDailySummaryInsight(
    bundle.insight,
    bundle.condition,
  );

  await prisma.inboxMessage.upsert({
    where: {
      summaryDate_kind: {
        summaryDate,
        kind: "daily_summary",
      },
    },
    create: {
      role: "assistant",
      kind: "daily_summary",
      content,
      insight: storedInsight,
      summaryDate,
      createdAt: endOfDay(date),
    },
    update: {},
  });
}

async function backfillMissingDailySummaryInsights(): Promise<void> {
  const messages = await prisma.inboxMessage.findMany({
    where: {
      kind: "daily_summary",
      insight: null,
      summaryDate: {
        not: null,
      },
    },
    select: {
      id: true,
      summaryDate: true,
    },
  });

  for (const message of messages) {
    const date = message.summaryDate!;
    const transactions = await getTransactionsForDay(date);
    const cumulativeBalance = await getCumulativeBalance(date);
    const bundle = await generateDailySummaryInsight(
      date,
      transactions,
      cumulativeBalance,
    );
    const content = buildDailySummaryMessage(date, transactions, bundle.insight);
    const storedInsight = serializeDailySummaryInsight(
      bundle.insight,
      bundle.condition,
    );

    await prisma.inboxMessage.update({
      where: { id: message.id },
      data: {
        insight: storedInsight,
        content,
      },
    });
  }
}

async function backfillLegacyDailySummaryInsights(): Promise<void> {
  const messages = await prisma.inboxMessage.findMany({
    where: {
      kind: "daily_summary",
      insight: {
        not: null,
      },
      summaryDate: {
        not: null,
      },
    },
    select: {
      id: true,
      insight: true,
      summaryDate: true,
    },
  });

  for (const message of messages) {
    const parsed = parseStoredDailySummaryInsight(message.insight);

    if (parsed.condition || !parsed.insight || !message.summaryDate) {
      continue;
    }

    const transactions = await getTransactionsForDay(message.summaryDate);
    const cumulativeBalance = await getCumulativeBalance(message.summaryDate);
    const condition = buildFallbackDailySummaryCondition(
      transactions,
      cumulativeBalance,
    );
    const storedInsight = serializeDailySummaryInsight(
      parsed.insight,
      condition,
    );

    await prisma.inboxMessage.update({
      where: { id: message.id },
      data: {
        insight: storedInsight,
      },
    });
  }
}

let ensurePendingDailySummariesInFlight: Promise<void> | null = null;

export async function ensurePendingDailySummaries(): Promise<void> {
  if (ensurePendingDailySummariesInFlight) {
    return ensurePendingDailySummariesInFlight;
  }

  ensurePendingDailySummariesInFlight = runEnsurePendingDailySummaries().finally(
    () => {
      ensurePendingDailySummariesInFlight = null;
    },
  );

  return ensurePendingDailySummariesInFlight;
}

async function runEnsurePendingDailySummaries(): Promise<void> {
  const todayStart = startOfDay(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      occurredAt: {
        lt: todayStart,
      },
    },
    select: {
      occurredAt: true,
    },
  });

  if (transactions.length > 0) {
    const dayKeys = new Set<string>();
    for (const transaction of transactions) {
      dayKeys.add(toDayKey(transaction.occurredAt));
    }

    const existingSummaries = await prisma.inboxMessage.findMany({
      where: {
        kind: "daily_summary",
        summaryDate: {
          not: null,
        },
      },
      select: {
        summaryDate: true,
      },
    });

    const summarizedDays = new Set(
      existingSummaries.map((entry) => toDayKey(entry.summaryDate!)),
    );

    for (const dayKey of dayKeys) {
      if (summarizedDays.has(dayKey)) {
        continue;
      }

      await createDailySummaryForDay(parseDayKey(dayKey));
    }
  }

  await backfillMissingDailySummaryInsights();
  await backfillLegacyDailySummaryInsights();
}

function resolveDailySummarySnapshot(
  date: Date,
  transactions: Awaited<ReturnType<typeof getTransactionsForDay>>,
  content: string,
  rawInsight: string | null,
  cumulativeBalance: number,
): DailySummarySnapshot {
  const parsed = parseStoredDailySummaryInsight(rawInsight);
  const condition =
    parsed.condition ??
    (parsed.insight
      ? buildFallbackDailySummaryCondition(transactions, cumulativeBalance)
      : null);

  return buildDailySummarySnapshot(
    date,
    transactions,
    content,
    parsed.insight,
    condition,
  );
}

export async function getYesterdayDailySummary(): Promise<DailySummarySnapshot | null> {
  await ensurePendingDailySummaries();

  const yesterday = getYesterday();
  const summaryDate = startOfDay(yesterday);

  const message = await prisma.inboxMessage.findFirst({
    where: {
      kind: "daily_summary",
      summaryDate,
    },
    select: {
      content: true,
      insight: true,
    },
  });

  if (!message) {
    return null;
  }

  const [transactions, cumulativeBalance] = await Promise.all([
    getTransactionsForDay(yesterday),
    getCumulativeBalance(yesterday),
  ]);

  return resolveDailySummarySnapshot(
    yesterday,
    transactions,
    message.content,
    message.insight,
    cumulativeBalance,
  );
}

export async function getDailySummaryForDay(
  date: Date,
): Promise<DailySummarySnapshot | null> {
  const summaryDate = startOfDay(date);

  const message = await prisma.inboxMessage.findFirst({
    where: {
      kind: "daily_summary",
      summaryDate,
    },
    select: {
      content: true,
      insight: true,
    },
  });

  if (!message) {
    return null;
  }

  const [transactions, cumulativeBalance] = await Promise.all([
    getTransactionsForDay(date),
    getCumulativeBalance(date),
  ]);

  return resolveDailySummarySnapshot(
    date,
    transactions,
    message.content,
    message.insight,
    cumulativeBalance,
  );
}
