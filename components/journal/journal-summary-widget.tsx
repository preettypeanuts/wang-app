"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  SparkleIcon,
  WalletIcon,
} from "@/lib/icons";

import { JournalStatTile } from "@/components/journal/journal-stat-tile";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import { useAppearance } from "@/components/shared/appearance-provider";
import { JOURNAL_WIDGET_TILE_STYLES } from "@/config/journal-widget";
import {
  UI_LABEL_BALANCE,
  UI_LABEL_CONDITION,
  UI_LABEL_EXPENSE,
  UI_LABEL_GEMINI_ANALYTICS,
  UI_LABEL_HIDE,
  UI_LABEL_INCOME,
  UI_LABEL_SHOW,
  UI_LABEL_VS_LAST_MONTH,
  UI_LABEL_VS_LAST_MONTH_END,
  UI_LABEL_VS_PREVIOUS_PERIOD_END,
} from "@/config/ui-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { JournalDaySummary } from "@/types/journal";

interface JournalSummaryWidgetProps {
  summary: JournalDaySummary;
  className?: string;
}

export function JournalSummaryWidget({
  summary,
  className,
}: JournalSummaryWidgetProps) {
  const { balanceVisible } = useAppearance();
  const { formatAmount, formatSignedDelta } = useProtectedCurrency();
  const expense = JOURNAL_WIDGET_TILE_STYLES.expense;
  const income = JOURNAL_WIDGET_TILE_STYLES.income;
  const balance = JOURNAL_WIDGET_TILE_STYLES.balance;
  const condition = JOURNAL_WIDGET_TILE_STYLES.condition;

  const deltaLabel = summary.periodDeltaLabel ?? UI_LABEL_VS_LAST_MONTH;
  const balanceDeltaLabel = summary.periodLabel
    ? UI_LABEL_VS_PREVIOUS_PERIOD_END
    : UI_LABEL_VS_LAST_MONTH_END;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between md:justify-end">
        <span className="text-xs font-medium text-muted-foreground md:hidden">
          {balanceVisible ? UI_LABEL_HIDE : UI_LABEL_SHOW}
        </span>
        <BalanceVisibilityToggle />
      </div>
      <div className="grid grid-cols-2 md:flex gap-2 md:gap-2 overflow-x-auto">
        <JournalStatTile
          icon={ArrowUpIcon}
          label={UI_LABEL_EXPENSE}
          value={formatAmount(summary.totalExpense)}
          delta={formatSignedDelta(summary.expenseDelta)}
          deltaLabel={deltaLabel}
          surfaceClassName={expense.surface}
          iconClassName={expense.iconColor}
          labelClassName={expense.labelColor}
          valueClassName={expense.valueColor}
          deltaClassName={expense.subtitleColor}
        />
        <JournalStatTile
          icon={ArrowDownIcon}
          label={UI_LABEL_INCOME}
          value={formatAmount(summary.totalIncome)}
          delta={formatSignedDelta(summary.incomeDelta)}
          deltaLabel={deltaLabel}
          surfaceClassName={income.surface}
          iconClassName={income.iconColor}
          labelClassName={income.labelColor}
          valueClassName={income.valueColor}
          deltaClassName={income.subtitleColor}
        />
        <JournalStatTile
          icon={WalletIcon}
          label={UI_LABEL_BALANCE}
          value={formatAmount(summary.cumulativeBalance)}
          delta={formatSignedDelta(summary.balanceDelta)}
          deltaLabel={balanceDeltaLabel}
          surfaceClassName={balance.surface}
          iconClassName={balance.iconColor}
          labelClassName={balance.labelColor}
          valueClassName={balance.valueColor}
          deltaClassName={balance.subtitleColor}
        />
        <JournalStatTile
          icon={SparkleIcon}
          label={UI_LABEL_CONDITION}
          subtitle={UI_LABEL_GEMINI_ANALYTICS}
          value={summary.condition.label}
          surfaceClassName={condition.surface}
          iconClassName={condition.iconColor}
          labelClassName={condition.labelColor}
          subtitleClassName={condition.subtitleColor}
          valueClassName={condition.valueColor}
        />
      </div>
    </div>
  );
}
