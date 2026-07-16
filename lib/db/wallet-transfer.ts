import { randomUUID } from "node:crypto";

import {
  revalidateAfterTransactionMutation,
  revalidateUserWallets,
} from "@/lib/cache/revalidate-user-data";
import { prisma } from "@/lib/db/prisma";

/** Category marker for transfer legs — excluded from expense breakdowns via type filter. */
export const TRANSFER_CATEGORY = "transfer";

export interface WalletTransferInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note: string;
  adminFeeAmount: number;
}

/**
 * Stores a wallet-to-wallet move as two linked rows with type="transfer":
 * source leg with negative amount, destination leg with positive amount,
 * sharing one transferPairId. Signed SUM per wallet then nets correctly and
 * income/expense aggregates stay untouched (they filter on type).
 */
export async function createWalletTransfer(
  userId: string,
  input: WalletTransferInput,
): Promise<void> {
  if (input.fromWalletId === input.toWalletId) {
    throw new Error("Wallet asal dan tujuan harus berbeda.");
  }

  const wallets = await prisma.wallet.findMany({
    where: {
      userId,
      isArchived: false,
      id: { in: [input.fromWalletId, input.toWalletId] },
    },
    select: { id: true, name: true },
  });

  const fromWallet = wallets.find((wallet) => wallet.id === input.fromWalletId);
  const toWallet = wallets.find((wallet) => wallet.id === input.toWalletId);

  if (!fromWallet || !toWallet) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const note = input.note.trim();
  const rawInput = note
    ? `Transfer ${fromWallet.name} → ${toWallet.name} — ${note}`
    : `Transfer ${fromWallet.name} → ${toWallet.name}`;
  const transferPairId = randomUUID();
  const occurredAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.transaction.createMany({
      data: [
        {
          userId,
          type: "transfer",
          amount: -input.amount,
          category: TRANSFER_CATEGORY,
          description: `Transfer ke ${toWallet.name}`,
          rawInput,
          occurredAt,
          walletId: fromWallet.id,
          transferPairId,
        },
        {
          userId,
          type: "transfer",
          amount: input.amount,
          category: TRANSFER_CATEGORY,
          description: `Transfer dari ${fromWallet.name}`,
          rawInput,
          occurredAt,
          walletId: toWallet.id,
          transferPairId,
        },
      ],
    });

    if (input.adminFeeAmount > 0) {
      await tx.transaction.create({
        data: {
          userId,
          type: "expense",
          amount: input.adminFeeAmount,
          category: "fees",
          description: `Biaya admin transfer ke ${toWallet.name}`,
          rawInput: `${rawInput} [transfer-admin-fee:${transferPairId}]`,
          occurredAt,
          walletId: fromWallet.id,
        },
      });
    }
  });

  revalidateAfterTransactionMutation(userId);
  revalidateUserWallets(userId);
}
