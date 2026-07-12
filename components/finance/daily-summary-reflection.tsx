import {
  FINANCE_REFLECTION_RADIUS,
  FINANCE_REFLECTION_SHELL,
  getFinanceConditionWeatherStyle,
} from "@/config/finance-condition-weather";
import { FinanceConditionBadgeIcon } from "@/components/shared/ai-summary-badge-icon";
import { cn } from "@/lib/utils";
import type { FinanceCondition } from "@/types/summary";

interface DailySummaryReflectionProps {
  insight: string;
  condition: FinanceCondition;
}

export function DailySummaryReflection({
  insight,
  condition,
}: DailySummaryReflectionProps) {
  const style = getFinanceConditionWeatherStyle(condition);

  return (
    <div className={cn(FINANCE_REFLECTION_SHELL, FINANCE_REFLECTION_RADIUS)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          FINANCE_REFLECTION_RADIUS,
          style.surface,
        )}
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          FINANCE_REFLECTION_RADIUS,
        )}
      >
        <div
          className={cn(
            "absolute right-3 top-3 size-20 rounded-full blur-3xl",
            style.glowOrb,
          )}
        />
        <div
          className={cn(
            "absolute bottom-3 left-3 size-16 rounded-full blur-3xl",
            style.secondaryOrb,
          )}
        />
      </div>

      <div className="relative z-10 flex flex-col px-4 pt-4 pb-5">
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.14em]",
              style.labelColor,
            )}
          >
            Refleksi
          </p>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              style.badgeSurface,
              style.subtitleColor,
            )}
          >
            <FinanceConditionBadgeIcon label={condition.label} />
            {condition.label}
          </span>
        </div>

        <p
          className={cn(
            "mt-3.5 min-w-0 text-[13px] leading-[1.6] tracking-[-0.01em]",
            style.textColor,
          )}
        >
          {insight}
        </p>
      </div>
    </div>
  );
}
