import { PlannedItemEndBadge } from "@/components/planner/planned-item-end-badge";
import { PlannedItemInstallmentProgressBar } from "@/components/planner/planned-item-installment-progress";
import {
  PLANNER_MANAGE_CARD_DIVIDER,
  PLANNER_MANAGE_CARD_DIVIDER_LINE,
  PLANNER_MANAGE_CARD_FOOTER,
  PLANNER_MANAGE_CARD_FOOTER_CONTENT,
  PLANNER_MANAGE_META,
} from "@/config/planner-manage";
import { formatPlannedStartLabel } from "@/lib/planner/format-planned-item";
import type { InstallmentProgress } from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemCardFooterProps {
  item: PlannedItemRecord;
  installmentProgress: InstallmentProgress | null;
}

export function PlannedItemCardFooter({
  item,
  installmentProgress,
}: PlannedItemCardFooterProps) {
  return (
    <div className={PLANNER_MANAGE_CARD_FOOTER}>
      <div className={PLANNER_MANAGE_CARD_DIVIDER}>
        {installmentProgress ? (
          <PlannedItemInstallmentProgressBar progress={installmentProgress} />
        ) : (
          <div className={PLANNER_MANAGE_CARD_DIVIDER_LINE} />
        )}
      </div>

      <div className={PLANNER_MANAGE_CARD_FOOTER_CONTENT}>
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className={PLANNER_MANAGE_META}>Start</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-foreground/85">
              {formatPlannedStartLabel(item)}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className={PLANNER_MANAGE_META}>End</p>
            <div className="mt-0.5 flex justify-end">
              <PlannedItemEndBadge item={item} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
