import { getCategoryLabel } from "@/config/categories";
import type { TodaySummary } from "@/types/summary";
import type { ParsedTransaction } from "@/types/transaction";

/** Client-side today summary patch after a successful inbox transaction. */
export function applyTransactionToSummary(
  summary: TodaySummary,
  transaction: ParsedTransaction,
): TodaySummary {
  if (transaction.type === "income") {
    return {
      ...summary,
      totalIncome: summary.totalIncome + transaction.amount,
      balance: summary.balance + transaction.amount,
    };
  }

  const categories = [...summary.categories];
  const index = categories.findIndex(
    (item) => item.category === transaction.category,
  );

  if (index >= 0) {
    const existing = categories[index];
    categories[index] = {
      ...existing,
      total: existing.total + transaction.amount,
      count: existing.count + 1,
    };
  } else {
    categories.push({
      category: transaction.category,
      label: getCategoryLabel(transaction.category),
      total: transaction.amount,
      count: 1,
    });
  }

  categories.sort((left, right) => right.total - left.total);

  return {
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense + transaction.amount,
    balance: summary.balance - transaction.amount,
    categories,
  };
}
