"use client";

import { ReceiptIcon } from "@/lib/icons";

import { OverviewActionLink } from "@/components/overview/overview-action-link";
import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_AMOUNT_PILL,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
} from "@/config/overview";
import { cn } from "@/lib/utils";
import type {
  OverviewActivityItem,
  OverviewFilterContext,
} from "@/types/overview";

interface OverviewTodayActivityCardProps {
  items: OverviewActivityItem[];
  filterContext?: OverviewFilterContext;
  className?: string;
}

export function OverviewTodayActivityCard({
  items,
  filterContext,
  className,
}: OverviewTodayActivityCardProps) {
  const { formatAmount, formatSignedAmount, formatExpenseAmount } =
    useProtectedCurrency();
  const activityTitle = filterContext?.activityTitle ?? "Aktivitas hari ini";
  const activitySubtitle = filterContext?.activitySubtitle;
  const emptyMessage =
    filterContext?.activityEmptyMessage ??
    "Belum ada transaksi hari ini. Catat lewat Inbox.";

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <OverviewIconShell variant="orange">
            <ReceiptIcon />
          </OverviewIconShell>
          <div className="min-w-0">
            <p className={OVERVIEW_SECTION_LABEL}>Today Activity</p>
            <h2 className={cn("mt-0.5", OVERVIEW_SECTION_TITLE)}>
              {activityTitle}
            </h2>
            {activitySubtitle ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {activitySubtitle}
              </p>
            ) : null}
          </div>
        </div>
        <OverviewActionLink href="/journal">Journal</OverviewActionLink>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-black/6 pb-2 last:border-0 last:pb-0 dark:border-white/8"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground/90">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.categoryLabel} · {item.timeLabel}
                </p>
              </div>
              <p
                className={cn(
                  OVERVIEW_AMOUNT_PILL,
                  item.type === "income"
                    ? "text-[#34C759]"
                    : "text-foreground/88",
                )}
              >
                {item.type === "income"
                  ? formatSignedAmount(item.amount)
                  : formatExpenseAmount(item.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
