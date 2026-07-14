import { Suspense } from "react";

import { WalletsPageContent } from "@/components/wallets/wallets-page-content";
import { WalletsPageData } from "@/components/wallets/wallets-page-data";
import { WalletsSkeleton } from "@/components/wallets/wallets-skeleton";

function WalletsPageFallback() {
  return (
    <WalletsPageContent>
      <WalletsSkeleton />
    </WalletsPageContent>
  );
}

export default function WalletsPage() {
  return (
    <Suspense fallback={<WalletsPageFallback />}>
      <WalletsPageData />
    </Suspense>
  );
}
