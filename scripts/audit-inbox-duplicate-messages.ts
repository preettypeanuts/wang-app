#!/usr/bin/env node
/**
 * Audit orphan transactions and duplicate inbox messages.
 * Usage: npx tsx scripts/audit-inbox-duplicate-messages.ts
 */
import { prisma } from "@/lib/db/prisma";

async function main() {
  const orphanTransactions = await prisma.transaction.findMany({
    where: { inboxMessageId: null },
    select: {
      id: true,
      userId: true,
      rawInput: true,
      description: true,
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const batchAssistantMessages = await prisma.inboxMessage.findMany({
    where: {
      role: "assistant",
      kind: "chat",
      transactions: { some: {} },
    },
    select: {
      id: true,
      userId: true,
      content: true,
      createdAt: true,
      _count: { select: { transactions: true } },
    },
  });

  const multiTransactionBatches = batchAssistantMessages.filter(
    (row) => row._count.transactions > 1,
  );

  const duplicateBackfillCandidates: Array<{
    userMessageId: string;
    assistantMessageId: string;
    rawInput: string;
    orphanTransactionId: string;
  }> = [];

  for (const orphan of orphanTransactions) {
    const rawInput = orphan.rawInput.trim();

    const userCandidates = await prisma.inboxMessage.findMany({
      where: {
        userId: orphan.userId,
        role: "user",
        kind: "chat",
        content: rawInput,
        createdAt: {
          gte: new Date(orphan.createdAt.getTime() - 60_000),
          lte: new Date(orphan.createdAt.getTime() + 60_000),
        },
      },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    for (const userMessage of userCandidates) {
      const assistant = await prisma.inboxMessage.findFirst({
        where: {
          userId: orphan.userId,
          role: "assistant",
          kind: "chat",
          createdAt: { gt: userMessage.createdAt },
          transactions: { some: { id: orphan.id } },
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (assistant) {
        duplicateBackfillCandidates.push({
          userMessageId: userMessage.id,
          assistantMessageId: assistant.id,
          rawInput,
          orphanTransactionId: orphan.id,
        });
      }
    }
  }

  const orphanByUser = new Map<string, number>();
  for (const row of orphanTransactions) {
    orphanByUser.set(row.userId, (orphanByUser.get(row.userId) ?? 0) + 1);
  }

  console.log("=== Inbox duplicate / orphan audit ===\n");
  console.log(
    `Orphan transactions (inboxMessageId is null): ${orphanTransactions.length}`,
  );
  console.log(
    `Assistant messages with multiple linked transactions: ${multiTransactionBatches.length}`,
  );
  console.log(
    `Suspected backfill duplicate pairs (user+assistant): ${duplicateBackfillCandidates.length}`,
  );
  console.log(
    `Extra inbox messages from backfill (est.): ${duplicateBackfillCandidates.length * 2}`,
  );

  if (orphanByUser.size > 0) {
    console.log("\nOrphans by user:");
    for (const [userId, count] of orphanByUser) {
      console.log(`  ${userId}: ${count}`);
    }
  }

  if (duplicateBackfillCandidates.length > 0) {
    console.log("\nSample duplicate pairs (max 10):");
    for (const row of duplicateBackfillCandidates.slice(0, 10)) {
      console.log(
        `  orphanTx=${row.orphanTransactionId} user=${row.userMessageId} assistant=${row.assistantMessageId} rawInput="${row.rawInput.slice(0, 60)}"`,
      );
    }
  }

  if (
    orphanTransactions.length > 0 &&
    duplicateBackfillCandidates.length === 0
  ) {
    console.log("\nSample orphans (max 5):");
    for (const row of orphanTransactions.slice(0, 5)) {
      console.log(
        `  id=${row.id} user=${row.userId} amount=${row.amount} rawInput="${row.rawInput.slice(0, 60)}"`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
