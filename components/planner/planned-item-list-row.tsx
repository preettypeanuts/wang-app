import { PlannedItemCardMenu } from "@/components/planner/planned-item-card-menu";
import { PlannedItemEndBadge } from "@/components/planner/planned-item-end-badge";
import { PlannedItemKindIcon } from "@/components/planner/planned-item-kind-icon";
import {
  formatPayPlanViewDetail,
  PAYPLAN_LABEL_START,
} from "@/config/payplan-labels";
import { PLANNER_MANAGE_STATUS } from "@/config/planner-manage";
import {
  PLANNER_LIST_AMOUNT_EXPENSE,
  PLANNER_LIST_AMOUNT_INCOME,
  PLANNER_LIST_ROW,
  PLANNER_LIST_ROW_AMOUNT,
  PLANNER_LIST_ROW_CONTENT,
  PLANNER_LIST_ROW_META,
  PLANNER_LIST_ROW_STATUS,
  PLANNER_LIST_ROW_TITLE,
  PLANNER_LIST_ROW_TRAILING,
  PLANNER_LIST_ROW_TRAILING_STACK,
} from "@/config/planner-table";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  formatPlannedInstallmentCount,
  formatPlannedItemRepeat,
  formatPlannedStartLabel,
} from "@/lib/planner/format-planned-item";
import { getPlannedItemPaymentStatus } from "@/lib/planner/installment-progress";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemListRowProps {
  item: PlannedItemRecord;
  disabled?: boolean;
  onViewDetail: (item: PlannedItemRecord) => void;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemListRow({
  item,
  disabled = false,
  onViewDetail,
  onEdit,
  onDelete,
}: PlannedItemListRowProps) {
  const isIncome = item.flowType === "income";
  const installmentCount = formatPlannedInstallmentCount(item);
  const repeatLabel = formatPlannedItemRepeat(item.repeat);
  const startLabel = formatPlannedStartLabel(item);
  const paymentStatus =
    item.flowType === "expense" ? getPlannedItemPaymentStatus(item) : null;

  return (
    <div
      className={cn(
        PLANNER_LIST_ROW,
        "relative",
        !disabled &&
          "transition-colors hover:bg-black/2 dark:hover:bg-white/3",
      )}
    >
      {disabled ? null : (
        <button
          type="button"
          className="absolute inset-0 z-0"
          aria-label={formatPayPlanViewDetail(item.name)}
          onClick={() => onViewDetail(item)}
        />
      )}

      <PlannedItemKindIcon kind={item.kind} className="relative z-10" />

      <div className={cn(PLANNER_LIST_ROW_CONTENT, "relative z-10")}>
        <p
          className={cn(
            PLANNER_LIST_ROW_TITLE,
            "max-w-xs truncate font-semibold tracking-tight sm:max-w-[20ch]",
          )}
          title={item.name}
        >
          {item.name}
        </p>
        <div
          className={cn(
            PLANNER_LIST_ROW_META,
            "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground",
          )}
        >
          <span className="inline-flex items-center gap-1 font-medium capitalize">
            {repeatLabel}
            {installmentCount ? (
              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-foreground/90">
                {installmentCount}
              </span>
            ) : null}
          </span>
          <span
            aria-hidden
            className="mx-1.5 hidden text-muted-foreground/40 sm:inline"
          >
            |
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground/60">{PAYPLAN_LABEL_START}</span>
            <span className="text-foreground/90">{startLabel}</span>
          </span>
          <span
            aria-hidden
            className="mx-1.5 hidden text-muted-foreground/40 sm:inline"
          >
            |
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground/60"></span>
            <PlannedItemEndBadge item={item} />
          </span>
        </div>
      </div>

      <div className={cn(PLANNER_LIST_ROW_TRAILING, "relative z-20")}>
        <div className={PLANNER_LIST_ROW_TRAILING_STACK}>
          <p
            className={cn(
              PLANNER_LIST_ROW_AMOUNT,
              isIncome
                ? PLANNER_LIST_AMOUNT_INCOME
                : PLANNER_LIST_AMOUNT_EXPENSE,
            )}
          >
            {isIncome ? "+" : "−"}
            {formatIdr(item.amount)}
          </p>
          {paymentStatus ? (
            <span
              className={cn(
                PLANNER_LIST_ROW_STATUS,
                PLANNER_MANAGE_STATUS,
                paymentStatus.status === "paid"
                  ? "text-[#34C759]"
                  : "text-[#FF9500]",
              )}
            >
              {paymentStatus.label}
            </span>
          ) : null}
        </div>
        <PlannedItemCardMenu
          item={item}
          disabled={disabled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
