import { generateDailySummaryInsightWithGemini } from "@/lib/ai/generate-daily-summary-insight-gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import {
  buildFallbackDailySummaryInsightBundle,
} from "@/lib/finance/build-daily-summary-insight";
import type { FinanceCondition } from "@/types/summary";

interface DailySummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

export interface DailySummaryInsightBundle {
  insight: string;
  condition: FinanceCondition;
}

export async function generateDailySummaryInsight(
  date: Date,
  transactions: DailySummaryTransaction[],
  cumulativeBalance = 0,
): Promise<DailySummaryInsightBundle> {
  if (isGeminiConfigured()) {
    try {
      return await generateDailySummaryInsightWithGemini(date, transactions);
    } catch {
      return buildFallbackDailySummaryInsightBundle(
        transactions,
        cumulativeBalance,
      );
    }
  }

  return buildFallbackDailySummaryInsightBundle(
    transactions,
    cumulativeBalance,
  );
}
