"use client";

import { PAYPLAN_LABEL_ADD_PAY_PLAN } from "@/config/payplan-labels";
import { MOBILE_ADD_FAB_ICON } from "@/config/mobile-nav";
import { PAYPLAN_ADD_FAB } from "@/config/payplan-mobile";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PayplanAddFabProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function PayplanAddFab({
  onClick,
  className,
  label = PAYPLAN_LABEL_ADD_PAY_PLAN,
}: PayplanAddFabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(PAYPLAN_ADD_FAB, className)}
    >
      <PlusIcon aria-hidden className={MOBILE_ADD_FAB_ICON} />
    </button>
  );
}
