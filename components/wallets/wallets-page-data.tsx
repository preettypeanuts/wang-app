import { WalletsPageContent } from "@/components/wallets/wallets-page-content";
import { WalletsView } from "@/components/wallets/wallets-view";
import { requireUserId } from "@/lib/auth/session";
import {
  getWalletBalances,
  queryWalletBalances,
} from "@/lib/db/wallet-balance";
import { ensureLegacyWalletTransactionsAssigned } from "@/lib/db/wallets";
import { processWalletAdminFeesForUser } from "@/lib/wallets/process-wallet-admin-fees";

export async function WalletsPageData() {
  const userId = await requireUserId();
  await processWalletAdminFeesForUser(userId);
  const assigned = await ensureLegacyWalletTransactionsAssigned(userId);
  const wallets =
    assigned > 0
      ? await queryWalletBalances(userId)
      : await getWalletBalances(userId);

  return (
    <WalletsPageContent>
      <WalletsView wallets={wallets} />
    </WalletsPageContent>
  );
}
