"use client";

import { WalletIcon } from "@/lib/icons";

import {
  UI_LABEL_FREE_BALANCE,
  UI_LABEL_OVERVIEW_ACTIVE_SAVINGS_COUNT,
  UI_LABEL_OVERVIEW_SAVINGS_TARGET,
  UI_LABEL_TOTAL_SAVED,
  formatViewPageLink,
} from "@/config/ui-labels";

import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import { OverviewActionLink } from "@/components/overview/overview-action-link";
import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
} from "@/config/overview";
import { PLANS_ROUTE, SAVINGS_PAGE_TITLE } from "@/config/navigation";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { SavingsOverview } from "@/types/savings-goal";

interface OverviewSavingsProgressCardProps {
  overview: SavingsOverview;
  className?: string;
}

export function OverviewSavingsProgressCard({
  overview,
  className,
}: OverviewSavingsProgressCardProps) {
  const { formatAmount } = useProtectedCurrency();
  const progress =
    overview.totalTarget <= 0
      ? 0
      : Math.min(
          100,
          Math.round((overview.totalSaved / overview.totalTarget) * 100),
        );

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <OverviewIconShell variant="blue">
            <WalletIcon />
          </OverviewIconShell>
          <div className="min-w-0">
            <p className={OVERVIEW_SECTION_LABEL}>{SAVINGS_PAGE_TITLE}</p>
            <h2 className={cn("mt-0.5", OVERVIEW_SECTION_TITLE)}>
              {UI_LABEL_OVERVIEW_SAVINGS_TARGET}
            </h2>
          </div>
        </div>
        <BalanceVisibilityToggle />
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {overview.activeCount}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {UI_LABEL_OVERVIEW_ACTIVE_SAVINGS_COUNT}
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-muted-foreground">{UI_LABEL_TOTAL_SAVED}</p>
            <p className="mt-0.5 font-semibold tabular-nums">
              {formatAmount(overview.totalSaved)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">{UI_LABEL_FREE_BALANCE}</p>
            <p
              className={cn(
                "mt-0.5 font-semibold tabular-nums",
                overview.freeBalance < 0
                  ? "text-[#FF3B30]"
                  : "text-foreground/90",
              )}
            >
              {formatAmount(overview.freeBalance)}
            </p>
          </div>
        </div>
      </div>

      <OverviewActionLink href={`${PLANS_ROUTE}?tab=savings`} className="mt-4">
        {formatViewPageLink(SAVINGS_PAGE_TITLE)}
      </OverviewActionLink>
    </section>
  );
}
