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
}

type InboxMessageWithTransactions = Prisma.InboxMessageGetPayload<{
  include: { transactions: true };
}>;

const inboxMessageInclude = {
  transactions: {
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.InboxMessageInclude;

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

function mapInboxMessage(record: InboxMessageWithTransactions): ChatMessage {
  const base = {
    id: record.id,
    role: record.role as MessageRole,
    content: record.content,
    createdAt: record.createdAt.toISOString(),
  };

  const transactions = record.transactions.map(mapTransaction);

  if (transactions.length > 0) {
    return {
      ...base,
      transaction: transactions[0],
      transactions,
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
}: CreateInboxMessageInput): Promise<ChatMessage> {
  const record = await prisma.inboxMessage.create({
    data: {
      userId,
      role: role as InboxMessageRole,
      kind: "chat",
      content,
    },
    include: inboxMessageInclude,
  });

  revalidateUserInbox(userId);
  return mapInboxMessage(record);
}

interface UpdateInboxMessageInput {
  content: string;
}

export async function updateInboxMessage(
  userId: string,
  id: string,
  { content }: UpdateInboxMessageInput,
): Promise<ChatMessage> {
  const updated = await prisma.inboxMessage.updateMany({
    where: scopedId(userId, id),
    data: { content },
  });

  if (updated.count === 0) {
    throw new Error("Pesan tidak ditemukan.");
  }

  const record = await prisma.inboxMessage.findFirstOrThrow({
    where: scopedId(userId, id),
    include: inboxMessageInclude,
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
    include: inboxMessageInclude,
  });

  const hasMore = records.length > limit;
  const messages = records
    .slice(0, limit)
    .reverse()
    .map((record) => mapInboxMessage(record));

  return { messages, hasMore };
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

/** Removes a user chat message, its assistant reply, and linked transactions. */
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
    },
  });

  const assistantRecord = nextRecord?.role === "assistant" ? nextRecord : null;

  const removedIds = [userRecord.id];

  if (assistantRecord) {
    removedIds.push(assistantRecord.id);
  }

  const linkedTransactions = assistantRecord
    ? await prisma.transaction.findMany({
        where: scopedByUser(userId, {
          inboxMessageId: assistantRecord.id,
        }),
        select: { id: true, occurredAt: true },
      })
    : [];

  await prisma.$transaction(async (tx) => {
    if (assistantRecord) {
      await tx.inboxMessage.deleteMany({
        where: scopedId(userId, assistantRecord.id),
      });
    }

    await tx.inboxMessage.deleteMany({
      where: scopedId(userId, userRecord.id),
    });

    if (linkedTransactions.length > 0) {
      await tx.transaction.deleteMany({
        where: scopedByUser(userId, {
          id: { in: linkedTransactions.map((row) => row.id) },
        }),
      });
    }
  });

  for (const row of linkedTransactions) {
    await invalidateAiInsightCacheOnTransactionMutation(userId, row.occurredAt);
  }
  if (linkedTransactions.length > 0) {
    revalidateAfterTransactionMutation(userId);
  }

  revalidateUserInbox(userId);

  return {
    removedIds,
    content: userRecord.content,
  };
}
