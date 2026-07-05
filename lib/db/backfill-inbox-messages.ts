import { normalizeCategory } from "@/config/categories";
import { buildTransactionReply } from "@/lib/ai/parse-transaction";
import { prisma } from "@/lib/db/prisma";
import type { ParsedTransaction } from "@/types/transaction";
import type { Transaction } from "@/generated/prisma/client";

function toParsedTransaction(record: Transaction): ParsedTransaction {
  return {
    type: record.type,
    amount: record.amount,
    category: normalizeCategory(record.category),
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
  };
}

export async function backfillInboxMessagesFromTransactions(): Promise<number> {
  const orphans = await prisma.transaction.findMany({
    where: { inboxMessage: null },
    orderBy: { createdAt: "asc" },
  });

  if (orphans.length === 0) {
    return 0;
  }

  for (const transaction of orphans) {
    const reply = buildTransactionReply(toParsedTransaction(transaction));
    const assistantAt = transaction.createdAt;
    const userAt = new Date(transaction.createdAt.getTime() - 1_000);

    await prisma.$transaction([
      prisma.inboxMessage.create({
        data: {
          role: "user",
          kind: "chat",
          content: transaction.rawInput,
          createdAt: userAt,
        },
      }),
      prisma.inboxMessage.create({
        data: {
          role: "assistant",
          kind: "chat",
          content: reply,
          createdAt: assistantAt,
          transactionId: transaction.id,
        },
      }),
    ]);
  }

  return orphans.length;
}
