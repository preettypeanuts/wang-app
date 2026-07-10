import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { generateDailySummaryInsightWithGemini } from "@/lib/ai/generate-daily-summary-insight-gemini";
import { buildFallbackDailySummaryInsightBundle } from "@/lib/finance/build-daily-summary-insight";
import type { DailySummaryReflectionContext } from "@/lib/finance/format-daily-summary-reflection-context";
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
  context: DailySummaryReflectionContext,
): Promise<DailySummaryInsightBundle> {
  if (isGeminiConfigured()) {
    try {
      return await generateDailySummaryInsightWithGemini(
        date,
        transactions,
        context,
      );
    } catch {
      return buildFallbackDailySummaryInsightBundle(transactions, context);
    }
  }

  return buildFallbackDailySummaryInsightBundle(transactions, context);
}
