import { normalizeCategory } from "@/config/categories";
import { backfillInboxMessagesFromTransactions } from "@/lib/db/backfill-inbox-messages";
import { ensurePendingDailySummaries } from "@/lib/db/daily-summary";
import { prisma } from "@/lib/db/prisma";
import type { ChatMessage, MessageRole } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";
import type {
  InboxMessageRole,
  Prisma,
  Transaction,
} from "@/generated/prisma/client";

interface CreateInboxMessageInput {
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
  role,
  content,
  transactionId,
}: CreateInboxMessageInput): Promise<ChatMessage> {
  const record = await prisma.inboxMessage.create({
    data: {
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
  id: string,
  { content, transactionId }: UpdateInboxMessageInput,
): Promise<ChatMessage> {
  const record = await prisma.inboxMessage.update({
    where: { id },
    data: {
      content,
      transactionId: transactionId ?? null,
    },
    include: {
      transaction: true,
    },
  });

  return mapInboxMessage(record);
}

export async function getInboxMessages(): Promise<ChatMessage[]> {
  await backfillInboxMessagesFromTransactions();
  await ensurePendingDailySummaries();

  const records = await prisma.inboxMessage.findMany({
    orderBy: { createdAt: "asc" },
    include: { transaction: true },
  });

  return records.map(mapInboxMessage);
}
