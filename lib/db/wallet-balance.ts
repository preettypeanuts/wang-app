import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { endOfDay } from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import { listActiveWalletsForBalance } from "@/lib/db/wallets";
import type { WalletWithBalance } from "@/types/wallet";

function signedTransactionSum(type: string, amount: number): number {
  return type === "expense" ? -amount : amount;
}

/**
 * Per-wallet balance = initialBalance + income − expense + transfer net.
 *
 * Transfer convention: a wallet-to-wallet move is stored as two rows —
 * destination wallet with positive amount (transfer in), source wallet with
 * negative amount (transfer out) — so a signed SUM per wallet nets correctly.
 */
export async function queryWalletBalances(
  userId: string,
  asOf?: Date,
): Promise<WalletWithBalance[]> {
  const end = asOf ? endOfDay(asOf) : undefined;

  const [wallets, grouped, lastActivityRows] = await Promise.all([
    listActiveWalletsForBalance(userId, asOf),
    prisma.transaction.groupBy({
      by: ["walletId", "type"],
      where: scopedByUser(userId, {
        walletId: { not: null },
        ...(end ? { occurredAt: { lte: end } } : {}),
      }),
      _sum: { amount: true },
    }),
    end
      ? Promise.resolve([])
      : prisma.transaction.groupBy({
          by: ["walletId"],
          where: scopedByUser(userId, { walletId: { not: null } }),
          _max: { occurredAt: true },
        }),
  ]);

  const flowByWallet = new Map<string, number>();
  const lastActivityByWallet = new Map<string, string>();

  for (const row of lastActivityRows) {
    if (!row.walletId || !row._max.occurredAt) {
      continue;
    }

    lastActivityByWallet.set(row.walletId, row._max.occurredAt.toISOString());
  }

  for (const row of grouped) {
    if (!row.walletId) {
      continue;
    }

    const sum = row._sum.amount ?? 0;
    flowByWallet.set(
      row.walletId,
      (flowByWallet.get(row.walletId) ?? 0) + signedTransactionSum(row.type, sum),
    );
  }

  return wallets.map((wallet) => ({
    ...wallet,
    balance: wallet.initialBalance + (flowByWallet.get(wallet.id) ?? 0),
    lastActivityAt: lastActivityByWallet.get(wallet.id) ?? null,
  }));
}

/** Sum of all active wallet balances — primary account balance source. */
export async function queryTotalWalletBalance(
  userId: string,
  asOf?: Date,
): Promise<number> {
  const wallets = await queryWalletBalances(userId, asOf);
  return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
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

export async function getTotalWalletBalance(
  userId: string,
  asOf = new Date(),
): Promise<number> {
  const dayKey = asOf.toISOString().slice(0, 10);

  return unstable_cache(
    () => queryTotalWalletBalance(userId, asOf),
    ["total-wallet-balance", userId, dayKey],
    {
      tags: [userDataTags.wallets(userId), userDataTags.transactions(userId)],
    },
  )();
}
