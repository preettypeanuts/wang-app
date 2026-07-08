"use client";

import {
  MOBILE_TAB_REFRESH_BAR,
  MOBILE_TAB_REFRESH_BAR_FILL,
} from "@/config/mobile-chrome";
import { cn } from "@/lib/utils";

interface MobileTabRefreshBarProps {
  active: boolean;
  className?: string;
}

export function MobileTabRefreshBar({
  active,
  className,
}: MobileTabRefreshBarProps) {
  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={cn(
        MOBILE_TAB_REFRESH_BAR,
        "pt-[var(--mobile-safe-top)]",
        className,
      )}
    >
      <div className="h-[2px] overflow-hidden">
        <div className={MOBILE_TAB_REFRESH_BAR_FILL} />
      </div>
    </div>
  );
}
