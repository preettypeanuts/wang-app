"use client";

import { PLANS_LABEL_ADD_WISH } from "@/config/plans-labels";
import { MOBILE_ADD_FAB_ICON } from "@/config/mobile-nav";
import { PLANS_ADD_FAB } from "@/config/plans";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PlansAddFabProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

export function PlansAddFab({
  onClick,
  className,
  ariaLabel = PLANS_LABEL_ADD_WISH,
}: PlansAddFabProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(PLANS_ADD_FAB, className)}
    >
      <PlusIcon aria-hidden className={MOBILE_ADD_FAB_ICON} />
    </button>
  );
}
