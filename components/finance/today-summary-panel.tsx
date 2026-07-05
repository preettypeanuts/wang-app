import { DailySummarySection } from "@/components/finance/daily-summary-section";
import { SummaryTile } from "@/components/finance/summary-tile";
import { GLASS_SURFACE } from "@/config/glass";
import {
  getCategoryTileStyle,
  TOTAL_TILE_STYLES,
} from "@/config/summary-tiles";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import { SEPARATED_SHELL } from "@/config/shape";
import { GRID_GAP, SHELL_PADDING, STACK_GAP } from "@/config/spacing";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { DailySummarySnapshot, TodaySummary } from "@/types/summary";

interface TodaySummaryPanelProps {
  summary: TodaySummary;
  dailySummary: DailySummarySnapshot | null;
}

export function TodaySummaryPanel({
  summary,
  dailySummary,
}: TodaySummaryPanelProps) {
  const today = new Date();
  const income = SOLID_WIDGET_TILE_STYLES.income;
  const expense = SOLID_WIDGET_TILE_STYLES.expense;
  const balance = SOLID_WIDGET_TILE_STYLES.balance;

  return (
    <div
      className={cn(
        SEPARATED_SHELL,
        GLASS_SURFACE,
        "flex h-full min-h-0 flex-col overflow-hidden",
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
            Hari ini
          </p>
          <div className="flex flex-row items-center justify-between">
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Ringkasan
            </h2>
            <p className="mt-1 text-sm font-medium capitalize text-foreground/90">
              {formatWeekday(today)}, {formatDayMonth(today)}
            </p>
          </div>
        </div>

        <section className={cn("grid grid-cols-2", GRID_GAP)}>
          <SummaryTile
            label="Pemasukan"
            value={formatIdr(summary.totalIncome)}
            icon={TOTAL_TILE_STYLES.income.icon}
            surfaceClassName={income.surface}
            iconClassName={income.iconColor}
            labelClassName={income.labelColor}
            valueClassName={income.valueColor}
          />
          <SummaryTile
            label="Pengeluaran"
            value={formatIdr(summary.totalExpense)}
            icon={TOTAL_TILE_STYLES.expense.icon}
            surfaceClassName={expense.surface}
            iconClassName={expense.iconColor}
            labelClassName={expense.labelColor}
            valueClassName={expense.valueColor}
          />
          <SummaryTile
            label="Saldo"
            value={formatIdr(summary.balance)}
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
                    value={formatIdr(category.total)}
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
