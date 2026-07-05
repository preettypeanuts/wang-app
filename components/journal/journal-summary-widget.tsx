"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  SparkleIcon,
  WalletIcon,
} from "@phosphor-icons/react";

import { JournalStatTile } from "@/components/journal/journal-stat-tile";
import { JOURNAL_WIDGET_TILE_STYLES } from "@/config/journal-widget";
import { formatIdr, formatSignedIdrDelta } from "@/lib/finance/format-currency";
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
  const expense = JOURNAL_WIDGET_TILE_STYLES.expense;
  const income = JOURNAL_WIDGET_TILE_STYLES.income;
  const balance = JOURNAL_WIDGET_TILE_STYLES.balance;
  const condition = JOURNAL_WIDGET_TILE_STYLES.condition;

  return (
    <div className={cn("flex gap-4 overflow-x-auto", className)}>
      <JournalStatTile
        icon={ArrowUpIcon}
        label="Keluar"
        value={formatIdr(summary.totalExpense)}
        delta={formatSignedIdrDelta(summary.expenseDelta)}
        surfaceClassName={expense.surface}
        iconClassName={expense.iconColor}
        labelClassName={expense.labelColor}
        valueClassName={expense.valueColor}
        deltaClassName={expense.subtitleColor}
      />
      <JournalStatTile
        icon={ArrowDownIcon}
        label="Masuk"
        value={formatIdr(summary.totalIncome)}
        delta={formatSignedIdrDelta(summary.incomeDelta)}
        surfaceClassName={income.surface}
        iconClassName={income.iconColor}
        labelClassName={income.labelColor}
        valueClassName={income.valueColor}
        deltaClassName={income.subtitleColor}
      />
      <JournalStatTile
        icon={WalletIcon}
        label="Saldo"
        value={formatIdr(summary.cumulativeBalance)}
        delta={formatSignedIdrDelta(summary.balanceDelta)}
        surfaceClassName={balance.surface}
        iconClassName={balance.iconColor}
        labelClassName={balance.labelColor}
        valueClassName={balance.valueColor}
        deltaClassName={balance.subtitleColor}
      />
      <JournalStatTile
        icon={SparkleIcon}
        label="Kondisi"
        subtitle="Gemini analytics"
        value={summary.condition.label}
        surfaceClassName={condition.surface}
        iconClassName={condition.iconColor}
        labelClassName={condition.labelColor}
        subtitleClassName={condition.subtitleColor}
        valueClassName={condition.valueColor}
      />
    </div>
  );
}
