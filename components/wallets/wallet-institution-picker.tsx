"use client";

import { useMemo, useState } from "react";

import { WalletInstitutionOptionList } from "@/components/wallets/wallet-institution-option-list";
import { WalletInstitutionLogo } from "@/components/wallets/wallet-institution-logo";
import { SettingsNestedDrawerBack } from "@/components/settings/settings-nested-drawer-back";
import {
  NestedDrawer,
  PICKER_NESTED_DRAWER_SURFACE,
} from "@/components/shared/nested-drawer";
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
import {
  SETTINGS_IOS_SUB_HEADER,
  SETTINGS_IOS_SUB_TITLE,
} from "@/config/settings-ios";
import {
  WALLET_INSTITUTION_PICKER_LABEL,
  WALLET_INSTITUTION_SEARCH_PLACEHOLDER,
} from "@/config/wallet-labels";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { CaretDownIcon } from "@/lib/icons";
import {
  buildWalletInstitutionSections,
  type WalletInstitutionOption,
  type WalletInstitutionSection,
} from "@/lib/wallets/build-wallet-institution-catalog";
import { resolveWalletIconSlug } from "@/lib/wallets/resolve-wallet-icon-slug";
import { cn } from "@/lib/utils";
import type { WalletType } from "@/types/wallet";

const WALLET_INSTITUTION_PICKER_PLACEHOLDER = "Pilih bank atau e-wallet";

interface WalletInstitutionPickerProps {
  type: WalletType;
  selectedSlug: string | null;
  selectedName: string;
  onSelect: (option: WalletInstitutionOption) => void;
  nestedInDrawer?: boolean;
  backLabel?: string;
  id?: string;
  className?: string;
}

function filterSections(
  sections: WalletInstitutionSection[],
  query: string,
): WalletInstitutionSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      options: section.options.filter((option) =>
        option.name.toLowerCase().includes(normalized),
      ),
    }))
    .filter((section) => section.options.length > 0);
}

function InstitutionTrigger({
  id,
  className,
  open,
  type,
  selectedSlug,
  selectedName,
  onClick,
}: {
  id?: string;
  className?: string;
  open: boolean;
  type: WalletType;
  selectedSlug: string | null;
  selectedName: string;
  onClick?: () => void;
}) {
  const hasSelection = selectedName.trim().length > 0;
  const displaySlug = resolveWalletIconSlug(
    selectedName,
    type,
    selectedSlug,
  );

  return (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={onClick}
      className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER, className)}
    >
      {hasSelection ? (
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <WalletInstitutionLogo
            slug={displaySlug}
            name={selectedName}
            size={28}
          />
          <span className="truncate">{selectedName}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">
          {WALLET_INSTITUTION_PICKER_PLACEHOLDER}
        </span>
      )}
      <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function WalletInstitutionPicker({
  type,
  selectedSlug,
  selectedName,
  onSelect,
  nestedInDrawer = false,
  backLabel,
  id,
  className,
}: WalletInstitutionPickerProps) {
  const isMobile = useIsMobileViewport();
  const useNestedDrawer = isMobile && nestedInDrawer;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sections = useMemo(
    () => buildWalletInstitutionSections(type),
    [type],
  );
  const filteredSections = useMemo(
    () => filterSections(sections, search),
    [search, sections],
  );

  if (sections.length === 0) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleSelect(option: WalletInstitutionOption) {
    onSelect(option);
    setOpen(false);
    setSearch("");
  }

  const optionList = (
    <WalletInstitutionOptionList
      type={type}
      sections={filteredSections}
      selectedSlug={selectedSlug}
      selectedName={selectedName}
      search={search}
      onSearchChange={setSearch}
      onSelect={handleSelect}
      className={useNestedDrawer ? "min-h-0 flex-1" : undefined}
      closeOnSelect={useNestedDrawer}
      listClassName={
        useNestedDrawer
          ? "min-h-0 flex-1 pb-[calc(0.5rem+var(--mobile-safe-bottom))]"
          : isMobile
            ? "max-h-[min(52dvh,28rem)]"
            : "max-h-80"
      }
    />
  );

  const trigger = (
    <InstitutionTrigger
      id={id}
      className={className}
      open={open}
      type={type}
      selectedSlug={selectedSlug}
      selectedName={selectedName}
      onClick={useNestedDrawer ? undefined : () => setOpen(true)}
    />
  );

  if (useNestedDrawer) {
    return (
      <NestedDrawer
        className={PICKER_NESTED_DRAWER_SURFACE}
        onOpenChange={handleOpenChange}
        title={WALLET_INSTITUTION_PICKER_LABEL}
        trigger={trigger}
      >
        <header className={SETTINGS_IOS_SUB_HEADER}>
          <div className="absolute left-3">
            <SettingsNestedDrawerBack
              label={backLabel ?? WALLET_INSTITUTION_PICKER_LABEL}
            />
          </div>
          <h2 className={SETTINGS_IOS_SUB_TITLE}>
            {WALLET_INSTITUTION_PICKER_LABEL}
          </h2>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {optionList}
        </div>
      </NestedDrawer>
    );
  }

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer onOpenChange={handleOpenChange} open={open} showSwipeHandle>
          <DrawerContent
            className={cn(
              MOBILE_BOTTOM_DRAWER_POPUP,
              "mt-0! gap-0 overflow-hidden border-0 bg-popover px-0",
            )}
          >
            <DrawerHeader className="border-b border-black/6 pb-3 text-left dark:border-white/8">
              <DrawerTitle>{WALLET_INSTITUTION_PICKER_LABEL}</DrawerTitle>
              <DrawerDescription>
                {WALLET_INSTITUTION_SEARCH_PLACEHOLDER}
              </DrawerDescription>
            </DrawerHeader>
            {optionList}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER, className)}
      >
        {selectedName.trim().length > 0 ? (
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <WalletInstitutionLogo
              slug={selectedSlug}
              name={selectedName}
              size={28}
            />
            <span className="truncate">{selectedName}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            {WALLET_INSTITUTION_PICKER_PLACEHOLDER}
          </span>
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
