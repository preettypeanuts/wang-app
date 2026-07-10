"use client";

import { CalendarBlankIcon } from "@/lib/icons";

import {
  UI_LABEL_OVERVIEW_UPCOMING_BILLS,
  UI_LABEL_OVERVIEW_UPCOMING_EMPTY,
} from "@/config/ui-labels";

import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
} from "@/config/overview";
import { cn } from "@/lib/utils";
import type { PlansUpcomingImpactItem } from "@/types/plan";

interface OverviewUpcomingCardProps {
  items: PlansUpcomingImpactItem[];
  className?: string;
}

export function OverviewUpcomingCard({
  items,
  className,
}: OverviewUpcomingCardProps) {
  const { formatAmount } = useProtectedCurrency();

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start gap-2.5">
        <OverviewIconShell variant="blue">
          <CalendarBlankIcon />
        </OverviewIconShell>
        <div className="min-w-0">
          <p className={OVERVIEW_SECTION_LABEL}>Upcoming</p>
          <h2 className={cn("mt-0.5", OVERVIEW_SECTION_TITLE)}>
            {UI_LABEL_OVERVIEW_UPCOMING_BILLS}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {UI_LABEL_OVERVIEW_UPCOMING_EMPTY}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.slice(0, 5).map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-black/6 pb-2.5 last:border-0 last:pb-0 dark:border-white/8"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground/90">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {formatAmount(item.amount)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium tabular-nums text-foreground/80">
                  {item.dueLabel}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[10px] font-medium tabular-nums",
                    item.daysUntil < 0
                      ? "text-[#FF3B30]"
                      : item.daysUntil === 0
                        ? "text-[#FF9500]"
                        : "text-muted-foreground",
                  )}
                >
                  {item.daysUntilLabel}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
