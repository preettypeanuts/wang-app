"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createStarterWalletAction } from "@/app/actions/wallets";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  WALLETS_STARTER_BANK,
  WALLETS_STARTER_CASH,
  WALLETS_STARTER_EWALLET,
  WALLETS_STARTER_HINT,
  WALLETS_STARTER_TITLE,
} from "@/config/wallet-labels";
import { cn } from "@/lib/utils";
import type { WalletType } from "@/types/wallet";

interface StarterOption {
  label: string;
  name: string;
  type: WalletType;
}

const STARTER_OPTIONS: StarterOption[] = [
  { label: WALLETS_STARTER_CASH, name: "Cash", type: "cash" },
  { label: WALLETS_STARTER_BANK, name: "Rekening Bank", type: "bank" },
  { label: WALLETS_STARTER_EWALLET, name: "E-Wallet", type: "ewallet" },
];

interface WalletsStarterTemplatesProps {
  onCreated?: () => void;
  onManualAdd: () => void;
}

export function WalletsStarterTemplates({
  onCreated,
  onManualAdd,
}: WalletsStarterTemplatesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTap(option: StarterOption) {
    startTransition(async () => {
      const result = await createStarterWalletAction({
        name: option.name,
        type: option.type,
      });

      if (!result.ok) {
        return;
      }

      onCreated?.();
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground/95">
          {WALLETS_STARTER_TITLE}
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {WALLETS_STARTER_HINT}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STARTER_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            disabled={isPending}
            onClick={() => handleTap(option)}
            className={cn(
              SEPARATED_CONTROL,
              "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-60",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onManualAdd}
        className="self-start text-[11px] font-medium text-muted-foreground underline-offset-2 transition-opacity hover:text-foreground hover:underline"
      >
        atau buat manual
      </button>
    </section>
  );
}
