"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  WalletFormDialog,
  type WalletFormMode,
} from "@/components/wallets/wallet-form-dialog";
import { WalletTransferFormDialog } from "@/components/wallets/wallet-transfer-form-dialog";
import { WalletAdjustFormDialog } from "@/components/wallets/wallet-adjust-form-dialog";
import { WalletsStarterTemplates } from "@/components/wallets/wallets-starter-templates";
import { WalletTypeIcon } from "@/components/wallets/wallet-type-icon";
import {
  WALLETS_LIST_CARD,
  WALLETS_LIST_DIVIDER,
  WALLETS_LIST_PADDING,
} from "@/config/wallets-page";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  WALLET_ADJUST,
  WALLET_TYPE_LABELS,
  WALLETS_ADD,
  WALLETS_DEFAULT_BADGE,
  WALLETS_TOTAL_LABEL,
  WALLET_TRANSFER,
} from "@/config/wallet-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { ArrowsLeftRightIcon, PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { WalletWithBalance } from "@/types/wallet";

interface WalletsViewProps {
  wallets: WalletWithBalance[];
}

export function WalletsView({ wallets }: WalletsViewProps) {
  const router = useRouter();
  const { formatAmount } = useProtectedCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustWallet, setAdjustWallet] = useState<WalletWithBalance | null>(
    null,
  );
  const [formMode, setFormMode] = useState<WalletFormMode | null>(null);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const canTransfer = wallets.length >= 2;
  const showStarter = wallets.length === 0;

  function openNew() {
    setFormMode({ kind: "new" });
    setDialogOpen(true);
  }

  function openEdit(wallet: WalletWithBalance) {
    setFormMode({ kind: "edit", wallet });
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-3">
      {showStarter ? (
        <WalletsStarterTemplates onManualAdd={openNew} />
      ) : (
        <section className={cn(WALLETS_LIST_CARD, WALLETS_LIST_PADDING)}>
          <ul className="flex flex-col">
            {wallets.map((wallet, index) => (
              <li key={wallet.id}>
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-px w-full shrink-0 border-t border-black/6 dark:border-white/8",
                      WALLETS_LIST_DIVIDER,
                    )}
                    aria-hidden
                  />
                ) : null}
                <div className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => openEdit(wallet)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
                  >
                    <WalletTypeIcon type={wallet.type} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground/95">
                          {wallet.name}
                        </span>
                        {wallet.isDefault ? (
                          <span className="shrink-0 rounded-full bg-black/6 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-white/10">
                            {WALLETS_DEFAULT_BADGE}
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {WALLET_TYPE_LABELS[wallet.type]}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums tracking-tight",
                        wallet.balance < 0
                          ? "text-[#FF3B30]"
                          : "text-foreground/95",
                      )}
                    >
                      {formatAmount(wallet.balance)}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(SEPARATED_CONTROL, "h-8 shrink-0 px-2.5 text-[11px]")}
                    onClick={() => setAdjustWallet(wallet)}
                  >
                    {WALLET_ADJUST}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-3 dark:border-white/8 max-md:border-t-0 max-md:pt-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {WALLETS_TOTAL_LABEL}
            </p>
            <p className="text-sm font-semibold tabular-nums tracking-tight text-foreground/95">
              {formatAmount(totalBalance)}
            </p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={openNew}
          className={cn(SEPARATED_CONTROL, "gap-1.5")}
        >
          <PlusIcon className="size-3.5" />
          {WALLETS_ADD}
        </Button>

        {canTransfer ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setTransferOpen(true)}
            className={cn(SEPARATED_CONTROL, "gap-1.5")}
          >
            <ArrowsLeftRightIcon className="size-3.5" />
            {WALLET_TRANSFER}
          </Button>
        ) : null}
      </div>

      <WalletFormDialog
        open={dialogOpen}
        mode={formMode}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            router.refresh();
          }
        }}
      />

      {canTransfer ? (
        <WalletTransferFormDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          wallets={wallets}
        />
      ) : null}

      <WalletAdjustFormDialog
        open={adjustWallet !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAdjustWallet(null);
          }
        }}
        wallet={adjustWallet}
      />
    </div>
  );
}
