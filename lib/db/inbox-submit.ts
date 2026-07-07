import { normalizeCategory } from "@/config/categories";
import { prisma } from "@/lib/db/prisma";
import type { ChatMessage } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";
import type { Transaction } from "@/generated/prisma/client";

function mapTransaction(record: Transaction): ParsedTransaction {
  return {
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
}> {
  const trimmed = input.rawInput.trim();
  const now = new Date();
  const userAt = new Date(now.getTime() - 1_000);
  const assistantAt = now;

  return prisma.$transaction(async (tx) => {
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

    const savedTransaction = await tx.transaction.create({
      data: {
        userId: input.userId,
        type: input.transaction.type,
        amount: input.transaction.amount,
        category: input.transaction.category,
        description: input.transaction.description,
        occurredAt: new Date(input.transaction.occurredAt),
        rawInput: trimmed,
        createdAt: assistantAt,
      },
    });

    const assistantRecord = await tx.inboxMessage.create({
      data: {
        userId: input.userId,
        role: "assistant",
        kind: "chat",
        content: input.assistantContent,
        createdAt: assistantAt,
        transactionId: savedTransaction.id,
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
      assistantMessage: mapAssistantMessage(
        assistantRecord,
        savedTransaction,
      ),
    };
  });
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

  return prisma.$transaction(async (tx) => {
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
}
