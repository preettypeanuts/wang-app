"use client";

import {
  IOS_SWITCH_ROOT,
  IOS_SWITCH_THUMB,
  IOS_SWITCH_THUMB_OFF,
  IOS_SWITCH_THUMB_ON,
  IOS_SWITCH_TRACK_OFF,
  IOS_SWITCH_TRACK_ON,
} from "@/config/ios-switch";
import { cn } from "@/lib/utils";

interface IosSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label": string;
  className?: string;
}

export function IosSwitch({
  checked,
  disabled = false,
  onCheckedChange,
  "aria-label": ariaLabel,
  className,
}: IosSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        IOS_SWITCH_ROOT,
        checked ? IOS_SWITCH_TRACK_ON : IOS_SWITCH_TRACK_OFF,
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        aria-hidden
        className={cn(
          IOS_SWITCH_THUMB,
          checked ? IOS_SWITCH_THUMB_ON : IOS_SWITCH_THUMB_OFF,
        )}
      />
    </button>
  );
}
