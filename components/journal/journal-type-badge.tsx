import { cn } from "@/lib/utils";
import { SEPARATED_PILL } from "@/config/shape";

interface JournalTypeBadgeProps {
  type: "income" | "expense";
}

export function JournalTypeBadge({ type }: JournalTypeBadgeProps) {
  const isIncome = type === "income";

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center px-2.5 text-[11px] font-semibold",
        SEPARATED_PILL,
        isIncome
          ? "border border-[#34C759]/25 bg-[#34C759]/12 text-[#2FAE52] dark:text-[#34C759]"
          : "border border-[#FF6B6B]/25 bg-[#FF6B6B]/12 text-[#E85555] dark:text-[#FF6B6B]",
      )}
    >
      {isIncome ? "Pemasukan" : "Pengeluaran"}
    </span>
  );
}
