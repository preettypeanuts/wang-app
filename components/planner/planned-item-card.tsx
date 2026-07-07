import { PlannedItemCardFooter } from "@/components/planner/planned-item-card-footer";

import { PlannedItemCardMenu } from "@/components/planner/planned-item-card-menu";
import { formatInstallmentProgressLabel } from "@/components/planner/planned-item-installment-progress";
import { PlannedItemInstallmentStatus } from "@/components/planner/planned-item-installment-status";
import {
  PAYPLAN_MANAGE_CARD_MOBILE,
  PAYPLAN_MOBILE_SOLID_CARD,
} from "@/config/payplan-mobile";
import {
  getPlannedKindBadgeClass,
  PLANNER_KIND_STYLES,
  PLANNER_MANAGE_AMOUNT,
  PLANNER_MANAGE_CARD,
  PLANNER_MANAGE_CARD_BODY,
  PLANNER_MANAGE_INSTALLMENT_COUNT,
  PLANNER_MANAGE_META_BETWEEN,
  PLANNER_MANAGE_REPEAT,
} from "@/config/planner-manage";
import { formatIdr } from "@/lib/finance/format-currency";
import {
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  type Icon,
  ReceiptIcon,
} from "@/lib/icons";
import {
  formatPlannedInstallmentCount,
  formatPlannedItemKind,
  formatPlannedItemRepeat,
} from "@/lib/planner/format-planned-item";
import { getInstallmentProgress } from "@/lib/planner/installment-progress";
import { cn } from "@/lib/utils";
import type { PlannedItemKind, PlannedItemRecord } from "@/types/planner";

const KIND_ICONS: Record<PlannedItemKind, Icon> = {
  bill: ReceiptIcon,
  subscription: CreditCardIcon,
  installment: CreditCardIcon,
  income: CurrencyCircleDollarIcon,
};

const PLANNER_KIND_BADGE =
  "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold";

interface PlannedItemCardProps {
  item: PlannedItemRecord;
  disabled?: boolean;
  onViewDetail: (item: PlannedItemRecord) => void;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemCard({
  item,
  disabled = false,
  onViewDetail,
  onEdit,
  onDelete,
}: PlannedItemCardProps) {
  const IconComponent = KIND_ICONS[item.kind];
  const kindStyle = PLANNER_KIND_STYLES[item.kind];
  const installmentProgress = getInstallmentProgress(item);
  const installmentCount = formatPlannedInstallmentCount(item);
  const isIncome = item.flowType === "income";

  return (
    <div
      className={cn(
        PLANNER_MANAGE_CARD,
        PAYPLAN_MOBILE_SOLID_CARD,
        PAYPLAN_MANAGE_CARD_MOBILE,
        "relative",
        !disabled &&
          "transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]",
      )}
    >
      {disabled ? null : (
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-[inherit]"
          aria-label={`Lihat detail ${item.name}`}
          onClick={() => onViewDetail(item)}
        />
      )}

      <div className={cn(PLANNER_MANAGE_CARD_BODY, "relative z-10")}>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              kindStyle.surface,
            )}
          >
            <IconComponent className={cn("size-5", kindStyle.color)} />
          </div>

          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground/90">
            {item.name}
          </h3>

          <div className="relative z-20">
            <PlannedItemCardMenu
              item={item}
              disabled={disabled}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>

        <div className={PLANNER_MANAGE_META_BETWEEN}>
          <span
            className={cn(
              PLANNER_KIND_BADGE,
              getPlannedKindBadgeClass(item.kind),
            )}
          >
            {formatPlannedItemKind(item.kind)}
          </span>

          <span className={cn(PLANNER_MANAGE_REPEAT, "shrink-0 text-right")}>
            {formatPlannedItemRepeat(item.repeat)}
            {installmentCount ? (
              <span className="ml-1 font-semibold tabular-nums text-foreground/75">
                · {installmentCount}
              </span>
            ) : null}
          </span>
        </div>

        <div className="mt-auto space-y-1">
          <div className="flex items-end justify-between gap-3">
            <p
              className={cn(
                PLANNER_MANAGE_AMOUNT,
                isIncome ? "text-[#34C759]" : "text-foreground",
              )}
            >
              {isIncome ? "+" : ""}
              {formatIdr(item.amount)}
            </p>

            {installmentProgress ? (
              <span className={PLANNER_MANAGE_INSTALLMENT_COUNT}>
                {formatInstallmentProgressLabel(installmentProgress)}
              </span>
            ) : null}
          </div>

          <PlannedItemInstallmentStatus item={item} />
        </div>
      </div>

      <div className="relative z-10">
        <PlannedItemCardFooter
          item={item}
          installmentProgress={installmentProgress}
        />
      </div>
    </div>
  );
}
