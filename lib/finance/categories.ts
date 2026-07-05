import {
  TRANSACTION_CATEGORIES,
  type TransactionCategoryId,
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
} from "@/config/categories";

export {
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
};

export { CATEGORY_LABELS } from "@/config/categories";

const INCOME_TYPE_KEYWORDS = [
  "gaji",
  "upah",
  "terima",
  "masuk",
  "cair",
  "dapat",
  "bonus",
  "freelance",
  "jual",
  "komisi",
  "dividen",
  "thr",
  "refund",
  "cashback",
  "transfer masuk",
];

export function detectTransactionType(text: string): "income" | "expense" {
  const lower = text.toLowerCase();
  return INCOME_TYPE_KEYWORDS.some((keyword) => lower.includes(keyword))
    ? "income"
    : "expense";
}

const INCOME_DETECTION_ORDER: TransactionCategoryId[] = [
  "salary",
  "investment",
  "gifts",
  "side_income",
];

function detectIncomeCategory(text: string): TransactionCategoryId {
  const lower = text.toLowerCase();
  let bestMatch: { categoryId: TransactionCategoryId; length: number } | null =
    null;

  for (const categoryId of INCOME_DETECTION_ORDER) {
    const definition = TRANSACTION_CATEGORIES.find(
      (category) => category.id === categoryId,
    );

    if (!definition) {
      continue;
    }

    for (const keyword of definition.keywords) {
      if (!lower.includes(keyword)) {
        continue;
      }

      if (!bestMatch || keyword.length > bestMatch.length) {
        bestMatch = { categoryId, length: keyword.length };
      }
    }
  }

  return bestMatch?.categoryId ?? "side_income";
}

export function detectCategory(text: string): TransactionCategoryId {
  const lower = text.toLowerCase();

  if (detectTransactionType(text) === "income") {
    return detectIncomeCategory(text);
  }

  let bestMatch: { categoryId: TransactionCategoryId; length: number } | null =
    null;

  for (const category of TRANSACTION_CATEGORIES) {
    if (
      category.id === "salary" ||
      category.id === "side_income" ||
      category.id === "other"
    ) {
      continue;
    }

    for (const keyword of category.keywords) {
      if (!lower.includes(keyword)) {
        continue;
      }

      if (!bestMatch || keyword.length > bestMatch.length) {
        bestMatch = { categoryId: category.id, length: keyword.length };
      }
    }
  }

  return bestMatch?.categoryId ?? "other";
}
