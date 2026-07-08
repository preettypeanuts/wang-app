import { normalizeCategory } from "@/config/categories";
import type { Transaction } from "@/generated/prisma/client";
import { buildTransactionReply } from "@/lib/ai/parse-transaction";
import { prisma } from "@/lib/db/prisma";
import type { ParsedTransaction } from "@/types/transaction";

function toParsedTransaction(record: Transaction): ParsedTransaction {
  return {
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
  };
}

export async function backfillInboxMessagesFromTransactions(
  userId: string,
): Promise<number> {
  const orphans = await prisma.transaction.findMany({
    where: { userId, inboxMessageId: null },
    orderBy: { createdAt: "asc" },
  });

  if (orphans.length === 0) {
    return 0;
  }

  for (const transaction of orphans) {
    const reply = buildTransactionReply(toParsedTransaction(transaction));
    const assistantAt = transaction.createdAt;
    const userAt = new Date(transaction.createdAt.getTime() - 1_000);

    await prisma.$transaction(async (tx) => {
      await tx.inboxMessage.create({
        data: {
          userId,
          role: "user",
          kind: "chat",
          content: transaction.rawInput,
          createdAt: userAt,
        },
      });

      const assistant = await tx.inboxMessage.create({
        data: {
          userId,
          role: "assistant",
          kind: "chat",
          content: reply,
          createdAt: assistantAt,
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { inboxMessageId: assistant.id },
      });
    });
  }

  return orphans.length;
}
