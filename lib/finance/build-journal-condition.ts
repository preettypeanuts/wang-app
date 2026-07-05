import type { JournalCondition } from "@/types/journal";

interface JournalSummaryTransaction {
  type: "income" | "expense";
  amount: number;
}

export function buildFallbackJournalCondition(
  transactions: JournalSummaryTransaction[],
  totalExpense: number,
  totalIncome: number,
  cumulativeBalance: number,
): JournalCondition {
  if (transactions.length === 0) {
    return { label: "Tenang", emoji: "😌" };
  }

  if (cumulativeBalance < 0) {
    return { label: "Kritis", emoji: "😰" };
  }

  if (totalIncome === 0 && totalExpense > 0) {
    return { label: "Waspada", emoji: "😐" };
  }

  if (totalIncome > 0 && totalExpense / totalIncome >= 1) {
    return { label: "Boros", emoji: "😬" };
  }

  if (totalIncome > 0 && totalExpense / totalIncome >= 0.7) {
    return { label: "Waspada", emoji: "😐" };
  }

  return { label: "Aman", emoji: "😊" };
}
