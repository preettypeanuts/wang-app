import { unstable_cache } from "next/cache";
import { normalizeCategory } from "@/config/categories";
import { INBOX_MESSAGE_PAGE_SIZE } from "@/config/inbox-messages";
import type {
  InboxMessageRole,
  Prisma,
  Transaction,
} from "@/generated/prisma/client";
import {
  revalidateAfterTransactionMutation,
  revalidateUserInbox,
} from "@/lib/cache/revalidate-user-data";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { invalidateAiInsightCacheOnTransactionMutation } from "@/lib/db/ai-insight-cache";
import { backfillInboxMessagesFromTransactions } from "@/lib/db/backfill-inbox-messages";
import { ensurePendingDailySummaries } from "@/lib/db/daily-summary";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import type { ChatMessage, MessageRole } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";

interface CreateInboxMessageInput {
  userId: string;
  role: MessageRole;
  content: string;
  transactionId?: string;
}

type InboxMessageWithTransaction = Prisma.InboxMessageGetPayload<{
  include: { transaction: true };
}>;

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

function parseOrphanedTransaction(
  value: Prisma.JsonValue,
): ParsedTransaction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    (record.type !== "income" && record.type !== "expense") ||
    typeof record.amount !== "number" ||
    typeof record.category !== "string" ||
    typeof record.description !== "string" ||
    typeof record.occurredAt !== "string"
  ) {
    return null;
  }

  return {
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt,
  };
}

function mapInboxMessage(record: InboxMessageWithTransaction): ChatMessage {
  const base = {
    id: record.id,
    role: record.role as MessageRole,
    content: record.content,
    createdAt: record.createdAt.toISOString(),
  };

  if (record.transaction) {
    return {
      ...base,
      transaction: mapTransaction(record.transaction),
    };
  }

  const orphaned = record.orphanedTransaction
    ? parseOrphanedTransaction(record.orphanedTransaction)
    : null;

  if (orphaned) {
    return {
      ...base,
      transaction: orphaned,
      transactionDeleted: true,
    };
  }

  return base;
}

export async function createInboxMessage({
  userId,
  role,
  content,
  transactionId,
}: CreateInboxMessageInput): Promise<ChatMessage> {
  const record = await prisma.inboxMessage.create({
    data: {
      userId,
      role: role as InboxMessageRole,
      kind: "chat",
      content,
      transactionId,
    },
    include: {
      transaction: true,
    },
  });

  revalidateUserInbox(userId);
  return mapInboxMessage(record);
}

interface UpdateInboxMessageInput {
  content: string;
  transactionId?: string | null;
}

export async function updateInboxMessage(
  userId: string,
  id: string,
  { content, transactionId }: UpdateInboxMessageInput,
): Promise<ChatMessage> {
  const updated = await prisma.inboxMessage.updateMany({
    where: scopedId(userId, id),
    data: {
      content,
      transactionId: transactionId ?? null,
    },
  });

  if (updated.count === 0) {
    throw new Error("Pesan tidak ditemukan.");
  }

  const record = await prisma.inboxMessage.findFirstOrThrow({
    where: scopedId(userId, id),
    include: {
      transaction: true,
    },
  });

  revalidateUserInbox(userId);
  return mapInboxMessage(record);
}

export async function getInboxMessages(userId: string): Promise<ChatMessage[]> {
  const page = await getInboxMessagesPage(userId);
  return page.messages;
}

export interface InboxMessagesPageCursor {
  createdAt: string;
  id: string;
}

export interface InboxMessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

async function queryInboxMessagesPage(
  userId: string,
  limit: number,
  before?: InboxMessagesPageCursor,
): Promise<InboxMessagesPage> {
  const where: Prisma.InboxMessageWhereInput = scopedByUser(userId, {
    kind: "chat",
  });

  if (before) {
    where.OR = [
      { createdAt: { lt: new Date(before.createdAt) } },
      {
        createdAt: new Date(before.createdAt),
        id: { lt: before.id },
      },
    ];
  }

  const records = await prisma.inboxMessage.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    include: { transaction: true },
  });

  const hasMore = records.length > limit;
  const messages = await hydrateBatchTransactions(
    userId,
    records
      .slice(0, limit)
      .reverse()
      .map((record) => mapInboxMessage(record)),
  );

  return { messages, hasMore };
}

async function hydrateBatchTransactions(
  userId: string,
  messages: ChatMessage[],
): Promise<ChatMessage[]> {
  const primaries = messages
    .map((message) => message.transaction)
    .filter((transaction): transaction is ParsedTransaction =>
      Boolean(transaction?.id),
    );

  if (primaries.length === 0) {
    return messages;
  }

  const primaryIds = primaries
    .map((transaction) => transaction.id)
    .filter((id): id is string => Boolean(id));

  const primaryRows = await prisma.transaction.findMany({
    where: scopedByUser(userId, { id: { in: primaryIds } }),
    select: {
      id: true,
      rawInput: true,
      createdAt: true,
    },
  });

  if (primaryRows.length === 0) {
    return messages;
  }

  const siblingGroups = await Promise.all(
    primaryRows.map(async (row) => {
      const siblings = await prisma.transaction.findMany({
        where: scopedByUser(userId, {
          rawInput: row.rawInput,
          createdAt: {
            gte: new Date(row.createdAt.getTime() - 5_000),
            lte: new Date(row.createdAt.getTime() + 5_000),
          },
        }),
        orderBy: { createdAt: "asc" },
      });

      return {
        primaryId: row.id,
        transactions: siblings.map(mapTransaction),
      };
    }),
  );

  const byPrimaryId = new Map(
    siblingGroups.map((group) => [group.primaryId, group.transactions]),
  );

  return messages.map((message) => {
    const primaryId = message.transaction?.id;
    if (!primaryId) {
      return message;
    }

    const transactions = byPrimaryId.get(primaryId);
    if (!transactions || transactions.length <= 1) {
      return message;
    }

    return {
      ...message,
      transactions,
      transaction: transactions[0],
    };
  });
}

export async function getInboxMessagesPage(
  userId: string,
  options: {
    limit?: number;
    before?: InboxMessagesPageCursor;
  } = {},
): Promise<InboxMessagesPage> {
  const limit = options.limit ?? INBOX_MESSAGE_PAGE_SIZE;
  const before = options.before;

  if (before || limit !== INBOX_MESSAGE_PAGE_SIZE) {
    return queryInboxMessagesPage(userId, limit, before);
  }

  return unstable_cache(
    () => queryInboxMessagesPage(userId, limit),
    ["inbox-messages-first-page", userId],
    { tags: [userDataTags.inbox(userId)] },
  )();
}

/** Backfill + daily summaries — run off the inbox hot path (client/cron). */
export async function maintainInboxData(userId: string): Promise<void> {
  await backfillInboxMessagesFromTransactions(userId);
  await ensurePendingDailySummaries(userId);
}

export interface DeleteInboxMessagePairResult {
  removedIds: string[];
  content: string;
}

/** Removes a user chat message, its assistant reply, and linked transaction. */
export async function deleteInboxMessagePair(
  userId: string,
  userMessageId: string,
): Promise<DeleteInboxMessagePairResult> {
  const userRecord = await prisma.inboxMessage.findFirst({
    where: scopedId(userId, userMessageId),
    select: {
      id: true,
      role: true,
      kind: true,
      content: true,
      createdAt: true,
    },
  });

  if (!userRecord || userRecord.role !== "user" || userRecord.kind !== "chat") {
    throw new Error("Pesan tidak ditemukan.");
  }

  if (userRecord.content.startsWith("Bayar ")) {
    throw new Error("Pembayaran PayPlan tidak bisa dibatalkan dari chat.");
  }

  const nextRecord = await prisma.inboxMessage.findFirst({
    where: scopedByUser(userId, {
      kind: "chat",
      createdAt: {
        gt: userRecord.createdAt,
      },
    }),
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      role: true,
      transactionId: true,
    },
  });

  const assistantRecord = nextRecord?.role === "assistant" ? nextRecord : null;

  const removedIds = [userRecord.id];
  const transactionId = assistantRecord?.transactionId ?? null;

  if (assistantRecord) {
    removedIds.push(assistantRecord.id);
  }

  const linkedTransaction = transactionId
    ? await prisma.transaction.findFirst({
        where: scopedId(userId, transactionId),
        select: { id: true, rawInput: true, createdAt: true, occurredAt: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    if (assistantRecord) {
      await tx.inboxMessage.deleteMany({
        where: scopedId(userId, assistantRecord.id),
      });
    }

    await tx.inboxMessage.deleteMany({
      where: scopedId(userId, userRecord.id),
    });

    if (linkedTransaction) {
      await tx.transaction.deleteMany({
        where: scopedByUser(userId, {
          rawInput: linkedTransaction.rawInput,
          createdAt: {
            gte: new Date(linkedTransaction.createdAt.getTime() - 5_000),
            lte: new Date(linkedTransaction.createdAt.getTime() + 5_000),
          },
        }),
      });
    }
  });

  if (linkedTransaction) {
    await invalidateAiInsightCacheOnTransactionMutation(
      userId,
      linkedTransaction.occurredAt,
    );
    revalidateAfterTransactionMutation(userId);
  }

  revalidateUserInbox(userId);

  return {
    removedIds,
    content: userRecord.content,
  };
}
