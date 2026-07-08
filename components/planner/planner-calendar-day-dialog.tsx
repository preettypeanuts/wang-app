"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePlannedItemAction } from "@/app/actions/planner";
import { PlannedItemFormDialog } from "@/components/planner/planned-item-form-dialog";
import { PlannerCalendarDayItem } from "@/components/planner/planner-calendar-day-item";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FORM_DIALOG_BODY_SCROLL, FORM_GROUP } from "@/config/form-dialog";
import { GRID_GAP } from "@/config/spacing";
import { dateInputFromCalendarDate } from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  items: PlannedOccurrence[];
  totalAmount: number;
}

export function PlannerCalendarDayDialog({
  open,
  onOpenChange,
  date,
  items,
  totalAmount,
}: PlannerCalendarDayDialogProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasItems = items.length > 0;
  const defaultStartAt = dateInputFromCalendarDate(date);
  const dialogTitle = `${formatWeekday(date)}, ${formatDayMonth(date)}`;

  function openCreateForm() {
    setError(null);
    onOpenChange(false);
    setFormOpen(true);
  }

  async function handleSubmit(formData: FormData): Promise<boolean> {
    const result = await savePlannedItemAction(formData);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    setError(null);
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
                    ? " keluar"
                    : totalAmount < 0
                      ? " masuk"
                      : ""}
                </span>
              </>
            ) : (
              "Tidak ada tagihan di tanggal ini."
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
                <PlannerCalendarDayItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                FORM_GROUP,
                "flex flex-col items-center justify-center px-3 py-8 text-center",
              )}
            >
              <p className="text-sm font-medium">Tidak ada tagihan</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Belum ada transaksi terjadwal di tanggal ini.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={openCreateForm}
              >
                <PlusIcon />
                Tambah Pay Plan
              </Button>
            </div>
          )}
        </ResponsiveDialogBody>
      </ResponsiveDialog>

      <PlannedItemFormDialog
        open={formOpen}
        item={null}
        defaultStartAt={defaultStartAt}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}
