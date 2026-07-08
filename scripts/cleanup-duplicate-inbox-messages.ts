#!/usr/bin/env node
/**
 * One-time cleanup for backfill duplicate inbox message pairs.
 *
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-inbox-messages.ts          # dry-run (default)
 *   npx tsx scripts/cleanup-duplicate-inbox-messages.ts --confirm  # delete matches
 */
import { prisma } from "@/lib/db/prisma";

const LEGACY_REPLY_PATTERN = /^(Pengeluaran|Pemasukan) Rp[\d.]+ tercatat · .+$/;
const MULTI_REPLY_PATTERN = /^Siap, \d+ transaksi tercatat:/;

interface CleanupCandidate {
  userId: string;
  userMessageId: string;
  assistantMessageId: string;
  userContent: string;
  assistantContent: string;
  rawInput: string;
  transactionIds: string[];
}

function isLegacyAssistantContent(content: string): boolean {
  const firstLine = content.trim().split("\n")[0] ?? "";
  return LEGACY_REPLY_PATTERN.test(firstLine);
}

function isMultiAssistantContent(content: string): boolean {
  const firstLine = content.trim().split("\n")[0] ?? "";
  return MULTI_REPLY_PATTERN.test(firstLine);
}

async function findCleanupCandidates(): Promise<CleanupCandidate[]> {
  const assistants = await prisma.inboxMessage.findMany({
    where: {
      role: "assistant",
      kind: "chat",
    },
    select: {
      id: true,
      userId: true,
      content: true,
      createdAt: true,
      transactions: {
        select: {
          id: true,
          rawInput: true,
        },
      },
    },
    orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
  });

  const multiRawInputsByUser = new Map<string, Set<string>>();

  for (const message of assistants) {
    if (!isMultiAssistantContent(message.content)) {
      continue;
    }

    const bucket =
      multiRawInputsByUser.get(message.userId) ?? new Set<string>();
    for (const transaction of message.transactions) {
      bucket.add(transaction.rawInput.trim());
    }
    multiRawInputsByUser.set(message.userId, bucket);
  }

  const candidates: CleanupCandidate[] = [];

  for (const assistant of assistants) {
    if (!isLegacyAssistantContent(assistant.content)) {
      continue;
    }

    if (assistant.transactions.length === 0) {
      continue;
    }

    const multiRawInputs = multiRawInputsByUser.get(assistant.userId);
    if (!multiRawInputs) {
      continue;
    }

    const rawInputs = [
      ...new Set(assistant.transactions.map((row) => row.rawInput.trim())),
    ];

    const matchesMultiBatch = rawInputs.every((rawInput) =>
      multiRawInputs.has(rawInput),
    );
    if (!matchesMultiBatch || rawInputs.length === 0) {
      continue;
    }

    const rawInput = rawInputs[0];

    const userMessage = await prisma.inboxMessage.findFirst({
      where: {
        userId: assistant.userId,
        role: "user",
        kind: "chat",
        createdAt: { lt: assistant.createdAt },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    if (!userMessage || userMessage.content.trim() !== rawInput) {
      continue;
    }

    const interveningAssistant = await prisma.inboxMessage.findFirst({
      where: {
        userId: assistant.userId,
        role: "assistant",
        kind: "chat",
        createdAt: {
          gt: userMessage.createdAt,
          lt: assistant.createdAt,
        },
      },
      select: { id: true },
    });

    if (interveningAssistant) {
      continue;
    }

    candidates.push({
      userId: assistant.userId,
      userMessageId: userMessage.id,
      assistantMessageId: assistant.id,
      userContent: userMessage.content,
      assistantContent: assistant.content,
      rawInput,
      transactionIds: assistant.transactions.map((row) => row.id),
    });
  }

  return candidates;
}

async function deleteCandidates(candidates: CleanupCandidate[]): Promise<void> {
  for (const candidate of candidates) {
    await prisma.$transaction(async (tx) => {
      await tx.inboxMessage.deleteMany({
        where: { id: candidate.assistantMessageId },
      });
      await tx.inboxMessage.deleteMany({
        where: { id: candidate.userMessageId },
      });
    });
  }
}

function printCandidates(candidates: CleanupCandidate[]) {
  console.log("=== Cleanup duplicate inbox messages ===\n");
  console.log(`Candidates found: ${candidates.length}`);

  if (candidates.length === 0) {
    console.log("\nNothing to delete.");
    return;
  }

  console.log(
    "\nPairs to delete (user + assistant only; transactions kept):\n",
  );

  for (const [index, row] of candidates.entries()) {
    console.log(`#${index + 1}`);
    console.log(`  userId:      ${row.userId}`);
    console.log(`  userMsg:     ${row.userMessageId}`);
    console.log(`  assistant:   ${row.assistantMessageId}`);
    console.log(`  rawInput:    ${JSON.stringify(row.rawInput)}`);
    console.log(`  user:        ${JSON.stringify(row.userContent)}`);
    console.log(`  assistant:   ${JSON.stringify(row.assistantContent)}`);
    console.log(`  transactions: ${row.transactionIds.join(", ")}`);
    console.log("");
  }

  console.log(
    `Total inbox messages to delete: ${candidates.length * 2} (${candidates.length} pairs)`,
  );
  console.log(
    `Transactions preserved: ${candidates.reduce((sum, row) => sum + row.transactionIds.length, 0)}`,
  );
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  const candidates = await findCleanupCandidates();

  printCandidates(candidates);

  if (candidates.length === 0) {
    return;
  }

  if (!confirm) {
    console.log("\nDry-run only. Re-run with --confirm to delete these pairs.");
    return;
  }

  await deleteCandidates(candidates);
  console.log(`\nDeleted ${candidates.length} duplicate pairs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
