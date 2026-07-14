import { WalletsLegacyAssignBanner } from "@/components/wallets/wallets-legacy-assign-banner";
import { WalletsPageContent } from "@/components/wallets/wallets-page-content";
import { WalletsView } from "@/components/wallets/wallets-view";
import { requireUserId } from "@/lib/auth/session";
import { getWalletBalances } from "@/lib/db/wallet-balance";
import {
  countUnassignedFlowTransactions,
  getDefaultWalletId,
  listWallets,
} from "@/lib/db/wallets";

export async function WalletsPageData() {
  const userId = await requireUserId();
  const [wallets, unassignedCount, defaultWalletId] = await Promise.all([
    getWalletBalances(userId),
    countUnassignedFlowTransactions(userId),
    getDefaultWalletId(userId),
  ]);

  const defaultWalletName =
    wallets.find((wallet) => wallet.id === defaultWalletId)?.name ??
    (await listWallets(userId)).find((wallet) => wallet.isDefault)?.name ??
    "Dompet Utama";

  return (
    <WalletsPageContent>
      <div className="flex flex-col gap-3">
        <WalletsLegacyAssignBanner
          count={unassignedCount}
          defaultWalletName={defaultWalletName}
        />
        <WalletsView wallets={wallets} />
      </div>
    </WalletsPageContent>
  );
}
