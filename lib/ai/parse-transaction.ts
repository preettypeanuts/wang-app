import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseTransactionWithGemini } from "@/lib/ai/parse-transaction-gemini";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import { resolveExplicitCategoryForType } from "@/lib/chat/category-mentions";
import { buildCategoryMentionOptionsFromCatalog } from "@/lib/finance/user-category-catalog";
import { resolveUserCategoryCatalog } from "@/lib/finance/resolve-user-categories";
import { detectTransactionType } from "@/lib/finance/categories";
import { parseAmount } from "@/lib/finance/parse-amount";
import { parseRelativeDate } from "@/lib/finance/parse-relative-date";
import { resolveTransactionCategory } from "@/lib/finance/resolve-transaction-category";
import type { ParsedTransaction } from "@/types/transaction";

export { buildTransactionReply } from "@/lib/ai/build-inbox-transaction-reply";
export { TransactionParseError };

/** Rule-based fallback when Gemini API key is not configured. */
export async function parseTransactionLocally(
  text: string,
  userId?: string,
): Promise<ParsedTransaction> {
  const now = new Date();
  const trimmed = text.trim();
  const dateParse = parseRelativeDate(trimmed, now);
  const description = dateParse?.cleanedText ?? trimmed;
  const occurredAt = dateParse?.occurredAt ?? now;

  const type = detectTransactionType(description);
  const mentionOptions = userId
    ? buildCategoryMentionOptionsFromCatalog(
        await resolveUserCategoryCatalog(userId),
        type,
      )
    : undefined;
  const { category: explicitCategory, cleanedText } =
    resolveExplicitCategoryForType(description, type, mentionOptions);
  const parseText = cleanedText || description;
  const amount = parseAmount(parseText);

  if (amount === null) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: makan warteg 15K",
    );
  }

  const category = explicitCategory
    ? explicitCategory
    : await resolveTransactionCategory(undefined, type, parseText, userId);

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
  userId?: string,
): Promise<ParsedTransaction> {
  try {
    return await parseTransactionLocally(text, userId);
  } catch (localError) {
    if (!isGeminiConfigured()) {
      throw localError;
    }

    try {
      return await parseTransactionWithGemini(text, userId);
    } catch {
      throw localError;
    }
  }
}
