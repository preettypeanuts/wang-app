import { detectTransactionType } from "@/lib/finance/categories";
import { isPlainAmountInput } from "@/lib/finance/parse-amount";
import type { ParsedTransaction } from "@/types/transaction";

export function isLowConfidenceTransaction(
  rawInput: string,
  transaction: ParsedTransaction,
): boolean {
  return transaction.category === "other" || isPlainAmountInput(rawInput);
}

/** No income keyword — type likely defaulted to expense. */
export function isUncertainTransactionType(rawInput: string): boolean {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return false;
  }

  return detectTransactionType(trimmed) === "expense" && !hasIncomeKeyword(trimmed);
}

function hasIncomeKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  const incomeKeywords = [
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

  return incomeKeywords.some((keyword) => lower.includes(keyword));
}
