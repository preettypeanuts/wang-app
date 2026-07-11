"use client";

import { FORM_GROUP } from "@/config/form-dialog";
import {
  formatBudgetAdjustedDailyHint,
  formatBudgetAvgDailyHint,
  formatBudgetDailyAmount,
  formatBudgetDailyDelta,
  formatBudgetElapsedDays,
  formatBudgetRemainingDays,
  PAYPLAN_LABEL_ADJUSTED_DAILY,
  PAYPLAN_LABEL_AVG_DAILY_SPENT,
  PAYPLAN_LABEL_BUDGET_PACING,
  PAYPLAN_LABEL_BUDGET_PERIOD,
  PAYPLAN_LABEL_ELAPSED_DAYS,
  PAYPLAN_LABEL_PLANNED_DAILY,
  PAYPLAN_LABEL_REMAINING_DAYS,
} from "@/config/payplan-labels";
import { PLANNER_MANAGE_META_BETWEEN } from "@/config/planner-manage";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  CalculatorIcon,
  CalendarBlankIcon,
  CaretRightIcon,
  ChartBarIcon,
  CoinsIcon,
  type Icon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { BudgetPace } from "@/types/budget";

interface BudgetDetailPaceMetricsProps {
  pace: BudgetPace;
}

interface PaceMetricItem {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}

function PaceMetricCard({
  icon: IconComponent,
  label,
  value,
  hint,
  valueClassName,
}: PaceMetricItem) {
  return (
    <div className="rounded-xl border border-black/6 bg-black/[0.02] px-3 py-2.5 dark:border-white/8 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/8">
          <IconComponent className="size-3.5 text-muted-foreground" />
        </div>
        <p className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-1.5 pl-9 text-sm font-semibold tabular-nums text-foreground/90",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 pl-9 text-[11px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function BudgetDetailPaceMetrics({
  pace,
}: BudgetDetailPaceMetricsProps) {
  const metrics: PaceMetricItem[] = [
    {
      icon: CoinsIcon,
      label: PAYPLAN_LABEL_PLANNED_DAILY,
      value: formatBudgetDailyAmount(formatIdr(pace.plannedDailyBudget ?? 0)),
    },
    {
      icon: ChartBarIcon,
      label: PAYPLAN_LABEL_AVG_DAILY_SPENT,
      value:
        pace.avgDailySpent !== null
          ? formatBudgetDailyAmount(formatIdr(pace.avgDailySpent))
          : "—",
      hint:
        pace.avgDailySpent !== null
          ? formatBudgetAvgDailyHint(
              formatIdr(pace.avgDailySpent),
              pace.elapsedDays,
            )
          : undefined,
      valueClassName: pace.paceStatus === "fast" ? "text-[#FF9500]" : undefined,
    },
    {
      icon: CalculatorIcon,
      label: PAYPLAN_LABEL_ADJUSTED_DAILY,
      value:
        pace.adjustedDailyBudget !== null
          ? formatBudgetDailyAmount(formatIdr(pace.adjustedDailyBudget))
          : "—",
      hint:
        pace.adjustedDailyBudget !== null
          ? formatBudgetAdjustedDailyHint(
              formatIdr(pace.adjustedDailyBudget),
              pace.remainingDays,
              formatIdr(pace.plannedDailyBudget ?? 0),
            )
          : undefined,
      valueClassName:
        pace.dailyDelta !== null && pace.dailyDelta < 0
          ? "text-[#FF9500]"
          : pace.dailyDelta !== null && pace.dailyDelta > 0
            ? "text-[#34C759]"
            : undefined,
    },
    {
      icon: CalendarBlankIcon,
      label: PAYPLAN_LABEL_ELAPSED_DAYS,
      value: String(pace.elapsedDays),
      hint: formatBudgetElapsedDays(pace.elapsedDays),
    },
    {
      icon: CaretRightIcon,
      label: PAYPLAN_LABEL_REMAINING_DAYS,
      value: String(pace.remainingDays),
      hint: formatBudgetRemainingDays(pace.remainingDays),
    },
  ];

  return (
    <div className={FORM_GROUP}>
      <div className="px-4 py-3">
        <div className={PLANNER_MANAGE_META_BETWEEN}>
          <p className="text-xs font-medium text-muted-foreground">
            {PAYPLAN_LABEL_BUDGET_PACING}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {PAYPLAN_LABEL_BUDGET_PERIOD} ·{" "}
            {formatBudgetElapsedDays(pace.elapsedDays)} ·{" "}
            {formatBudgetRemainingDays(pace.remainingDays)}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {metrics.map((metric) => (
            <PaceMetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {pace.dailyDelta !== null && pace.dailyDelta !== 0 ? (
          <p className="mt-3 rounded-lg bg-black/[0.03] px-3 py-2 text-[11px] leading-snug text-muted-foreground dark:bg-white/[0.04]">
            {formatBudgetDailyDelta(
              formatIdr(Math.abs(pace.dailyDelta)),
              pace.dailyDelta < 0 ? "below" : "above",
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
