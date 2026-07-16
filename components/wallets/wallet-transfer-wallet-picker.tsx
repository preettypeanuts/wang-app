"use client";

import { SettingsNestedDrawerBack } from "@/components/settings/settings-nested-drawer-back";
import {
  NestedDrawer,
  PICKER_NESTED_DRAWER_SURFACE,
} from "@/components/shared/nested-drawer";
import { WalletTypeIcon } from "@/components/wallets/wallet-type-icon";
import { DrawerClose } from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORM_FIELD_SELECT } from "@/config/form-dialog";
import { PLANNER_SELECT_TRIGGER } from "@/config/planner-manage";
import {
  SETTINGS_IOS_SUB_HEADER,
  SETTINGS_IOS_SUB_TITLE,
} from "@/config/settings-ios";
import { UI_LABEL_WALLET } from "@/config/ui-labels";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { CaretDownIcon, CheckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { WalletTransferPickerOption } from "@/types/wallet";

interface WalletTransferWalletPickerProps {
  value: string;
  options: WalletTransferPickerOption[];
  onChange: (value: string) => void;
  backLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  nestedInDrawer?: boolean;
}

function findSelectedOption(
  value: string,
  options: WalletTransferPickerOption[],
): WalletTransferPickerOption | undefined {
  return options.find((option) => option.id === value);
}

function WalletTransferOptionLabel({
  option,
  className,
}: {
  option: WalletTransferPickerOption;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <WalletTypeIcon
        type={option.type}
        name={option.name}
        iconSlug={option.icon}
        size="md"
      />
      <span className="min-w-0 truncate">{option.name}</span>
    </span>
  );
}

function WalletTransferOptionRow({
  option,
  selected,
  onSelect,
  disabled,
}: {
  option: WalletTransferPickerOption;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <DrawerClose
      render={
        <button
          type="button"
          role="option"
          aria-selected={selected}
          disabled={disabled}
          onClick={onSelect}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[17px] transition-colors active:bg-foreground/5 disabled:opacity-50",
            selected && "bg-accent font-medium",
          )}
        >
          <WalletTransferOptionLabel option={option} />
          {selected ? (
            <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : null}
        </button>
      }
    />
  );
}

function WalletTransferTriggerContent({
  selected,
  placeholder,
}: {
  selected?: WalletTransferPickerOption;
  placeholder: string;
}) {
  if (!selected) {
    return (
      <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
        {placeholder}
      </span>
    );
  }

  return <WalletTransferOptionLabel option={selected} className="flex-1" />;
}

export function WalletTransferWalletPicker({
  value,
  options,
  onChange,
  backLabel = UI_LABEL_WALLET,
  disabled = false,
  id,
  className,
  placeholder = "Pilih wallet",
  nestedInDrawer = false,
}: WalletTransferWalletPickerProps) {
  const isMobile = useIsMobileViewport();
  const useNestedDrawer = isMobile && nestedInDrawer;
  const selected = findSelectedOption(value, options);
  const triggerClassName = cn(
    FORM_FIELD_SELECT,
    PLANNER_SELECT_TRIGGER,
    "gap-2.5",
    className,
  );

  if (!isMobile) {
    return (
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue);
          }
        }}
      >
        <SelectTrigger id={id} className={triggerClassName}>
          <WalletTransferTriggerContent
            selected={selected}
            placeholder={placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <WalletTransferOptionLabel option={option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (useNestedDrawer) {
    return (
      <NestedDrawer
        className={PICKER_NESTED_DRAWER_SURFACE}
        title={UI_LABEL_WALLET}
        trigger={
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={triggerClassName}
          >
            <WalletTransferTriggerContent
              selected={selected}
              placeholder={placeholder}
            />
            <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      >
        <header className={SETTINGS_IOS_SUB_HEADER}>
          <div className="absolute left-3">
            <SettingsNestedDrawerBack label={backLabel} />
          </div>
          <h2 className={SETTINGS_IOS_SUB_TITLE}>{UI_LABEL_WALLET}</h2>
        </header>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(1rem+var(--mobile-safe-bottom))]"
          role="listbox"
          aria-label={UI_LABEL_WALLET}
        >
          {options.map((option) => (
            <WalletTransferOptionRow
              key={option.id}
              disabled={disabled}
              option={option}
              selected={value === option.id}
              onSelect={() => onChange(option.id)}
            />
          ))}
        </div>
      </NestedDrawer>
    );
  }

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      <SelectTrigger id={id} className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <WalletTransferOptionLabel option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
