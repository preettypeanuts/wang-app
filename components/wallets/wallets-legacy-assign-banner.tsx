"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { assignLegacyTransactionsAction } from "@/app/actions/wallets";
import { Button } from "@/components/ui/button";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  WALLETS_LEGACY_BANNER_ACTION,
  WALLETS_LEGACY_BANNER_ACTIONING,
  WALLETS_LEGACY_BANNER_DESC,
  WALLETS_LEGACY_BANNER_TITLE,
} from "@/config/wallet-labels";
import { cn } from "@/lib/utils";

interface WalletsLegacyAssignBannerProps {
  count: number;
  defaultWalletName: string;
}

export function WalletsLegacyAssignBanner({
  count,
  defaultWalletName,
}: WalletsLegacyAssignBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (count <= 0 || dismissed) {
    return null;
  }

  const description = WALLETS_LEGACY_BANNER_DESC.replace("{count}", String(count)).replace(
    "{wallet}",
    defaultWalletName,
  );

  function handleAssign() {
    setError(null);
    startTransition(async () => {
      const result = await assignLegacyTransactionsAction();

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDismissed(true);
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3">
      <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">
        {WALLETS_LEGACY_BANNER_TITLE}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-amber-950/90 dark:text-amber-50/90">
        {description}
      </p>
      {error ? (
        <p className="mt-2 text-[12px] text-destructive">{error}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          className={cn(SEPARATED_CONTROL, "h-8")}
          onClick={handleAssign}
        >
          {isPending ? WALLETS_LEGACY_BANNER_ACTIONING : WALLETS_LEGACY_BANNER_ACTION}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          className="h-8 text-amber-950/80 dark:text-amber-50/80"
          onClick={() => setDismissed(true)}
        >
          Nanti
        </Button>
      </div>
    </section>
  );
}
