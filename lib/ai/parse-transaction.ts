import { getCategoryLabel } from "@/config/categories";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseTransactionWithGemini } from "@/lib/ai/parse-transaction-gemini";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import { detectTransactionType } from "@/lib/finance/categories";
import { formatIdr } from "@/lib/finance/format-currency";
import { parseAmount } from "@/lib/finance/parse-amount";
import { resolveTransactionCategory } from "@/lib/finance/resolve-transaction-category";
import type { ParsedTransaction } from "@/types/transaction";

export { TransactionParseError };

/** Rule-based fallback when Gemini API key is not configured. */
export function parseTransactionLocally(text: string): ParsedTransaction {
  const description = text.trim();
  const amount = parseAmount(description);

  if (amount === null) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: makan warteg 15K",
    );
  }

  const type = detectTransactionType(description);
  const category = resolveTransactionCategory(undefined, type, description);

  return {
    type,
    amount,
    category,
    description,
    occurredAt: new Date().toISOString(),
  };
}

export async function parseTransaction(
  text: string,
): Promise<ParsedTransaction> {
  if (isGeminiConfigured()) {
    try {
      return await parseTransactionWithGemini(text);
    } catch {
      return parseTransactionLocally(text);
    }
  }

  return parseTransactionLocally(text);
}

export function buildTransactionReply(transaction: ParsedTransaction): string {
  const typeLabel = transaction.type === "income" ? "Pemasukan" : "Pengeluaran";
  const categoryLabel = getCategoryLabel(transaction.category);

  return `${typeLabel} ${formatIdr(transaction.amount)} tercatat · ${categoryLabel}`;
}
