import type { TransactionCategoryId } from "@/config/categories";
import type { TransactionType } from "@/types/transaction";

import { detectCategory } from "@/lib/finance/categories";

const EXPENSE_PURCHASE_PATTERN = /\b(beli|checkout|order|pesan|co\s)\b/i;
const EXPENSE_BILL_PATTERN = /\b(bayar|byr|pelunasan|tagihan)\b/i;
const EXPENSE_INSTALLMENT_PATTERN = /\b(cicilan|angsuran|dp|down payment|kredit)\b/i;
const EXPENSE_FOOD_TREAT_PATTERN = /\b(traktir|makan bareng|kopi)\b/i;

export const FAMILY_RECIPIENT_PATTERN =
  /\b(mama|papa|ibu|ayah|mami|papi|adik|kakak|istri|suami|anak|nenek|kakek|tante|om|bibi|sepupu|ponakan|keluarga|orang tua|ortu)\b/i;

export const EXPENSE_FEE_PATTERN =
  /\b(biaya transfer|admin bank|biaya admin|provisi|pajak|denda|bunga pinjaman|biaya provisi)\b/i;

export function refineMisclassifiedCategory(
  category: TransactionCategoryId,
  description: string,
): TransactionCategoryId {
  const lower = description.toLowerCase();

  if (
    category === "fees" &&
    FAMILY_RECIPIENT_PATTERN.test(lower) &&
    !EXPENSE_FEE_PATTERN.test(lower)
  ) {
    return "family";
  }

  return category;
}

export function inferTransactionCategory(
  text: string,
  type: TransactionType,
): TransactionCategoryId | null {
  const lower = text.toLowerCase();

  if (type === "income") {
    const detected = detectCategory(text);
    return detected === "other" ? "side_income" : detected;
  }

  if (FAMILY_RECIPIENT_PATTERN.test(lower)) {
    return "family";
  }

  if (EXPENSE_FOOD_TREAT_PATTERN.test(lower)) {
    return "food";
  }

  if (EXPENSE_INSTALLMENT_PATTERN.test(lower)) {
    return "shopping";
  }

  if (EXPENSE_PURCHASE_PATTERN.test(lower)) {
    return "shopping";
  }

  if (EXPENSE_BILL_PATTERN.test(lower)) {
    return "utilities";
  }

  if (EXPENSE_FEE_PATTERN.test(lower)) {
    return "fees";
  }

  return null;
}
