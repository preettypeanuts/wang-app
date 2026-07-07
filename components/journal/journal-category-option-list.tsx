"use client";

import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { Input } from "@/components/ui/input";
import type { CategoryMentionOption } from "@/config/category-mentions";
import { CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

const OPTION_ITEM =
  "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

interface JournalCategoryOptionListProps {
  options: CategoryMentionOption[];
  selectedId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (option: CategoryMentionOption) => void;
  type: TransactionType;
  className?: string;
  listClassName?: string;
}

export function JournalCategoryOptionList({
  options,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  type,
  className,
  listClassName,
}: JournalCategoryOptionListProps) {
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b border-black/6 px-3 py-2 dark:border-white/8">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari kategori..."
          className="h-9"
        />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain p-1",
          listClassName,
        )}
        role="listbox"
        aria-label="Pilih kategori"
      >
        {options.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            Kategori tidak ditemukan.
          </p>
        ) : (
          options.map((option) => {
            const isSelected = option.id === selectedId;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(option)}
                className={cn(OPTION_ITEM, isSelected && "bg-accent")}
              >
                <JournalCategoryIcon
                  category={option.id}
                  type={type}
                  className="size-8 shrink-0 rounded-xl"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground/90">
                      {option.label}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      @{option.token}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    Ketik @{option.token} untuk memilih kategori ini
                  </span>
                </span>
                {isSelected ? (
                  <CheckIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
