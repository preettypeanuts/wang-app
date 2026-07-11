"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import { BudgetRepeatNextMonthField } from "@/components/planner/budget-repeat-next-month-field";
import { AmountTextInput } from "@/components/shared/amount-text-input";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBudgetDailyPreview,
  formatBudgetEmptyDayCountHint,
  PAYPLAN_LABEL_ADD_BUDGET,
  PAYPLAN_LABEL_BUDGET_FORM_DESC,
  PAYPLAN_LABEL_DAY_COUNT,
  PAYPLAN_LABEL_EDIT_BUDGET,
  PAYPLAN_LABEL_LIMIT_MODE,
  PAYPLAN_LABEL_MANUAL_TOTAL,
  PAYPLAN_LABEL_MONTHLY_LIMIT,
  PAYPLAN_LABEL_NEW_BUDGET,
  PAYPLAN_LABEL_NOTE,
  PAYPLAN_LABEL_NOTE_OPTIONAL,
  PAYPLAN_LABEL_PER_DAY,
  PAYPLAN_LABEL_SAVING,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_SAVE,
  UI_LABEL_SELECT_CATEGORY,
  UI_LABEL_TOTAL,
} from "@/config/payplan-labels";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_GRID_ROW,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_NOTE,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
  FORM_SEGMENT,
  FORM_SEGMENT_ACTIVE,
  FORM_SEGMENT_INACTIVE,
  FORM_SEGMENTED,
} from "@/config/form-dialog";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { getBudgetDayCount } from "@/lib/finance/compute-budget-status";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { BudgetLimitMode, BudgetStatus } from "@/types/budget";

interface BudgetFormDialogProps {
  open: boolean;
  status: BudgetStatus | null;
  periodMonth: string;
  usedCategories: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
}

export function BudgetFormDialog({
  open,
  status,
  periodMonth,
  usedCategories,
  onOpenChange,
  onSubmit,
}: BudgetFormDialogProps) {
  const { getExpenseOptions } = useUserCategoryCatalog();
  const [isPending, startTransition] = useTransition();
  const [limitMode, setLimitMode] = useState<BudgetLimitMode>("daily");
  const [category, setCategory] = useState("food");
  const [dailyAmount, setDailyAmount] = useState("50000");
  const [dayCount, setDayCount] = useState("");
  const [fixedLimit, setFixedLimit] = useState("1500000");
  const [repeatNextMonth, setRepeatNextMonth] = useState(false);

  const categoryOptions = useMemo(
    () =>
      getExpenseOptions().map((entry) => ({
        id: entry.id,
        label: entry.label,
      })),
    [getExpenseOptions],
  );
  const defaultDayCount = useMemo(
    () =>
      String(
        getBudgetDayCount(
          { dayCount: status?.budget.dayCount ?? null },
          periodMonth,
        ),
      ),
    [periodMonth, status?.budget.dayCount],
  );

  const previewTotal = useMemo(() => {
    if (limitMode === "fixed") {
      const parsed = Number.parseInt(fixedLimit.replace(/\D/g, ""), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const daily = Number.parseInt(dailyAmount.replace(/\D/g, ""), 10);
    const days = Number.parseInt(dayCount || defaultDayCount, 10);
    if (!Number.isFinite(daily) || !Number.isFinite(days)) {
      return 0;
    }

    return daily * days;
  }, [dailyAmount, dayCount, defaultDayCount, fixedLimit, limitMode]);

  const selectedCategory = categoryOptions.find(
    (option) => option.id === category,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (status) {
      setLimitMode(status.budget.limitMode);
      setCategory(status.budget.category);
      setDailyAmount(String(status.budget.dailyAmount ?? ""));
      setDayCount(status.budget.dayCount ? String(status.budget.dayCount) : "");
      setFixedLimit(String(status.budget.fixedLimit ?? ""));
      setRepeatNextMonth(status.budget.repeatNextMonth);
      return;
    }

    setLimitMode("daily");
    setCategory("food");
    setDailyAmount("50000");
    setDayCount("");
    setFixedLimit("1500000");
    setRepeatNextMonth(false);
  }, [open, status]);

  const availableCategories = categoryOptions.filter((option) => {
    if (status?.budget.category === option.id) {
      return true;
    }

    return !usedCategories.includes(option.id);
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const ok = await onSubmit(formData);
      if (ok) {
        onOpenChange(false);
      }
    });
  }

  const limitModeLabel =
    limitMode === "daily" ? PAYPLAN_LABEL_PER_DAY : PAYPLAN_LABEL_MANUAL_TOTAL;
  const dialogTitle = status ? PAYPLAN_LABEL_EDIT_BUDGET : PAYPLAN_LABEL_NEW_BUDGET;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {dialogTitle}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {PAYPLAN_LABEL_BUDGET_FORM_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            {status ? (
              <input type="hidden" name="id" value={status.budget.id} />
            ) : null}
            <input type="hidden" name="periodMonth" value={periodMonth} />
            <input type="hidden" name="limitMode" value={limitMode} />
            <input type="hidden" name="category" value={category} />
            <input
              type="hidden"
              name="repeatNextMonth"
              value={repeatNextMonth ? "true" : "false"}
            />

            <div className={FORM_PREVIEW_COMPACT}>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {PAYPLAN_LABEL_MONTHLY_LIMIT}
                </p>
                <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                  {formatIdr(previewTotal)}
                </p>
              </div>
              <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
                <p>{selectedCategory?.label ?? UI_LABEL_CATEGORY}</p>
                <p>{limitModeLabel}</p>
                {limitMode === "daily" ? (
                  <p className="mt-1 font-medium text-foreground">
                    {formatBudgetDailyPreview(
                      formatIdr(
                        Number.parseInt(dailyAmount.replace(/\D/g, ""), 10) || 0,
                      ),
                      dayCount || defaultDayCount,
                    )}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className={FORM_SEGMENTED}
              role="tablist"
              aria-label={PAYPLAN_LABEL_LIMIT_MODE}
            >
              <button
                type="button"
                role="tab"
                aria-selected={limitMode === "daily"}
                onClick={() => setLimitMode("daily")}
                className={cn(
                  FORM_SEGMENT,
                  limitMode === "daily"
                    ? FORM_SEGMENT_ACTIVE
                    : FORM_SEGMENT_INACTIVE,
                )}
              >
                {PAYPLAN_LABEL_PER_DAY}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={limitMode === "fixed"}
                onClick={() => setLimitMode("fixed")}
                className={cn(
                  FORM_SEGMENT,
                  limitMode === "fixed"
                    ? FORM_SEGMENT_ACTIVE
                    : FORM_SEGMENT_INACTIVE,
                )}
              >
                {PAYPLAN_LABEL_MANUAL_TOTAL}
              </button>
            </div>

            <div className={FORM_GROUP}>
              <FormDialogField label={UI_LABEL_CATEGORY} htmlFor="budget-category">
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value) {
                      setCategory(value);
                    }
                  }}
                  disabled={Boolean(status)}
                >
                  <SelectTrigger
                    id="budget-category"
                    className={cn(
                      PLANNER_SELECT_TRIGGER,
                      FORM_FIELD_SELECT,
                      "text-left",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {selectedCategory ? (
                        <JournalCategoryIcon
                          category={selectedCategory.id}
                          type="expense"
                          className="size-5 shrink-0 rounded-md"
                        />
                      ) : null}
                      <SelectValue placeholder={UI_LABEL_SELECT_CATEGORY} />
                    </span>
                  </SelectTrigger>
                  <SelectContent className={PLANNER_SELECT_CONTENT}>
                    {availableCategories.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className={PLANNER_SELECT_ITEM}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormDialogField>

              {limitMode === "daily" ? (
                <div className={FORM_FIELD_GRID_ROW}>
                  <FormDialogField
                    label={PAYPLAN_LABEL_PER_DAY}
                    htmlFor="budget-daily-amount"
                    gridItem
                  >
                    <AmountTextInput
                      id="budget-daily-amount"
                      name="dailyAmount"
                      value={dailyAmount}
                      onChange={(event) => setDailyAmount(event.target.value)}
                      placeholder="50K"
                      required
                    />
                  </FormDialogField>

                  <FormDialogField
                    label={PAYPLAN_LABEL_DAY_COUNT}
                    htmlFor="budget-day-count"
                    gridItem
                  >
                    <Input
                      id="budget-day-count"
                      name="dayCount"
                      value={dayCount}
                      onChange={(event) => setDayCount(event.target.value)}
                      placeholder={defaultDayCount}
                      autoComplete="off"
                      className={FORM_FIELD_INPUT}
                    />
                  </FormDialogField>
                </div>
              ) : (
                <FormDialogField label={UI_LABEL_TOTAL} htmlFor="budget-fixed-limit">
                  <AmountTextInput
                    id="budget-fixed-limit"
                    name="fixedLimit"
                    value={fixedLimit}
                    onChange={(event) => setFixedLimit(event.target.value)}
                    placeholder="1.5jt"
                    required
                  />
                </FormDialogField>
              )}
            </div>

            {limitMode === "daily" ? (
              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                {formatBudgetEmptyDayCountHint(defaultDayCount)}
              </p>
            ) : null}

            <div className={FORM_GROUP}>
              <BudgetRepeatNextMonthField
                periodMonth={periodMonth}
                checked={repeatNextMonth}
                onCheckedChange={setRepeatNextMonth}
                disabled={isPending}
              />
            </div>

            <div className={FORM_GROUP}>
              <FormDialogField label={PAYPLAN_LABEL_NOTE} htmlFor="budget-note">
                <Textarea
                  id="budget-note"
                  name="note"
                  defaultValue={status?.budget.note ?? ""}
                  rows={3}
                  placeholder={PAYPLAN_LABEL_NOTE_OPTIONAL}
                  className={FORM_NOTE}
                />
              </FormDialogField>
            </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className={cn(SEPARATED_CONTROL, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            {UI_LABEL_CANCEL}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={cn(SEPARATED_CONTROL, "flex-1")}
          >
            {isPending
              ? PAYPLAN_LABEL_SAVING
              : status
                ? UI_LABEL_SAVE
                : PAYPLAN_LABEL_ADD_BUDGET}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialog>
  );
}
