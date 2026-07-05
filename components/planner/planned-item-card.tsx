import {
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  ReceiptIcon,
  type Icon,
} from "@phosphor-icons/react";

import { PlannedItemCardMenu } from "@/components/planner/planned-item-card-menu";
import { PlannedItemCardFooter } from "@/components/planner/planned-item-card-footer";
import { PlannedItemInstallmentStatus } from "@/components/planner/planned-item-installment-status";
import { formatInstallmentProgressLabel } from "@/components/planner/planned-item-installment-progress";
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
import {
  formatPlannedInstallmentCount,
  formatPlannedItemKind,
  formatPlannedItemRepeat,
} from "@/lib/planner/format-planned-item";
import { getInstallmentProgress } from "@/lib/planner/installment-progress";
import { formatIdr } from "@/lib/finance/format-currency";
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
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemCard({
  item,
  disabled = false,
  onEdit,
  onDelete,
}: PlannedItemCardProps) {
  const IconComponent = KIND_ICONS[item.kind];
  const kindStyle = PLANNER_KIND_STYLES[item.kind];
  const installmentProgress = getInstallmentProgress(item);
  const installmentCount = formatPlannedInstallmentCount(item);
  const isIncome = item.flowType === "income";

  return (
    <article className={PLANNER_MANAGE_CARD}>
      <div className={PLANNER_MANAGE_CARD_BODY}>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              kindStyle.surface,
            )}
          >
            <IconComponent
              className={cn("size-5", kindStyle.color)}
              weight="duotone"
            />
          </div>

          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground/90">
            {item.name}
          </h3>

          <PlannedItemCardMenu
            item={item}
            disabled={disabled}
            onEdit={onEdit}
            onDelete={onDelete}
          />
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

      <PlannedItemCardFooter
        item={item}
        installmentProgress={installmentProgress}
      />
    </article>
  );
}
