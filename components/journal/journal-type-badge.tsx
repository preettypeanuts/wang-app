import { cn } from "@/lib/utils";
import { SEPARATED_PILL } from "@/config/shape";

import type { TransactionType } from "@/types/transaction";

interface JournalTypeBadgeProps {
  type: TransactionType;
}

const BADGE_STYLES: Record<TransactionType, string> = {
  income:
    "border border-[#34C759]/25 bg-[#34C759]/12 text-[#2FAE52] dark:text-[#34C759]",
  expense:
    "border border-[#FF6B6B]/25 bg-[#FF6B6B]/12 text-[#E85555] dark:text-[#FF6B6B]",
  transfer:
    "border border-black/10 bg-black/5 text-muted-foreground dark:border-white/12 dark:bg-white/8",
  adjustment:
    "border border-black/10 bg-black/5 text-muted-foreground dark:border-white/12 dark:bg-white/8",
};

const BADGE_LABELS: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  transfer: "Transfer",
  adjustment: "Penyesuaian",
};

export function JournalTypeBadge({ type }: JournalTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center px-2.5 text-[11px] font-semibold",
        SEPARATED_PILL,
        BADGE_STYLES[type],
      )}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
