import { generateJournalConditionWithGemini } from "@/lib/ai/generate-journal-condition-gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { buildFallbackJournalCondition } from "@/lib/finance/build-journal-condition";
import { buildTodaySummary } from "@/lib/finance/build-summary";
import type { JournalCondition } from "@/types/journal";

interface JournalSummaryTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

export async function generateJournalCondition(
  date: Date,
  transactions: JournalSummaryTransaction[],
  cumulativeBalance: number,
): Promise<JournalCondition> {
  const summary = buildTodaySummary(transactions);

  if (isGeminiConfigured()) {
    try {
      return await generateJournalConditionWithGemini(
        date,
        transactions,
        cumulativeBalance,
      );
    } catch {
      return buildFallbackJournalCondition(
        transactions,
        summary.totalExpense,
        summary.totalIncome,
        cumulativeBalance,
      );
    }
  }

  return buildFallbackJournalCondition(
    transactions,
    summary.totalExpense,
    summary.totalIncome,
    cumulativeBalance,
  );
}
