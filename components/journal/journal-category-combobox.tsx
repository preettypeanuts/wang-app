"use client";

import { useMemo, useState } from "react";

import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { JournalCategoryOptionList } from "@/components/journal/journal-category-option-list";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FORM_FIELD_SELECT } from "@/config/form-dialog";
import { MOBILE_BOTTOM_DRAWER_POPUP } from "@/config/mobile-layout";
import { PLANNER_SELECT_TRIGGER } from "@/config/planner-manage";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { filterCategoryMentionOptions } from "@/lib/chat/category-mentions";
import { CaretDownIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

interface JournalCategoryComboboxProps {
  id?: string;
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function JournalCategoryTrigger({
  id,
  className,
  open,
  selectedLabel,
  selectedCategoryId,
  selectedIcon,
  transactionType,
  onClick,
}: {
  id?: string;
  className?: string;
  open: boolean;
  selectedLabel?: string;
  selectedCategoryId?: string;
  selectedIcon?: string;
  transactionType: TransactionType;
  onClick?: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={onClick}
      className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER, className)}
    >
      {selectedLabel && selectedCategoryId ? (
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <JournalCategoryIcon
            category={selectedCategoryId}
            type={transactionType}
            iconOverride={selectedIcon as never}
            className="size-6 shrink-0 rounded-lg"
          />
          <span className="truncate">{selectedLabel}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">Pilih kategori</span>
      )}
      <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function JournalCategoryCombobox({
  id,
  type,
  value,
  onChange,
  className,
}: JournalCategoryComboboxProps) {
  const isMobile = useIsMobileViewport();
  const { getMentionOptions } = useUserCategoryCatalog();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const typeOptions = useMemo(
    () => getMentionOptions(type),
    [getMentionOptions, type],
  );

  const filteredOptions = useMemo(
    () => filterCategoryMentionOptions(search, typeOptions),
    [search, typeOptions],
  );

  const selectedOption = typeOptions.find((option) => option.id === value);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleSelect(optionId: string) {
    onChange(optionId);
    setOpen(false);
    setSearch("");
  }

  const optionList = (
    <JournalCategoryOptionList
      options={filteredOptions}
      selectedId={value}
      search={search}
      onSearchChange={setSearch}
      onSelect={(option) => handleSelect(option.id)}
      type={type}
      listClassName={isMobile ? "max-h-[min(52dvh,28rem)]" : "max-h-72"}
    />
  );

  if (isMobile) {
    return (
      <>
        <JournalCategoryTrigger
          id={id}
          className={className}
          open={open}
          selectedLabel={selectedOption?.label}
          selectedCategoryId={selectedOption?.id}
          selectedIcon={undefined}
          transactionType={type}
          onClick={() => setOpen(true)}
        />
        <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
          <DrawerContent
            className={cn(
              MOBILE_BOTTOM_DRAWER_POPUP,
              "mt-0! gap-0 overflow-hidden border-0 bg-popover px-0",
            )}
          >
            <DrawerHeader className="border-b border-black/6 pb-3 text-left dark:border-white/8">
              <DrawerTitle>Pilih kategori</DrawerTitle>
              <DrawerDescription>
                Cari atau pilih kategori transaksi.
              </DrawerDescription>
            </DrawerHeader>
            {optionList}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER, className)}
      >
        {selectedOption ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <JournalCategoryIcon
              category={selectedOption.id}
              type={type}
              className="size-6 shrink-0 rounded-lg"
            />
            <span className="truncate">{selectedOption.label}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Pilih kategori</span>
        )}
        <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={{
          top: 48,
          bottom: 16,
          left: 8,
          right: 8,
        }}
        className="flex w-(--anchor-width) max-h-(--available-height) flex-col gap-0 overflow-hidden p-0"
      >
        {optionList}
      </PopoverContent>
    </Popover>
  );
}
