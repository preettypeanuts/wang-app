"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOURNAL_CATEGORY_OPTIONS,
  JOURNAL_TYPE_OPTIONS,
} from "@/config/journal";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CONTROL_GAP } from "@/config/spacing";
import {
  UI_LABEL_APPLY,
  UI_LABEL_CATEGORY,
  UI_LABEL_RESET,
  UI_LABEL_TYPE,
} from "@/config/ui-labels";
import { cn } from "@/lib/utils";
import type { JournalFilters } from "@/types/journal";

interface JournalFilterFieldsProps {
  type: JournalFilters["type"];
  category: JournalFilters["category"];
  onTypeChange: (value: JournalFilters["type"]) => void;
  onCategoryChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  layout?: "stack" | "inline";
  className?: string;
}

export function JournalFilterFields({
  type,
  category,
  onTypeChange,
  onCategoryChange,
  onApply,
  onReset,
  layout = "stack",
  className,
}: JournalFilterFieldsProps) {
  const isStack = layout === "stack";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        !isStack && "sm:flex-row sm:flex-wrap sm:items-end",
        className,
      )}
    >
      <div className={cn("grid gap-1.5", !isStack && "sm:w-40")}>
        <span className="text-xs font-medium">{UI_LABEL_TYPE}</span>
        <Select
          value={type}
          onValueChange={(value) =>
            onTypeChange((value as JournalFilters["type"] | null) ?? "all")
          }
        >
          <SelectTrigger
            className={cn(SEPARATED_CONTROL, isStack ? "h-10" : "h-9", "w-full")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOURNAL_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("grid gap-1.5", !isStack && "sm:w-44")}>
        <span className="text-xs font-medium">{UI_LABEL_CATEGORY}</span>
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value ?? "all")}
        >
          <SelectTrigger
            className={cn(SEPARATED_CONTROL, isStack ? "h-10" : "h-9", "w-full")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOURNAL_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "flex w-full",
          !isStack && "sm:w-auto sm:shrink-0",
          CONTROL_GAP,
        )}
      >
        <Button
          type="button"
          size={isStack ? "default" : "sm"}
          className={cn(SEPARATED_CONTROL, isStack && "flex-1")}
          onClick={onApply}
        >
          {UI_LABEL_APPLY}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size={isStack ? "default" : "sm"}
          className={cn(SEPARATED_CONTROL, isStack && "flex-1")}
          onClick={onReset}
        >
          {UI_LABEL_RESET}
        </Button>
      </div>
    </div>
  );
}
