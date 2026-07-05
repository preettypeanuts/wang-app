import { getCategoryLabel } from "@/config/categories";
import {
  PLANNER_CALENDAR_UPCOMING_ITEM,
  PLANNER_CALENDAR_UPCOMING_PAID,
  PLANNER_CALENDAR_UPCOMING_PENDING,
} from "@/config/planner-calendar";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { getOccurrencePaymentStatus } from "@/lib/planner/installment-occurrence";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarUpcomingItemProps {
  item: PlannedOccurrence;
}

export function PlannerCalendarUpcomingItem({
  item,
}: PlannerCalendarUpcomingItemProps) {
  const isIncome = item.type === "income";
  const categoryLabel = getCategoryLabel(item.category);
  const paymentStatus = getOccurrencePaymentStatus(item);

  return (
    <article className={PLANNER_CALENDAR_UPCOMING_ITEM}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {item.title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {categoryLabel} · {formatJournalTime(item.dueAt)}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            isIncome ? "text-[#30D158]" : "text-foreground/90",
          )}
        >
          {isIncome ? "+" : "−"}
          {formatIdr(item.amount)}
        </p>
      </div>

      {paymentStatus ? (
        <p
          className={cn(
            "mt-2 text-[11px] font-medium",
            paymentStatus.status === "paid"
              ? PLANNER_CALENDAR_UPCOMING_PAID
              : PLANNER_CALENDAR_UPCOMING_PENDING,
          )}
        >
          {paymentStatus.label}
        </p>
      ) : null}
    </article>
  );
}
