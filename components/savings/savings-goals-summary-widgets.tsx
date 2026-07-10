"use client";

import { useAppearance } from "@/components/shared/appearance-provider";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import {
  UI_LABEL_ACTIVE_SAVINGS,
  UI_LABEL_FREE_BALANCE,
  UI_LABEL_HIDE,
  UI_LABEL_SHOW,
  UI_LABEL_TOTAL_SAVED,
} from "@/config/ui-labels";
import {
  SAVINGS_WIDGET_GRID,
  SAVINGS_WIDGET_SURFACE,
  SAVINGS_WIDGET_TILE_LAYOUT,
  type SavingsWidgetId,
} from "@/config/savings";
import { SEPARATED_SURFACE } from "@/config/shape";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { WalletIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SavingsOverview } from "@/types/savings-goal";

interface SavingsGoalsSummaryWidgetsProps {
  overview: SavingsOverview;
}

const WIDGETS: Array<{
  id: SavingsWidgetId;
  label: string;
  isMoney: boolean;
  getValue: (overview: SavingsOverview) => number | string;
}> = [
  {
    id: "active",
    label: UI_LABEL_ACTIVE_SAVINGS,
    isMoney: false,
    getValue: (overview) => overview.activeCount,
  },
  {
    id: "saved",
    label: UI_LABEL_TOTAL_SAVED,
    isMoney: true,
    getValue: (overview) => overview.totalSaved,
  },
  {
    id: "free",
    label: UI_LABEL_FREE_BALANCE,
    isMoney: true,
    getValue: (overview) => overview.freeBalance,
  },
];

export function SavingsGoalsSummaryWidgets({
  overview,
}: SavingsGoalsSummaryWidgetsProps) {
  const { balanceVisible } = useAppearance();
  const { formatAmount } = useProtectedCurrency();

  function formatWidgetValue(
    widget: (typeof WIDGETS)[number],
    value: number | string,
  ): string {
    if (!widget.isMoney) {
      return String(value);
    }

    return formatAmount(Number(value));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between md:justify-end">
        <span className="text-xs font-medium text-muted-foreground md:hidden">
          {balanceVisible ? UI_LABEL_HIDE : UI_LABEL_SHOW}
        </span>
        <BalanceVisibilityToggle />
      </div>
      <div className={SAVINGS_WIDGET_GRID}>
        {WIDGETS.map((widget) => {
          const surface = SAVINGS_WIDGET_SURFACE[widget.id];
          const rawValue = widget.getValue(overview);

          return (
            <div
              key={widget.id}
              className={cn(
                SEPARATED_SURFACE,
                SAVINGS_WIDGET_TILE_LAYOUT,
                surface.surface,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide sm:text-xs",
                    surface.labelColor,
                  )}
                >
                  {widget.label}
                </p>
                <WalletIcon
                  className={cn("size-5 shrink-0 sm:size-6", surface.iconColor)}
                />
              </div>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums tracking-tight sm:text-xl",
                  surface.valueColor,
                )}
              >
                {formatWidgetValue(widget, rawValue)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
