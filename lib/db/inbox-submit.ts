import { normalizeCategory } from "@/config/categories";
import type { Transaction } from "@/generated/prisma/client";
import {
  revalidateAfterTransactionMutation,
  revalidateUserInbox,
} from "@/lib/cache/revalidate-user-data";
import { invalidateAiInsightCacheOnTransactionMutation } from "@/lib/db/ai-insight-cache";
import { prisma } from "@/lib/db/prisma";
import type { ChatMessage } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";

function mapTransaction(record: Transaction): ParsedTransaction {
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
  transaction: Transaction | null,
): ChatMessage {
  return {
    id: record.id,
    role: record.role as ChatMessage["role"],
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    ...(transaction ? { transaction: mapTransaction(transaction) } : {}),
  };
}

export async function submitInboxChatTransaction(input: {
  userId: string;
  rawInput: string;
  transaction: ParsedTransaction;
  assistantContent: string;
}): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  transactions: ParsedTransaction[];
}> {
  const result = await submitInboxChatTransactions({
    userId: input.userId,
    rawInput: input.rawInput,
    transactions: [input.transaction],
    assistantContent: input.assistantContent,
  });

  return result;
}

export async function submitInboxChatTransactions(input: {
  userId: string;
  rawInput: string;
  transactions: ParsedTransaction[];
  assistantContent: string;
}): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  transactions: ParsedTransaction[];
}> {
  const trimmed = input.rawInput.trim();
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
          createdAt: new Date(assistantAt.getTime() + index),
        },
      });
      savedTransactions.push(saved);
    }

    const primary = savedTransactions[0];
    const assistantRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "assistant",
        kind: "chat",
        content: input.assistantContent,
        createdAt: assistantAt,
        transactionId: primary.id,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    const parsed = savedTransactions.map(mapTransaction);

    return {
      userMessage: mapUserMessage(userRecord),
      assistantMessage: {
        ...mapAssistantMessage(assistantRecord, primary),
        transactions: parsed,
      },
      transactions: parsed,
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
      assistantMessage: mapAssistantMessage(assistantRecord, null),
    };
  });

  revalidateUserInbox(input.userId);

  return result;
}
