"use client";

import { useEffect, useState } from "react";

import { JournalFilterCategoryList } from "@/components/journal/journal-filter-category-list";
import { FormDateRangePicker } from "@/components/shared/form-date-range-picker";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_LABEL,
  FORM_SEGMENT,
  FORM_SEGMENT_ACTIVE,
  FORM_SEGMENT_INACTIVE,
  FORM_SEGMENTED,
} from "@/config/form-dialog";
import { JOURNAL_TYPE_OPTIONS } from "@/config/journal";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  UI_LABEL_APPLY,
  UI_LABEL_CATEGORY,
  UI_LABEL_DATE_RANGE,
  UI_LABEL_FILTER,
  UI_LABEL_FILTER_JOURNAL_DESCRIPTION,
  UI_LABEL_RESET,
  UI_LABEL_TYPE,
} from "@/config/ui-labels";
import {
  getJournalDateRangePresets,
  isValidJournalDateInput,
} from "@/lib/journal/journal-date-range";
import { cn } from "@/lib/utils";
import type { JournalFilters } from "@/types/journal";

interface JournalFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFrom: string | null;
  dateTo: string | null;
  type: JournalFilters["type"];
  category: JournalFilters["category"];
  onApply: (filters: {
    dateFrom: string | null;
    dateTo: string | null;
    type: JournalFilters["type"];
    category: string;
  }) => void;
  onReset: () => void;
}

export function JournalFiltersDrawer({
  open,
  onOpenChange,
  dateFrom,
  dateTo,
  type,
  category,
  onApply,
  onReset,
}: JournalFiltersDrawerProps) {
  const [draftFrom, setDraftFrom] = useState(dateFrom ?? "");
  const [draftTo, setDraftTo] = useState(dateTo ?? "");
  const [draftType, setDraftType] = useState(type);
  const [draftCategory, setDraftCategory] = useState(category);
  const [error, setError] = useState<string | null>(null);
  const presets = getJournalDateRangePresets();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftFrom(dateFrom ?? "");
    setDraftTo(dateTo ?? "");
    setDraftType(type);
    setDraftCategory(category);
    setError(null);
  }, [open, dateFrom, dateTo, type, category]);

  function handleApply() {
    const nextFrom = draftFrom.trim();
    const nextTo = draftTo.trim();

    if (nextFrom && !isValidJournalDateInput(nextFrom)) {
      setError("Start date is invalid.");
      return;
    }

    if (nextTo && !isValidJournalDateInput(nextTo)) {
      setError("End date is invalid.");
      return;
    }

    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError("Start date must be on or before the end date.");
      return;
    }

    onApply({
      dateFrom: nextFrom || null,
      dateTo: nextTo || null,
      type: draftType,
      category: draftCategory,
    });
    onOpenChange(false);
  }

  function handleReset() {
    setDraftFrom("");
    setDraftTo("");
    setDraftType("all");
    setDraftCategory("all");
    setError(null);
    onReset();
    onOpenChange(false);
  }

  function applyPreset(dateFromValue: string, dateToValue: string) {
    setDraftFrom(dateFromValue);
    setDraftTo(dateToValue);
    setError(null);
  }

  function handleDateRangeChange(nextFrom: string, nextTo: string) {
    setDraftFrom(nextFrom);
    setDraftTo(nextTo);
    setError(null);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={UI_LABEL_FILTER}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {UI_LABEL_FILTER}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {UI_LABEL_FILTER_JOURNAL_DESCRIPTION}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
        <section className="flex flex-col gap-2">
          <span className={FORM_FIELD_LABEL}>{UI_LABEL_DATE_RANGE}</span>
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
          <FormDateRangePicker
            dateFrom={draftFrom}
            dateTo={draftTo}
            onChange={handleDateRangeChange}
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className={FORM_FIELD_LABEL}>{UI_LABEL_TYPE}</span>
          <div className={FORM_SEGMENTED}>
            {JOURNAL_TYPE_OPTIONS.map((option) => {
              const isActive = draftType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setDraftType(option.value)}
                  className={cn(
                    FORM_SEGMENT,
                    isActive ? FORM_SEGMENT_ACTIVE : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className={FORM_FIELD_LABEL}>{UI_LABEL_CATEGORY}</span>
          <JournalFilterCategoryList
            value={draftCategory}
            onChange={setDraftCategory}
          />
        </section>

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
          {UI_LABEL_RESET}
        </Button>
        <Button
          type="button"
          className={cn(SEPARATED_CONTROL, "flex-1")}
          onClick={handleApply}
        >
          {UI_LABEL_APPLY}
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
