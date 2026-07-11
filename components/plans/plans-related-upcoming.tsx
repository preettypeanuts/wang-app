import {
  PLANS_RELATED_UPCOMING_DESC,
} from "@/config/plans-labels";
import { UI_LABEL_OVERVIEW_UPCOMING_EMPTY } from "@/config/ui-labels";
import { CalendarBlankIcon } from "@/lib/icons";

import {
  PLANS_RELATED_UPCOMING_DIVIDER,
  PLANS_RELATED_UPCOMING_EMPTY,
  PLANS_RELATED_UPCOMING_HEADER,
  PLANS_RELATED_UPCOMING_LIST,
  PLANS_RELATED_UPCOMING_ROW,
  PLANS_RELATED_UPCOMING_SHELL,
  PLANS_MOBILE_SOLID_CARD,
} from "@/config/plans";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { PlansUpcomingImpactItem } from "@/types/plan";

interface PlansRelatedUpcomingProps {
  items: PlansUpcomingImpactItem[];
  className?: string;
}

export function PlansRelatedUpcoming({
  items,
  className,
}: PlansRelatedUpcomingProps) {
  return (
    <section className={cn(PLANS_RELATED_UPCOMING_SHELL, PLANS_MOBILE_SOLID_CARD, className)}>
      <header className={PLANS_RELATED_UPCOMING_HEADER}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FF9500]/15 text-[#FF9500] dark:bg-[#FF9500]/20">
            <CalendarBlankIcon className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Related Upcoming
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-foreground/90">
              Planner Impact
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {PLANS_RELATED_UPCOMING_DESC}
            </p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <p className={PLANS_RELATED_UPCOMING_EMPTY}>
          {UI_LABEL_OVERVIEW_UPCOMING_EMPTY}
        </p>
      ) : (
        <div className={PLANS_RELATED_UPCOMING_LIST}>
          {items.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <div className={PLANS_RELATED_UPCOMING_DIVIDER} /> : null}
              <div className={PLANS_RELATED_UPCOMING_ROW}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground/90">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {formatIdr(item.amount)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium tabular-nums text-foreground/80">
                    {item.dueLabel}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[11px] font-medium tabular-nums",
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
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
