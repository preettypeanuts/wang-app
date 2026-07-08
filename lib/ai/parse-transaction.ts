import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseTransactionWithGemini } from "@/lib/ai/parse-transaction-gemini";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import { resolveExplicitCategoryForType } from "@/lib/chat/category-mentions";
import { detectTransactionType } from "@/lib/finance/categories";
import { parseAmount } from "@/lib/finance/parse-amount";
import { parseRelativeDate } from "@/lib/finance/parse-relative-date";
import { resolveTransactionCategory } from "@/lib/finance/resolve-transaction-category";
import type { ParsedTransaction } from "@/types/transaction";

export { buildTransactionReply } from "@/lib/ai/build-inbox-transaction-reply";
export { TransactionParseError };

/** Rule-based fallback when Gemini API key is not configured. */
export function parseTransactionLocally(text: string): ParsedTransaction {
  const now = new Date();
  const trimmed = text.trim();
  const dateParse = parseRelativeDate(trimmed, now);
  const description = dateParse?.cleanedText ?? trimmed;
  const occurredAt = dateParse?.occurredAt ?? now;

  const type = detectTransactionType(description);
  const { category: explicitCategory, cleanedText } =
    resolveExplicitCategoryForType(description, type);
  const parseText = cleanedText || description;
  const amount = parseAmount(parseText);

  if (amount === null) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: makan warteg 15K",
    );
  }

  const category = explicitCategory
    ? explicitCategory
    : resolveTransactionCategory(undefined, type, parseText);

  return {
    type,
    amount,
    category,
    description: parseText,
    occurredAt: occurredAt.toISOString(),
  };
}

export async function parseTransaction(
  text: string,
): Promise<ParsedTransaction> {
  try {
    return parseTransactionLocally(text);
  } catch (localError) {
    if (!isGeminiConfigured()) {
      throw localError;
    }

    try {
      return await parseTransactionWithGemini(text);
    } catch {
      throw localError;
    }
  }
}
