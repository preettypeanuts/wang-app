"use client";

import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "@/lib/icons";

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
} from "@/config/overview";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type {
  OverviewDayDeltas,
  OverviewFilterContext,
} from "@/types/overview";

interface OverviewBalanceHeroProps {
  balance: number;
  todayIncome: number;
  todayExpense: number;
  dayDeltas: OverviewDayDeltas;
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
  const incomeLabel = filterContext?.incomeLabel ?? "In hari ini";
  const expenseLabel = filterContext?.expenseLabel ?? "Out hari ini";
  const balanceDeltaLabel = filterContext?.balanceDeltaLabel ?? "vs kemarin";

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={OVERVIEW_SECTION_LABEL}>Saldo</p>
          <h2 className={cn("mt-1", OVERVIEW_SECTION_TITLE)}>
            Ringkasan saldo
          </h2>
        </div>
        <BalanceVisibilityToggle />
      </div>

      <div className={OVERVIEW_BALANCE_METRICS}>
        <div className={OVERVIEW_BALANCE_METRIC}>
          <div className="flex items-center gap-2">
            <OverviewIconShell variant={isNegative ? "orange" : "green"}>
              <WalletIcon />
            </OverviewIconShell>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Saldo
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
          ? "Saldo kumulatif hingga akhir periode filter."
          : "Saldo kumulatif dari semua transaksi hingga hari ini."}
      </p>
    </section>
  );
}
