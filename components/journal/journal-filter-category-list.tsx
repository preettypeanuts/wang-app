"use client";

import { JOURNAL_CATEGORY_OPTIONS } from "@/config/journal";
import { UI_LABEL_SELECT_CATEGORY } from "@/config/ui-labels";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface JournalFilterCategoryListProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function JournalFilterCategoryList({
  value,
  onChange,
  className,
}: JournalFilterCategoryListProps) {
  return (
    <div
      className={cn(
        "max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-black/8 bg-white/70 dark:border-white/12 dark:bg-white/8",
        className,
      )}
      role="listbox"
      aria-label={UI_LABEL_SELECT_CATEGORY}
    >
      {JOURNAL_CATEGORY_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
              isSelected && "bg-accent font-medium",
            )}
          >
            <span className="min-w-0 truncate">{option.label}</span>
            {isSelected ? (
              <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
