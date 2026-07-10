"use client";

import { Button } from "@/components/ui/button";
import { PLAN_MARK_PURCHASED_SHELL } from "@/config/plans";
import {
  formatPlansMarkPurchasedDesc,
  PLANS_MARK_PURCHASED_BUTTON,
} from "@/config/plans-labels";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CheckCircleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PlanMarkPurchasedSectionProps {
  amount: number;
  disabled?: boolean;
  onMarkPurchased: () => void;
  className?: string;
}

export function PlanMarkPurchasedSection({
  amount,
  disabled = false,
  onMarkPurchased,
  className,
}: PlanMarkPurchasedSectionProps) {
  return (
    <section className={cn(PLAN_MARK_PURCHASED_SHELL, className)}>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {formatPlansMarkPurchasedDesc(amount)}
      </p>
      <Button
        type="button"
        disabled={disabled}
        className={cn(SEPARATED_CONTROL, "mt-3 w-full")}
        onClick={onMarkPurchased}
      >
        <CheckCircleIcon aria-hidden className="size-4" />
        {PLANS_MARK_PURCHASED_BUTTON}
      </Button>
    </section>
  );
}
