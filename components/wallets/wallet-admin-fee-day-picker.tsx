"use client";

import { useMemo, useState } from "react";

import { SettingsNestedDrawerBack } from "@/components/settings/settings-nested-drawer-back";
import {
  NestedDrawer,
  PICKER_NESTED_DRAWER_SURFACE,
} from "@/components/shared/nested-drawer";
import { Calendar } from "@/components/ui/calendar";
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
import { FORM_FIELD_DATE } from "@/config/form-dialog";
import { MOBILE_BOTTOM_DRAWER_POPUP } from "@/config/mobile-layout";
import {
  SETTINGS_IOS_SUB_HEADER,
  SETTINGS_IOS_SUB_TITLE,
} from "@/config/settings-ios";
import {
  WALLET_FORM_ADMIN_FEE_DAY,
  WALLET_FORM_ADMIN_FEE_DAY_OPTION,
  WALLET_FORM_ADMIN_FEE_DAY_PICKER_DESC,
  WALLET_FORM_ADMIN_FEE_DAY_PICKER_TITLE,
  WALLET_FORM_ADMIN_FEE_DAY_PLACEHOLDER,
} from "@/config/wallet-labels";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import {
  dateInputFromCalendarDate,
  parseDayKey,
} from "@/lib/finance/day-range";
import {
  billingDayToDateInput,
  dateInputToBillingDay,
  isBillingDayDisabled,
} from "@/lib/wallets/wallet-admin-fee";
import { CalendarBlankIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface WalletAdminFeeDayPickerProps {
  id: string;
  day: string;
  onDayChange: (day: string) => void;
  disabled?: boolean;
  className?: string;
  nestedInDrawer?: boolean;
  backLabel?: string;
}

function resolvePickerValue(day: string): string {
  const parsedDay = Number.parseInt(day, 10);
  if (!Number.isFinite(parsedDay) || parsedDay <= 0) {
    return billingDayToDateInput(1);
  }

  return billingDayToDateInput(parsedDay);
}

function DayPickerTrigger({
  id,
  disabled,
  className,
  open,
  label,
  placeholder,
  onClick,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  open: boolean;
  label?: string;
  placeholder: string;
  onClick?: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      aria-expanded={open}
      onClick={onClick}
      className={cn(FORM_FIELD_DATE, className)}
    >
      <span
        className={cn("min-w-0 truncate", !label && "text-muted-foreground")}
      >
        {label ?? placeholder}
      </span>
      <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function BillingDayCalendar({
  selected,
  onSelect,
}: {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Calendar
      className="mx-auto rounded-xl border border-black/8 bg-white/70 p-2 dark:border-white/12 dark:bg-white/8"
      defaultMonth={selected ?? new Date()}
      disabled={isBillingDayDisabled}
      mode="single"
      selected={selected}
      onSelect={onSelect}
    />
  );
}

export function WalletAdminFeeDayPicker({
  id,
  day,
  onDayChange,
  disabled = false,
  className,
  nestedInDrawer = false,
  backLabel = WALLET_FORM_ADMIN_FEE_DAY,
}: WalletAdminFeeDayPickerProps) {
  const isMobile = useIsMobileViewport();
  const useNestedDrawer = isMobile && nestedInDrawer;
  const [open, setOpen] = useState(false);
  const pickerValue = useMemo(() => resolvePickerValue(day), [day]);
  const selected = parseDayKey(pickerValue);
  const parsedDay = Number.parseInt(day, 10);
  const displayLabel =
    Number.isFinite(parsedDay) && parsedDay > 0
      ? WALLET_FORM_ADMIN_FEE_DAY_OPTION(parsedDay)
      : undefined;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    onDayChange(String(dateInputToBillingDay(dateInputFromCalendarDate(date))));
    setOpen(false);
  }

  const trigger = (
    <DayPickerTrigger
      className={className}
      disabled={disabled}
      id={id}
      label={displayLabel}
      open={open}
      placeholder={WALLET_FORM_ADMIN_FEE_DAY_PLACEHOLDER}
    />
  );

  if (useNestedDrawer) {
    return (
      <NestedDrawer
        className={PICKER_NESTED_DRAWER_SURFACE}
        onOpenChange={handleOpenChange}
        open={open}
        title={WALLET_FORM_ADMIN_FEE_DAY_PICKER_TITLE}
        trigger={trigger}
      >
        <header className={SETTINGS_IOS_SUB_HEADER}>
          <div className="absolute left-3">
            <SettingsNestedDrawerBack label={backLabel} />
          </div>
          <h2 className={SETTINGS_IOS_SUB_TITLE}>
            {WALLET_FORM_ADMIN_FEE_DAY_PICKER_TITLE}
          </h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+var(--mobile-safe-bottom))] pt-2">
          <BillingDayCalendar onSelect={handleSelect} selected={selected} />
        </div>
      </NestedDrawer>
    );
  }

  if (isMobile) {
    return (
      <>
        <DayPickerTrigger
          className={className}
          disabled={disabled}
          id={id}
          label={displayLabel}
          open={open}
          placeholder={WALLET_FORM_ADMIN_FEE_DAY_PLACEHOLDER}
          onClick={() => setOpen(true)}
        />
        <Drawer onOpenChange={handleOpenChange} open={open} showSwipeHandle>
          <DrawerContent
            className={cn(
              MOBILE_BOTTOM_DRAWER_POPUP,
              "mt-0! gap-0 overflow-hidden border-0 bg-popover px-0",
            )}
          >
            <DrawerHeader className="border-b border-black/6 pb-3 text-left dark:border-white/8">
              <DrawerTitle>{WALLET_FORM_ADMIN_FEE_DAY_PICKER_TITLE}</DrawerTitle>
              <DrawerDescription>
                {WALLET_FORM_ADMIN_FEE_DAY_PICKER_DESC}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-3 pb-[calc(1rem+var(--mobile-safe-bottom))] pt-2">
              <BillingDayCalendar onSelect={handleSelect} selected={selected} />
            </div>
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
        disabled={disabled}
        className={cn(FORM_FIELD_DATE, className)}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            !displayLabel && "text-muted-foreground",
          )}
        >
          {displayLabel ?? WALLET_FORM_ADMIN_FEE_DAY_PLACEHOLDER}
        </span>
        <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <BillingDayCalendar onSelect={handleSelect} selected={selected} />
      </PopoverContent>
    </Popover>
  );
}
