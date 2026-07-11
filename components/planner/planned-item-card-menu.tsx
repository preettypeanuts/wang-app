"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/lib/icons";

import { markInstallmentPaidAction } from "@/app/actions/planner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatPayPlanOptionsLabel,
  PAYPLAN_LABEL_DELETE,
  PAYPLAN_LABEL_EDIT,
  PAYPLAN_LABEL_SAVING,
} from "@/config/payplan-labels";
import { PLANNER_SELECT_ITEM } from "@/config/planner-manage";
import {
  canMarkPlannedItemDone,
  getMarkPlannedItemActionLabel,
  getPlannedItemPaymentIndex,
} from "@/lib/planner/item-payment";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemCardMenuProps {
  item: PlannedItemRecord;
  disabled?: boolean;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemCardMenu({
  item,
  disabled = false,
  onEdit,
  onDelete,
}: PlannedItemCardMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canPay = canMarkPlannedItemDone(item) && !disabled;
  const payLabel = getMarkPlannedItemActionLabel(item);

  function handleMarkPaid() {
    if (!canPay) {
      return;
    }

    startTransition(async () => {
      const result = await markInstallmentPaidAction(
        item.id,
        getPlannedItemPaymentIndex(item),
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={formatPayPlanOptionsLabel(item.name)}
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          />
        }
      >
        <DotsThreeIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="min-w-36 capitalize">
        {canPay ? (
          <DropdownMenuItem
            className={PLANNER_SELECT_ITEM}
            disabled={isPending}
            onClick={handleMarkPaid}
          >
            <CheckCircleIcon />
            {isPending ? PAYPLAN_LABEL_SAVING : payLabel}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className={PLANNER_SELECT_ITEM} onClick={() => onEdit(item)}>
          <PencilSimpleIcon />
          {PAYPLAN_LABEL_EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className={PLANNER_SELECT_ITEM}
          onClick={() => onDelete(item)}
        >
          <TrashIcon />
          {PAYPLAN_LABEL_DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
