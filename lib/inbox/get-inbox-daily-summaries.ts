import { ensureDailySummaryForDay, getDailySummaryForDay } from "@/lib/db/daily-summary";
import { getYesterday } from "@/lib/finance/day-range";
import type { DailySummarySnapshot } from "@/types/summary";

export interface InboxDailySummaries {
  yesterdaySummary: DailySummarySnapshot | null;
  todayReflection: DailySummarySnapshot | null;
}

export async function getInboxDailySummaries(
  userId: string,
): Promise<InboxDailySummaries> {
  const today = new Date();
  const yesterday = getYesterday(today);

  await Promise.all([
    ensureDailySummaryForDay(userId, today),
    ensureDailySummaryForDay(userId, yesterday),
  ]);

  const [todayReflection, yesterdaySummary] = await Promise.all([
    getDailySummaryForDay(userId, today),
    getDailySummaryForDay(userId, yesterday),
  ]);

  return { yesterdaySummary, todayReflection };
}
