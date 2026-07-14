import { normalizeCategory } from "@/config/categories";
import type { Transaction } from "@/generated/prisma/client";
import {
  revalidateAfterTransactionMutation,
  revalidateUserInbox,
} from "@/lib/cache/revalidate-user-data";
import { invalidateAiInsightCacheOnTransactionMutation } from "@/lib/db/ai-insight-cache";
import { prisma } from "@/lib/db/prisma";
import {
  assertFlowTransactionType,
  isFlowTransactionType,
} from "@/lib/db/transaction-flow-filter";
import type { ChatMessage } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";

function mapTransaction(record: Transaction): ParsedTransaction | null {
  if (!isFlowTransactionType(record.type)) {
    return null;
  }

  return {
    id: record.id,
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
  };
}

function mapUserMessage(record: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}): ChatMessage {
  return {
    id: record.id,
    role: record.role as ChatMessage["role"],
    content: record.content,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapAssistantMessage(
  record: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  },
  transactions: Transaction[],
): ChatMessage {
  const parsed = transactions
    .map(mapTransaction)
    .filter(
      (transaction): transaction is ParsedTransaction => transaction !== null,
    );

  return {
    id: record.id,
    role: record.role as ChatMessage["role"],
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    ...(parsed[0] ? { transaction: parsed[0] } : {}),
    ...(parsed.length > 0 ? { transactions: parsed } : {}),
  };
}

export async function submitInboxChatTransaction(input: {
  userId: string;
  rawInput: string;
  userContent?: string;
  transaction: ParsedTransaction;
  assistantContent: string;
  walletId?: string | null;
}): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  transactions: ParsedTransaction[];
}> {
  return submitInboxChatTransactions({
    userId: input.userId,
    rawInput: input.rawInput,
    userContent: input.userContent,
    transactions: [input.transaction],
    assistantContent: input.assistantContent,
    walletId: input.walletId,
  });
}

export async function submitInboxChatTransactions(input: {
  userId: string;
  rawInput: string;
  userContent?: string;
  transactions: ParsedTransaction[];
  assistantContent: string;
  /** Wallet assigned to every saved transaction (detected or user default). */
  walletId?: string | null;
}): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  transactions: ParsedTransaction[];
}> {
  const trimmed = input.rawInput.trim();
  const userContent = input.userContent?.trim() || trimmed;
  const now = new Date();
  const userAt = new Date(now.getTime() - 1_000);
  const assistantAt = now;
  const transactions = input.transactions;

  if (transactions.length === 0) {
    throw new Error("Tidak ada transaksi untuk disimpan.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const userRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "user",
        kind: "chat",
        content: userContent,
        createdAt: userAt,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    const assistantRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "assistant",
        kind: "chat",
        content: input.assistantContent,
        createdAt: assistantAt,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    const savedTransactions: Transaction[] = [];
    for (const [index, transaction] of transactions.entries()) {
      const saved = await tx.transaction.create({
        data: {
          userId: input.userId,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          occurredAt: new Date(transaction.occurredAt),
          rawInput: trimmed,
          inboxMessageId: assistantRecord.id,
          walletId: input.walletId ?? null,
          createdAt: new Date(assistantAt.getTime() + index),
        },
      });
      savedTransactions.push(saved);
    }

    return {
      userMessage: mapUserMessage(userRecord),
      assistantMessage: mapAssistantMessage(assistantRecord, savedTransactions),
      transactions: savedTransactions
        .map(mapTransaction)
        .filter(
          (transaction): transaction is ParsedTransaction =>
            transaction !== null,
        ),
      occurredAts: savedTransactions.map((row) => row.occurredAt),
    };
  });

  for (const occurredAt of result.occurredAts) {
    await invalidateAiInsightCacheOnTransactionMutation(
      input.userId,
      occurredAt,
    );
  }
  revalidateAfterTransactionMutation(input.userId);

  return {
    userMessage: result.userMessage,
    assistantMessage: result.assistantMessage,
    transactions: result.transactions,
  };
}

export async function submitInboxChatFailure(input: {
  userId: string;
  rawInput: string;
  assistantContent: string;
}): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}> {
  const trimmed = input.rawInput.trim();
  const now = new Date();
  const userAt = new Date(now.getTime() - 1_000);
  const assistantAt = now;

  const result = await prisma.$transaction(async (tx) => {
    const userRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "user",
        kind: "chat",
        content: trimmed,
        createdAt: userAt,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    const assistantRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "assistant",
        kind: "chat",
        content: input.assistantContent,
        createdAt: assistantAt,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return {
      userMessage: mapUserMessage(userRecord),
      assistantMessage: mapAssistantMessage(assistantRecord, []),
    };
  });

  revalidateUserInbox(input.userId);

  return result;
}
