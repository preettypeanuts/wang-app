import {
  buildTransactionReply,
  buildWarmMultipleTransactionReply,
  buildWarmTransactionReply,
} from "@/lib/ai/build-warm-transaction-reply";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { generateTransactionReplyWithGemini } from "@/lib/ai/generate-transaction-reply-gemini";
import { getBudgetStatusForExpense } from "@/lib/finance/build-budget-reply";
import type { BudgetStatus } from "@/types/budget";
import type { ParsedTransaction } from "@/types/transaction";

export {
  buildTransactionReply,
  buildWarmMultipleTransactionReply,
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

async function collectExpenseBudgetStatuses(
  userId: string,
  transactions: ParsedTransaction[],
): Promise<BudgetStatus[]> {
  const expenseByCategory = new Map<string, ParsedTransaction>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const existing = expenseByCategory.get(transaction.category);
    if (!existing) {
      expenseByCategory.set(transaction.category, { ...transaction });
      continue;
    }

    expenseByCategory.set(transaction.category, {
      ...existing,
      amount: existing.amount + transaction.amount,
    });
  }

  const statuses: BudgetStatus[] = [];

  for (const transaction of expenseByCategory.values()) {
    try {
      const status = await getBudgetStatusForExpense(
        userId,
        transaction.category,
        transaction.occurredAt,
        transaction.amount,
      );
      if (status) {
        statuses.push(status);
      }
    } catch {
      // Reply should still succeed without budget context.
    }
  }

  return statuses;
}

export async function buildInboxTransactionReplyForParsed(
  userId: string,
  rawInput: string,
  transaction: ParsedTransaction,
  walletName?: string | null,
): Promise<string> {
  const budgetStatuses = await collectExpenseBudgetStatuses(userId, [
    transaction,
  ]);

  // MVP hot path: warm template only — no second Gemini round-trip.
  return buildWarmTransactionReply(
    transaction,
    budgetStatuses[0] ?? null,
    walletName,
  );
}

export async function buildInboxMultipleTransactionReplyForParsed(
  userId: string,
  transactions: ParsedTransaction[],
  /** Mentioned in the reply only when a non-default wallet was detected. */
  walletName?: string | null,
): Promise<string> {
  if (transactions.length === 1) {
    return buildInboxTransactionReplyForParsed(
      userId,
      transactions[0].description,
      transactions[0],
      walletName,
    );
  }

  const budgetStatuses = await collectExpenseBudgetStatuses(
    userId,
    transactions,
  );
  return buildWarmMultipleTransactionReply(
    transactions,
    budgetStatuses,
    walletName,
  );
}
