"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react";

import { savePlannedItemAction } from "@/app/actions/planner";
import { PlannedItemFormSheet } from "@/components/planner/planned-item-form-sheet";
import { PlannerCalendarDayItem } from "@/components/planner/planner-calendar-day-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GRID_GAP } from "@/config/spacing";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { toDateInputValue } from "@/lib/validations/planned-item";
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasItems = items.length > 0;
  const defaultStartAt = toDateInputValue(date);

  function openCreateSheet() {
    setError(null);
    setSheetOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const result = await savePlannedItemAction(formData);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setSheetOpen(false);
    router.refresh();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="capitalize">
                  {formatWeekday(date)}, {formatDayMonth(date)}
                </DialogTitle>
                <DialogDescription className="mt-1">
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
              </div>

              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={openCreateSheet}
              >
                <PlusIcon />
                Tambah
              </Button>
            </div>
          </DialogHeader>

          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          {hasItems ? (
            <div
              className={cn(
                "flex max-h-[min(60vh,28rem)] flex-col overflow-y-auto",
                GRID_GAP,
              )}
            >
              {items.map((item) => (
                <PlannerCalendarDayItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 px-3 py-6 text-center dark:border-white/12">
              <p className="text-sm font-medium">Tidak ada tagihan</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Belum ada transaksi terjadwal di tanggal ini.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={openCreateSheet}
              >
                <PlusIcon />
                Tambah jadwal
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PlannedItemFormSheet
        open={sheetOpen}
        item={null}
        defaultStartAt={defaultStartAt}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}
