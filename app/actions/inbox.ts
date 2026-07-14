"use server";

import { revalidatePath } from "next/cache";
import { normalizeCategory } from "@/config/categories";
import { buildInboxMultipleTransactionReplyForParsed } from "@/lib/ai/build-inbox-transaction-reply";
import { parseMultipleTransactions } from "@/lib/ai/parse-multiple-transactions";
import { requireUserId } from "@/lib/auth/session";
import {
  revalidateAfterTransactionMutation,
  revalidateUserInbox,
  revalidateUserPlannedItems,
  revalidateUserPlans,
} from "@/lib/cache/revalidate-user-data";
import { formatInboxProcessingError } from "@/lib/chat/inbox-error";
import { findLowConfidenceTransaction } from "@/lib/chat/low-confidence-transaction";
import { resolveInboxWallet } from "@/lib/chat/resolve-inbox-wallet";
import {
  createInboxMessage,
  type DeleteInboxMessagePairResult,
  deleteInboxMessagePair,
  getInboxMessagesPage,
  type InboxMessagesPage,
  type InboxMessagesPageCursor,
  searchInboxMessages,
  updateInboxMessage,
} from "@/lib/db/inbox-messages";
import {
  submitInboxChatFailure,
  submitInboxChatTransactions,
} from "@/lib/db/inbox-submit";
import { listPlannedItems, markInstallmentPaid } from "@/lib/db/planned-items";
import { listPlans, markPlanDone } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import { assertFlowTransactionType } from "@/lib/db/transaction-flow-filter";
import { createMultipleTransactions } from "@/lib/db/transactions";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import { detectRecurringPattern } from "@/lib/finance/detect-recurring-transaction";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  canMarkPlannedItemDone,
  getPlannedItemPaymentIndex,
} from "@/lib/planner/item-payment";
import { executeSavingsInboxCommand } from "@/lib/savings/execute-savings-inbox-command";
import { findSavingsGoalByQuery } from "@/lib/savings/find-savings-goal";
import { formatSavingsGoalDetail } from "@/lib/savings/format-savings-reply";
import { parseSavingsInboxCommand } from "@/lib/savings/parse-savings-inbox-command";
import type { ChatMessage } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";

interface SubmitInboxMessageSuccess {
  ok: true;
  content: string;
  transaction?: ParsedTransaction;
  transactions?: ParsedTransaction[];
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface SubmitInboxMessageFailure {
  ok: false;
  content: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type SubmitInboxMessageResult =
  | SubmitInboxMessageSuccess
  | SubmitInboxMessageFailure;

function withLowConfidenceFlag(
  rawInput: string,
  transactions: ParsedTransaction[],
  message: ChatMessage,
): ChatMessage {
  if (transactions.length === 0) {
    return message;
  }

  const primary = transactions[0];
  const flagged = findLowConfidenceTransaction(rawInput, transactions);

  return {
    ...message,
    transaction: primary,
    transactions,
    lowConfidenceCategory: Boolean(flagged),
    lowConfidenceTransactionId: flagged?.id,
  };
}

async function withRecurringSuggestion(
  userId: string,
  transactions: ParsedTransaction[],
  message: ChatMessage,
): Promise<ChatMessage> {
  const last = transactions.at(-1);
  if (!last) {
    return message;
  }

  try {
    const suggestion = await detectRecurringPattern(userId, last);
    if (!suggestion) {
      return message;
    }

    return {
      ...message,
      recurringSuggestion: suggestion,
    };
  } catch {
    return message;
  }
}

async function enrichAssistantMessage(
  userId: string,
  rawInput: string,
  transactions: ParsedTransaction[],
  message: ChatMessage,
): Promise<ChatMessage> {
  const withConfidence = withLowConfidenceFlag(rawInput, transactions, message);
  return withRecurringSuggestion(userId, transactions, withConfidence);
}

export async function submitInboxMessage(
  text: string,
): Promise<SubmitInboxMessageResult> {
  const userId = await requireUserId();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("Pesan tidak boleh kosong.");
  }

  const savingsCommand = parseSavingsInboxCommand(trimmed);
  if (savingsCommand) {
    const result = await executeSavingsInboxCommand(
      userId,
      trimmed,
      savingsCommand,
    );

    return {
      ok: result.ok,
      content: result.content,
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
    };
  }

  try {
    const [transactions, walletResolution] = await Promise.all([
      parseMultipleTransactions(trimmed, userId),
      resolveInboxWallet(userId, trimmed),
    ]);
    const content = await buildInboxMultipleTransactionReplyForParsed(
      userId,
      transactions,
      walletResolution.mentionedWalletName,
    );

    const {
      userMessage,
      assistantMessage,
      transactions: savedTransactions,
    } = await submitInboxChatTransactions({
      userId,
      rawInput: trimmed,
      transactions,
      assistantContent: content,
      walletId: walletResolution.walletId,
    });

    const enriched = await enrichAssistantMessage(
      userId,
      trimmed,
      savedTransactions,
      assistantMessage,
    );

    return {
      ok: true,
      content,
      transaction: savedTransactions[0],
      transactions: savedTransactions,
      userMessage,
      assistantMessage:
        walletResolution.ambiguousCandidates.length > 1
          ? {
              ...enriched,
              walletCandidates: walletResolution.ambiguousCandidates,
            }
          : enriched,
    };
  } catch (error) {
    const content = formatInboxProcessingError(error);

    const { userMessage, assistantMessage } = await submitInboxChatFailure({
      userId,
      rawInput: trimmed,
      assistantContent: content,
    });

    return {
      ok: false,
      content,
      userMessage,
      assistantMessage,
    };
  }
}

export async function retryInboxMessageAction(
  assistantMessageId: string,
): Promise<SubmitInboxMessageResult> {
  const userId = await requireUserId();

  const assistantRecord = await prisma.inboxMessage.findFirst({
    where: scopedId(userId, assistantMessageId),
    select: {
      id: true,
      role: true,
      createdAt: true,
    },
  });

  if (!assistantRecord || assistantRecord.role !== "assistant") {
    throw new Error("Pesan error tidak ditemukan.");
  }

  const userRecord = await prisma.inboxMessage.findFirst({
    where: scopedByUser(userId, {
      role: "user",
      kind: "chat",
      createdAt: {
        lt: assistantRecord.createdAt,
      },
    }),
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!userRecord) {
    throw new Error("Pesan user tidak ditemukan.");
  }

  const trimmed = userRecord.content.trim();
  const userMessage: ChatMessage = {
    id: userRecord.id,
    role: "user",
    content: userRecord.content,
    createdAt: userRecord.createdAt.toISOString(),
  };

  try {
    const [transactions, walletResolution] = await Promise.all([
      parseMultipleTransactions(trimmed, userId),
      resolveInboxWallet(userId, trimmed),
    ]);

    const savedRows = await createMultipleTransactions({
      userId,
      rawInput: trimmed,
      transactions,
      inboxMessageId: assistantMessageId,
      walletId: walletResolution.walletId,
    });

    const savedTransactions: ParsedTransaction[] = savedRows.map(
      (row, index) => ({
        id: row.id,
        type: assertFlowTransactionType(row.type),
        amount: row.amount,
        category: normalizeCategory(row.category),
        description: row.description,
        occurredAt: row.occurredAt.toISOString(),
      }),
    );

    const content = await buildInboxMultipleTransactionReplyForParsed(
      userId,
      savedTransactions,
      walletResolution.mentionedWalletName,
    );

    const assistantMessage = await updateInboxMessage(
      userId,
      assistantMessageId,
      {
        content,
      },
    );

    return {
      ok: true,
      content,
      transaction: savedTransactions[0],
      transactions: savedTransactions,
      userMessage,
      assistantMessage: await enrichAssistantMessage(
        userId,
        trimmed,
        savedTransactions,
        {
          ...assistantMessage,
          transactions: savedTransactions,
        },
      ),
    };
  } catch (error) {
    const content = formatInboxProcessingError(error);

    const assistantMessage = await updateInboxMessage(
      userId,
      assistantMessageId,
      {
        content,
      },
    );

    return {
      ok: false,
      content,
      userMessage,
      assistantMessage,
    };
  }
}

export async function undoInboxMessageAction(
  userMessageId: string,
): Promise<DeleteInboxMessagePairResult> {
  const userId = await requireUserId();
  const result = await deleteInboxMessagePair(userId, userMessageId);

  revalidateAfterTransactionMutation(userId);
  revalidateUserInbox(userId);
  revalidatePath("/");
  revalidatePath("/journal");

  return result;
}

export async function loadOlderInboxMessagesAction(
  before: InboxMessagesPageCursor,
): Promise<InboxMessagesPage> {
  const userId = await requireUserId();
  return getInboxMessagesPage(userId, { before });
}

export async function searchInboxMessagesAction(
  query: string,
): Promise<ChatMessage[]> {
  const userId = await requireUserId();
  return searchInboxMessages(userId, query);
}

interface PayPayPlanFromInboxSuccess {
  ok: true;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface PayPayPlanFromInboxFailure {
  ok: false;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type PayPayPlanFromInboxResult =
  | PayPayPlanFromInboxSuccess
  | PayPayPlanFromInboxFailure;

export async function payPayPlanFromInboxAction(
  plannedItemId: string,
  installmentIndex?: number,
): Promise<PayPayPlanFromInboxResult> {
  const userId = await requireUserId();
  const trimmedId = plannedItemId.trim();
  const items = await listPlannedItems(userId);
  const item = items.find((entry) => entry.id === trimmedId);

  if (!item) {
    throw new Error("PayPlan tidak ditemukan.");
  }

  const isIncome = item.flowType === "income";
  const userContent = `${isIncome ? "Terima" : "Bayar"} ${item.name}`;
  const userMessage = await createInboxMessage({
    userId,
    role: "user",
    content: userContent,
  });

  if (!canMarkPlannedItemDone(item)) {
    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `${item.name} ${isIncome ? "sudah diterima" : "sudah dibayar"} atau tidak bisa ditandai dari chat.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }

  const paymentIndex = installmentIndex ?? getPlannedItemPaymentIndex(item);

  try {
    await markInstallmentPaid(userId, trimmedId, paymentIndex);

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `${item.name} (${formatIdr(item.amount)}) ditandai sudah ${isIncome ? "diterima" : "dibayar"}.`,
    });

    revalidateUserPlannedItems(userId);
    revalidateAfterTransactionMutation(userId);
    revalidatePath("/");
    revalidatePath("/payplan");
    revalidatePath("/journal");
    revalidatePath("/overview");

    return {
      ok: true,
      userMessage,
      assistantMessage,
    };
  } catch {
    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `Gagal menandai ${item.name} sudah ${isIncome ? "diterima" : "dibayar"}. Coba lagi.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }
}

interface MarkPlanDoneFromInboxSuccess {
  ok: true;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface MarkPlanDoneFromInboxFailure {
  ok: false;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type MarkPlanDoneFromInboxResult =
  | MarkPlanDoneFromInboxSuccess
  | MarkPlanDoneFromInboxFailure;

interface CheckSavingsGoalFromInboxSuccess {
  ok: true;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface CheckSavingsGoalFromInboxFailure {
  ok: false;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type CheckSavingsGoalFromInboxResult =
  | CheckSavingsGoalFromInboxSuccess
  | CheckSavingsGoalFromInboxFailure;

export async function checkSavingsGoalFromInboxAction(
  goalId: string,
): Promise<CheckSavingsGoalFromInboxResult> {
  const userId = await requireUserId();
  const trimmedId = goalId.trim();
  const goals = await listSavingsGoals(userId);
  const goal = goals.find((entry) => entry.id === trimmedId);

  if (!goal) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  const userContent = `cek tabungan ${goal.name}`;
  const userMessage = await createInboxMessage({
    userId,
    role: "user",
    content: userContent,
  });

  try {
    const resolved = findSavingsGoalByQuery(goals, goal.name);
    if (!resolved) {
      throw new Error(`Tabungan "${goal.name}" tidak ditemukan.`);
    }

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: formatSavingsGoalDetail(resolved),
    });

    return {
      ok: true,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    const content =
      error instanceof Error ? error.message : "Gagal menampilkan tabungan.";

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }
}

export async function markPlanDoneFromInboxAction(
  planId: string,
): Promise<MarkPlanDoneFromInboxResult> {
  const userId = await requireUserId();
  const trimmedId = planId.trim();
  const plans = await listPlans(userId);
  const plan = plans.find((entry) => entry.id === trimmedId);

  if (!plan) {
    throw new Error("Wish tidak ditemukan.");
  }

  const userContent = `Beli ${plan.name}`;
  const userMessage = await createInboxMessage({
    userId,
    role: "user",
    content: userContent,
  });

  if (plan.status !== "active") {
    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `${plan.name} sudah ditandai selesai atau tidak bisa diupdate dari chat.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }

  try {
    await markPlanDone(userId, trimmedId);

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `${plan.name} (${formatIdr(plan.amount)}) ditandai sudah dibeli.`,
    });

    revalidateUserPlans(userId);
    revalidateAfterTransactionMutation(userId);
    revalidatePath("/");
    revalidatePath("/plans");
    revalidatePath("/journal");
    revalidatePath("/overview");

    return {
      ok: true,
      userMessage,
      assistantMessage,
    };
  } catch {
    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content: `Gagal menandai ${plan.name} sudah dibeli. Coba lagi.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }
}
