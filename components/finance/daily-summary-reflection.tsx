import {
  FINANCE_REFLECTION_SHELL,
  getFinanceConditionWeatherStyle,
} from "@/config/finance-condition-weather";
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
    <div className={cn(FINANCE_REFLECTION_SHELL, style.surface)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 size-28 rounded-full blur-2xl",
          style.glowOrb,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full blur-2xl",
          style.secondaryOrb,
        )}
      />

      <div className="relative flex h-full flex-col p-4">
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
            <span aria-hidden="true">{condition.emoji}</span>
            {condition.label}
          </span>
        </div>

        <div className="mt-3.5 flex min-h-0 flex-1 items-start gap-3">
       

          <p
            className={cn(
              "min-w-0 pt-0.5 text-[13px] leading-[1.6] tracking-[-0.01em]",
              style.textColor,
            )}
          >
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
