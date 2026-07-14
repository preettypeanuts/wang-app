import {
  revalidateAfterTransactionMutation,
  revalidateUserWallets,
} from "@/lib/cache/revalidate-user-data";
import { prisma } from "@/lib/db/prisma";
import { getWalletBalances } from "@/lib/db/wallet-balance";

/** Category marker for balance adjustments — excluded from expense breakdowns via type filter. */
export const ADJUSTMENT_CATEGORY = "adjustment";

export interface WalletAdjustmentInput {
  walletId: string;
  actualBalance: number;
  note: string;
}

/**
 * Stores a manual balance correction as one signed adjustment row.
 * Positive amount increases wallet balance; negative decreases it.
 */
export async function createWalletAdjustment(
  userId: string,
  input: WalletAdjustmentInput,
): Promise<void> {
  const wallets = await getWalletBalances(userId);
  const wallet = wallets.find((row) => row.id === input.walletId);

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const diff = input.actualBalance - wallet.balance;

  if (diff === 0) {
    throw new Error("Saldo sudah sesuai dengan perhitungan.");
  }

  const note = input.note.trim();
  const description = note
    ? `Penyesuaian saldo — ${note}`
    : "Penyesuaian saldo";

  await prisma.transaction.create({
    data: {
      userId,
      type: "adjustment",
      amount: diff,
      category: ADJUSTMENT_CATEGORY,
      description,
      rawInput: description,
      occurredAt: new Date(),
      walletId: wallet.id,
    },
  });

  revalidateAfterTransactionMutation(userId);
  revalidateUserWallets(userId);
}
