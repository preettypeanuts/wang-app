import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import {
  buildTransactionReply,
  buildWarmTransactionReply,
} from "@/lib/ai/build-warm-transaction-reply";
import { generateTransactionReplyWithGemini } from "@/lib/ai/generate-transaction-reply-gemini";
import { getBudgetStatusForExpense } from "@/lib/finance/build-budget-reply";
import type { BudgetStatus } from "@/types/budget";
import type { ParsedTransaction } from "@/types/transaction";

export {
  buildTransactionReply,
  buildWarmTransactionReply,
} from "@/lib/ai/build-warm-transaction-reply";

export async function buildInboxTransactionReply(
  rawInput: string,
  transaction: ParsedTransaction,
  budgetStatus: BudgetStatus | null,
): Promise<string> {
  if (isGeminiConfigured()) {
    try {
      return await generateTransactionReplyWithGemini(
        rawInput,
        transaction,
        budgetStatus,
      );
    } catch {
      // Fall back to warm template.
    }
  }

  return buildWarmTransactionReply(transaction, budgetStatus);
}

export async function buildInboxTransactionReplyForParsed(
  userId: string,
  rawInput: string,
  transaction: ParsedTransaction,
): Promise<string> {
  let budgetStatus: BudgetStatus | null = null;

  if (transaction.type === "expense") {
    try {
      budgetStatus = await getBudgetStatusForExpense(
        userId,
        transaction.category,
        transaction.occurredAt,
        transaction.amount,
      );
    } catch {
      // Reply should still succeed without budget context.
    }
  }

  // MVP hot path: warm template only — no second Gemini round-trip.
  return buildWarmTransactionReply(transaction, budgetStatus);
}
