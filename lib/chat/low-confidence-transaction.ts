import { detectTransactionType } from "@/lib/finance/categories";
import { isPlainAmountInput } from "@/lib/finance/parse-amount";
import type { ParsedTransaction } from "@/types/transaction";

export function isLowConfidenceTransaction(
  rawInput: string,
  transaction: ParsedTransaction,
): boolean {
  const segment = transaction.description?.trim() || rawInput;
  return transaction.category === "other" || isPlainAmountInput(segment);
}

/** First low-confidence transaction in a batch, if any. */
export function findLowConfidenceTransaction(
  rawInput: string,
  transactions: ParsedTransaction[],
): ParsedTransaction | null {
  for (const transaction of transactions) {
    if (isLowConfidenceTransaction(rawInput, transaction)) {
      return transaction;
    }
  }

  return null;
}

/** No income keyword — type likely defaulted to expense. */
export function isUncertainTransactionType(rawInput: string): boolean {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return false;
  }

  return (
    detectTransactionType(trimmed) === "expense" && !hasIncomeKeyword(trimmed)
  );
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
