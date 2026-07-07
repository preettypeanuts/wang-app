import { normalizeCategory } from "@/config/categories";
import { INBOX_MESSAGE_PAGE_SIZE } from "@/config/inbox-messages";
import { backfillInboxMessagesFromTransactions } from "@/lib/db/backfill-inbox-messages";
import { ensurePendingDailySummaries } from "@/lib/db/daily-summary";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import type { ChatMessage, MessageRole } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";
import type {
  InboxMessageRole,
  Prisma,
  Transaction,
} from "@/generated/prisma/client";

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
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
  };
}

function mapInboxMessage(record: InboxMessageWithTransaction): ChatMessage {
  return {
    id: record.id,
    role: record.role as MessageRole,
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    ...(record.transaction ? { transaction: mapTransaction(record.transaction) } : {}),
  };
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

export async function getInboxMessagesPage(
  userId: string,
  options: {
    limit?: number;
    before?: InboxMessagesPageCursor;
  } = {},
): Promise<InboxMessagesPage> {
  const limit = options.limit ?? INBOX_MESSAGE_PAGE_SIZE;
  const before = options.before;

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
  const messages = records
    .slice(0, limit)
    .reverse()
    .map((record) => mapInboxMessage(record));

  return { messages, hasMore };
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

  if (
    !userRecord ||
    userRecord.role !== "user" ||
    userRecord.kind !== "chat"
  ) {
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

  const assistantRecord =
    nextRecord?.role === "assistant" ? nextRecord : null;

  const removedIds = [userRecord.id];
  const transactionId = assistantRecord?.transactionId ?? null;

  if (assistantRecord) {
    removedIds.push(assistantRecord.id);
  }

  await prisma.$transaction(async (tx) => {
    if (assistantRecord) {
      await tx.inboxMessage.deleteMany({
        where: scopedId(userId, assistantRecord.id),
      });
    }

    await tx.inboxMessage.deleteMany({
      where: scopedId(userId, userRecord.id),
    });

    if (transactionId) {
      await tx.transaction.deleteMany({
        where: scopedId(userId, transactionId),
      });
    }
  });

  return {
    removedIds,
    content: userRecord.content,
  };
}
