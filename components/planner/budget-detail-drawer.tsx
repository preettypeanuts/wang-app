"use client";

import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  BUDGET_PROGRESS_TRACK,
  BUDGET_SUBTEXT,
  getBudgetPaceBadge,
  getBudgetProgressColor,
  getBudgetStatusBadge,
} from "@/config/budget";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_GROUP,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import {
  formatBudgetAdjustedDailyHint,
  formatBudgetAvgDailyHint,
  formatBudgetDailyAmount,
  formatBudgetDailyDelta,
  formatBudgetDailyLimit,
  formatBudgetElapsedDays,
  formatBudgetRemainingDays,
  PAYPLAN_LABEL_ADJUSTED_DAILY,
  PAYPLAN_LABEL_AVG_DAILY_SPENT,
  PAYPLAN_LABEL_BUDGET_DETAIL_DESC,
  PAYPLAN_LABEL_BUDGET_PACING,
  PAYPLAN_LABEL_BUDGET_PERIOD,
  PAYPLAN_LABEL_CLOSE,
  PAYPLAN_LABEL_DELETE,
  PAYPLAN_LABEL_EDIT,
  PAYPLAN_LABEL_ELAPSED_DAYS,
  PAYPLAN_LABEL_LIMIT,
  PAYPLAN_LABEL_MANUAL_TOTAL,
  PAYPLAN_LABEL_NOTE,
  PAYPLAN_LABEL_PER_DAY,
  PAYPLAN_LABEL_PLANNED_DAILY,
  PAYPLAN_LABEL_REMAINING_BUDGET,
  PAYPLAN_LABEL_REMAINING_DAYS,
  PAYPLAN_LABEL_REPEAT_NEXT_MONTH,
  PAYPLAN_LABEL_USED,
} from "@/config/payplan-labels";
import {
  PLANNER_MANAGE_META,
  PLANNER_MANAGE_META_BETWEEN,
} from "@/config/planner-manage";
import { getPlanCategoryAccent } from "@/config/plans";
import { SEPARATED_CONTROL } from "@/config/shape";
import { formatIdr } from "@/lib/finance/format-currency";
import { PencilSimpleIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types/budget";

interface BudgetDetailDrawerProps {
  open: boolean;
  status: BudgetStatus | null;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (status: BudgetStatus) => void;
  onDelete: (status: BudgetStatus) => void;
}

const MODE_BADGE =
  "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-black/6 text-muted-foreground dark:bg-white/10";

function DetailMetric({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className={PLANNER_MANAGE_META}>{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold tabular-nums text-foreground/90",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function formatLimitSummary(status: BudgetStatus): string {
  if (status.budget.limitMode === "daily") {
    return `${formatBudgetDailyLimit(formatIdr(status.budget.dailyAmount ?? 0), status.dayCount)} · ${PAYPLAN_LABEL_LIMIT} ${formatIdr(status.totalLimit)}`;
  }

  return `${PAYPLAN_LABEL_MANUAL_TOTAL} · ${PAYPLAN_LABEL_LIMIT} ${formatIdr(status.totalLimit)}`;
}

export function BudgetDetailDrawer({
  open,
  status,
  disabled = false,
  onOpenChange,
  onEdit,
  onDelete,
}: BudgetDetailDrawerProps) {
  if (!status) {
    return null;
  }

  const currentStatus = status;
  const { pace } = currentStatus;
  const categoryAccent = getPlanCategoryAccent(currentStatus.budget.category);
  const statusBadge = getBudgetStatusBadge(currentStatus.remainingPercent);
  const paceBadge = getBudgetPaceBadge(pace.paceStatus);
  const progressWidth = Math.min(100, currentStatus.usedPercent);
  const isOver = currentStatus.remaining < 0;
  const showPacing =
    pace.plannedDailyBudget !== null &&
    (pace.isCurrentMonth || pace.isPastMonth);

  function handleEdit() {
    onOpenChange(false);
    onEdit(currentStatus);
  }

  function handleDelete() {
    onOpenChange(false);
    onDelete(currentStatus);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={currentStatus.categoryLabel}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {currentStatus.categoryLabel}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {PAYPLAN_LABEL_BUDGET_DETAIL_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
        <div className="flex items-center gap-3 px-1 pb-1">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              categoryAccent.iconSurface,
            )}
          >
            <JournalCategoryIcon
              category={currentStatus.budget.category}
              type="expense"
              className={cn("size-5", categoryAccent.iconColor)}
            />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className={MODE_BADGE}>
              {currentStatus.budget.limitMode === "daily"
                ? PAYPLAN_LABEL_PER_DAY
                : PAYPLAN_LABEL_MANUAL_TOTAL}
            </span>
            {currentStatus.budget.repeatNextMonth ? (
              <span className={MODE_BADGE}>
                {PAYPLAN_LABEL_REPEAT_NEXT_MONTH}
              </span>
            ) : null}
          </div>
        </div>

        <div className={FORM_PREVIEW_COMPACT}>
          <div className="min-w-0">
            <p className={BUDGET_SUBTEXT}>{PAYPLAN_LABEL_REMAINING_BUDGET}</p>
            <p
              className={cn(
                "mt-0.5",
                FORM_PREVIEW_COMPACT_AMOUNT,
                isOver
                  ? "text-[#FF3B30]"
                  : currentStatus.remainingPercent <= 20
                    ? "text-[#FF9500]"
                    : "text-foreground",
              )}
            >
              {formatIdr(currentStatus.remaining)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatLimitSummary(currentStatus)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={cn(
                "inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
            {showPacing ? (
              <span
                className={cn(
                  "inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold",
                  paceBadge.className,
                )}
              >
                {paceBadge.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="px-1 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">
              {PAYPLAN_LABEL_USED} {formatIdr(currentStatus.spent)}
            </span>
            <span className="font-medium tabular-nums text-muted-foreground">
              {currentStatus.usedPercent}%
            </span>
          </div>
          <div className={BUDGET_PROGRESS_TRACK}>
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                getBudgetProgressColor(currentStatus.remainingPercent),
              )}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {showPacing ? (
          <div className={FORM_GROUP}>
            <div className="px-4 py-3">
              <div className={PLANNER_MANAGE_META_BETWEEN}>
                <p className="text-xs font-medium text-muted-foreground">
                  {PAYPLAN_LABEL_BUDGET_PACING}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {PAYPLAN_LABEL_BUDGET_PERIOD} ·{" "}
                  {formatBudgetElapsedDays(pace.elapsedDays)} ·{" "}
                  {formatBudgetRemainingDays(pace.remainingDays)}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <DetailMetric
                  label={PAYPLAN_LABEL_PLANNED_DAILY}
                  value={formatBudgetDailyAmount(
                    formatIdr(pace.plannedDailyBudget ?? 0),
                  )}
                />
                {pace.avgDailySpent !== null ? (
                  <DetailMetric
                    label={PAYPLAN_LABEL_AVG_DAILY_SPENT}
                    value={formatBudgetDailyAmount(
                      formatIdr(pace.avgDailySpent),
                    )}
                    hint={formatBudgetAvgDailyHint(
                      formatIdr(pace.avgDailySpent),
                      pace.elapsedDays,
                    )}
                    valueClassName={
                      pace.paceStatus === "fast" ? "text-[#FF9500]" : undefined
                    }
                  />
                ) : (
                  <DetailMetric
                    label={PAYPLAN_LABEL_AVG_DAILY_SPENT}
                    value="—"
                  />
                )}
                {pace.adjustedDailyBudget !== null ? (
                  <DetailMetric
                    label={PAYPLAN_LABEL_ADJUSTED_DAILY}
                    value={formatBudgetDailyAmount(
                      formatIdr(pace.adjustedDailyBudget),
                    )}
                    hint={formatBudgetAdjustedDailyHint(
                      formatIdr(pace.adjustedDailyBudget),
                      pace.remainingDays,
                      formatIdr(pace.plannedDailyBudget ?? 0),
                    )}
                    valueClassName={
                      pace.dailyDelta !== null && pace.dailyDelta < 0
                        ? "text-[#FF9500]"
                        : pace.dailyDelta !== null && pace.dailyDelta > 0
                          ? "text-[#34C759]"
                          : undefined
                    }
                  />
                ) : (
                  <DetailMetric
                    label={PAYPLAN_LABEL_ADJUSTED_DAILY}
                    value="—"
                  />
                )}
                <DetailMetric
                  label={PAYPLAN_LABEL_ELAPSED_DAYS}
                  value={String(pace.elapsedDays)}
                />
                <DetailMetric
                  label={PAYPLAN_LABEL_REMAINING_DAYS}
                  value={String(pace.remainingDays)}
                />
              </div>

              {pace.dailyDelta !== null && pace.dailyDelta !== 0 ? (
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  {formatBudgetDailyDelta(
                    formatIdr(Math.abs(pace.dailyDelta)),
                    pace.dailyDelta < 0 ? "below" : "above",
                  )}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentStatus.budget.note?.trim() ? (
          <div className={FORM_GROUP}>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {PAYPLAN_LABEL_NOTE}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                {currentStatus.budget.note}
              </p>
            </div>
          </div>
        ) : null}
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          disabled={disabled}
          className={cn(SEPARATED_CONTROL, "shrink-0")}
          onClick={handleDelete}
          aria-label={PAYPLAN_LABEL_DELETE}
        >
          <span className="sr-only">{PAYPLAN_LABEL_DELETE}</span>
          <TrashIcon className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-1 gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            className={cn(SEPARATED_CONTROL, "shrink-0")}
            onClick={handleEdit}
            aria-label={PAYPLAN_LABEL_EDIT}
          >
            <span className="sr-only">{PAYPLAN_LABEL_EDIT}</span>
            <PencilSimpleIcon className="size-4" />
          </Button>
          <Button
            type="button"
            disabled={disabled}
            className={cn(SEPARATED_CONTROL, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            {PAYPLAN_LABEL_CLOSE}
          </Button>
        </div>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
