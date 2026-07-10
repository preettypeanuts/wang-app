"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { markInstallmentPaidAction } from "@/app/actions/planner";
import { PlannedItemEndBadge } from "@/components/planner/planned-item-end-badge";
import { PlannedItemInstallmentProgressBar } from "@/components/planner/planned-item-installment-progress";
import { PlannedItemInstallmentStatus } from "@/components/planner/planned-item-installment-status";
import { PlannedItemKindIcon } from "@/components/planner/planned-item-kind-icon";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  formatPayPlanCompletedProgress,
  formatPayPlanInstallmentEntry,
  PAYPLAN_LABEL_AMOUNT,
  PAYPLAN_LABEL_CLOSE,
  PAYPLAN_LABEL_DELETE,
  PAYPLAN_LABEL_DETAIL_DESC,
  PAYPLAN_LABEL_EDIT,
  PAYPLAN_LABEL_END,
  PAYPLAN_LABEL_INSTALLMENT_SCHEDULE,
  PAYPLAN_LABEL_NOTE,
  PAYPLAN_LABEL_PAY_PER_PERIOD,
  PAYPLAN_LABEL_SAVING,
  PAYPLAN_LABEL_START,
  PAYPLAN_LABEL_STATUS_PAID,
  PAYPLAN_LABEL_STATUS_UNPAID,
  UI_LABEL_TOTAL,
} from "@/config/payplan-labels";
import { getCategoryLabel } from "@/config/categories";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_GROUP,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import {
  getPlannedKindBadgeClass,
  PLANNER_MANAGE_META,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatDayMonth } from "@/lib/finance/format-datetime";
import { CheckCircleIcon, PencilSimpleIcon, TrashIcon } from "@/lib/icons";
import {
  formatPlannedInstallmentCount,
  formatPlannedItemKind,
  formatPlannedItemRepeat,
  formatPlannedStartLabel,
} from "@/lib/planner/format-planned-item";
import {
  getInstallmentProgress,
  getPlannedItemInstallmentSchedule,
} from "@/lib/planner/installment-progress";
import {
  canMarkPlannedItemPaid,
  getMarkPlannedItemPaidLabel,
  getPlannedItemPaymentIndex,
} from "@/lib/planner/item-payment";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemDetailDialogProps {
  open: boolean;
  item: PlannedItemRecord | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemDetailDialog({
  open,
  item,
  onOpenChange,
  onEdit,
  onDelete,
}: PlannedItemDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!item) {
    return null;
  }

  const currentItem = item;
  const isIncome = currentItem.flowType === "income";
  const installmentProgress = getInstallmentProgress(currentItem);
  const installmentCount = formatPlannedInstallmentCount(currentItem);
  const installmentSchedule = getPlannedItemInstallmentSchedule(currentItem);
  const canPay = canMarkPlannedItemPaid(currentItem) && !isPending;
  const payLabel = getMarkPlannedItemPaidLabel();
  const totalAmount =
    currentItem.kind === "installment" && currentItem.installmentCount
      ? currentItem.amount * currentItem.installmentCount
      : null;

  function handleMarkPaid() {
    if (!canPay) {
      return;
    }

    startTransition(async () => {
      const result = await markInstallmentPaidAction(
        currentItem.id,
        getPlannedItemPaymentIndex(currentItem),
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function handleEdit() {
    onOpenChange(false);
    onEdit(currentItem);
  }

  function handleDelete() {
    onOpenChange(false);
    onDelete(currentItem);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={currentItem.name}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {currentItem.name}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {PAYPLAN_LABEL_DETAIL_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            <div className="flex items-center gap-3 px-1 pb-1">
              <PlannedItemKindIcon kind={currentItem.kind} />
              <span
                className={cn(
                  "inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold",
                  getPlannedKindBadgeClass(currentItem.kind),
                )}
              >
                {formatPlannedItemKind(currentItem.kind)}
              </span>
            </div>

            <div className={FORM_PREVIEW_COMPACT}>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {currentItem.kind === "installment"
                    ? PAYPLAN_LABEL_PAY_PER_PERIOD
                    : PAYPLAN_LABEL_AMOUNT}
                </p>
                <p
                  className={cn(
                    "mt-0.5",
                    FORM_PREVIEW_COMPACT_AMOUNT,
                    isIncome
                      ? "text-[#2FAE52] dark:text-[#34C759]"
                      : "text-foreground",
                  )}
                >
                  {isIncome ? "+" : ""}
                  {formatIdr(currentItem.amount)}
                </p>
                {totalAmount ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {UI_LABEL_TOTAL} {formatIdr(totalAmount)}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
                <p>{getCategoryLabel(currentItem.category)}</p>
                <p className="font-medium text-foreground">
                  {formatPlannedItemRepeat(currentItem.repeat)}
                  {installmentCount ? ` · ${installmentCount}` : ""}
                </p>
              </div>
            </div>

            {installmentProgress ? (
              <div className="px-1 py-2">
                <PlannedItemInstallmentProgressBar
                  progress={installmentProgress}
                />
                <p className="mt-1.5 text-center text-[11px] font-medium tabular-nums text-muted-foreground">
                  {formatPayPlanCompletedProgress(
                    installmentProgress.completed,
                    installmentProgress.total,
                  )}
                </p>
              </div>
            ) : null}

            <div className="px-1 py-1">
              <PlannedItemInstallmentStatus item={currentItem} />
            </div>

            <div className={FORM_GROUP}>
              <div className="grid grid-cols-2 gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className={PLANNER_MANAGE_META}>{PAYPLAN_LABEL_START}</p>
                  <p className="mt-1 text-sm font-medium text-foreground/90">
                    {formatPlannedStartLabel(currentItem)}
                  </p>
                </div>
                <div className="min-w-0 text-right">
                  <p className={PLANNER_MANAGE_META}>{PAYPLAN_LABEL_END}</p>
                  <div className="mt-1 flex justify-end">
                    <PlannedItemEndBadge item={currentItem} />
                  </div>
                </div>
              </div>
            </div>

            {currentItem.note ? (
              <div className={FORM_GROUP}>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {PAYPLAN_LABEL_NOTE}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                    {currentItem.note}
                  </p>
                </div>
              </div>
            ) : null}

            {installmentSchedule.length > 0 ? (
              <div className={FORM_GROUP}>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {PAYPLAN_LABEL_INSTALLMENT_SCHEDULE}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {installmentSchedule.map((entry) => (
                      <li
                        key={entry.index}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate text-foreground/90">
                          {formatPayPlanInstallmentEntry(entry.index)}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatDayMonth(entry.dueAt)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs font-semibold",
                            entry.isPaid ? "text-[#34C759]" : "text-[#FF9500]",
                          )}
                        >
                          {entry.isPaid
                            ? PAYPLAN_LABEL_STATUS_PAID
                            : PAYPLAN_LABEL_STATUS_UNPAID}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          disabled={isPending}
          className={cn(SEPARATED_CONTROL, "shrink-0")}
          onClick={handleDelete}
          aria-label={PAYPLAN_LABEL_DELETE}
        >
          <span className="sr-only">{PAYPLAN_LABEL_DELETE}</span>
          <TrashIcon className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-1 gap-2">
          {canPay ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "shrink-0")}
              onClick={handleMarkPaid}
            >
              <CheckCircleIcon className="size-4" />
              {isPending ? PAYPLAN_LABEL_SAVING : payLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={isPending}
            className={cn(SEPARATED_CONTROL, "shrink-0")}
            onClick={handleEdit}
            aria-label={PAYPLAN_LABEL_EDIT}
          >
            <span className="sr-only">{PAYPLAN_LABEL_EDIT}</span>
            <PencilSimpleIcon className="size-4" />
          </Button>
          <Button
            type="button"
            disabled={isPending}
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
