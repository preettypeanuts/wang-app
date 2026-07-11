"use client";

import {
  formatPayPlanFlowItemCount,
  PAYPLAN_LABEL_FLOW_BALANCED,
  PAYPLAN_LABEL_FLOW_DEFICIT,
  PAYPLAN_LABEL_FLOW_EXPENSE,
  PAYPLAN_LABEL_FLOW_INCOME,
  PAYPLAN_LABEL_FLOW_NET,
  PAYPLAN_LABEL_FLOW_SURPLUS,
  PAYPLAN_LABEL_NEXT_MONTH_FLOW,
  PAYPLAN_LABEL_NO_PLANNED_FLOW,
} from "@/config/payplan-labels";
import { SEPARATED_SURFACE } from "@/config/shape";
import { formatIdr, formatSignedIdrDelta } from "@/lib/finance/format-currency";
import { ArrowDownIcon, ArrowUpIcon, ChartUptrendIcon } from "@/lib/icons";
import { formatAppleMonthTitle } from "@/lib/planner/calendar";
import type { PlannedCashFlowSummary } from "@/lib/planner/summarize-cash-flow";
import { cn } from "@/lib/utils";

interface PlannerNextMonthCashflowProps {
  summary: PlannedCashFlowSummary;
  monthKey: string;
  className?: string;
}

export function PlannerNextMonthCashflow({
  summary,
  monthKey,
  className,
}: PlannerNextMonthCashflowProps) {
  const { incomeTotal, expenseTotal, net, incomeCount, expenseCount } = summary;
  const isEmpty = incomeCount === 0 && expenseCount === 0;
  const netTone = net > 0 ? "positive" : net < 0 ? "negative" : "neutral";
  const netLabel =
    net > 0
      ? PAYPLAN_LABEL_FLOW_SURPLUS
      : net < 0
        ? PAYPLAN_LABEL_FLOW_DEFICIT
        : PAYPLAN_LABEL_FLOW_BALANCED;

  return (
    <section
      className={cn(
        SEPARATED_SURFACE,
        "rounded-2xl bg-black/3 p-3.5 dark:bg-white/4 sm:p-4",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
            {PAYPLAN_LABEL_NEXT_MONTH_FLOW}
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">
            {formatAppleMonthTitle(monthKey)}
          </p>
        </div>
        <ChartUptrendIcon
          className="size-5 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
      </header>

      {isEmpty ? (
        <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
          {PAYPLAN_LABEL_NO_PLANNED_FLOW}
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <FlowStat
              icon="up"
              label={PAYPLAN_LABEL_FLOW_INCOME}
              amount={formatIdr(incomeTotal)}
              subtitle={formatPayPlanFlowItemCount(incomeCount)}
              tone="positive"
            />
            <FlowStat
              icon="down"
              label={PAYPLAN_LABEL_FLOW_EXPENSE}
              amount={formatIdr(expenseTotal)}
              subtitle={formatPayPlanFlowItemCount(expenseCount)}
              tone="negative"
            />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/8 pt-3 dark:border-white/10">
            <div>
              <p className="text-[11px] font-medium leading-none text-muted-foreground sm:text-xs">
                {PAYPLAN_LABEL_FLOW_NET}
              </p>
              <p
                className={cn(
                  "mt-1 text-[11px] leading-none",
                  netTone === "positive" && "text-[#34C759]",
                  netTone === "negative" && "text-[#FF3B30]",
                  netTone === "neutral" && "text-muted-foreground",
                )}
              >
                {netLabel}
              </p>
            </div>
            <p
              className={cn(
                "text-lg font-bold tabular-nums leading-none tracking-tight sm:text-xl",
                netTone === "positive" && "text-[#34C759]",
                netTone === "negative" && "text-[#FF3B30]",
                netTone === "neutral" && "text-foreground",
              )}
            >
              {formatSignedIdrDelta(net)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

interface FlowStatProps {
  icon: "up" | "down";
  label: string;
  amount: string;
  subtitle: string;
  tone: "positive" | "negative";
}

function FlowStat({ icon, label, amount, subtitle, tone }: FlowStatProps) {
  const IconComponent = icon === "up" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="rounded-xl bg-white/40 p-2.5 dark:bg-white/5">
      <div className="flex items-center gap-1.5">
        <IconComponent
          className={cn(
            "size-3.5 shrink-0",
            tone === "positive" ? "text-[#34C759]" : "text-[#FF3B30]",
          )}
          aria-hidden
        />
        <p className="text-[11px] font-medium leading-none text-muted-foreground sm:text-xs">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-[15px] font-bold tabular-nums leading-none tracking-tight text-foreground sm:text-base">
        {amount}
      </p>
      <p className="mt-1 text-[10px] leading-none text-muted-foreground/80 sm:text-[11px]">
        {subtitle}
      </p>
    </div>
  );
}
