import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { BudgetCardMenu } from "@/components/planner/budget-card-menu";
import {
  BUDGET_PROGRESS_TRACK,
  BUDGET_SUBTEXT,
  getBudgetProgressColor,
  getBudgetStatusBadge,
} from "@/config/budget";
import {
  formatBudgetAdjustedDailyHint,
  formatBudgetDailyLimit,
  formatBudgetRemainingDays,
  formatBudgetViewDetail,
  PAYPLAN_LABEL_LIMIT,
  PAYPLAN_LABEL_MANUAL_TOTAL,
  PAYPLAN_LABEL_PER_DAY,
  PAYPLAN_LABEL_REMAINING_BUDGET,
  PAYPLAN_LABEL_REPEAT_NEXT_MONTH,
  PAYPLAN_LABEL_USED,
} from "@/config/payplan-labels";
import {
  PAYPLAN_MANAGE_CARD_MOBILE,
  PAYPLAN_MOBILE_SOLID_CARD,
  PAYPLAN_MOBILE_SOLID_DIVIDER,
} from "@/config/payplan-mobile";
import {
  PLANNER_MANAGE_AMOUNT,
  PLANNER_MANAGE_CARD,
  PLANNER_MANAGE_CARD_BODY,
  PLANNER_MANAGE_CARD_DIVIDER_LINE,
  PLANNER_MANAGE_CARD_FOOTER,
  PLANNER_MANAGE_CARD_FOOTER_CONTENT,
  PLANNER_MANAGE_META_BETWEEN,
} from "@/config/planner-manage";
import { getPlanCategoryAccent } from "@/config/plans";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types/budget";

interface BudgetCardProps {
  status: BudgetStatus;
  disabled?: boolean;
  onViewDetail: (status: BudgetStatus) => void;
}

function formatLimitModeLabel(status: BudgetStatus): string {
  if (status.budget.limitMode === "daily") {
    return formatBudgetDailyLimit(
      formatIdr(status.budget.dailyAmount ?? 0),
      status.dayCount,
    );
  }

  return PAYPLAN_LABEL_MANUAL_TOTAL;
}

const MODE_BADGE =
  "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-black/6 text-muted-foreground dark:bg-white/10";

function formatPaceSummary(status: BudgetStatus): string | null {
  const { pace } = status;

  if (
    !pace.isCurrentMonth ||
    pace.adjustedDailyBudget === null ||
    pace.plannedDailyBudget === null
  ) {
    return null;
  }

  return formatBudgetAdjustedDailyHint(
    formatIdr(pace.adjustedDailyBudget),
    pace.remainingDays,
    formatIdr(pace.plannedDailyBudget),
  );
}

export function BudgetCard({
  status,
  disabled = false,
  onViewDetail,
}: BudgetCardProps) {
  const progressWidth = Math.min(100, status.usedPercent);
  const categoryAccent = getPlanCategoryAccent(status.budget.category);
  const statusBadge = getBudgetStatusBadge(
    status.remainingPercent,
    status.pace,
  );
  const isOver = status.remaining < 0;
  const paceSummary = formatPaceSummary(status);
  const showRemainingDays =
    status.pace.isCurrentMonth && status.pace.remainingDays > 0;

  return (
    <article
      className={cn(
        PLANNER_MANAGE_CARD,
        PAYPLAN_MOBILE_SOLID_CARD,
        PAYPLAN_MANAGE_CARD_MOBILE,
        "relative",
        disabled && "opacity-60",
        !disabled &&
          "transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]",
      )}
    >
      {!disabled ? (
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-[inherit]"
          aria-label={formatBudgetViewDetail(status.categoryLabel)}
          onClick={() => onViewDetail(status)}
        />
      ) : null}

      <div className={cn(PLANNER_MANAGE_CARD_BODY, "relative z-10")}>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              categoryAccent.iconSurface,
            )}
          >
            <JournalCategoryIcon
              category={status.budget.category}
              type="expense"
              className={cn("size-5", categoryAccent.iconColor)}
            />
          </div>

          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground/90">
            {status.categoryLabel}
          </h3>

          <div className="relative z-20">
            <BudgetCardMenu
              status={status}
              disabled={disabled}
              onViewDetail={onViewDetail}
            />
          </div>
        </div>

        <div className={PLANNER_MANAGE_META_BETWEEN}>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className={MODE_BADGE}>
              {status.budget.limitMode === "daily"
                ? PAYPLAN_LABEL_PER_DAY
                : PAYPLAN_LABEL_MANUAL_TOTAL}
            </span>
            {status.budget.repeatNextMonth ? (
              <span className={MODE_BADGE}>
                {PAYPLAN_LABEL_REPEAT_NEXT_MONTH}
              </span>
            ) : null}
            {showRemainingDays ? (
              <span className={MODE_BADGE}>
                {formatBudgetRemainingDays(status.pace.remainingDays)}
              </span>
            ) : null}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold",
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="mt-auto space-y-2">
          <div>
            <p className={BUDGET_SUBTEXT}>{PAYPLAN_LABEL_REMAINING_BUDGET}</p>
            <p
              className={cn(
                PLANNER_MANAGE_AMOUNT,
                isOver
                  ? "text-[#FF3B30]"
                  : status.remainingPercent <= 20
                    ? "text-[#FF9500]"
                    : "text-foreground",
              )}
            >
              {formatIdr(status.remaining)}
            </p>
            <p className={cn("mt-0.5", BUDGET_SUBTEXT)}>
              {formatLimitModeLabel(status)} · {PAYPLAN_LABEL_LIMIT}{" "}
              {formatIdr(status.totalLimit)}
            </p>
            {paceSummary ? (
              <p
                className={cn(
                  "mt-1 text-[11px] leading-snug",
                  status.pace.paceStatus === "fast"
                    ? "text-[#FF9500]"
                    : "text-muted-foreground",
                )}
              >
                {paceSummary}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">
                {PAYPLAN_LABEL_USED} {formatIdr(status.spent)}
              </span>
              <span className="font-medium tabular-nums text-muted-foreground">
                {status.usedPercent}%
              </span>
            </div>
            <div className={BUDGET_PROGRESS_TRACK}>
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  getBudgetProgressColor(status.remainingPercent),
                )}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {status.budget.note?.trim() ? (
        <div className={PLANNER_MANAGE_CARD_FOOTER}>
          <div
            className={cn(
              PLANNER_MANAGE_CARD_DIVIDER_LINE,
              PAYPLAN_MOBILE_SOLID_DIVIDER,
            )}
          />
          <div className={PLANNER_MANAGE_CARD_FOOTER_CONTENT}>
            <p className="truncate text-[11px] text-muted-foreground">
              {status.budget.note}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
