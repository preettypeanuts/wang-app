import { WalletIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface JournalWalletBadgeProps {
  name: string;
  className?: string;
}

/** Tiny pill showing which wallet a transaction belongs to. */
export function JournalWalletBadge({ name, className }: JournalWalletBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-24 shrink-0 items-center gap-0.5 rounded-full bg-black/6 px-1.5 py-px text-[10px] font-medium leading-tight text-muted-foreground dark:bg-white/10",
        className,
      )}
    >
      <WalletIcon aria-hidden className="size-2.5 shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}
