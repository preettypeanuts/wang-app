"use client";

import { useEffect, useState } from "react";

import { FormDatePicker } from "@/components/shared/form-date-picker";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FORM_DIALOG_BODY_SCROLL, FORM_FIELD_GRID_ROW } from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  getJournalDateRangePresets,
  isValidJournalDateInput,
} from "@/lib/journal/journal-date-range";
import { cn } from "@/lib/utils";

interface JournalDateRangeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFrom: string | null;
  dateTo: string | null;
  onApply: (dateFrom: string | null, dateTo: string | null) => void;
  onReset: () => void;
}

export function JournalDateRangeDrawer({
  open,
  onOpenChange,
  dateFrom,
  dateTo,
  onApply,
  onReset,
}: JournalDateRangeDrawerProps) {
  const [draftFrom, setDraftFrom] = useState(dateFrom ?? "");
  const [draftTo, setDraftTo] = useState(dateTo ?? "");
  const [error, setError] = useState<string | null>(null);
  const presets = getJournalDateRangePresets();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftFrom(dateFrom ?? "");
    setDraftTo(dateTo ?? "");
    setError(null);
  }, [open, dateFrom, dateTo]);

  function handleApply() {
    const nextFrom = draftFrom.trim();
    const nextTo = draftTo.trim();

    if (!nextFrom && !nextTo) {
      onApply(null, null);
      onOpenChange(false);
      return;
    }

    if (nextFrom && !isValidJournalDateInput(nextFrom)) {
      setError("Tanggal mulai tidak valid.");
      return;
    }

    if (nextTo && !isValidJournalDateInput(nextTo)) {
      setError("Tanggal akhir tidak valid.");
      return;
    }

    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError("Tanggal mulai harus sebelum atau sama dengan tanggal akhir.");
      return;
    }

    onApply(nextFrom || null, nextTo || null);
    onOpenChange(false);
  }

  function handleReset() {
    setDraftFrom("");
    setDraftTo("");
    setError(null);
    onReset();
    onOpenChange(false);
  }

  function applyPreset(dateFromValue: string, dateToValue: string) {
    setDraftFrom(dateFromValue);
    setDraftTo(dateToValue);
    setError(null);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rentang tanggal"
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Rentang tanggal
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          Filter transaksi, ringkasan, dan breakdown kategori menurut periode.
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant="outline"
              className={cn(SEPARATED_CONTROL, "h-8")}
              onClick={() => applyPreset(preset.dateFrom, preset.dateTo)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className={cn(FORM_FIELD_GRID_ROW, "mt-1")}>
          <div className="flex flex-col gap-1.5 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              Dari
            </span>
            <FormDatePicker
              id="journal-date-from"
              name="journal-date-from"
              value={draftFrom}
              onChange={setDraftFrom}
              placeholder="Pilih tanggal mulai"
            />
          </div>
          <div className="flex flex-col gap-1.5 px-4 py-3 sm:border-l sm:border-black/6 dark:sm:border-white/8">
            <span className="text-xs font-medium text-muted-foreground">
              Sampai
            </span>
            <FormDatePicker
              id="journal-date-to"
              name="journal-date-to"
              value={draftTo}
              onChange={setDraftTo}
              placeholder="Pilih tanggal akhir"
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter>
        <Button
          type="button"
          variant="ghost"
          className={cn(SEPARATED_CONTROL, "flex-1")}
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          type="button"
          className={cn(SEPARATED_CONTROL, "flex-1")}
          onClick={handleApply}
        >
          Terapkan
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
