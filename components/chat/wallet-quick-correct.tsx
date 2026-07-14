"use client";

import { CHAT_BUBBLE_STYLES } from "@/config/chat-bubbles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";
import type { WalletChipCandidate } from "@/types/chat";

const WALLET_CORRECT_SHELL = cn(
  SEPARATED_SURFACE,
  CHAT_BUBBLE_STYLES.assistant.surface,
  "flex flex-col gap-2 p-3",
);

const WALLET_CORRECT_CHIP = [
  "rounded-full border border-black/8 bg-black/4 px-3 py-1.5",
  "text-[11px] font-medium text-foreground transition-colors",
  "hover:bg-black/8 active:scale-[0.98]",
  "disabled:pointer-events-none disabled:opacity-40",
  "dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12",
  "max-md:py-2 max-md:text-xs",
].join(" ");

interface WalletQuickCorrectProps {
  candidates: WalletChipCandidate[];
  disabled?: boolean;
  onSelect: (walletId: string) => void;
}

/** Chips shown when a chat mention matched more than one wallet name. */
export function WalletQuickCorrect({
  candidates,
  disabled = false,
  onSelect,
}: WalletQuickCorrectProps) {
  return (
    <div className={cn("mt-1.5 max-w-[85%]", WALLET_CORRECT_SHELL)}>
      <p className="text-[11px] text-muted-foreground">
        Masuk dompet mana? Aku belum yakin:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {candidates.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(wallet.id)}
            className={WALLET_CORRECT_CHIP}
          >
            {wallet.name}
          </button>
        ))}
      </div>
    </div>
  );
}
