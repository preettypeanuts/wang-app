"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markInstallmentPaidAction } from "@/app/actions/planner";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/config/categories";
import {
  PAYPLAN_LABEL_ALREADY_PAID,
  PAYPLAN_LABEL_SAVING,
} from "@/config/payplan-labels";
import {
  PLANNER_CALENDAR_DAY_DIALOG_ITEM,
  PLANNER_CALENDAR_DAY_DIALOG_PAID,
  PLANNER_CALENDAR_DAY_DIALOG_PENDING,
} from "@/config/planner-calendar";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  canMarkOccurrencePaid,
  getOccurrencePaymentStatus,
} from "@/lib/planner/installment-occurrence";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarDayItemProps {
  item: PlannedOccurrence;
  onOpenDetail?: () => void;
}

export function PlannerCalendarDayItem({
  item,
  onOpenDetail,
}: PlannerCalendarDayItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isIncome = item.type === "income";
  const categoryLabel = getCategoryLabel(item.category);
  const paymentStatus = getOccurrencePaymentStatus(item);
  const canPay = canMarkOccurrencePaid(item);

  function handleMarkPaid() {
    if (!canPay || item.installmentIndex === null) {
      return;
    }

    startTransition(async () => {
      const result = await markInstallmentPaidAction(
        item.plannedItemId,
        item.installmentIndex!,
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  const summary = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {item.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {categoryLabel} · {formatJournalTime(item.dueAt)}
          </p>
          {item.note ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.note}
            </p>
          ) : null}
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            isIncome ? "text-[#30D158]" : "text-[#FF3B30]",
          )}
        >
          {isIncome ? "+" : "−"}
          {formatIdr(item.amount)}
        </p>
      </div>

      {paymentStatus ? (
        <p
          className={cn(
            "mt-3",
            paymentStatus.status === "paid"
              ? PLANNER_CALENDAR_DAY_DIALOG_PAID
              : PLANNER_CALENDAR_DAY_DIALOG_PENDING,
          )}
        >
          {paymentStatus.label}
        </p>
      ) : null}
    </>
  );

  return (
    <article className={PLANNER_CALENDAR_DAY_DIALOG_ITEM}>
      {onOpenDetail ? (
        <button
          type="button"
          onClick={onOpenDetail}
          className={cn(
            "w-full text-left transition-colors",
            "rounded-lg -mx-1 px-1 py-0.5",
            "hover:bg-black/4 active:bg-black/6 dark:hover:bg-white/6 dark:active:bg-white/8",
          )}
        >
          {summary}
        </button>
      ) : (
        summary
      )}

      {canPay ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          disabled={isPending}
          onClick={handleMarkPaid}
        >
          {isPending ? PAYPLAN_LABEL_SAVING : PAYPLAN_LABEL_ALREADY_PAID}
        </Button>
      ) : null}
    </article>
  );
}
