"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  PLANNED_ITEM_KINDS,
  PLANNED_REPEAT_INTERVALS,
} from "@/config/planner-items";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { getPlannedItemEndMode, toDateInputValue } from "@/lib/validations/planned-item";
import { cn } from "@/lib/utils";
import type {
  PlannedEndMode,
  PlannedItemKind,
  PlannedItemRecord,
  PlannedRepeatInterval,
} from "@/types/planner";

interface PlannedItemFormSheetProps {
  open: boolean;
  item: PlannedItemRecord | null;
  defaultStartAt?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function PlannedItemFormSheet({
  open,
  item,
  defaultStartAt,
  onOpenChange,
  onSubmit,
}: PlannedItemFormSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<PlannedItemKind>("bill");
  const [repeat, setRepeat] = useState<PlannedRepeatInterval>("monthly");
  const [endMode, setEndMode] = useState<PlannedEndMode>("never");

  const fallbackStartAt = useMemo(
    () => defaultStartAt ?? toDateInputValue(new Date()),
    [defaultStartAt],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (item) {
      setKind(item.kind);
      setRepeat(item.repeat);
      setEndMode(getPlannedItemEndMode(item));
      return;
    }

    setKind("bill");
    setRepeat("monthly");
    setEndMode("never");
  }, [item, open]);

  useEffect(() => {
    if (kind === "installment" && endMode === "never") {
      setEndMode("installments");
    }
  }, [kind, endMode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("kind", kind);
    formData.set("repeat", repeat);
    formData.set("endMode", endMode);

    startTransition(async () => {
      await onSubmit(formData);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{item ? "Edit jadwal" : "Tambah jadwal"}</SheetTitle>
          <SheetDescription>
            Jadwal berulang akan otomatis muncul di kalender PayPlan.
          </SheetDescription>
        </SheetHeader>

        <form
          key={item?.id ?? `create-${fallbackStartAt}`}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="planned-name">Name</Label>
            <Input
              id="planned-name"
              name="name"
              defaultValue={item?.name ?? ""}
              placeholder="Netflix"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planned-kind">Type</Label>
              <Select
                value={kind}
                onValueChange={(value) => setKind(value as PlannedItemKind)}
              >
                <SelectTrigger
                  id="planned-kind"
                  className={cn("w-full", PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_ITEM_KINDS.map((entry) => (
                    <SelectItem
                      key={entry.value}
                      value={entry.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planned-repeat">Repeat</Label>
              <Select
                value={repeat}
                onValueChange={(value) =>
                  setRepeat(value as PlannedRepeatInterval)
                }
              >
                <SelectTrigger
                  id="planned-repeat"
                  className={cn("w-full", PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_REPEAT_INTERVALS.map((entry) => (
                    <SelectItem
                      key={entry.value}
                      value={entry.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planned-amount">Amount</Label>
              <Input
                id="planned-amount"
                name="amount"
                defaultValue={item ? String(item.amount) : ""}
                placeholder="69000"
                inputMode="numeric"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planned-start">Start</Label>
              <Input
                id="planned-start"
                name="startAt"
                type="date"
                defaultValue={
                  item ? toDateInputValue(item.startAt) : fallbackStartAt
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned-end-mode">End</Label>
            <Select
              value={endMode}
              onValueChange={(value) => setEndMode(value as PlannedEndMode)}
            >
              <SelectTrigger
                id="planned-end-mode"
                className={cn("w-full", PLANNER_SELECT_TRIGGER)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={PLANNER_SELECT_CONTENT}>
                <SelectItem value="never" className={PLANNER_SELECT_ITEM}>
                  ∞ (selamanya)
                </SelectItem>
                <SelectItem value="installments" className={PLANNER_SELECT_ITEM}>
                  Jumlah cicilan (12x)
                </SelectItem>
                <SelectItem value="date" className={PLANNER_SELECT_ITEM}>
                  Tanggal akhir
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {endMode === "installments" ? (
            <div className="space-y-2">
              <Label htmlFor="planned-installments">Installments</Label>
              <Input
                id="planned-installments"
                name="installmentCount"
                type="number"
                min={1}
                defaultValue={item?.installmentCount ?? 12}
                required
              />
            </div>
          ) : null}

          {endMode === "date" ? (
            <div className="space-y-2">
              <Label htmlFor="planned-end-date">End date</Label>
              <Input
                id="planned-end-date"
                name="endAt"
                type="date"
                defaultValue={
                  item?.endAt ? toDateInputValue(item.endAt) : fallbackStartAt
                }
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="planned-note">Catatan</Label>
            <Textarea
              id="planned-note"
              name="note"
              defaultValue={item?.note ?? ""}
              placeholder="Opsional"
              rows={3}
            />
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {item ? "Simpan perubahan" : "Tambah jadwal"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
