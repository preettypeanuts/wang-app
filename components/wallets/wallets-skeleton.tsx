import { Skeleton } from "@/components/ui/skeleton";
import {
  WALLETS_LIST_CARD,
  WALLETS_LIST_PADDING,
} from "@/config/wallets-page";
import { cn } from "@/lib/utils";

export function WalletsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className={cn(WALLETS_LIST_CARD, WALLETS_LIST_PADDING)}>
        <div className="flex flex-col gap-4">
          {["first", "second", "third"].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-4xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-9 w-32 rounded-xl" />
    </div>
  );
}
