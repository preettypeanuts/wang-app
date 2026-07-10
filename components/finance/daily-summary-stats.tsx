"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  WalletIcon,
} from "@/lib/icons";

import {
  UI_LABEL_BALANCE,
  UI_LABEL_EXPENSE,
  UI_LABEL_INCOME,
} from "@/config/ui-labels";
import { SOLID_WIDGET_TILE_STYLES } from "@/config/solid-widget-tiles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";

const STAT_ICONS = {
  "arrow-down": ArrowDownIcon,
  "arrow-up": ArrowUpIcon,
  wallet: WalletIcon,
} as const;

interface DailySummaryStatsProps {
  totalExpense: number;
  totalIncome: number;
  balance: number;
}

const STATS = [
  {
    label: UI_LABEL_EXPENSE,
    valueKey: "totalExpense" as const,
    styleKey: "expense" as const,
    icon: "arrow-up" as const,
  },
  {
    label: UI_LABEL_INCOME,
    valueKey: "totalIncome" as const,
    styleKey: "income" as const,
    icon: "arrow-down" as const,
  },
  {
    label: UI_LABEL_BALANCE,
    valueKey: "balance" as const,
    styleKey: "balance" as const,
    icon: "wallet" as const,
  },
] as const;

export function DailySummaryStats({
  totalExpense,
  totalIncome,
  balance,
}: DailySummaryStatsProps) {
  const { formatAmount } = useProtectedCurrency();
  const values = {
    totalExpense,
    totalIncome,
    balance,
  };

  return (
    <div className="space-y-1.5">
      {STATS.map((stat) => {
        const tile = SOLID_WIDGET_TILE_STYLES[stat.styleKey];
        const IconComponent = STAT_ICONS[stat.icon];

        return (
          <div
            key={stat.label}
            className={cn(
              tile.surface,
              SEPARATED_SURFACE,
              "flex min-h-9 items-center justify-between gap-3 px-2.5 py-1.5",
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <IconComponent
                className={cn("size-4 shrink-0", tile.iconColor)}
              />
              <span className={cn("text-xs font-medium", tile.labelColor)}>
                {stat.label}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                tile.valueColor,
              )}
            >
              {formatAmount(values[stat.valueKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}
