import { Button } from "@/components/ui/button";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  WALLET_INSUFFICIENT_BACK,
  WALLET_INSUFFICIENT_HINT,
  WALLET_INSUFFICIENT_TITLE,
} from "@/config/wallet-labels";
import { cn } from "@/lib/utils";

interface InsufficientWalletBalancePanelProps {
  message: string;
  onBack: () => void;
  onProceed: () => void;
  isPending: boolean;
  proceedLabel: string;
}

export function InsufficientWalletBalancePanel({
  message,
  onBack,
  onProceed,
  isPending,
  proceedLabel,
}: InsufficientWalletBalancePanelProps) {
  return (
    <div className="flex flex-col gap-4 px-1">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
        <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">
          {WALLET_INSUFFICIENT_TITLE}
        </p>
        <p className="mt-1.5 text-[13px] leading-snug text-amber-950/90 dark:text-amber-50/90">
          {message}
        </p>
        <p className="mt-2 text-[12px] leading-snug text-amber-900/80 dark:text-amber-100/80">
          {WALLET_INSUFFICIENT_HINT}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className={cn(SEPARATED_CONTROL, "flex-1")}
          onClick={onBack}
        >
          {WALLET_INSUFFICIENT_BACK}
        </Button>
        <Button
          type="button"
          disabled={isPending}
          className={cn(SEPARATED_CONTROL, "flex-1")}
          onClick={onProceed}
        >
          {proceedLabel}
        </Button>
      </div>
    </div>
  );
}
