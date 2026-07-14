import { WalletsPageContent } from "@/components/wallets/wallets-page-content";
import { WalletsView } from "@/components/wallets/wallets-view";
import { requireUserId } from "@/lib/auth/session";
import { getWalletBalances } from "@/lib/db/wallet-balance";

export async function WalletsPageData() {
  const userId = await requireUserId();
  const wallets = await getWalletBalances(userId);

  return (
    <WalletsPageContent>
      <WalletsView wallets={wallets} />
    </WalletsPageContent>
  );
}
