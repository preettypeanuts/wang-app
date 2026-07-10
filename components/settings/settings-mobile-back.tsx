"use client";

import { SETTINGS_TITLE } from "@/config/settings-labels";
import { SETTINGS_IOS_BACK_BUTTON } from "@/config/settings-ios";
import { CaretLeftIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface SettingsMobileBackProps {
  onBack: () => void;
  label?: string;
}

export function SettingsMobileBack({
  onBack,
  label = SETTINGS_TITLE,
}: SettingsMobileBackProps) {
  return (
    <button type="button" onClick={onBack} className={cn(SETTINGS_IOS_BACK_BUTTON)}>
      <CaretLeftIcon aria-hidden className="size-5" />
      {label}
    </button>
  );
}
