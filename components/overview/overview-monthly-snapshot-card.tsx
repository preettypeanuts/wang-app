"use client";

import { TableIcon } from "@/lib/icons";

import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
  OVERVIEW_STAT_TILE,
} from "@/config/overview";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { OverviewMonthlySnapshot } from "@/types/overview";

interface OverviewMonthlySnapshotCardProps {
  snapshot: OverviewMonthlySnapshot;
  isCustomPeriod?: boolean;
  className?: string;
}

export function OverviewMonthlySnapshotCard({
  snapshot,
  isCustomPeriod = snapshot.isCustomPeriod ?? false,
  className,
}: OverviewMonthlySnapshotCardProps) {
  const { formatAmount, formatSignedAmount } = useProtectedCurrency();

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <OverviewIconShell variant="indigo">
            <TableIcon />
          </OverviewIconShell>
          <div className="min-w-0">
            <p className={OVERVIEW_SECTION_LABEL}>
              {isCustomPeriod ? "Period Snapshot" : "Monthly Snapshot"}
            </p>
            <h2 className={cn("mt-0.5 capitalize", OVERVIEW_SECTION_TITLE)}>
              {snapshot.monthLabel}
            </h2>
          </div>
        </div>
        <BalanceVisibilityToggle />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={OVERVIEW_STAT_TILE}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Masuk
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-[#34C759]">
            {formatAmount(snapshot.totalIncome)}
          </p>
        </div>
        <div className={OVERVIEW_STAT_TILE}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Keluar
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-foreground/90">
            {formatAmount(snapshot.totalExpense)}
          </p>
        </div>
        <div className={OVERVIEW_STAT_TILE}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Net flow
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold tabular-nums",
              snapshot.netFlow >= 0 ? "text-[#34C759]" : "text-[#FF3B30]",
            )}
          >
            {formatSignedAmount(snapshot.netFlow)}
          </p>
        </div>
        <div className={OVERVIEW_STAT_TILE}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Transaksi
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {snapshot.transactionCount}
          </p>
        </div>
      </div>
    </section>
  );
}
