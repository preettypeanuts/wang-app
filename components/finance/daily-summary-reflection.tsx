import {
  FINANCE_REFLECTION_CONTENT,
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
    <div className={FINANCE_REFLECTION_SHELL}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
          style.surface,
        )}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <div
          className={cn(
            "absolute -right-6 -top-6 size-20 rounded-full opacity-70 blur-2xl",
            style.glowOrb,
          )}
        />
        <div
          className={cn(
            "absolute -bottom-5 -left-5 size-16 rounded-full opacity-60 blur-2xl",
            style.secondaryOrb,
          )}
        />
      </div>

      <div className={FINANCE_REFLECTION_CONTENT}>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs font-semibold leading-tight",
              style.labelColor,
            )}
          >
            Refleksi
          </p>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              style.badgeSurface,
              style.subtitleColor,
            )}
          >
            <FinanceConditionBadgeIcon
              label={condition.label}
              className="size-2.5"
            />
            {condition.label}
          </span>
        </div>

        <p
          className={cn(
            "mt-2 min-w-0 text-xs leading-[1.55] font-medium",
            style.textColor,
          )}
        >
          {insight}
        </p>
      </div>
    </div>
  );
}
