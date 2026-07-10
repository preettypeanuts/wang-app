import { InfinityIcon } from "@/lib/icons";

import { PAYPLAN_LABEL_REPEAT_FOREVER } from "@/config/payplan-labels";
import { PLANNER_MANAGE_META } from "@/config/planner-manage";
import {
  formatPlannedEndLabel,
  formatPlannedInstallmentEndLabel,
} from "@/lib/planner/format-planned-item";
import { isPlannedItemInfinite } from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemEndBadgeProps {
  item: PlannedItemRecord;
}

export function PlannedItemEndBadge({ item }: PlannedItemEndBadgeProps) {
  if (isPlannedItemInfinite(item)) {
    return (
      <span
        className="inline-flex items-center text-muted-foreground"
        aria-label={PAYPLAN_LABEL_REPEAT_FOREVER}
        title={PAYPLAN_LABEL_REPEAT_FOREVER}
      >
        <InfinityIcon className="size-3" />
      </span>
    );
  }

  const installmentEndLabel = formatPlannedInstallmentEndLabel(item);

  if (installmentEndLabel) {
    return (
      <span className="text-xs font-medium capitalize text-foreground/85">
        {installmentEndLabel}
      </span>
    );
  }

  return (
    <span className={`${PLANNER_MANAGE_META} font-medium text-foreground/80`}>
      {formatPlannedEndLabel(item)}
    </span>
  );
}
