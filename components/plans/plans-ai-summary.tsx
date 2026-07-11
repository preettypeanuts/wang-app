"use client";

import { PlansInsightBadgeIcon } from "@/components/shared/ai-summary-badge-icon";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import { PlanIcon } from "@/components/plans/plan-icon";
import { getPlanBudgetImpactBadge } from "@/config/budget";
import {
  PLANS_AI_SUMMARY_SHELL,
  getPlansInsightToneStyle,
} from "@/config/plans";
import {
  PLANS_AI_BUDGET_IMPACT,
  PLANS_AI_BUDGET_OVER_BY,
  PLANS_AI_BUDGET_REMAINING,
  PLANS_AI_METRIC_BALANCE_PREFIX,
  PLANS_AI_PAYPLAN_THIS_MONTH,
  PLANS_AI_PROJECTED_REMAINING,
  PLANS_AI_REMAINING_BUDGET_THIS_MONTH,
  PLANS_AI_SALARY_CYCLE_PROJECTION,
  PLANS_AI_UPCOMING_INCOME_THIS_MONTH,
} from "@/config/plans-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { PlansOverview } from "@/types/plan";

interface PlansAiSummaryProps {
  overview: PlansOverview;
}

export function PlansAiSummary({ overview }: PlansAiSummaryProps) {
  const { formatAmount } = useProtectedCurrency();
  const { insightMeta } = overview;
  const style = getPlansInsightToneStyle(insightMeta.tone);
  const riskyBudgetImpacts = overview.budgetImpacts.filter(
    (impact) => impact.status === "waspada" || impact.status === "over",
  );

  return (
    <div className={PLANS_AI_SUMMARY_SHELL}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-20 size-36 rounded-full blur-3xl opacity-70",
          style.glowOrb,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full blur-3xl opacity-60",
          style.secondaryOrb,
        )}
      />

      <div className="relative flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "relative flex size-7 items-center justify-center rounded-full",
                style.iconSurface,
              )}
            >
              <span
                aria-hidden
                className="absolute inset-[3px] rounded-full bg-white/70 dark:bg-white/20"
              />
              <PlanIcon
                name="sparkle"
                className={cn("relative size-3.5", style.iconColor)}
              />
            </div>
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                style.labelColor,
              )}
            >
              AI summary
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                style.badgeSurface,
                style.badgeText,
              )}
            >
              <PlansInsightBadgeIcon tone={insightMeta.tone} />
              {insightMeta.label}
            </span>
            <BalanceVisibilityToggle />
          </div>
        </div>

        <p
          className={cn(
            "mt-3 text-[13px] leading-[1.6] tracking-[-0.01em]",
            style.textColor,
          )}
        >
          {overview.insight}
        </p>

        {overview.estimatedCost > 0 ||
        overview.upcomingPayPlanTotal > 0 ||
        overview.remainingBudgetTotal > 0 ||
        overview.upcomingIncomeTotal > 0 ? (
          <div className={cn("mt-2.5 space-y-1 text-xs", style.subtitleColor)}>
            {overview.estimatedCost > 0 ? (
              <p>
                Spend{" "}
                <span className={cn("font-semibold", style.metricSpend)}>
                  {formatAmount(overview.estimatedCost)}
                </span>
                {" · "}
                {PLANS_AI_METRIC_BALANCE_PREFIX}{" "}
                <span className={cn("font-semibold", style.metricBalance)}>
                  {formatAmount(overview.availableBalance)}
                </span>
              </p>
            ) : null}
            {overview.upcomingPayPlanTotal > 0 ? (
              <p>
                {PLANS_AI_PAYPLAN_THIS_MONTH}{" "}
                <span className={cn("font-semibold", style.metricSpend)}>
                  {formatAmount(overview.upcomingPayPlanTotal)}
                </span>
              </p>
            ) : null}
            {overview.remainingBudgetTotal > 0 ? (
              <p>
                {PLANS_AI_REMAINING_BUDGET_THIS_MONTH}{" "}
                <span className={cn("font-semibold", style.metricSpend)}>
                  {formatAmount(overview.remainingBudgetTotal)}
                </span>
              </p>
            ) : null}
            {overview.upcomingIncomeTotal > 0 ? (
              <p>
                {PLANS_AI_UPCOMING_INCOME_THIS_MONTH}{" "}
                <span className={cn("font-semibold", style.metricBalance)}>
                  {formatAmount(overview.upcomingIncomeTotal)}
                </span>
              </p>
            ) : null}
            <p>
              {PLANS_AI_PROJECTED_REMAINING}{" "}
              <span className={cn("font-semibold", style.metricRemaining)}>
                {formatAmount(overview.projectedBalance)}
              </span>
            </p>
            {overview.salaryCycleProjection !== null ? (
              <p>
                {PLANS_AI_SALARY_CYCLE_PROJECTION}{" "}
                <span className={cn("font-semibold", style.metricBalance)}>
                  {formatAmount(overview.salaryCycleProjection)}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}

        {riskyBudgetImpacts.length > 0 ? (
          <div className={cn("mt-3 space-y-1.5", style.subtitleColor)}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
              {PLANS_AI_BUDGET_IMPACT}
            </p>
            {riskyBudgetImpacts.map((impact) => {
              const badge = getPlanBudgetImpactBadge(impact.status);
              const overAmount = impact.projectedSpent - impact.budgetLimit;

              return (
                <div
                  key={impact.category}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <p className="min-w-0 leading-snug">
                    <span className="font-medium">{impact.categoryLabel}</span>
                    {impact.status === "over" ? (
                      <>
                        {" "}
                        {PLANS_AI_BUDGET_OVER_BY}{" "}
                        <span className="font-semibold text-[#FF3B30]">
                          {formatAmount(overAmount)}
                        </span>
                      </>
                    ) : (
                      <>
                        {" "}
                        {PLANS_AI_BUDGET_REMAINING}{" "}
                        <span className="font-semibold text-[#FF9500]">
                          {formatAmount(
                            Math.max(0, impact.budgetLimit - impact.projectedSpent),
                          )}
                        </span>
                      </>
                    )}
                  </p>
                  <span
                    className={cn(
                      "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
