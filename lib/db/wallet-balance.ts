import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import { listWallets } from "@/lib/db/wallets";
import type { WalletWithBalance } from "@/types/wallet";

/**
 * Per-wallet balance = initialBalance + income − expense + transfer net.
 *
 * Transfer convention: a wallet-to-wallet move is stored as two rows —
 * destination wallet with positive amount (transfer in), source wallet with
 * negative amount (transfer out) — so a signed SUM per wallet nets correctly.
 */
async function queryWalletBalances(
  userId: string,
): Promise<WalletWithBalance[]> {
  const [wallets, grouped] = await Promise.all([
    listWallets(userId),
    prisma.transaction.groupBy({
      by: ["walletId", "type"],
      where: scopedByUser(userId, { walletId: { not: null } }),
      _sum: { amount: true },
    }),
  ]);

  const flowByWallet = new Map<string, number>();

  for (const row of grouped) {
    if (!row.walletId) {
      continue;
    }

    const sum = row._sum.amount ?? 0;
    const signed = row.type === "expense" ? -sum : sum;
    flowByWallet.set(
      row.walletId,
      (flowByWallet.get(row.walletId) ?? 0) + signed,
    );
  }

  return wallets.map((wallet) => ({
    ...wallet,
    balance: wallet.initialBalance + (flowByWallet.get(wallet.id) ?? 0),
  }));
}

export async function getWalletBalances(
  userId: string,
): Promise<WalletWithBalance[]> {
  return unstable_cache(
    () => queryWalletBalances(userId),
    ["wallet-balances", userId],
    {
      tags: [userDataTags.wallets(userId), userDataTags.transactions(userId)],
    },
  )();
}
