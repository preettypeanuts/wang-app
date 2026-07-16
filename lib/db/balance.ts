import { unstable_cache } from "next/cache";

import { userDataTags } from "@/lib/cache/user-data-tags";
import { toDayKey } from "@/lib/finance/day-range";
import {
  queryTotalWalletBalance,
} from "@/lib/db/wallet-balance";
import { ensureLegacyWalletTransactionsAssigned } from "@/lib/db/wallets";

/** Cumulative balance from all active wallets up to `asOf`. */
export async function getAvailableBalance(
  userId: string,
  asOf = new Date(),
): Promise<number> {
  const assigned = await ensureLegacyWalletTransactionsAssigned(userId);

  if (assigned > 0) {
    return queryTotalWalletBalance(userId, asOf);
  }

  const dayKey = toDayKey(asOf);

  return unstable_cache(
    () => queryTotalWalletBalance(userId, asOf),
    ["available-balance", userId, dayKey],
    {
      tags: [userDataTags.transactions(userId), userDataTags.wallets(userId)],
    },
  )();
}
