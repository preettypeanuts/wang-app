"use client";

import { DailySummarySection } from "@/components/finance/daily-summary-section";
import { SummaryTile } from "@/components/finance/summary-tile";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import {
  UI_LABEL_BALANCE,
  UI_LABEL_EXPENSE,
  UI_LABEL_INCOME,
  UI_LABEL_SUMMARY,
  UI_LABEL_TODAY,
} from "@/config/ui-labels";
import { GLASS_SURFACE } from "@/config/glass";
import {
  getCategoryTileStyle,
  TOTAL_TILE_STYLES,
} from "@/config/summary-tiles";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import { SEPARATED_SHELL } from "@/config/shape";
import { GRID_GAP, SHELL_PADDING, STACK_GAP } from "@/config/spacing";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { cn } from "@/lib/utils";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface TodaySummaryPanelProps {
  summary: TodaySummary;
  dailySummary: DailySummarySnapshot | null;
  /** Flat layout for mobile drawer — no outer glass shell. */
  embedded?: boolean;
}

export function TodaySummaryPanel({
  summary,
  dailySummary,
  embedded = false,
}: TodaySummaryPanelProps) {
  const today = new Date();
  const { formatAmount } = useProtectedCurrency();
  const income = SOLID_WIDGET_TILE_STYLES.income;
  const expense = SOLID_WIDGET_TILE_STYLES.expense;
  const balance = SOLID_WIDGET_TILE_STYLES.balance;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden",
        !embedded && SEPARATED_SHELL,
        !embedded && GLASS_SURFACE,
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          SHELL_PADDING,
          STACK_GAP,
        )}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {UI_LABEL_TODAY}
          </p>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {UI_LABEL_SUMMARY}
              </h2>
              <BalanceVisibilityToggle className="mt-1" />
            </div>
            <p className="mt-1 shrink-0 text-sm font-medium capitalize text-foreground/90">
              {formatWeekday(today)}, {formatDayMonth(today)}
            </p>
          </div>
        </div>

        <section className={cn("grid grid-cols-2", GRID_GAP)}>
          <SummaryTile
            label={UI_LABEL_INCOME}
            value={formatAmount(summary.totalIncome)}
            icon={TOTAL_TILE_STYLES.income.icon}
            surfaceClassName={income.surface}
            iconClassName={income.iconColor}
            labelClassName={income.labelColor}
            valueClassName={income.valueColor}
          />
          <SummaryTile
            label={UI_LABEL_EXPENSE}
            value={formatAmount(summary.totalExpense)}
            icon={TOTAL_TILE_STYLES.expense.icon}
            surfaceClassName={expense.surface}
            iconClassName={expense.iconColor}
            labelClassName={expense.labelColor}
            valueClassName={expense.valueColor}
          />
          <SummaryTile
            label={UI_LABEL_BALANCE}
            value={formatAmount(summary.balance)}
            icon={TOTAL_TILE_STYLES.balance.icon}
            surfaceClassName={balance.surface}
            iconClassName={balance.iconColor}
            labelClassName={balance.labelColor}
            valueClassName={balance.valueColor}
            variant="compact"
            className="col-span-2"
          />
        </section>

        <section>
          <h3 className={cn("mb-3 text-sm font-semibold")}>Kategori</h3>
          {summary.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada pengeluaran hari ini.
            </p>
          ) : (
            <div className={cn("grid grid-cols-2", GRID_GAP)}>
              {summary.categories.map((category) => {
                const tile = getCategoryTileStyle(category.category);

                return (
                  <SummaryTile
                    key={category.category}
                    label={category.label}
                    value={formatAmount(category.total)}
                    subtitle={`${category.count} transaksi`}
                    icon={tile.icon}
                    surfaceClassName={tile.surface}
                    iconClassName={tile.iconColor}
                  />
                );
              })}
            </div>
          )}
        </section>

        {dailySummary ? (
          <DailySummarySection dailySummary={dailySummary} />
        ) : null}
      </div>
    </div>
  );
}
