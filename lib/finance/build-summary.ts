import { getCategoryLabel } from "@/config/categories";
import type { CategorySummary, TodaySummary } from "@/types/summary";

interface TransactionRecord {
  type: "income" | "expense";
  amount: number;
  category: string;
}

export function buildTodaySummary(
  transactions: TransactionRecord[],
): TodaySummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = new Map<string, CategorySummary>();

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
      continue;
    }

    totalExpense += transaction.amount;

    const existing = categoryMap.get(transaction.category);
    if (existing) {
      existing.total += transaction.amount;
      existing.count += 1;
      continue;
    }

    categoryMap.set(transaction.category, {
      category: transaction.category,
      label: getCategoryLabel(transaction.category),
      total: transaction.amount,
      count: 1,
    });
  }

  const categories = [...categoryMap.values()].sort(
    (left, right) => right.total - left.total,
  );

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categories,
  };
}
