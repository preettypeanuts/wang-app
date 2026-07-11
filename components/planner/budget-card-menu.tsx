"use client";

import { Button } from "@/components/ui/button";
import { formatBudgetOptionsLabel } from "@/config/payplan-labels";
import { DotsThreeIcon } from "@/lib/icons";
import type { BudgetStatus } from "@/types/budget";

interface BudgetCardMenuProps {
  status: BudgetStatus;
  disabled?: boolean;
  onViewDetail: (status: BudgetStatus) => void;
}

export function BudgetCardMenu({
  status,
  disabled = false,
  onViewDetail,
}: BudgetCardMenuProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={formatBudgetOptionsLabel(status.categoryLabel)}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onViewDetail(status);
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <DotsThreeIcon className="size-4" />
    </Button>
  );
}
