"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  deletePlannedItemAction,
  savePlannedItemAction,
} from "@/app/actions/planner";
import { PlannedItemDetailDialog } from "@/components/planner/planned-item-detail-dialog";
import { PlannedItemFormDialog } from "@/components/planner/planned-item-form-dialog";
import { PlannerCalendarDayItem } from "@/components/planner/planner-calendar-day-item";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  formatPayPlanDeleteConfirm,
  PAYPLAN_LABEL_ADD_PAY_PLAN,
  PAYPLAN_LABEL_INFLOW,
  PAYPLAN_LABEL_NO_BILLS,
  PAYPLAN_LABEL_NO_BILLS_ON_DATE,
  PAYPLAN_LABEL_NO_SCHEDULED_ON_DATE,
  PAYPLAN_LABEL_OUTFLOW,
} from "@/config/payplan-labels";
import { FORM_DIALOG_BODY_SCROLL, FORM_GROUP } from "@/config/form-dialog";
import { GRID_GAP } from "@/config/spacing";
import { dateInputFromCalendarDate } from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord, PlannedOccurrence } from "@/types/planner";

type PlannedItemRecordSerialized = Omit<
  PlannedItemRecord,
  "startAt" | "endAt"
> & {
  startAt: string;
  endAt: string | null;
};

function normalizePlannedItems(
  items: PlannedItemRecordSerialized[],
): PlannedItemRecord[] {
  return items.map((item) => ({
    ...item,
    startAt: new Date(item.startAt),
    endAt: item.endAt ? new Date(item.endAt) : null,
  }));
}

interface PlannerCalendarDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  items: PlannedOccurrence[];
  totalAmount: number;
  plannedItems: PlannedItemRecordSerialized[];
}

export function PlannerCalendarDayDialog({
  open,
  onOpenChange,
  date,
  items,
  totalAmount,
  plannedItems,
}: PlannerCalendarDayDialogProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedItemRecord | null>(null);
  const [detailItem, setDetailItem] = useState<PlannedItemRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const normalizedPlannedItems = useMemo(
    () => normalizePlannedItems(plannedItems),
    [plannedItems],
  );
  const plannedItemById = useMemo(
    () => new Map(normalizedPlannedItems.map((item) => [item.id, item])),
    [normalizedPlannedItems],
  );
  const hasItems = items.length > 0;
  const defaultStartAt = dateInputFromCalendarDate(date);
  const dialogTitle = `${formatWeekday(date)}, ${formatDayMonth(date)}`;

  function openCreateForm() {
    setError(null);
    onOpenChange(false);
    setFormOpen(true);
  }

  function openDetail(occurrence: PlannedOccurrence) {
    const item = plannedItemById.get(occurrence.plannedItemId);

    if (!item) {
      return;
    }

    setError(null);
    onOpenChange(false);
    setDetailItem(item);
    setDetailOpen(true);
  }

  function openEditForm(item: PlannedItemRecord) {
    setDetailOpen(false);
    setEditingItem(item);
    setError(null);
    setFormOpen(true);
  }

  async function handleDelete(item: PlannedItemRecord) {
    const confirmed = window.confirm(formatPayPlanDeleteConfirm(item.name));

    if (!confirmed) {
      return;
    }

    const result = await deletePlannedItemAction(item.id);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDetailOpen(false);
    setDetailItem(null);
    router.refresh();
  }

  async function handleSubmit(formData: FormData): Promise<boolean> {
    const result = await savePlannedItemAction(formData);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    setError(null);
    setEditingItem(null);
    router.refresh();
    return true;
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={dialogTitle}
      >
        <ResponsiveDialogHeader>
          <DialogTitle className="text-lg font-semibold capitalize tracking-tight">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-snug">
            {hasItems ? (
              <>
                {items.length} item
                <span className="mx-1">·</span>
                <span className="font-medium text-foreground/85">
                  {formatIdr(Math.abs(totalAmount))}
                  {totalAmount > 0
                    ? ` ${PAYPLAN_LABEL_OUTFLOW}`
                    : totalAmount < 0
                      ? ` ${PAYPLAN_LABEL_INFLOW}`
                      : ""}
                </span>
              </>
            ) : (
              PAYPLAN_LABEL_NO_BILLS_ON_DATE
            )}
          </DialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          {hasItems ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-1 w-full"
              onClick={openCreateForm}
            >
              <PlusIcon /> New Plan
            </Button>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          {hasItems ? (
            <div className={cn("flex flex-col", GRID_GAP)}>
              {items.map((item) => (
                <PlannerCalendarDayItem
                  key={item.id}
                  item={item}
                  onOpenDetail={() => openDetail(item)}
                />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                FORM_GROUP,
                "flex flex-col items-center justify-center px-3 py-8 text-center",
              )}
            >
              <p className="text-sm font-medium">{PAYPLAN_LABEL_NO_BILLS}</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {PAYPLAN_LABEL_NO_SCHEDULED_ON_DATE}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={openCreateForm}
              >
                <PlusIcon />
                {PAYPLAN_LABEL_ADD_PAY_PLAN}
              </Button>
            </div>
          )}
        </ResponsiveDialogBody>
      </ResponsiveDialog>

      <PlannedItemDetailDialog
        open={detailOpen}
        item={detailItem}
        onOpenChange={setDetailOpen}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />

      <PlannedItemFormDialog
        open={formOpen}
        item={editingItem}
        defaultStartAt={editingItem ? undefined : defaultStartAt}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}
