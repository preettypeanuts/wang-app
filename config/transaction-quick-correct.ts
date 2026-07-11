import {
  INCOME_CATEGORY_IDS,
  TRANSACTION_CATEGORIES,
  type TransactionCategoryId,
} from "@/config/categories";
import type { TransactionType } from "@/types/transaction";

const QUICK_CORRECT_EXPENSE_CATEGORY_IDS: TransactionCategoryId[] = [
  "food",
  "transport",
  "shopping",
  "groceries",
  "utilities",
  "family",
  "entertainment",
  "health",
];

const QUICK_CORRECT_INCOME_CATEGORY_IDS: TransactionCategoryId[] = [
  "salary",
  "side_income",
  "gifts",
  "investment",
];

export function getQuickCorrectCategories(
  type: TransactionType,
  excludeCategory?: string,
): Array<{ id: string; label: string }> {
  const ids =
    type === "income"
      ? QUICK_CORRECT_INCOME_CATEGORY_IDS
      : QUICK_CORRECT_EXPENSE_CATEGORY_IDS;

  return TRANSACTION_CATEGORIES.filter(
    (category) =>
      ids.includes(category.id as TransactionCategoryId) &&
      category.id !== excludeCategory &&
      (type === "income"
        ? INCOME_CATEGORY_IDS.has(category.id as TransactionCategoryId)
        : !INCOME_CATEGORY_IDS.has(category.id as TransactionCategoryId)),
  ).map((category) => ({
    id: category.id as TransactionCategoryId,
    label: category.label,
  }));
}
