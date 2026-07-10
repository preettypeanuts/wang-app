"use client";

import {
  formatBudgetRepeatNextMonthHint,
  PAYPLAN_LABEL_REPEAT_NEXT_MONTH,
} from "@/config/payplan-labels";
import { AppleCheckbox } from "@/components/shared/apple-checkbox";
import { formatPlannerMonthLabel, shiftMonthKey } from "@/lib/planner/calendar";

interface BudgetRepeatNextMonthFieldProps {
  periodMonth: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function BudgetRepeatNextMonthField({
  periodMonth,
  checked,
  onCheckedChange,
  disabled = false,
}: BudgetRepeatNextMonthFieldProps) {
  const fieldId = "budget-repeat-next-month";
  const nextMonthLabel = formatPlannerMonthLabel(shiftMonthKey(periodMonth, 1));

  return (
    <div className="flex items-start gap-3 px-1">
      <AppleCheckbox
        id={fieldId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <label
        htmlFor={fieldId}
        className="min-w-0 cursor-pointer text-sm leading-snug"
      >
        <span className="font-medium text-foreground">
          {PAYPLAN_LABEL_REPEAT_NEXT_MONTH}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {formatBudgetRepeatNextMonthHint(nextMonthLabel)}
        </span>
      </label>
    </div>
  );
}
