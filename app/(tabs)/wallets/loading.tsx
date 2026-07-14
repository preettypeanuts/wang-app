import { WalletsPageContent } from "@/components/wallets/wallets-page-content";
import { WalletsSkeleton } from "@/components/wallets/wallets-skeleton";

export default function WalletsLoading() {
  return (
    <WalletsPageContent>
      <WalletsSkeleton />
    </WalletsPageContent>
  );
}
