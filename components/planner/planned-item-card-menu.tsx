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
import { PLANNER_SELECT_ITEM } from "@/config/planner-manage";
import {
  canMarkPlannedItemPaid,
  getMarkPlannedItemPaidLabel,
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
  const canPay = canMarkPlannedItemPaid(item) && !disabled;
  const payLabel = getMarkPlannedItemPaidLabel();

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
            aria-label={`Opsi ${item.name}`}
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
            {isPending ? "Menyimpan..." : payLabel}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className={PLANNER_SELECT_ITEM} onClick={() => onEdit(item)}>
          <PencilSimpleIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className={PLANNER_SELECT_ITEM}
          onClick={() => onDelete(item)}
        >
          <TrashIcon />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
