"use client";

import Link from "next/link";
import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import {
  OVERVIEW_BALANCE_DELTA,
  OVERVIEW_BALANCE_METRIC,
  OVERVIEW_BALANCE_METRICS,
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
  OVERVIEW_STATUS_BADGE,
} from "@/config/overview";
import {
  UI_LABEL_BALANCE,
  UI_LABEL_OVERVIEW_BALANCE,
  UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_FILTERED,
  UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_TODAY,
  UI_LABEL_OVERVIEW_BALANCE_SUMMARY,
  UI_LABEL_OVERVIEW_IN_TODAY,
  UI_LABEL_OVERVIEW_OUT_TODAY,
  UI_LABEL_OVERVIEW_VS_YESTERDAY,
} from "@/config/ui-labels";
import { WALLETS_MANAGE } from "@/config/wallet-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type {
  OverviewDayDeltas,
  OverviewFilterContext,
  OverviewWalletChip,
} from "@/types/overview";

interface OverviewBalanceHeroProps {
  balance: number;
  todayIncome: number;
  todayExpense: number;
  dayDeltas: OverviewDayDeltas;
  walletChips?: OverviewWalletChip[];
  filterContext?: OverviewFilterContext;
  className?: string;
}

function resolveDeltaClass(
  delta: number,
  tone: "income" | "expense" | "balance",
): string {
  if (delta === 0) {
    return "text-muted-foreground";
  }

  if (tone === "expense") {
    return delta > 0 ? "text-[#FF9500]" : "text-[#34C759]";
  }

  return delta > 0 ? "text-[#34C759]" : "text-[#FF3B30]";
}

interface BalanceMetricDeltaProps {
  delta: number;
  tone: "income" | "expense" | "balance";
  label: string;
}

function BalanceMetricDelta({ delta, tone, label }: BalanceMetricDeltaProps) {
  return (
    <p className={cn(OVERVIEW_BALANCE_DELTA, resolveDeltaClass(delta, tone))}>
      {label}
    </p>
  );
}

export function OverviewBalanceHero({
  balance,
  todayIncome,
  todayExpense,
  dayDeltas,
  walletChips,
  filterContext,
  className,
}: OverviewBalanceHeroProps) {
  const {
    formatAmount,
    formatSignedAmount,
    formatSignedDelta,
    formatExpenseAmount,
  } = useProtectedCurrency();
  const isNegative = balance < 0;
  const incomeLabel = filterContext?.incomeLabel ?? UI_LABEL_OVERVIEW_IN_TODAY;
  const expenseLabel =
    filterContext?.expenseLabel ?? UI_LABEL_OVERVIEW_OUT_TODAY;
  const balanceDeltaLabel =
    filterContext?.balanceDeltaLabel ?? UI_LABEL_OVERVIEW_VS_YESTERDAY;

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={OVERVIEW_SECTION_LABEL}>{UI_LABEL_OVERVIEW_BALANCE}</p>
          <h2 className={cn("mt-1", OVERVIEW_SECTION_TITLE)}>
            {UI_LABEL_OVERVIEW_BALANCE_SUMMARY}
          </h2>
        </div>
        <BalanceVisibilityToggle />
      </div>

      <div className={OVERVIEW_BALANCE_METRICS}>
        <div className={cn(OVERVIEW_BALANCE_METRIC, "min-w-0")}>
          <div className="flex items-center gap-2">
            <OverviewIconShell variant={isNegative ? "orange" : "green"}>
              <WalletIcon />
            </OverviewIconShell>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {UI_LABEL_BALANCE}
            </p>
          </div>
          <div className="mt-auto pt-3">
            <p
              className={cn(
                "text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
                isNegative ? "text-[#FF3B30]" : "text-foreground/95",
              )}
            >
              {formatAmount(balance)}
            </p>
            <BalanceMetricDelta
              delta={dayDeltas.balanceDelta}
              tone="balance"
              label={`${formatSignedDelta(dayDeltas.balanceDelta)} ${balanceDeltaLabel}`}
            />
            {walletChips && walletChips.length > 0 ? (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {walletChips.map((wallet) => (
                  <Link
                    key={wallet.id}
                    href="/overview/wallets"
                    className={cn(
                      OVERVIEW_STATUS_BADGE,
                      "shrink-0 transition-opacity hover:opacity-80",
                    )}
                  >
                    <span className="max-w-24 truncate">{wallet.name}</span>
                    <span
                      className={cn(
                        "tabular-nums",
                        wallet.balance < 0
                          ? "text-[#FF3B30]"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatAmount(wallet.balance)}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/overview/wallets"
                  className={cn(
                    OVERVIEW_STATUS_BADGE,
                    "shrink-0 text-[#007AFF] transition-opacity hover:opacity-80 dark:text-[#0A84FF]",
                  )}
                >
                  {WALLETS_MANAGE}
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className={OVERVIEW_BALANCE_METRIC}>
          <div className="flex items-center gap-2">
            <OverviewIconShell variant="green">
              <ArrowDownIcon />
            </OverviewIconShell>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {incomeLabel}
            </p>
          </div>
          <div className="mt-auto pt-3">
            <p className="text-xl font-semibold tabular-nums tracking-tight text-[#34C759] sm:text-2xl">
              {formatSignedAmount(todayIncome)}
            </p>
            <BalanceMetricDelta
              delta={dayDeltas.incomeDelta}
              tone="income"
              label={`${formatSignedDelta(dayDeltas.incomeDelta)} ${balanceDeltaLabel}`}
            />
          </div>
        </div>

        <div className={OVERVIEW_BALANCE_METRIC}>
          <div className="flex items-center gap-2">
            <OverviewIconShell variant="orange">
              <ArrowUpIcon />
            </OverviewIconShell>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {expenseLabel}
            </p>
          </div>
          <div className="mt-auto pt-3">
            <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground/90 sm:text-2xl">
              {formatExpenseAmount(todayExpense)}
            </p>
            <BalanceMetricDelta
              delta={dayDeltas.expenseDelta}
              tone="expense"
              label={`${formatSignedDelta(dayDeltas.expenseDelta)} ${balanceDeltaLabel}`}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {filterContext?.isDateRangeActive
          ? UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_FILTERED
          : UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_TODAY}
      </p>
    </section>
  );
}
