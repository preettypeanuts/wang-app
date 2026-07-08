"use client";

import { JournalFilterFields } from "@/components/journal/journal-filter-fields";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FORM_DIALOG_BODY_SCROLL } from "@/config/form-dialog";

import type { JournalFilters } from "@/types/journal";

interface JournalFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: JournalFilters["type"];
  category: JournalFilters["category"];
  onTypeChange: (value: JournalFilters["type"]) => void;
  onCategoryChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function JournalFiltersDialog({
  open,
  onOpenChange,
  type,
  category,
  onTypeChange,
  onCategoryChange,
  onApply,
  onReset,
}: JournalFiltersDialogProps) {
  function handleApply() {
    onApply();
    onOpenChange(false);
  }

  function handleReset() {
    onReset();
    onOpenChange(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Filter">
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Filter
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          Saring transaksi berdasarkan tipe dan kategori.
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
        <JournalFilterFields
          type={type}
          category={category}
          onTypeChange={onTypeChange}
          onCategoryChange={onCategoryChange}
          onApply={handleApply}
          onReset={handleReset}
        />
      </ResponsiveDialogBody>
    </ResponsiveDialog>
  );
}
